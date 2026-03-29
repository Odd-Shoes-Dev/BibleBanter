const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const path = require('path');
const multer = require('multer');
const mammoth = require('mammoth');
const pdfParse = require('pdf-parse');
const { parse: csvParse } = require('csv-parse/sync');
const questions = require('./questions');

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

app.post('/api/parse-questions', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: 'No file uploaded.' });
    const { originalname, buffer } = req.file;
    const ext = originalname.split('.').pop().toLowerCase();
    let parsed = [];

    if (ext === 'csv') {
      const records = csvParse(buffer.toString('utf8'), { columns: true, skip_empty_lines: true, trim: true });
      parsed = records.map((r, i) => ({
        id: Date.now() + i,
        question: r.question || r.Question || '',
        options: [r.optionA || r.OptionA || r.A || '', r.optionB || r.OptionB || r.B || '',
                  r.optionC || r.OptionC || r.C || '', r.optionD || r.OptionD || r.D || ''],
        answer: parseInt(r.answer ?? r.Answer ?? 0),
        category: r.category || r.Category || 'General',
        difficulty: (r.difficulty || r.Difficulty || 'medium').toLowerCase(),
        scripture: r.scripture || r.Scripture || '',
      })).filter(q => q.question && q.options.slice(0,2).every(Boolean) && !isNaN(q.answer));

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
    res.json({ questions: parsed, count: parsed.length });
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
const MAX_POINTS = 1000;

io.on('connection', (socket) => {
  console.log('Connected:', socket.id);

  // HOST: Create game
  socket.on('create-game', ({ testament } = {}, callback) => {
    const pin = generatePin();
    const filtered = testament && testament !== 'both'
      ? questions.filter(q => q.category === testament)
      : questions;
    const gameQuestions = shuffleQuestions(filtered);
    games[pin] = {
      pin,
      hostId: socket.id,
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
    console.log(`Game created: ${pin}`);
    callback({ success: true, pin });
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
    if (!game || game.hostId !== socket.id) return;
    if (game.players.size === 0) {
      socket.emit('error-msg', 'At least one player must join before starting.');
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
    if (!game || game.hostId !== socket.id) return;
    clearTimeout(game.timer);
    const nextIdx = game.currentQuestion + 1;
    if (nextIdx >= game.questions.length) {
      endGame(pin);
    } else {
      sendQuestion(pin);
    }
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

  const playerResults = {};
  game.players.forEach((p, id) => {
    playerResults[id] = p.lastAnswer;
  });

  io.to(pin).emit('question-results', {
    correctAnswer: q.answer,
    scripture: q.scripture,
    leaderboard,
    isLastQuestion: game.currentQuestion === game.questions.length - 1,
  });
}

function endGame(pin) {
  const game = games[pin];
  if (!game) return;
  game.status = 'ended';
  clearTimeout(game.timer);

  const leaderboard = getLeaderboard(game);
  io.to(pin).emit('game-over', { leaderboard });
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
