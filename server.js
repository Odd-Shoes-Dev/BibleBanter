require('dotenv').config();
const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const path = require('path');
const multer = require('multer');
const mammoth = require('mammoth');
const pdfParse = require('pdf-parse');
const { parse: csvParse } = require('csv-parse/sync');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { PrismaClient } = require('@prisma/client');
const { requireHost, optionalHost } = require('./middleware/auth');
const localQuestions = require('./questions');

const prisma = new PrismaClient();

const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 10 * 1024 * 1024 } });

function parseTextToQuestions(text) {
  const questions = [];
  const blocks = text.split(/(?=Q:|Question:)/i).map(b => b.trim()).filter(Boolean);
  for (const block of blocks) {
    const lines = block.split('\n').map(l => l.trim()).filter(Boolean);
    const q = {}; const options = [];
    for (const line of lines) {
      if (/^(Q|Question):\s*/i.test(line)) q.question = line.replace(/^(Q|Question):\s*/i, '').trim();
      else if (/^A[.):]\s*/i.test(line)) options[0] = line.replace(/^A[.):]\s*/i, '').trim();
      else if (/^B[.):]\s*/i.test(line)) options[1] = line.replace(/^B[.):]\s*/i, '').trim();
      else if (/^C[.):]\s*/i.test(line)) options[2] = line.replace(/^C[.):]\s*/i, '').trim();
      else if (/^D[.):]\s*/i.test(line)) options[3] = line.replace(/^D[.):]\s*/i, '').trim();
      else if (/^(Answer|Correct)[^:]*:\s*/i.test(line)) {
        const ans = line.replace(/^(Answer|Correct)[^:]*:\s*/i, '').trim().toUpperCase();
        q.answer = ['A','B','C','D'].indexOf(ans[0]);
      }
      else if (/^Category:\s*/i.test(line)) q.category = line.replace(/^Category:\s*/i, '').trim();
      else if (/^Difficulty:\s*/i.test(line)) q.difficulty = line.replace(/^Difficulty:\s*/i, '').trim().toLowerCase();
      else if (/^Scripture:\s*/i.test(line)) q.scripture = line.replace(/^Scripture:\s*/i, '').trim();
    }
    if (q.question && options.filter(Boolean).length >= 2 && q.answer !== undefined && q.answer >= 0) {
      while (options.length < 4) options.push('');
      q.options = options;
      q.category = q.category || 'General';
      q.difficulty = q.difficulty || 'medium';
      q.id = Date.now() + questions.length;
      questions.push(q);
    }
  }
  return questions;
}

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST']
  }
});

app.use(cors());
app.use(express.json());

// ── AUTH ──────────────────────────────────────────────────────────────────────
app.post('/api/auth/register', async (req, res) => {
  try {
    const { email, password, name } = req.body;
    if (!email || !password || !name) return res.status(400).json({ error: 'email, password, and name are required.' });
    const exists = await prisma.host.findUnique({ where: { email } });
    if (exists) return res.status(400).json({ error: 'Email already registered.' });
    const passwordHash = await bcrypt.hash(password, 12);
    const host = await prisma.host.create({ data: { email, passwordHash, name } });
    const token = jwt.sign({ id: host.id, email: host.email, name: host.name }, process.env.JWT_SECRET, { expiresIn: '30d' });
    res.json({ token, host: { id: host.id, email: host.email, name: host.name } });
  } catch (err) { console.error(err); res.status(500).json({ error: 'Registration failed.' }); }
});

app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const host = await prisma.host.findUnique({ where: { email } });
    if (!host || !(await bcrypt.compare(password, host.passwordHash)))
      return res.status(401).json({ error: 'Invalid email or password.' });
    const token = jwt.sign({ id: host.id, email: host.email, name: host.name }, process.env.JWT_SECRET, { expiresIn: '30d' });
    res.json({ token, host: { id: host.id, email: host.email, name: host.name } });
  } catch (err) { res.status(500).json({ error: 'Login failed.' }); }
});

app.get('/api/auth/me', requireHost, async (req, res) => {
  const host = await prisma.host.findUnique({ where: { id: req.host.id }, select: { id: true, email: true, name: true, createdAt: true } });
  if (!host) return res.status(404).json({ error: 'Not found.' });
  res.json({ host });
});

// ── QUESTION SETS ─────────────────────────────────────────────────────────────
app.get('/api/sets', optionalHost, async (req, res) => {
  try {
    const where = req.host
      ? { OR: [{ isDefault: true }, { hostId: req.host.id }] }
      : { isDefault: true };
    const sets = await prisma.questionSet.findMany({
      where,
      select: { id: true, name: true, description: true, testament: true, isDefault: true, createdAt: true, _count: { select: { questions: true } } },
      orderBy: [{ isDefault: 'desc' }, { createdAt: 'asc' }],
    });
    res.json({ sets });
  } catch (err) { res.status(500).json({ error: 'Failed to fetch sets.' }); }
});

app.delete('/api/sets/:id', requireHost, async (req, res) => {
  try {
    const set = await prisma.questionSet.findUnique({ where: { id: req.params.id } });
    if (!set) return res.status(404).json({ error: 'Set not found.' });
    if (set.isDefault) return res.status(403).json({ error: 'Cannot delete the default set.' });
    if (set.hostId !== req.host.id) return res.status(403).json({ error: 'You do not own this set.' });
    await prisma.questionSet.delete({ where: { id: req.params.id } });
    res.json({ success: true });
  } catch (err) { res.status(500).json({ error: 'Failed to delete set.' }); }
});

// ── GAME HISTORY ──────────────────────────────────────────────────────────────
app.get('/api/games', requireHost, async (req, res) => {
  try {
    const dbGames = await prisma.game.findMany({
      where: { hostId: req.host.id },
      orderBy: { createdAt: 'desc' },
      take: 50,
      select: { id: true, pin: true, status: true, createdAt: true, finishedAt: true, set: { select: { name: true } }, _count: { select: { players: true } } },
    });
    res.json({ games: dbGames });
  } catch (err) { res.status(500).json({ error: 'Failed to fetch games.' }); }
});

app.get('/api/games/:id', requireHost, async (req, res) => {
  try {
    const game = await prisma.game.findFirst({
      where: { id: req.params.id, hostId: req.host.id },
      include: { set: { select: { name: true } }, players: { orderBy: { score: 'desc' } } },
    });
    if (!game) return res.status(404).json({ error: 'Game not found.' });
    res.json({ game });
  } catch (err) { res.status(500).json({ error: 'Failed to fetch game.' }); }
});

app.post('/api/parse-questions', upload.single('file'), optionalHost, async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: 'No file uploaded.' });
    const { originalname, buffer } = req.file;
    const ext = originalname.split('.').pop().toLowerCase();
    let parsed = [];

    if (ext === 'csv') {
      const records = csvParse(buffer.toString('utf8'), { columns: true, skip_empty_lines: true, trim: true });
      parsed = records.map((r) => ({
        question: r.question || r.Question || '',
        options: [r.optionA || r.OptionA || r.A || '', r.optionB || r.OptionB || r.B || '',
                  r.optionC || r.OptionC || r.C || '', r.optionD || r.OptionD || r.D || ''],
        answer: parseInt(r.answer ?? r.Answer ?? 0),
        category: r.category || r.Category || 'General',
        difficulty: (r.difficulty || r.Difficulty || 'medium').toLowerCase(),
        scripture: r.scripture || r.Scripture || '',
      })).filter(q => q.question && q.options.slice(0, 2).every(Boolean) && !isNaN(q.answer));
    } else if (ext === 'docx') {
      const result = await mammoth.extractRawText({ buffer });
      parsed = parseTextToQuestions(result.value);
    } else if (ext === 'pdf') {
      const data = await pdfParse(buffer);
      parsed = parseTextToQuestions(data.text);
    } else {
      return res.status(400).json({ error: 'Unsupported file type. Use CSV, DOCX, or PDF.' });
    }

    if (parsed.length === 0) return res.status(400).json({ error: 'No valid questions found. Check the template format.' });

    // If authenticated host + setName provided → save to DB as a named question set
    let savedSetId = null;
    const setName = req.body.setName;
    if (req.host && setName) {
      const set = await prisma.questionSet.create({
        data: {
          name: setName,
          description: `Imported from ${originalname}`,
          testament: 'both',
          hostId: req.host.id,
          questions: {
            create: parsed.map(q => ({
              question: q.question, options: q.options, answer: q.answer,
              category: q.category, difficulty: q.difficulty, scripture: q.scripture || '',
            })),
          },
        },
      });
      savedSetId = set.id;
    }

    res.json({ questions: parsed, count: parsed.length, savedSetId });
  } catch (err) {
    console.error('Parse error:', err);
    res.status(500).json({ error: 'Failed to parse file: ' + err.message });
  }
});

app.get('/api/question-template.csv', (req, res) => {
  const header = 'question,optionA,optionB,optionC,optionD,answer,category,difficulty,scripture\n';
  const example = '"Who built the ark?","Moses","Noah","Abraham","David",1,"Old Testament","easy","Genesis 6:14"\n';
  const example2 = '"What was Jesus\' first miracle?","Healing a blind man","Raising Lazarus","Walking on water","Turning water into wine",3,"New Testament","easy","John 2:1-11"\n';
  res.setHeader('Content-Type', 'text/csv');
  res.setHeader('Content-Disposition', 'attachment; filename="question-template.csv"');
  res.send(header + example + example2);
});

const distPath = path.join(__dirname, 'client', 'dist');
if (require('fs').existsSync(distPath)) {
  app.use(express.static(distPath));
}

// In-memory game store
const games = {};

function generatePin() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

function shuffleQuestions(arr) {
  const copy = [...arr];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

function getLeaderboard(game) {
  return [...game.players.values()]
    .sort((a, b) => b.score - a.score)
    .map((p, idx) => ({ rank: idx + 1, name: p.name, score: p.score, streak: p.streak }));
}

const QUESTION_TIME = 20; // seconds
const RESULTS_TIME = 7;   // seconds to show results before auto-advancing
const MAX_POINTS = 1000;

io.on('connection', (socket) => {
  console.log('Connected:', socket.id);

  // HOST: Create game
  socket.on('create-game', async ({ testament, setId, hostToken } = {}, callback) => {
    try {
      // Verify host JWT if provided
      let hostDbId = null;
      if (hostToken) {
        try { const p = jwt.verify(hostToken, process.env.JWT_SECRET); hostDbId = p.id; } catch {}
      }

      // Fetch questions from DB
      let dbQuestions;
      if (setId) {
        dbQuestions = await prisma.question.findMany({ where: { setId } });
      } else {
        const defaultSet = await prisma.questionSet.findFirst({ where: { isDefault: true } });
        if (defaultSet) {
          const where = { setId: defaultSet.id };
          if (testament && testament !== 'both') where.category = testament;
          dbQuestions = await prisma.question.findMany({ where });
        }
      }

      const pin = generatePin();
      // Fallback to local questions.js if DB returned nothing
      const questionPool = (dbQuestions && dbQuestions.length > 0) ? dbQuestions : localQuestions;
      const filtered = (testament && testament !== 'both')
        ? questionPool.filter(q => q.category === testament)
        : questionPool;
      const gameQuestions = shuffleQuestions(filtered.length > 0 ? filtered : questionPool).slice(0, 10);

      // Persist game to DB
      let dbGameId = null;
      try {
        const dbGame = await prisma.game.create({
          data: { pin, hostId: hostDbId, setId: setId || (await prisma.questionSet.findFirst({ where: { isDefault: true } }))?.id || null },
        });
        dbGameId = dbGame.id;
      } catch (e) { console.error('DB game create error:', e.message); }

      games[pin] = {
        pin, dbGameId, hostId: socket.id,
        players: new Map(),
        questions: gameQuestions,
        currentQuestion: -1,
        status: 'lobby',
        timer: null,
        questionStartTime: null,
      };
      socket.join(pin);
      socket.data.pin = pin;
      socket.data.role = 'host';
      console.log(`Game created: ${pin} (${gameQuestions.length} questions)`);
      callback({ success: true, pin });
    } catch (err) {
      console.error('create-game error:', err);
      callback({ success: false, error: 'Failed to create game.' });
    }
  });

  // PLAYER: Join game
  socket.on('join-game', ({ pin, name }, callback) => {
    const game = games[pin];
    if (!game) return callback({ success: false, error: 'Game not found. Check your PIN.' });
    if (game.status !== 'lobby') return callback({ success: false, error: 'Game already in progress.' });
    if ([...game.players.values()].find(p => p.name.toLowerCase() === name.toLowerCase())) {
      return callback({ success: false, error: 'Name already taken. Choose another.' });
    }

    game.players.set(socket.id, {
      id: socket.id,
      name,
      score: 0,
      streak: 0,
      answered: false,
      lastAnswer: null,
    });

    socket.join(pin);
    socket.data.pin = pin;
    socket.data.role = 'player';
    socket.data.name = name;

    // Persist player to DB
    if (game.dbGameId) {
      prisma.player.upsert({
        where: { name_gameId: { name, gameId: game.dbGameId } },
        update: {},
        create: { name, gameId: game.dbGameId },
      }).catch(e => console.error('DB player upsert:', e.message));
    }

    const playerList = [...game.players.values()].map(p => ({ id: p.id, name: p.name, score: p.score }));
    io.to(pin).emit('player-joined', { players: playerList, name });

    callback({ success: true, pin });
  });

  // HOST: Replace questions from upload
  socket.on('set-questions', (newQuestions, callback) => {
    const pin = socket.data.pin;
    const game = games[pin];
    if (!game || game.hostId !== socket.id) return;
    if (game.status !== 'lobby') return;
    game.questions = shuffleQuestions(newQuestions);
    console.log(`Game ${pin}: questions replaced with ${newQuestions.length} uploaded questions`);
    if (callback) callback({ success: true, count: newQuestions.length });
  });

  // HOST: Start game
  socket.on('start-game', () => {
    const pin = socket.data.pin;
    const game = games[pin];
    if (!game) { socket.emit('error-msg', 'Game not found. Please refresh and try again.'); return; }
    if (game.hostId !== socket.id) {
      // Allow if socket reconnected — re-adopt host role by pin+role
      if (socket.data.role === 'host') {
        game.hostId = socket.id;
      } else {
        socket.emit('error-msg', 'Not authorised to start this game.'); return;
      }
    }
    if (game.players.size === 0) {
      socket.emit('error-msg', 'At least one player must join before starting.');
      return;
    }
    if (game.questions.length === 0) {
      socket.emit('error-msg', 'No questions loaded. Upload questions or check DB connection.');
      return;
    }
    game.status = 'playing';
    io.to(pin).emit('game-started');
    setTimeout(() => sendQuestion(pin), 1000);
  });

  // PLAYER: Submit answer
  socket.on('submit-answer', ({ answerIndex }) => {
    const pin = socket.data.pin;
    const game = games[pin];
    if (!game || game.status !== 'question') return;

    const player = game.players.get(socket.id);
    if (!player || player.answered) return;

    const q = game.questions[game.currentQuestion];
    const timeElapsed = (Date.now() - game.questionStartTime) / 1000;
    const isCorrect = answerIndex === q.answer;

    let pointsEarned = 0;
    if (isCorrect) {
      const timeBonus = Math.max(0, 1 - timeElapsed / QUESTION_TIME);
      pointsEarned = Math.round(MAX_POINTS * (0.5 + 0.5 * timeBonus));
      player.streak = (player.streak || 0) + 1;
      if (player.streak >= 3) pointsEarned = Math.round(pointsEarned * 1.2);
      player.score += pointsEarned;
    } else {
      player.streak = 0;
    }

    player.answered = true;
    player.lastAnswer = { answerIndex, isCorrect, pointsEarned };

    socket.emit('answer-result', {
      isCorrect,
      correctAnswer: q.answer,
      pointsEarned,
      totalScore: player.score,
      streak: player.streak,
      scripture: q.scripture,
    });

    // Persist answer to DB
    if (game.dbGameId) {
      prisma.playerAnswer.create({
        data: {
          playerName: player.name,
          gameId: game.dbGameId,
          questionIndex: game.currentQuestion,
          answerIndex,
          isCorrect,
          pointsEarned,
        },
      }).catch(e => console.error('DB answer write:', e.message));
    }

    const answeredCount = [...game.players.values()].filter(p => p.answered).length;
    io.to(pin).emit('answer-progress', {
      answered: answeredCount,
      total: game.players.size,
      leaderboard: getLeaderboard(game),
    });

    if (answeredCount === game.players.size) {
      clearTimeout(game.timer);
      setTimeout(() => showResults(pin), 500);
    }
  });

  // HOST: Next question manually
  socket.on('next-question', () => {
    const pin = socket.data.pin;
    const game = games[pin];
    if (!game) return;
    if (game.hostId !== socket.id && socket.data.role === 'host') game.hostId = socket.id;
    if (game.hostId !== socket.id) return;
    clearTimeout(game.timer);
    clearTimeout(game.resultsTimer);
    // sendQuestion already increments currentQuestion — just call it directly
    sendQuestion(pin);
  });

  socket.on('disconnect', () => {
    const pin = socket.data.pin;
    const role = socket.data.role;
    if (!pin || !games[pin]) return;
    const game = games[pin];

    if (role === 'host') {
      io.to(pin).emit('host-disconnected');
      clearTimeout(game.timer);
      delete games[pin];
    } else if (role === 'player') {
      game.players.delete(socket.id);
      const playerList = [...game.players.values()].map(p => ({ id: p.id, name: p.name, score: p.score }));
      io.to(pin).emit('player-left', { players: playerList, name: socket.data.name });
    }
  });
});

function sendQuestion(pin) {
  const game = games[pin];
  if (!game) return;

  game.currentQuestion += 1;

  if (game.currentQuestion >= game.questions.length) {
    endGame(pin);
    return;
  }

  game.status = 'question';
  game.questionStartTime = Date.now();

  // Reset player answered state
  game.players.forEach(p => {
    p.answered = false;
    p.lastAnswer = null;
  });

  const q = game.questions[game.currentQuestion];
  const questionData = {
    index: game.currentQuestion,
    total: game.questions.length,
    question: q.question,
    options: q.options,
    category: q.category,
    difficulty: q.difficulty,
    timeLimit: QUESTION_TIME,
  };

  io.to(pin).emit('new-question', questionData);

  game.timer = setTimeout(() => {
    showResults(pin);
  }, QUESTION_TIME * 1000 + 500);
}

function showResults(pin) {
  const game = games[pin];
  if (!game) return;
  game.status = 'results';

  const q = game.questions[game.currentQuestion];
  const leaderboard = getLeaderboard(game);
  const isLast = game.currentQuestion === game.questions.length - 1;

  io.to(pin).emit('question-results', {
    correctAnswer: q.answer,
    scripture: q.scripture,
    leaderboard,
    isLastQuestion: isLast,
    autoAdvanceIn: RESULTS_TIME,
  });

  // Auto-advance after RESULTS_TIME seconds
  game.resultsTimer = setTimeout(() => {
    if (game.status !== 'results') return;
    if (isLast) { endGame(pin); } else { sendQuestion(pin); }
  }, RESULTS_TIME * 1000);
}

async function endGame(pin) {
  const game = games[pin];
  if (!game) return;
  game.status = 'ended';
  clearTimeout(game.timer);

  const leaderboard = getLeaderboard(game);
  io.to(pin).emit('game-over', { leaderboard });

  // Persist final scores to DB
  if (game.dbGameId) {
    try {
      await prisma.game.update({
        where: { id: game.dbGameId },
        data: { status: 'finished', finishedAt: new Date() },
      });
      await Promise.all(leaderboard.map(p =>
        prisma.player.update({
          where: { name_gameId: { name: p.name, gameId: game.dbGameId } },
          data: { score: p.score, streak: p.streak, rank: p.rank },
        }).catch(() => {})
      ));
    } catch (e) { console.error('DB endGame error:', e.message); }
  }
}

// Serve React app for all other routes (only in local dev where client/dist exists)
app.get('*', (req, res) => {
  const indexPath = path.join(__dirname, 'client', 'dist', 'index.html');
  if (require('fs').existsSync(indexPath)) {
    res.sendFile(indexPath);
  } else {
    res.json({ status: 'Bible Battle API running' });
  }
});

const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
  console.log(`Bible Battle server running on http://localhost:${PORT}`);
});
