const express = require('express');

const router = express.Router();

router.get('/sets', (req, res) => {
  res.status(501).json({ error: 'Question set routes not implemented in this checkout.' });
});

module.exports = router;

