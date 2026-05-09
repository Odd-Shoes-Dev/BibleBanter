const express = require('express');
const router = express.Router();
const prisma = require('../lib/prisma');
const { requireHost } = require('../middleware/auth');

// GET /api/stats — Global aggregated usage stats
router.get('/stats', async (req, res) => {
  try {
    const stats = await prisma.systemStat.findUnique({ where: { id: 1 } });
    const questionCount = await prisma.question.count();

    if (stats) {
      res.json({
        totalGames: stats.totalGames,
        totalPlayers: stats.totalPlayers,
        totalQuestions: questionCount
      });
    } else {
      res.json({ totalGames: 0, totalPlayers: 0, totalQuestions: questionCount });
    }
  } catch (err) {
    console.error('Stats error:', err);
    res.status(500).json({ error: 'Failed to fetch global stats.' });
  }
});

// GET /api/leaderboard — Global leaderboard (top 10)
router.get('/leaderboard', async (req, res) => {
  try {
    const rows = await prisma.player.groupBy({
      by: ['name'],
      _sum: { score: true },
      _count: { gameId: true },
      orderBy: { _sum: { score: 'desc' } },
      take: 10,
    });
    const leaderboard = rows.map((r, i) => ({
      rank: i + 1,
      name: r.name,
      totalScore: r._sum.score || 0,
      gamesPlayed: r._count.gameId,
    }));
    res.json({ leaderboard });
  } catch (err) {
    console.error('Leaderboard error:', err);
    res.status(500).json({ error: 'Failed to fetch leaderboard.' });
  }
});

// GET /api/games — Game history for authenticated host
router.get('/games', requireHost, async (req, res) => {
  try {
    const dbGames = await prisma.game.findMany({
      where: { hostId: req.hostUser.id },
      orderBy: { createdAt: 'desc' },
      take: 50,
      select: {
        id: true, pin: true, status: true, createdAt: true, finishedAt: true,
        set: { select: { name: true } },
        _count: { select: { players: true } },
      },
    });
    res.json({ games: dbGames });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch games.' });
  }
});

// GET /api/games/:id — Single game detail
router.get('/games/:id', requireHost, async (req, res) => {
  try {
    const game = await prisma.game.findFirst({
      where: { id: req.params.id, hostId: req.hostUser.id },
      include: { set: { select: { name: true } }, players: { orderBy: { score: 'desc' } } },
    });
    if (!game) return res.status(404).json({ error: 'Game not found.' });
    res.json({ game });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch game.' });
  }
});

module.exports = router;
