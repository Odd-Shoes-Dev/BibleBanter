const express = require('express');

const router = express.Router();

router.get('/reports', (req, res) => {
  res.status(501).json({ error: 'Reports routes not implemented in this checkout.' });
});

module.exports = router;

