const express = require('express');
const router = express.Router();
const prisma = require('../lib/prisma');
const { requireHost, optionalHost } = require('../middleware/auth');
const { sanitizeText } = require('../utils/sanitize');

// GET /api/sets
router.get('/sets', optionalHost, async (req, res) => {
  try {
    const where = req.hostUser
      ? { OR: [{ isDefault: true }, { hostId: req.hostUser.id }] }
      : { isDefault: true };
    const sets = await prisma.questionSet.findMany({
      where,
      select: {
        id: true, name: true, description: true, testament: true, isDefault: true, createdAt: true,
        _count: { select: { questions: true } },
      },
      orderBy: [{ isDefault: 'desc' }, { createdAt: 'asc' }],
    });
    res.json({ sets });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch sets.' });
  }
});

// POST /api/sets
router.post('/sets', requireHost, async (req, res) => {
  try {
    const { name, testament = 'both', description = '' } = req.body;
    if (!name?.trim()) return res.status(400).json({ error: 'Name is required.' });
    const set = await prisma.questionSet.create({
      data: {
        name: sanitizeText(name, 200),
        testament,
        description: sanitizeText(description, 500),
        hostId: req.hostUser.id,
      },
    });
    res.json({ set });
  } catch (err) {
    if (err.code === 'P2003') {
      return res.status(401).json({ error: 'Session invalid: Host account not found. Please log out and back in.' });
    }
    res.status(500).json({ error: 'Failed to create set.' });
  }
});

// PUT /api/sets/:id
router.put('/sets/:id', requireHost, async (req, res) => {
  try {
    const { name } = req.body;
    if (!name?.trim()) return res.status(400).json({ error: 'Name is required.' });
    const set = await prisma.questionSet.findUnique({ where: { id: req.params.id } });
    if (!set) return res.status(404).json({ error: 'Set not found.' });
    if (set.isDefault) return res.status(403).json({ error: 'Cannot edit the default set.' });
    if (set.hostId !== null && set.hostId !== req.hostUser.id) return res.status(403).json({ error: 'You do not own this set.' });
    const updated = await prisma.questionSet.update({ where: { id: req.params.id }, data: { name: sanitizeText(name, 200) } });
    res.json({ set: updated });
  } catch (err) {
    res.status(500).json({ error: 'Failed to rename set.' });
  }
});

// DELETE /api/sets/:id
router.delete('/sets/:id', requireHost, async (req, res) => {
  try {
    const set = await prisma.questionSet.findUnique({ where: { id: req.params.id } });
    if (!set) return res.status(404).json({ error: 'Set not found.' });
    if (set.isDefault) return res.status(403).json({ error: 'Cannot delete the default set.' });
    if (set.hostId !== null && set.hostId !== req.hostUser.id) return res.status(403).json({ error: 'You do not own this set.' });
    await prisma.questionSet.delete({ where: { id: req.params.id } });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete set.' });
  }
});

// GET /api/sets/:id/questions
router.get('/sets/:id/questions', optionalHost, async (req, res) => {
  try {
    const set = await prisma.questionSet.findUnique({ where: { id: req.params.id } });
    if (!set) return res.status(404).json({ error: 'Set not found.' });
    if (set.hostId !== null && (!req.hostUser || set.hostId !== req.hostUser.id)) return res.status(403).json({ error: 'You do not own this set.' });
    const questions = await prisma.question.findMany({ where: { setId: req.params.id }, orderBy: { id: 'asc' } });
    res.json({ questions, setName: set.name, testament: set.testament });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch questions.' });
  }
});

// POST /api/sets/:id/questions
router.post('/sets/:id/questions', requireHost, async (req, res) => {
  try {
    const { question, options, answer, category, difficulty, scripture } = req.body;
    const set = await prisma.questionSet.findUnique({ where: { id: req.params.id } });
    if (!set) return res.status(404).json({ error: 'Set not found.' });
    if (set.hostId !== null && set.hostId !== req.hostUser.id) return res.status(403).json({ error: 'You do not own this set.' });
    const q = await prisma.question.create({
      data: {
        setId: req.params.id,
        question: sanitizeText(question, 1000),
        options: Array.isArray(options) ? options.map(o => sanitizeText(String(o), 500)) : [],
        answer: parseInt(answer),
        category: sanitizeText(category || 'General', 100),
        difficulty: sanitizeText(difficulty || 'medium', 20),
        scripture: sanitizeText(scripture || '', 500),
      },
    });
    res.json({ question: q });
  } catch (err) {
    res.status(500).json({ error: 'Failed to add question.' });
  }
});

// PATCH /api/questions/:id
router.patch('/questions/:id', requireHost, async (req, res) => {
  try {
    const { question, options, answer, category, difficulty, scripture } = req.body;
    const existing = await prisma.question.findUnique({ where: { id: req.params.id }, include: { set: true } });
    if (!existing) return res.status(404).json({ error: 'Question not found.' });
    if (existing.set.hostId !== null && existing.set.hostId !== req.hostUser.id) return res.status(403).json({ error: 'You do not own this question.' });
    const updated = await prisma.question.update({
      where: { id: req.params.id },
      data: {
        question: sanitizeText(question, 1000),
        options: Array.isArray(options) ? options.map(o => sanitizeText(String(o), 500)) : existing.options,
        answer: parseInt(answer),
        category: sanitizeText(category, 100),
        difficulty: sanitizeText(difficulty, 20),
        scripture: sanitizeText(scripture || '', 500),
      },
    });
    res.json({ question: updated });
  } catch (err) {
    res.status(500).json({ error: 'Failed to update question.' });
  }
});

// DELETE /api/questions/:id
router.delete('/questions/:id', requireHost, async (req, res) => {
  try {
    const existing = await prisma.question.findUnique({ where: { id: req.params.id }, include: { set: true } });
    if (!existing) return res.status(404).json({ error: 'Question not found.' });
    if (existing.set.hostId !== null && existing.set.hostId !== req.hostUser.id) return res.status(403).json({ error: 'You do not own this question.' });
    await prisma.question.delete({ where: { id: req.params.id } });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete question.' });
  }
});

module.exports = router;
