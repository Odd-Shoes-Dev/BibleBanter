const express = require('express');

const router = express.Router();

router.get('/games', (req, res) => {
  res.status(501).json({ error: 'Game history routes not implemented in this checkout.' });
});

module.exports = router;

