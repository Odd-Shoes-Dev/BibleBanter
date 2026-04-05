# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What This Is

Bible Banter — a real-time multiplayer Bible trivia platform (Kahoot-style). Hosts create games, players join via 6-digit PIN, and questions are answered live with speed-based scoring and streak multipliers. AI-powered quiz generation uses Google Gemini.

## Commands

### Backend (root directory)
```bash
npm run dev              # Start backend with nodemon (port 3001)
npm start                # Start backend with node
npm test                 # Run Jest tests (tests/)
npx jest tests/sanitize.test.js  # Run a single test file
```

### Frontend (client/)
```bash
cd client
npm run dev              # Start Vite dev server (port 5173)
npm run build            # Production build → client/dist/
```

### Database
```bash
npx prisma generate      # Regenerate Prisma client after schema changes
npx prisma db push       # Push schema to database (no migration files)
npx prisma migrate dev   # Create and apply a migration
npm run seed             # Seed database (prisma/seed.js)
```

## Architecture

### Two-process dev setup
Backend (Express + Socket.IO on :3001) and frontend (React + Vite on :5173) run separately. Vite proxies `/socket.io` to the backend (see `client/vite.config.js`). In production, the backend serves `client/dist/` as static files with SPA fallback.

### Real-time game engine
All game state lives **in-memory** in `socket/handlers.js` (the `games` object — a plain JS map keyed by PIN). This is the core of the app. It manages the full game lifecycle: lobby → question → results → game over. The database (via Prisma) is used to persist finished games, players, answers, and reports — not live game state.

Disconnection handling uses a grace-period timer map (`disconnectTimers`) that gives players/hosts 20 seconds to reconnect before being removed.

### Backend structure
- `server.js` — Express app, Socket.IO server, CORS config, keep-alive pings
- `socket/handlers.js` — All socket event handlers and in-memory game state (this is the largest and most critical file)
- `routes/` — REST API: `auth.js` (JWT + Google OAuth), `sets.js` (question set CRUD), `games.js` (game history), `ai.js` (Gemini quiz generation + reports), `upload.js` (file upload parsing), `reports.js` (session reports)
- `middleware/auth.js` — JWT auth middleware (`requireHost`, `optionalHost`)
- `lib/gemini.js` — Google Gemini client (gemini-2.5-flash model)
- `lib/prisma.js` — Prisma client singleton
- `utils/` — `parseQuestions.js` (CSV/PDF/DOCX/TXT parsing), `sanitize.js`, `rateLimit.js`, `email.js`
- `questions.js` — Default question bank (fallback when no set is selected)

### Frontend structure
- React 18 + Vite + React Router v7 + TailwindCSS v3
- `client/src/socket.js` — Socket.IO client instance (shared across all pages)
- `client/src/App.jsx` — Router and global socket event handlers
- `client/src/pages/` — All page components (no nested component directories)
- Path alias: `@` maps to `client/src/`

### Database (Prisma + PostgreSQL/Neon)
Schema in `prisma/schema.prisma`. Key models: `Host`, `QuestionSet`, `Question`, `Game`, `Player` (composite key: `[name, gameId]`), `PlayerAnswer`, `SessionReport`, `SystemStat`.

### Scoring
- Max 1000 points per question, scaled by response speed
- 3+ correct streak gives 1.2x multiplier
- Answer index is 0-based (A=0, B=1, C=2, D=3)

## Environment Variables

Backend `.env`: `DATABASE_URL`, `JWT_SECRET`, `PORT`, `GEMINI_API_KEY`, `ALLOWED_ORIGINS`
Frontend `client/.env`: `VITE_BACKEND_URL`

## Deployment

- Backend: Render (build: `npm install && npx prisma generate`, start: `node server.js`)
- Frontend: Vercel (root: `client`, build: `npm run build`)
