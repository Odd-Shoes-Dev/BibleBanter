require('dotenv').config();
const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const path = require('path');
const prisma = require('./lib/prisma');

// ── CORS configuration ──────────────────────────────────────────────────────
// In production, set ALLOWED_ORIGINS to your actual frontend domain(s).
// e.g. ALLOWED_ORIGINS=https://biblebanter.vercel.app,https://bitblebattle.onrender.com
const allowedOrigins = process.env.ALLOWED_ORIGINS
  ? process.env.ALLOWED_ORIGINS.split(',').map(o => o.trim())
  : [
      'http://localhost:5173',
      'http://localhost:3001',
      'https://bible-banter.vercel.app',
      'https://bitblebattle.onrender.com',
    ];

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: allowedOrigins, methods: ['GET', 'POST'] },
  pingTimeout: 60000,
  pingInterval: 25000,
  connectTimeout: 45000,
});

app.use(cors({ origin: allowedOrigins }));
app.use(express.json());

// ── REST routes ──────────────────────────────────────────────────────────────
app.use('/api/auth', require('./routes/auth'));
app.use('/api',      require('./routes/sets'));
app.use('/api',      require('./routes/games'));
app.use('/api/ai',   require('./routes/ai'));
app.use('/api',      require('./routes/reports'));
app.use('/api',      require('./routes/upload'));

// ── Ping (keep-alive target) ────────────────────────────────────────────────
app.get('/api/ping', (req, res) => res.json({ ok: true, ts: Date.now() }));

// ── Serve React production build if it exists ────────────────────────────────
const distPath = path.join(__dirname, 'client', 'dist');
if (require('fs').existsSync(distPath)) {
  app.use(express.static(distPath));
}

// ── Socket.IO real-time handlers ─────────────────────────────────────────────
const setupSocketHandlers = require('./socket/handlers');
setupSocketHandlers(io);

// ── SPA fallback (client-side routing) ───────────────────────────────────────
app.get('*', (req, res) => {
  const indexPath = path.join(__dirname, 'client', 'dist', 'index.html');
  if (require('fs').existsSync(indexPath)) {
    res.sendFile(indexPath);
  } else {
    res.json({ status: 'Bible Banter API running' });
  }
});

// ── Start server ─────────────────────────────────────────────────────────────
const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
  console.log(`Bible Banter server running on http://localhost:${PORT}`);
});

// ── Keep-alive: prevent Render backend + Neon DB from sleeping ───────────────
const KEEP_ALIVE_INTERVAL = 5 * 60 * 1000; // 5 minutes

setInterval(async () => {
  const backendUrl = process.env.RENDER_EXTERNAL_URL || `http://localhost:${PORT}`;
  try {
    await fetch(`${backendUrl}/api/ping`);
    console.log('[keep-alive] backend ping ok');
  } catch (e) {
    console.warn('[keep-alive] backend ping failed:', e.message);
  }

  try {
    await prisma.$queryRaw`SELECT 1`;
    console.log('[keep-alive] neon db ping ok');
  } catch (e) {
    console.warn('[keep-alive] neon db ping failed:', e.message);
  }
}, KEEP_ALIVE_INTERVAL);
