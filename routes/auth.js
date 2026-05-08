const express = require('express');

const router = express.Router();

// Placeholder auth routes.
// Real implementation (JWT + Google OAuth) may be missing from this checkout.
router.get('/health', (req, res) => res.json({ ok: true }));

module.exports = router;

