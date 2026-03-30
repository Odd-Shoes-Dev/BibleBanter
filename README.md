# ⚔️ Bible Banter

A real-time multiplayer Bible trivia game — Kahoot-style, built for church events and Bible study groups.

![Bible Banter](https://img.shields.io/badge/Stack-React%20%2B%20Socket.io-blue) ![License](https://img.shields.io/badge/License-MIT-green)

---

## ✨ Features

- **Real-time multiplayer** — unlimited players join via PIN or QR code scan
- **Host & player roles** — host controls the game from their screen; players answer on their own devices
- **Testament selection** — host picks Old Testament, New Testament, or Mixed before starting
- **Custom question upload** — upload your own questions via CSV, PDF, or Word (.docx)
- **Speed scoring** — faster correct answers earn more points
- **Streak multiplier** — 3+ correct answers in a row earns a 1.2× bonus 🔥
- **Live leaderboard** — updates in real-time as players answer
- **QR code** — players scan to join instantly without typing the URL
- **Game Over podium** — top 3 players shown on an animated podium
- **Responsive design** — works on mobile, tablet, and desktop/projector

---

## 🚀 Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) v18 or higher
- npm

### Installation

```bash
# Clone the repository
git clone https://github.com/shadrack-ss/BitbleBattle.git
cd BitbleBattle

# Install backend dependencies
npm install

# Install frontend dependencies
cd client
npm install
cd ..
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
1. Click **Host a Game** on the landing page
2. Choose a category: **Old Testament**, **New Testament**, or **Mixed**
3. *(Optional)* Click **📂 Upload Custom Questions** to use your own question set
4. Share the **6-digit PIN** or **QR code** with players
5. Click **🚀 Start Game** once players have joined
6. After each question, click **⏭️ Next Question** to advance
7. At the end, click **🏆 Final Results** to see the Game Over podium

### Player
1. Click **Join Game** on the landing page (or scan the host's QR code)
2. Enter the 6-digit PIN and your name
3. Wait in the lobby until the host starts
4. Answer each question as fast as possible — speed earns more points!
5. See your rank and score after every round

---

## 📁 Project Structure

```
BitbleBattle/
├── server.js               # Express + Socket.io backend
├── questions.js            # Default question bank (24 questions)
├── package.json            # Backend dependencies
├── QUESTION_UPLOAD_GUIDE.md # Guide for uploading custom questions
│
└── client/                 # React + Vite frontend
    ├── index.html
    ├── public/
    │   └── kampus-logo.jpeg
    └── src/
        ├── App.jsx          # Main app state + socket event handlers
        ├── socket.js        # Socket.io client instance
        ├── index.css        # Global styles + Tailwind utilities
        └── pages/
            ├── LandingPage.jsx      # Welcome screen
            ├── HostSetup.jsx        # Testament category selection
            ├── HostLobby.jsx        # Host waiting room + QR code + upload
            ├── PlayerLobby.jsx      # Player waiting room
            ├── JoinPage.jsx         # Join with PIN
            ├── GameScreen.jsx       # Question view (host + player)
            ├── ResultsScreen.jsx    # Per-question results + leaderboard
            ├── GameOver.jsx         # Final podium + full rankings
            └── UploadQuestions.jsx  # Question upload modal
```

---

## 🔌 Socket Events

| Event | Direction | Description |
|-------|-----------|-------------|
| `create-game` | Client → Server | Host creates a new game with testament filter |
| `join-game` | Client → Server | Player joins with PIN and name |
| `set-questions` | Client → Server | Host uploads custom questions |
| `start-game` | Client → Server | Host starts the game |
| `submit-answer` | Client → Server | Player submits answer index |
| `next-question` | Client → Server | Host advances to next question |
| `player-joined` | Server → Client | Broadcast updated player list |
| `new-question` | Server → Client | Broadcast next question to all |
| `answer-result` | Server → Player | Player's answer result + score |
| `answer-progress` | Server → All | Live answer count + leaderboard |
| `question-results` | Server → All | End-of-question results |
| `game-over` | Server → All | Final leaderboard |

---

## 📤 Custom Question Upload

See **[QUESTION_UPLOAD_GUIDE.md](./QUESTION_UPLOAD_GUIDE.md)** for full details.

### Quick CSV format:
```csv
question,optionA,optionB,optionC,optionD,answer,category,difficulty,scripture
"Who built the ark?","Moses","Noah","Abraham","David",1,"Old Testament","easy","Genesis 6:14"
```
> `answer` is 0-indexed: A=0, B=1, C=2, D=3

Supported formats: `.csv` · `.pdf` · `.docx` — max 10 MB

---

## 🛠 Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18, Vite, TailwindCSS |
| UI Components | Custom components, Lucide-style icons |
| Fonts | Anton (titles), Cinzel, Nunito (Google Fonts) |
| Real-time | Socket.io client |
| QR Code | qrcode.react |
| Backend | Node.js, Express |
| Real-time | Socket.io server |
| File Parsing | multer, mammoth (DOCX), pdf-parse (PDF), csv-parse (CSV) |

---

## ⚙️ Environment

The frontend auto-connects to the backend. For production deployment:

- Set `VITE_BACKEND_URL` in `client/.env` to your backend URL
- Build the client: `cd client && npm run build`
- The Express server will serve the built files from `client/dist/`

```bash
# Production build + serve
cd client && npm run build
cd ..
node server.js   # serves both API and static frontend on port 3001
```

---

## 📜 License

MIT — free to use for church events, Bible studies, and educational purposes.

---

*Built with ❤️ for the Kampus community*
