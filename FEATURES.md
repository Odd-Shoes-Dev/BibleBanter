# Bible Banter — Feature Documentation

> A live multiplayer Bible quiz platform for churches, fellowships, and youth groups.
> Built with React + Vite (frontend), Express + Socket.IO (backend), PostgreSQL via Neon (database).

---

## Table of Contents

1. [Player Experience](#1-player-experience)
2. [Host Game Flow](#2-host-game-flow)
3. [Question Management](#3-question-management)
4. [AI Quiz Generator](#4-ai-quiz-generator)
5. [Understanding Reports](#5-understanding-reports)
6. [Game History & Report Archive](#6-game-history--report-archive)
7. [Solo Practice Mode](#7-solo-practice-mode)
8. [Global Leaderboard](#8-global-leaderboard)
9. [Authentication](#9-authentication)
10. [Tech Stack](#10-tech-stack)
11. [Environment Variables](#11-environment-variables)
12. [Deployment](#12-deployment)

---

## 1. Player Experience

### Joining a Game
- Players visit the app URL and click **Join Game**
- Enter a 6-digit PIN shared by the host (or scan the **QR code** from the host lobby)
- Choose a display name
- Wait in a lobby that shows connected players in real time
- **Reconnection:** Players who drop mid-game can rejoin with the same PIN and name within a 20-second grace period

### Gameplay
- Questions appear one at a time with a countdown timer
- 4 answer options (A / B / C / D) shown as coloured buttons
- Points scored based on correctness + speed (faster = more points)
- **Streak bonus:** 3+ correct answers in a row earns a 1.2× score multiplier
- After each answer, the correct answer is revealed with the scripture reference

### Results & Leaderboard
- Live leaderboard updates after every question
- Final **Game Over** screen shows podium (1st / 2nd / 3rd), full rankings, scores, and streaks

---

## 2. Host Game Flow

### Starting a Session
1. Log in as a host
2. Go to **Host Setup** → choose a question set (default or custom)
3. Configure optional settings: **question timer** (5–120s, default 20s) and **rounds per batch** (1–50, default 10)
4. A unique 6-digit PIN is generated
5. Share the PIN or **QR code** with players
6. Click **Start Game** when ready

### During the Game
- Host view shows live answer progress (how many players have answered)
- Questions auto-advance after the results timer expires (7 seconds)
- Host can manually advance at any time
- If the host disconnects, players are notified; host can rejoin within 20 seconds
- Large sets are split into batches with a **Continue Game** button between rounds

### After the Game
- Host sees the full leaderboard on the Game Over screen
- **📊 View Understanding Report** button appears automatically for hosts
- Report is AI-generated instantly from the game data

---

## 3. Question Management

### Default Questions
- 24 built-in questions covering Old and New Testament
- Filterable by: **Old Testament**, **New Testament**, or **Mixed (Both)**

### Uploading a Custom Set
1. Go to **My Sets** tab in Host Setup
2. Click **＋ Upload New Set**
3. Upload a **CSV**, **DOCX**, or **PDF** file
4. Preview parsed questions (scripture highlighted, warnings for missing scripture)
5. Choose a **Testament** tag (Old / New / Mixed)
6. Name the set and save

**CSV Format:**
```
question,optionA,optionB,optionC,optionD,answer,category,difficulty,scripture
"Who built the ark?","Moses","Noah","Abraham","David",1,"Old Testament","easy","Genesis 6:14 — 'So make yourself an ark...'"
```
- `answer` = 0-indexed correct option (0 = A, 1 = B, 2 = C, 3 = D)
- Download the template from the upload modal

### Editing a Set
- Click **✏️ Edit** on any custom set card
- Add, edit, or delete individual questions inline
- Changes are saved immediately to the database

### Deleting a Set
- Click **🗑 Delete** → confirm in the modal
- Permanently removes the set and all its questions

---

## 4. AI Quiz Generator

> Powered by **Google Gemini 2.0 Flash** (free tier — 1,500 requests/day).

### How It Works
Access via **My Sets → ✨ Generate with AI**

**Step 1 — Content**
- Paste sermon notes, Bible study outlines, or fellowship notes directly
- OR upload a **PDF**, **DOCX**, or **TXT** file (text is extracted automatically)
- Content is truncated to 8,000 tokens before being sent to the AI

**Step 2 — Settings**

| Setting | Options |
|---|---|
| **Audience** | General Church, Gen Z, Youth, Adults, Children |
| **Tone** | Conversational, Playful, Energetic, Formal, Simple |
| **Question Count** | 5 or 10 |
| **Testament Tag** | Old Testament, New Testament, Mixed |
| **Custom Instruction** | Optional free-text override (e.g. "Make it extra relatable for university students") |

**Step 3 — Review**
- All generated questions shown as expandable cards
- Each card shows: question text, all 4 options (correct answer highlighted), category, difficulty, scripture
- **♻ Regenerate** — replaces one question with a fresh AI-generated alternative (different from existing questions)
- **🗑 Remove** — removes a question with confirmation
- Regenerate / remove as many times as needed before saving

**Step 4 — Save**
- Name the set (e.g. "Sunday Sermon — John 3:16")
- Summary shown: question count, audience, tone, testament
- Saved to **My Sets** library, available immediately for hosting

### AI Guardrails
- Questions are generated **only from the provided content** — no outside information added
- Doctrine and biblical meaning are never altered — only style/tone changes
- Questions always require host review before being used in a game
- AI output is validated and sanitised before saving (malformed responses are rejected)

---

## 5. Understanding Reports

### What Is a Report?
After every finished game, an **Understanding Report** is automatically generated for the host. It analyses player answers and produces a readable breakdown of what the group understood, what they missed, and what may need follow-up.

### Accessing Reports
- **Immediately after a game:** Click **📊 VIEW UNDERSTANDING REPORT** on the Game Over screen (visible to hosts only)
- **Later:** Go to **Game History** → click **📊 View Understanding Report** under any finished game
- **Archive:** Go to **📊 Reports** from the landing page (logged-in hosts)

### Report Contents

**Summary Stats**
| Stat | Description |
|---|---|
| Players | Total participants in the session |
| Accuracy | Overall % of correct answers across all questions |
| Avg Score | Average final score across all players |

**AI Written Summary**
- 3–4 sentence plain-language paragraph written by Gemini
- Describes what the group understood well, what they struggled with, and suggests follow-up topics
- Written in warm, church-friendly language (not corporate)

**Question Breakdown**
Each question shows:
- Question text
- Correct answer
- Scripture reference (if available)
- Accuracy bar (colour-coded)
- Understanding label:
  - ✅ **Well understood** — ≥ 75% correct
  - 🟡 **Partly understood** — 40–74% correct
  - 🔴 **Needs follow-up** — < 40% correct
- Answered correctly count (e.g. 7/10)
- Average response time in seconds

**Highlights**
- ✅ **Strongest question** — highest accuracy
- 🔴 **Needs follow-up** — lowest accuracy

**Topics to Revisit**
- All questions marked 🔴 listed for easy reference during the next session

### How Reports Are Generated
1. Game ends → `game-over` socket event fires
2. Host clicks report button → `GET /api/games/:id/report` is called
3. Server fetches all `PlayerAnswer` rows for the game (including `responseTimeMs`)
4. Per-question statistics are computed
5. Gemini Flash generates the AI summary paragraph
6. Report is saved to the `SessionReport` table (cached — regenerating the same game returns the stored report)

---

## 6. Game History & Report Archive

### Game History (`/history`)
- Lists all games hosted, ordered by most recent
- Shows: PIN, question set name, player count, status, date
- Click any game to see the **Final Leaderboard** for that session
- Finished games show a **📊 View Understanding Report** button

### Reports Page (`/reports`)
- Dedicated archive of all generated understanding reports
- Shows: set name, date, player count, accuracy %
- Preview of the AI summary (first 120 characters)
- Click any row to open the full report

---

## 7. Solo Practice Mode

- Available from the landing page via **Solo Practice** (no login required)
- Players choose a testament filter (Old / New / Mixed) and difficulty
- Questions drawn from the default question bank
- Timed per question — score based on speed and accuracy
- Personal score shown at the end; no leaderboard or host required

---

## 8. Global Leaderboard

- Shown on the landing page (visible to all visitors)
- Displays the top 10 all-time highest scorers across all games
- Shows: rank, name, total score, and number of games played
- Updates automatically after each game finishes

---

## 9. Authentication

- Hosts register with name, email, and password (bcrypt-hashed)
- JWT tokens stored in `localStorage` (`bb_token`, `bb_host`)
- All host-only API endpoints are protected by `requireHost` middleware
- Players do not need accounts — they join with just a name and PIN

---

## 10. Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 18 + Vite |
| Styling | TailwindCSS v3 |
| Real-time | Socket.IO (client + server) |
| Backend | Node.js + Express |
| Database | PostgreSQL (Neon serverless) |
| ORM | Prisma 5 |
| Auth | JWT + bcryptjs |
| AI | Google Gemini 2.0 Flash (`@google/generative-ai`) |
| File Parsing | `pdf-parse`, `mammoth`, `csv-parse` |
| QR Codes | `qrcode.react` |
| Deployment | Vercel (frontend) + Render (backend) |
| Routing | React Router v7 |

### Database Models

| Model | Purpose |
|---|---|
| `Host` | Admin/pastor accounts |
| `QuestionSet` | Named groups of questions (default or custom) |
| `Question` | Individual questions with options, answer, scripture |
| `Game` | Live game session (PIN, status, set, host) |
| `Player` | Player in a game (name, score, streak) |
| `PlayerAnswer` | Each player's answer per question (+ response time) |
| `SessionReport` | Cached AI understanding report per game |

---

## 11. Environment Variables

### Backend (`.env`)
```
DATABASE_URL="postgresql://..."        # Neon PostgreSQL connection string
JWT_SECRET="your-secret-here"          # Long random string for JWT signing
PORT=3001                               # Server port (optional, defaults to 3001)
GEMINI_API_KEY=AIza...                 # Google AI Studio API key (free)
```

### Frontend (`client/.env.production`)
```
VITE_BACKEND_URL=https://biblebanter.onrender.com
```

### Getting a Gemini API Key (Free)
1. Go to [aistudio.google.com](https://aistudio.google.com)
2. Click **Get API Key** → **Create API Key**
3. Copy the key and add it to your environment

---

## 12. Deployment

### Backend — Render
- Service: `biblebanter` (Node.js web service)
- Build command: `npm install && npx prisma generate`
- Start command: `node server.js`
- **Required environment variables on Render:**
  - `DATABASE_URL`
  - `JWT_SECRET`
  - `GEMINI_API_KEY` ← **must be added manually for AI features to work**

### Frontend — Vercel
- Auto-deploys from `main` branch
- Environment variable: `VITE_BACKEND_URL=https://biblebanter.onrender.com`

### Database — Neon
- Serverless PostgreSQL
- Run migrations: `npx prisma migrate deploy`
- Seed default questions: `node prisma/seed.js`
