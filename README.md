# 📖 Bible Banter

A real-time multiplayer Bible trivia platform for churches, fellowships, and youth groups — Kahoot-style, powered by AI.

![Stack](https://img.shields.io/badge/Stack-React%20%2B%20Socket.IO%20%2B%20Prisma-blue) ![AI](https://img.shields.io/badge/AI-Google%20Gemini%202.0-purple) ![DB](https://img.shields.io/badge/DB-PostgreSQL%20%2F%20Neon-teal) ![License](https://img.shields.io/badge/License-MIT-green)

---

## ✨ Features

- **Real-time multiplayer** — unlimited players join via 6-digit PIN or QR code scan
- **AI quiz generator** — generate questions from sermon text, PDFs, or any Bible topic using Google Gemini
- **Custom question upload** — upload via CSV, PDF, Word (.docx), or Plain Text (.txt)
- **Understanding reports** — AI-generated post-game analysis showing what stuck, per question
- **Game history** — full archive of past games with per-session report links
- **Solo practice mode** — individual timed practice, no host required
- **Global leaderboard** — all-time top scorers shown on the landing page
- **Speed scoring** — faster correct answers earn more points
- **Streak multiplier** — 3+ correct answers in a row earns a 1.2× bonus 🔥
- **Live leaderboard** — updates in real-time after every question
- **Configurable settings** — adjustable question timer (5–120s) and rounds per batch (1–50)
- **Reconnection handling** — players and hosts can rejoin within a 20-second grace period
- **Responsive design** — works on mobile, tablet, and desktop/projector

---

## 🚀 Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) v18 or higher
- npm
- A [Neon](https://neon.tech) PostgreSQL database (free tier)
- A [Google AI Studio](https://aistudio.google.com) Gemini API key (free tier)

### Installation

```bash
# Clone the repository
git clone https://github.com/shadrack-ss/BitbleBattle.git
cd BitbleBattle

# Install backend dependencies
npm install

# Install frontend dependencies
cd client && npm install && cd ..
```

### Environment Setup

Create a `.env` file in the project root:

```env
DATABASE_URL="postgresql://..."       # Neon PostgreSQL connection string
JWT_SECRET="your-long-random-secret"  # Any long random string
PORT=3001
GEMINI_API_KEY=AIza...                # From aistudio.google.com
```

Create `client/.env` for local development:

```env
VITE_BACKEND_URL=http://localhost:3001
```

### Database Setup

```bash
npx prisma generate
npx prisma db push
```

### Running Locally

Open **two terminals**:

**Terminal 1 — Backend (port 3001):**
```bash
node server.js
```

**Terminal 2 — Frontend (port 5173):**
```bash
cd client
npm run dev
```

Then open **http://localhost:5173** in your browser.

---

## 🎮 How to Play

### Host
1. Log in or register as a host
2. Click **Host a Game** → select or upload a question set
3. Configure timer and round size (optional)
4. Share the **6-digit PIN** or **QR code** with players
5. Click **Start Game** and advance questions manually or let them auto-advance
6. View the **Understanding Report** on the Game Over screen

### Player
1. Click **Join Game** (or scan the host's QR code)
2. Enter the 6-digit PIN and your name
3. Answer each question as fast as possible — speed earns bonus points
4. See your rank and score update live after every question

### Solo Practice
1. Click **Solo Practice** on the landing page — no login needed
2. Choose testament filter and difficulty
3. Answer timed questions and see your personal score

---

## 📁 Project Structure

```
BitbleBattle/
├── server.js                  # Express + Socket.IO server entry point
├── questions.js               # Default question bank
├── package.json               # Backend dependencies
├── prisma/
│   └── schema.prisma          # Database schema (Host, Game, Player, Reports…)
├── routes/
│   ├── auth.js                # Registration, login, Google OAuth
│   ├── sets.js                # Question set CRUD
│   ├── games.js               # Game history API
│   ├── ai.js                  # AI quiz generation + report endpoints
│   ├── reports.js             # Understanding report archive
│   └── upload.js              # File upload + parsing (CSV/PDF/DOCX/TXT)
├── FEATURES.md                # Full feature documentation
├── QUESTION_UPLOAD_GUIDE.md   # Upload format guide
│
└── client/                    # React + Vite frontend
    ├── index.html
    └── src/
        ├── App.jsx                  # Router + global socket handlers
        ├── socket.js                # Socket.IO client instance
        ├── index.css                # Global styles + Tailwind utilities
        └── pages/
            ├── LandingPage.jsx      # Welcome screen + global leaderboard
            ├── LoginPage.jsx        # Host login
            ├── RegisterPage.jsx     # Host registration
            ├── HostSetup.jsx        # Game setup + question set selection
            ├── HostLobby.jsx        # Host waiting room + QR code
            ├── PlayerLobby.jsx      # Player waiting room
            ├── JoinPage.jsx         # Join with PIN
            ├── GameScreen.jsx       # Live question view
            ├── ResultsScreen.jsx    # Per-question results + leaderboard
            ├── GameOver.jsx         # Final podium + report link
            ├── AiQuizGenerator.jsx  # AI-powered quiz generation (4-step)
            ├── UploadQuestions.jsx  # Manual file upload modal
            ├── EditSet.jsx          # Edit saved question sets
            ├── SoloPractice.jsx     # Solo timed practice mode
            ├── GameHistory.jsx      # Past games archive
            ├── SessionReport.jsx    # Per-game AI understanding report
            └── ReportsPage.jsx      # All reports archive
```

---

## 🔌 Socket Events

| Event | Direction | Description |
|-------|-----------|-------------|
| `create-game` | Client → Server | Host creates a new game |
| `join-game` | Client → Server | Player joins with PIN and name |
| `start-game` | Client → Server | Host starts the game |
| `submit-answer` | Client → Server | Player submits answer index |
| `next-question` | Client → Server | Host advances to next question |
| `player-joined` | Server → Client | Updated player list broadcast |
| `new-question` | Server → Client | Next question broadcast to all |
| `answer-result` | Server → Player | Player's result + updated score |
| `answer-progress` | Server → All | Live answer count during question |
| `question-results` | Server → All | End-of-question leaderboard |
| `game-over` | Server → All | Final leaderboard + `dbGameId` for reports |
| `reconnect-success` | Server → Client | Confirms successful rejoin |

---

## 📤 Custom Question Upload

See **[QUESTION_UPLOAD_GUIDE.md](./QUESTION_UPLOAD_GUIDE.md)** for full details.

Supported formats: `.csv` · `.pdf` · `.docx` · `.txt` — max 10 MB

### Quick CSV format:
```csv
question,optionA,optionB,optionC,optionD,answer,category,difficulty,scripture
"Who built the ark?","Moses","Noah","Abraham","David",1,"Old Testament","easy","Genesis 6:14 — '...'"
```
> `answer` is 0-indexed: A=0, B=1, C=2, D=3

---

## 🛠 Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18 + Vite + React Router v7 |
| Styling | TailwindCSS v3 |
| Fonts | Bangers, Nunito, Orbitron, Cinzel (Google Fonts) |
| Real-time | Socket.IO (client + server) |
| QR Code | qrcode.react |
| Backend | Node.js + Express |
| Database | PostgreSQL via [Neon](https://neon.tech) (serverless) |
| ORM | Prisma 5 |
| Auth | JWT + bcryptjs + Google OAuth (`@react-oauth/google`) |
| AI | Google Gemini 2.0 Flash (`@google/generative-ai`) |
| File Parsing | multer, mammoth, pdf-parse, csv-parse |
| Deployment | Vercel (frontend) + Render (backend) |

---

## ⚙️ Deployment

### Backend — Render
- Build command: `npm install && npx prisma generate`
- Start command: `node server.js`
- Required env vars: `DATABASE_URL`, `JWT_SECRET`, `GEMINI_API_KEY`, `ALLOWED_ORIGINS`

### Frontend — Vercel
- Root directory: `client`
- Build command: `npm run build`
- Required env var: `VITE_BACKEND_URL=https://your-backend.onrender.com`

---

## 📜 License

MIT — free to use for church events, Bible studies, and educational purposes.

---

*Built with ❤️ by [Odd Shoes](https://www.oddshoes.dev) in partnership with [Kingdom Chaplain](https://betweenhisshoulders.org)*
