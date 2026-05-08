const express = require('express');

const router = express.Router();

router.get('/health', (req, res) => res.json({ ok: true }));

router.post('/generate', (req, res) => {
  res.status(501).json({ error: 'AI generation route not implemented in this checkout.' });
});

module.exports = router;

