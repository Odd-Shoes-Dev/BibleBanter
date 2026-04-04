const jwt = require("jsonwebtoken");
const prisma = require("../lib/prisma");
const localQuestions = require("../questions");
const { sanitizePlayerName } = require("../utils/sanitize");

const QUESTION_TIME = 20; // seconds per question (default)
const RESULTS_TIME = 7; // seconds to show results before auto-advancing
const MAX_POINTS = 1000;

// In-memory game store  —  lives for the lifetime of the Node process
const games = {};

// Grace-period timers: brief disconnects don't immediately kick players/hosts
const disconnectTimers = new Map(); // key: `${pin}:${name}` for players, `host:${pin}` for hosts

// ── Helpers ──────────────────────────────────────────────────────────────────

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
    .map((p, idx) => ({
      rank: idx + 1,
      name: p.name,
      team: p.team || "",
      score: p.score,
      streak: p.streak,
    }));
}

function getTeamLeaderboard(game) {
  const scores = {};
  for (const p of game.players.values()) {
    if (!p.team) continue;
    scores[p.team] = (scores[p.team] || 0) + p.score;
  }
  return Object.entries(scores)
    .map(([team, score]) => ({ team, score }))
    .sort((a, b) => b.score - a.score)
    .map((t, idx) => ({ rank: idx + 1, team: t.team, score: t.score }));
}

// ── Game-flow functions (need `io` via closure) ──────────────────────────────

function createGameFlowFunctions(io) {
  function sendQuestion(pin) {
    const game = games[pin];
    if (!game) return;

    game.currentQuestion += 1;
    if (game.currentQuestion >= game.questions.length) {
      endGame(pin);
      return;
    }

    game.status = "question";
    game.questionStartTime = Date.now();

    // Reset player answered state
    game.players.forEach((p) => {
      p.answered = false;
      p.lastAnswer = null;
    });

    const q = game.questions[game.currentQuestion];
    io.to(pin).emit("new-question", {
      index: game.currentQuestion,
      total: game.questions.length,
      question: q.question,
      options: q.options,
      category: q.category,
      difficulty: q.difficulty,
      timeLimit: game.questionTime || QUESTION_TIME,
    });

    const qTime = game.questionTime || QUESTION_TIME;
    game.timer = setTimeout(() => showResults(pin), qTime * 1000 + 500);
  }

  function showResults(pin) {
    const game = games[pin];
    if (!game) return;
    game.status = "results";

    const q = game.questions[game.currentQuestion];
    const leaderboard = getLeaderboard(game);
    const teamLeaderboard = getTeamLeaderboard(game);
    const isLast = game.currentQuestion === game.questions.length - 1;

    io.to(pin).emit("question-results", {
      correctAnswer: q.answer,
      scripture: q.scripture,
      leaderboard,
      teamLeaderboard,
      isLastQuestion: isLast,
      autoAdvanceIn: RESULTS_TIME,
    });

    game.resultsTimer = setTimeout(() => {
      if (game.status !== "results") return;
      if (isLast) endGame(pin);
      else sendQuestion(pin);
    }, RESULTS_TIME * 1000);
  }

  async function endGame(pin) {
    const game = games[pin];
    if (!game) return;
    game.status = "ended";
    clearTimeout(game.timer);

    const leaderboard = getLeaderboard(game);
    const teamLeaderboard = getTeamLeaderboard(game);

    io.to(pin).emit("game-over", {
      leaderboard,
      teamLeaderboard,
      dbGameId: game.dbGameId || null,
      hasMore: game.hasMore || false,
      nextOffset: game.nextOffset || 0,
      setId: game.setId || null,
      totalQuestions: game.totalQuestions || 0,
      batchEnd: game.nextOffset || 0,
    });

    // Persist final scores to DB
    if (game.dbGameId) {
      try {
        await prisma.game.update({
          where: { id: game.dbGameId },
          data: { status: "finished", finishedAt: new Date() },
        });

        const questionIds = Array.isArray(game.questions)
          ? game.questions.map((q) => q.id).filter((id) => id)
          : [];
        if (questionIds.length > 0) {
          await prisma.question
            .updateMany({
              where: { id: { in: questionIds } },
              data: { timesPlayed: { increment: 1 } },
            })
            .catch((e) => console.error("DB q count err:", e.message));
        }

        // UPDATE SYSTEM STATS
        await prisma.systemStat
          .upsert({
            where: { id: 1 },
            update: {
              totalGames: { increment: 1 },
              totalPlayers: { increment: leaderboard.length },
            },
            create: {
              id: 1,
              totalGames: 1,
              totalPlayers: leaderboard.length,
            },
          })
          .catch(() => {});

        await Promise.all(
          leaderboard.map((p) =>
            prisma.player
              .update({
                where: { name_gameId: { name: p.name, gameId: game.dbGameId } },
                data: { score: p.score, streak: p.streak, rank: p.rank },
              })
              .catch(() => {}),
          ),
        );
      } catch (e) {
        console.error("DB endGame error:", e.message);
      }
    }
  }

  return { sendQuestion, showResults, endGame };
}

// ── Main setup ───────────────────────────────────────────────────────────────

function setupSocketHandlers(io) {
  const { sendQuestion, showResults, endGame } = createGameFlowFunctions(io);

  io.on("connection", (socket) => {
    console.log("Connected:", socket.id);

    // ── HOST: Create game ──────────────────────────────────────────────────
    socket.on(
      "create-game",
      async (
        {
          testament,
          setId,
          hostToken,
          offset = 0,
          questionTime = 20,
          rounds = 10,
          mode = "Multiplayer",
        } = {},
        callback,
      ) => {
        try {
          let hostDbId = null;
          if (hostToken) {
            try {
              const p = jwt.verify(hostToken, process.env.JWT_SECRET);
              hostDbId = p.id;
            } catch {}
          }

          let allSetQuestions;
          let resolvedSetId = setId;
          if (setId) {
            allSetQuestions = await prisma.question.findMany({
              where: { setId },
              orderBy: { id: "asc" },
            });
          } else {
            const defaultSet = await prisma.questionSet.findFirst({
              where: { isDefault: true },
            });
            if (defaultSet) {
              resolvedSetId = defaultSet.id;
              const where = { setId: defaultSet.id };
              if (testament && testament !== "both") where.category = testament;
              allSetQuestions = await prisma.question.findMany({
                where,
                orderBy: { id: "asc" },
              });
            }
          }

          const pin = generatePin();
          const questionPool =
            allSetQuestions && allSetQuestions.length > 0
              ? allSetQuestions
              : localQuestions;
          const totalQuestions = questionPool.length;

          let gameQuestions;
          const filtered =
            testament && testament !== "both" && !setId
              ? questionPool.filter((q) => q.category === testament)
              : questionPool;

          // Sort by timesPlayed ascending, then shuffle chunks of same timesPlayed, or just group them.
          filtered.sort((a, b) => {
            if (a.timesPlayed !== b.timesPlayed)
              return (a.timesPlayed || 0) - (b.timesPlayed || 0);
            return 0.5 - Math.random();
          });

          gameQuestions = filtered.slice(0, rounds);
          gameQuestions = shuffleQuestions(gameQuestions);

          if (gameQuestions.length === 0)
            return callback({
              success: false,
              error: "No questions available in this set.",
            });

          const nextOffset = offset + gameQuestions.length;
          const hasMore = setId ? nextOffset < totalQuestions : false;

          let dbGameId = null;
          try {
            const dbGame = await prisma.game.create({
              data: { pin, hostId: hostDbId, setId: resolvedSetId || null },
            });
            dbGameId = dbGame.id;
          } catch (e) {
            console.error("DB game create error:", e.message);
          }

          games[pin] = {
            pin,
            dbGameId,
            hostId: socket.id,
            players: new Map(),
            questions: gameQuestions,
            currentQuestion: -1,
            status: "lobby",
            timer: null,
            questionStartTime: null,
            setId: resolvedSetId || null,
            questionOffset: offset,
            nextOffset,
            hasMore,
            totalQuestions,
            mode,
            questionTime: Math.min(
              Math.max(parseInt(questionTime) || 20, 5),
              120,
            ),
            rounds: Math.min(Math.max(parseInt(rounds) || 10, 1), 50),
          };
          socket.join(pin);
          socket.data.pin = pin;
          socket.data.role = "host";
          console.log(
            `Game created: ${pin} (Q${offset + 1}-${nextOffset} of ${totalQuestions}, ${questionTime}s/q)`,
          );
          callback({ success: true, pin });
        } catch (err) {
          console.error("create-game error:", err);
          callback({ success: false, error: "Failed to create game." });
        }
      },
    );

    // ── HOST: Continue game with next batch ────────────────────────────────
    socket.on("continue-game", async (_, callback) => {
      const pin = socket.data.pin;
      const game = games[pin];
      if (!game || game.hostId !== socket.id)
        return callback?.({ success: false, error: "Not authorised." });
      if (!game.hasMore || !game.setId)
        return callback?.({ success: false, error: "No more questions." });
      try {
        const allQuestions = await prisma.question.findMany({
          where: { setId: game.setId },
          orderBy: { id: "asc" },
        });
        const batch = allQuestions.slice(game.nextOffset, game.nextOffset + 10);
        if (batch.length === 0)
          return callback?.({ success: false, error: "No more questions." });

        const newNextOffset = game.nextOffset + batch.length;
        const stillHasMore = newNextOffset < allQuestions.length;

        game.questions = batch;
        game.currentQuestion = -1;
        game.status = "lobby";
        game.questionOffset = game.nextOffset;
        game.nextOffset = newNextOffset;
        game.hasMore = stillHasMore;

        for (const [, p] of game.players) {
          p.answered = false;
          p.lastAnswer = null;
        }

        const playerList = [...game.players.values()].map((p) => ({
          id: p.id,
          name: p.name,
          score: p.score,
        }));
        const round = Math.floor(game.questionOffset / 10) + 1;
        io.to(pin).emit("round-starting", {
          round,
          batchStart: game.questionOffset + 1,
          batchEnd: newNextOffset,
          totalQuestions: allQuestions.length,
          players: playerList,
        });
        callback?.({ success: true });
      } catch (e) {
        callback?.({ success: false, error: e.message });
      }
    });

    // ── PLAYER: Join game ──────────────────────────────────────────────────
    socket.on("check-game-mode", (pin, callback) => {
      const game = games[pin];
      if (game) {
        callback({ success: true, mode: game.mode });
      } else {
        callback({ success: false, error: "Game not found" });
      }
    });

    socket.on("join-game", ({ pin, name, team }, callback) => {
      const game = games[pin];
      if (!game)
        return callback({
          success: false,
          error: "Game not found. Check your PIN.",
        });
      // Removed check for game.status !== 'lobby' to allow joining ongoing games

      const safeName = sanitizePlayerName(name);
      if (!safeName)
        return callback({ success: false, error: "Invalid name." });

      if (
        [...game.players.values()].find(
          (p) => p.name.toLowerCase() === safeName.toLowerCase(),
        )
      ) {
        return callback({
          success: false,
          error: "Name already taken. Choose another.",
        });
      }

      game.players.set(socket.id, {
        id: socket.id,
        name: safeName,
        team: team || "",
        score: 0,
        streak: 0,
        answered: false,
        lastAnswer: null,
      });

      socket.join(pin);
      socket.data.pin = pin;
      socket.data.role = "player";
      socket.data.name = safeName;
      socket.data.team = team || "";

      // Persist player to DB
      if (game.dbGameId) {
        prisma.player
          .upsert({
            where: { name_gameId: { name: safeName, gameId: game.dbGameId } },
            update: { team: team || "" },
            create: { name: safeName, gameId: game.dbGameId, team: team || "" },
          })
          .catch((e) => console.error("DB player upsert:", e.message));
      }

      const playerList = [...game.players.values()].map((p) => ({
        id: p.id,
        name: p.name,
        team: p.team,
        score: p.score,
      }));
      io.to(pin).emit("player-joined", {
        players: playerList,
        name: safeName,
        team,
      });

      if (
        game.status === "question" &&
        game.currentQuestion >= 0
      ) {
        const q = game.questions[game.currentQuestion];
        socket.emit("new-question", {
          index: game.currentQuestion,
          total: game.questions.length,
          question: q.question,
          options: q.options,
          category: q.category,
          timeRemaining: Math.max(
            0,
            game.questionTime -
              Math.floor((Date.now() - game.questionStartTime) / 1000),
          ),
        });
      } else if (game.status === "results") {
        // We could emit show-results or just let them wait
      }
    });

    // ── HOST: Replace questions from upload ────────────────────────────────
    socket.on("set-questions", (newQuestions, callback) => {
      const pin = socket.data.pin;
      const game = games[pin];
      if (!game || game.hostId !== socket.id) return;
      if (game.status !== "lobby") return;
      game.questions = shuffleQuestions(newQuestions);
      console.log(
        `Game ${pin}: questions replaced with ${newQuestions.length} uploaded questions`,
      );
      if (callback) callback({ success: true, count: newQuestions.length });
    });

    // ── HOST: Start game ───────────────────────────────────────────────────
    socket.on("start-game", () => {
      const pin = socket.data.pin;
      const game = games[pin];
      if (!game) {
        socket.emit(
          "error-msg",
          "Game not found. Please refresh and try again.",
        );
        return;
      }
      if (game.hostId !== socket.id) {
        if (socket.data.role === "host") {
          game.hostId = socket.id;
        } else {
          socket.emit("error-msg", "Not authorised to start this game.");
          return;
        }
      }
      if (game.players.size === 0) {
        socket.emit(
          "error-msg",
          "At least one player must join before starting.",
        );
        return;
      }
      if (game.questions.length === 0) {
        socket.emit(
          "error-msg",
          "No questions loaded. Upload questions or check DB connection.",
        );
        return;
      }
      game.status = "playing";
      io.to(pin).emit("game-started");
      setTimeout(() => sendQuestion(pin), 1000);
    });

    // ── PLAYER: Submit answer ──────────────────────────────────────────────
    socket.on("submit-answer", ({ answerIndex }) => {
      const pin = socket.data.pin;
      const game = games[pin];
      if (!game || game.status !== "question") return;

      const player = game.players.get(socket.id);
      if (!player || player.answered) return;

      const q = game.questions[game.currentQuestion];
      const timeElapsed = (Date.now() - game.questionStartTime) / 1000;
      const isCorrect = answerIndex === q.answer;

      let pointsEarned = 0;
      if (isCorrect) {
        const timeBonus = Math.max(
          0,
          1 - timeElapsed / (game.questionTime || QUESTION_TIME),
        );
        pointsEarned = Math.round(MAX_POINTS * (0.5 + 0.5 * timeBonus));
        player.streak = (player.streak || 0) + 1;
        if (player.streak >= 3) pointsEarned = Math.round(pointsEarned * 1.2);
        player.score += pointsEarned;
      } else {
        player.streak = 0;
      }

      player.answered = true;
      player.lastAnswer = { answerIndex, isCorrect, pointsEarned };

      socket.emit("answer-result", {
        isCorrect,
        correctAnswer: q.answer,
        pointsEarned,
        totalScore: player.score,
        streak: player.streak,
        scripture: q.scripture,
      });

      // Persist answer to DB
      const responseTimeMs = Date.now() - game.questionStartTime;
      if (game.dbGameId) {
        prisma.playerAnswer
          .create({
            data: {
              playerName: player.name,
              gameId: game.dbGameId,
              questionIndex: game.currentQuestion,
              answerIndex,
              isCorrect,
              pointsEarned,
              responseTimeMs,
            },
          })
          .catch((e) => console.error("DB answer write:", e.message));
      }

      const answeredCount = [...game.players.values()].filter(
        (p) => p.answered,
      ).length;
      io.to(pin).emit("answer-progress", {
        answered: answeredCount,
        total: game.players.size,
        leaderboard: getLeaderboard(game),
      });

      if (answeredCount === game.players.size) {
        clearTimeout(game.timer);
        setTimeout(() => showResults(pin), 500);
      }
    });

    // ── HOST: Next question manually ───────────────────────────────────────
    socket.on("next-question", () => {
      const pin = socket.data.pin;
      const game = games[pin];
      if (!game) return;
      if (game.hostId !== socket.id && socket.data.role === "host")
        game.hostId = socket.id;
      if (game.hostId !== socket.id) return;
      clearTimeout(game.timer);
      clearTimeout(game.resultsTimer);
      sendQuestion(pin);
    });

    // ── PLAYER: Rejoin after socket reconnect ──────────────────────────────
    socket.on("rejoin-game", ({ pin, name }, callback) => {
      const game = games[pin];
      if (!game)
        return callback?.({ success: false, error: "Game not found." });

      const safeName = sanitizePlayerName(name);
      const key = `${pin}:${safeName}`;
      const pending = disconnectTimers.get(key);

      if (pending) {
        clearTimeout(pending.timerId);
        disconnectTimers.delete(key);
        const playerData = game.players.get(pending.oldSocketId);
        if (playerData) {
          game.players.delete(pending.oldSocketId);
          game.players.set(socket.id, { ...playerData, id: socket.id });
        } else {
          game.players.set(socket.id, {
            id: socket.id,
            name: safeName,
            score: 0,
            streak: 0,
            answered: false,
            lastAnswer: null,
          });
        }
      } else {
        const already = [...game.players.values()].find(
          (p) => p.name === safeName,
        );
        if (already) {
          game.players.delete(already.id);
          game.players.set(socket.id, { ...already, id: socket.id });
        } else {
          // Allowed to join even if game already started
          game.players.set(socket.id, {
            id: socket.id,
            name: safeName,
            score: 0,
            streak: 0,
            answered: false,
            lastAnswer: null,
          });
        }
      }

      socket.join(pin);
      socket.data.pin = pin;
      socket.data.role = "player";
      socket.data.name = safeName;

      const playerList = [...game.players.values()].map((p) => ({
        id: p.id,
        name: p.name,
        score: p.score,
      }));
      io.to(pin).emit("player-joined", { players: playerList, name: safeName });
      callback?.({ success: true, status: game.status });
    });

    // ── HOST: Rejoin after socket reconnect ────────────────────────────────
    socket.on("rejoin-host", ({ pin }, callback) => {
      const game = games[pin];
      if (!game)
        return callback?.({ success: false, error: "Game not found." });

      const hostKey = `host:${pin}`;
      const pending = disconnectTimers.get(hostKey);
      if (pending) {
        clearTimeout(pending.timerId);
        disconnectTimers.delete(hostKey);
      }

      game.hostId = socket.id;
      socket.join(pin);
      socket.data.pin = pin;
      socket.data.role = "host";

      const playerList = [...game.players.values()].map((p) => ({
        id: p.id,
        name: p.name,
        score: p.score,
      }));
      callback?.({
        success: true,
        status: game.status,
        players: playerList,
        pin,
      });
    });

    // ── Disconnect with grace period ───────────────────────────────────────
    socket.on("disconnect", () => {
      const pin = socket.data.pin;
      const role = socket.data.role;
      const name = socket.data.name;
      if (!pin || !games[pin]) return;
      const game = games[pin];

      if (role === "host") {
        const hostKey = `host:${pin}`;
        const timerId = setTimeout(() => {
          disconnectTimers.delete(hostKey);
          if (!games[pin]) return;
          clearTimeout(games[pin].timer);
          clearTimeout(games[pin].resultsTimer);
          io.to(pin).emit("host-disconnected");
          delete games[pin];
        }, 20000);
        disconnectTimers.set(hostKey, { timerId, oldSocketId: socket.id });
      } else if (role === "player") {
        const key = `${pin}:${name}`;
        const timerId = setTimeout(() => {
          disconnectTimers.delete(key);
          if (!games[pin]) return;
          games[pin].players.delete(socket.id);
          const playerList = [...games[pin].players.values()].map((p) => ({
            id: p.id,
            name: p.name,
            score: p.score,
          }));
          io.to(pin).emit("player-left", { players: playerList, name });
        }, 20000);
        disconnectTimers.set(key, { timerId, oldSocketId: socket.id });
      }
    });
  });
}

module.exports = setupSocketHandlers;
