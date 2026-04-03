const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const { OAuth2Client } = require('google-auth-library');
const prisma = require('../lib/prisma');
const { requireHost } = require('../middleware/auth');
const { sanitizeText } = require('../utils/sanitize');
const { createRateLimit } = require('../utils/rateLimit');
const { sendResetEmail } = require('../utils/email');

const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

// Rate-limit: 10 attempts per minute for register/login
const authLimiter = createRateLimit({ windowMs: 60_000, max: 10, message: 'Too many auth attempts. Try again in a minute.' });

// POST /api/auth/register
router.post('/register', authLimiter, async (req, res) => {
  try {
    const { email, password, name } = req.body;
    if (!email || !password || !name) return res.status(400).json({ error: 'email, password, and name are required.' });
    const safeName = sanitizeText(name, 100);
    const exists = await prisma.host.findUnique({ where: { email } });
    if (exists) return res.status(400).json({ error: 'Email already registered.' });
    const passwordHash = await bcrypt.hash(password, 12);
    const host = await prisma.host.create({ data: { email, passwordHash, name: safeName } });
    const token = jwt.sign({ id: host.id, email: host.email, name: host.name }, process.env.JWT_SECRET, { expiresIn: '30d' });
    res.json({ token, host: { id: host.id, email: host.email, name: host.name } });
  } catch (err) {
    console.error('Register error:', err);
    res.status(500).json({ error: 'Registration failed.' });
  }
});

// POST /api/auth/login
router.post('/login', authLimiter, async (req, res) => {
  try {
    const { email, password } = req.body;
    const host = await prisma.host.findUnique({ where: { email } });
    if (!host || !host.passwordHash || !(await bcrypt.compare(password, host.passwordHash)))
      return res.status(401).json({ error: 'Invalid email or password.' });
    const token = jwt.sign({ id: host.id, email: host.email, name: host.name }, process.env.JWT_SECRET, { expiresIn: '30d' });
    res.json({ token, host: { id: host.id, email: host.email, name: host.name } });
  } catch (err) {
    res.status(500).json({ error: 'Login failed.' });
  }
});

// POST /api/auth/google
router.post('/google', authLimiter, async (req, res) => {
  try {
    const { credential } = req.body;
    if (!credential) return res.status(400).json({ error: 'No credential provided.' });
    if (!process.env.GOOGLE_CLIENT_ID) return res.status(503).json({ error: 'Google Sign In not configured.' });

    const ticket = await googleClient.verifyIdToken({
      idToken: credential,
      audience: process.env.GOOGLE_CLIENT_ID,
    });
    const payload = ticket.getPayload();
    const { sub: googleId, email, name } = payload;

    let host = await prisma.host.findFirst({ where: { OR: [{ googleId }, { email }] } });
    if (host) {
      if (!host.googleId) await prisma.host.update({ where: { id: host.id }, data: { googleId } });
    } else {
      host = await prisma.host.create({
        data: { email, name: name || email.split('@')[0], googleId },
      });
    }

    const token = jwt.sign({ id: host.id, email: host.email, name: host.name }, process.env.JWT_SECRET, { expiresIn: '30d' });
    res.json({ token, host: { id: host.id, email: host.email, name: host.name } });
  } catch (err) {
    console.error('Google auth error:', err.message);
    res.status(401).json({ error: 'Google authentication failed.' });
  }
});

// GET /api/auth/me
router.get('/me', requireHost, async (req, res) => {
  const host = await prisma.host.findUnique({
    where: { id: req.hostUser.id },
    select: { id: true, email: true, name: true, createdAt: true },
  });
  if (!host) return res.status(404).json({ error: 'Not found.' });
  res.json({ host });
});

// POST /api/auth/forgot-password
router.post('/forgot-password', authLimiter, async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ error: 'Email is required.' });

    const host = await prisma.host.findUnique({ where: { email } });
    if (!host) {
      // Return a 200 even if not found to prevent user enumeration
      return res.json({ message: 'If an account with that email exists, we have sent a password reset link. Please check your spam folder if it doesn\'t appear in your inbox.' });
    }

    const resetToken = crypto.randomBytes(32).toString('hex');
    const hash = crypto.createHash('sha256').update(resetToken).digest('hex');
    const expiry = new Date(Date.now() + 3600000); // 1 hour token

    await prisma.host.update({
      where: { email },
      data: {
        resetToken: hash,
        resetTokenExpires: expiry,
      },
    });

    // Send via utility
    const sent = await sendResetEmail(email, resetToken);
    if (!sent) {
      return res.status(500).json({ error: 'Error sending email. Please try again later.' });
    }

    res.json({ message: 'If an account with that email exists, we have sent a password reset link. Please check your spam folder if it doesn\'t appear in your inbox.' });
  } catch (err) {
    console.error('Forgot password error:', err);
    res.status(500).json({ error: 'Failed to process request.' });
  }
});

// POST /api/auth/reset-password
router.post('/reset-password', authLimiter, async (req, res) => {
  try {
    const { token, password } = req.body;
    if (!token || !password) return res.status(400).json({ error: 'Token and new password are required.' });

    const hash = crypto.createHash('sha256').update(token).digest('hex');
    
    const host = await prisma.host.findFirst({
      where: {
        resetToken: hash,
        resetTokenExpires: { gt: new Date() }, // ensure it's not expired
      },
    });

    if (!host) {
      return res.status(400).json({ error: 'Invalid or expired password reset token.' });
    }

    const newPasswordHash = await bcrypt.hash(password, 12);

    await prisma.host.update({
      where: { id: host.id },
      data: {
        passwordHash: newPasswordHash,
        resetToken: null,
        resetTokenExpires: null,
      },
    });

    res.json({ message: 'Password has been successfully reset. You may now log in.' });
  } catch (err) {
    console.error('Reset password error:', err);
    res.status(500).json({ error: 'Failed to reset password.' });
  }
});

module.exports = router;
