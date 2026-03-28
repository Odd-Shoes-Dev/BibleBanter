const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const path = require('path');
const questions = require('./questions');

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
app.use(express.static(path.join(__dirname, 'client', 'dist')));

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
  socket.on('create-game', (callback) => {
    const pin = generatePin();
    const gameQuestions = shuffleQuestions(questions);
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
    io.to(pin).emit('answer-progress', { answered: answeredCount, total: game.players.size });

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

// Serve React app for all other routes
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'client', 'dist', 'index.html'));
});

const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
  console.log(`Bible Battle server running on http://localhost:${PORT}`);
});
