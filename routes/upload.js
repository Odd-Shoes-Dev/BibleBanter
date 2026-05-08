const express = require('express');

const router = express.Router();

router.post('/upload', (req, res) => {
  res.status(501).json({ error: 'Upload route not implemented in this checkout.' });
});

module.exports = router;

