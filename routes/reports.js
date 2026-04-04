const express = require('express');
const router = express.Router();
const prisma = require('../lib/prisma');
const gemini = require('../lib/gemini');
const { requireHost } = require('../middleware/auth');

// ── Report builder ───────────────────────────────────────────────────────────

async function buildReportData(gameId) {
  const game = await prisma.game.findUnique({
    where: { id: gameId },
    include: {
      players: { include: { answers: { orderBy: { questionIndex: 'asc' } } } },
      set: { include: { questions: { orderBy: { id: 'asc' } } } },
    },
  });
  if (!game) return null;

  const players = game.players;
  const questions = game.set?.questions || [];
  const totalPlayers = players.length;
  if (totalPlayers === 0 || questions.length === 0) return null;

  const allScores = players.map(p => p.score);
  const avgScore = Math.round(allScores.reduce((a, b) => a + b, 0) / totalPlayers);

  const qStats = questions.map((q, idx) => {
    const answers = players.flatMap(p => p.answers.filter(a => a.questionIndex === idx));
    const total = answers.length;
    const correct = answers.filter(a => a.isCorrect).length;
    const pct = total > 0 ? Math.round((correct / total) * 100) : 0;
    const avgTime = total > 0 ? Math.round(answers.reduce((s, a) => s + (a.responseTimeMs || 0), 0) / total / 1000) : 0;
    const label = pct >= 75 ? 'well_understood' : pct >= 40 ? 'partly_understood' : 'needs_followup';
    return {
      idx, question: q.question, correctAnswer: q.options[q.answer],
      pct, correct, total, avgTimeSec: avgTime, label, scripture: q.scripture || '',
    };
  });

  const totalAnswers = players.flatMap(p => p.answers);
  const correctAnswers = totalAnswers.filter(a => a.isCorrect).length;
  const overallAccuracy = totalAnswers.length > 0 ? Math.round((correctAnswers / totalAnswers.length) * 100) : 0;

  const playerStats = players.map(p => {
    const pAnswers = p.answers || [];
    const pCorrect = pAnswers.filter(a => a.isCorrect).length;
    const pTotal = pAnswers.length;
    const pAccuracy = pTotal > 0 ? Math.round((pCorrect / pTotal) * 100) : 0;
    const avgTime = pTotal > 0 ? Math.round(pAnswers.reduce((s, a) => s + (a.responseTimeMs || 0), 0) / pTotal / 1000) : 0;
    return { name: p.name, score: p.score, streak: p.streak, rank: p.rank, accuracy: pAccuracy, avgTimeSec: avgTime };
  });

  const best = [...qStats].sort((a, b) => b.pct - a.pct)[0];
  const worst = [...qStats].sort((a, b) => a.pct - b.pct)[0];

  return { totalPlayers, avgScore, overallAccuracy, questions: qStats, best, worst, setName: game.set?.name || 'Unknown Set', playerStats };
}

async function generateAiSummary(reportData) {
  if (!process.env.GEMINI_API_KEY) return 'Report generated. Review the breakdown below for details.';
  const { totalPlayers, overallAccuracy, questions, best, worst, setName } = reportData;
  const needsFollowup = questions.filter(q => q.label === 'needs_followup').map(q => `"${q.question}"`).join(', ');
  const prompt = `You are a helpful assistant for a church pastor or fellowship leader. Write a short 3-4 sentence understanding summary for a Bible quiz session.

Quiz: "${setName}"
Players: ${totalPlayers}
Overall accuracy: ${overallAccuracy}%
Best understood question (${best?.pct}% correct): "${best?.question}"
Most missed question (${worst?.pct}% correct): "${worst?.question}"
${needsFollowup ? `Questions needing follow-up: ${needsFollowup}` : ''}

Write in plain, warm, church-friendly language. No bullet points. No headings. Just a short paragraph. Mention what people understood well, what they struggled with, and suggest a follow-up if needed. Use language like "participants", "the group", "may need reinforcement", "strongest area". Avoid corporate jargon.`;

  try {
    const result = await gemini.generateContent(prompt);
    return result.response.text().trim();
  } catch (e) {
    return `The session had ${totalPlayers} participants with ${overallAccuracy}% overall accuracy. Review the breakdown below to see which questions may need follow-up.`;
  }
}

// ── Routes ───────────────────────────────────────────────────────────────────

// GET /api/games/:id/report
router.get('/games/:id/report', requireHost, async (req, res) => {
  try {
    const game = await prisma.game.findFirst({ where: { id: req.params.id, hostId: req.hostUser.id } });
    if (!game) return res.status(404).json({ error: 'Game not found.' });

    const existing = await prisma.sessionReport.findUnique({ where: { gameId: req.params.id } });
    if (existing) return res.json({ report: existing });

    const data = await buildReportData(req.params.id);
    if (!data) return res.status(400).json({ error: 'Not enough data to generate report.' });

    const summary = await generateAiSummary(data);
    const report = await prisma.sessionReport.create({
      data: { gameId: req.params.id, hostId: req.hostUser.id, summary, data },
    });
    res.json({ report });
  } catch (err) {
    console.error('Report error:', err);
    res.status(500).json({ error: 'Failed to generate report.' });
  }
});

// GET /api/reports
router.get('/reports', requireHost, async (req, res) => {
  try {
    const reports = await prisma.sessionReport.findMany({
      where: { hostId: req.hostUser.id },
      orderBy: { createdAt: 'desc' },
      take: 50,
      include: {
        game: {
          select: {
            pin: true, finishedAt: true,
            set: { select: { name: true } },
            _count: { select: { players: true } },
          },
        },
      },
    });
    res.json({ reports });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch reports.' });
  }
});

module.exports = router;
