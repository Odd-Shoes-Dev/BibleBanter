require('dotenv').config();
const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const path = require('path');
const multer = require('multer');
const mammoth = require('mammoth');
const pdfParse = require('pdf-parse');
const { parse: csvParse } = require('csv-parse/sync');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { PrismaClient } = require('@prisma/client');
const { requireHost, optionalHost } = require('./middleware/auth');
const localQuestions = require('./questions');
const { GoogleGenerativeAI } = require('@google/generative-ai');

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');
const gemini = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });

const prisma = new PrismaClient();

const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 10 * 1024 * 1024 } });

function parseTextToQuestions(text) {
  const questions = [];
  const blocks = text.split(/(?=Q:|Question:)/i).map(b => b.trim()).filter(Boolean);
  for (const block of blocks) {
    const lines = block.split('\n').map(l => l.trim()).filter(Boolean);
    const q = {}; const options = [];
    for (const line of lines) {
      if (/^(Q|Question):\s*/i.test(line)) q.question = line.replace(/^(Q|Question):\s*/i, '').trim();
      else if (/^A[.):]\s*/i.test(line)) options[0] = line.replace(/^A[.):]\s*/i, '').trim();
      else if (/^B[.):]\s*/i.test(line)) options[1] = line.replace(/^B[.):]\s*/i, '').trim();
      else if (/^C[.):]\s*/i.test(line)) options[2] = line.replace(/^C[.):]\s*/i, '').trim();
      else if (/^D[.):]\s*/i.test(line)) options[3] = line.replace(/^D[.):]\s*/i, '').trim();
      else if (/^(Answer|Correct)[^:]*:\s*/i.test(line)) {
        const ans = line.replace(/^(Answer|Correct)[^:]*:\s*/i, '').trim().toUpperCase();
        q.answer = ['A','B','C','D'].indexOf(ans[0]);
      }
      else if (/^Category:\s*/i.test(line)) q.category = line.replace(/^Category:\s*/i, '').trim();
      else if (/^Difficulty:\s*/i.test(line)) q.difficulty = line.replace(/^Difficulty:\s*/i, '').trim().toLowerCase();
      else if (/^Scripture:\s*/i.test(line)) q.scripture = line.replace(/^Scripture:\s*/i, '').trim();
    }
    if (q.question && options.filter(Boolean).length >= 2 && q.answer !== undefined && q.answer >= 0) {
      while (options.length < 4) options.push('');
      q.options = options;
      q.category = q.category || 'General';
      q.difficulty = q.difficulty || 'medium';
      q.id = Date.now() + questions.length;
      questions.push(q);
    }
  }
  return questions;
}

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: '*', methods: ['GET', 'POST'] },
  pingTimeout: 60000,
  pingInterval: 25000,
  connectTimeout: 45000,
});

// Grace-period timers so brief disconnects don't immediately kick players/hosts
const disconnectTimers = new Map(); // key: `${pin}:${name}` for players, `host:${pin}` for hosts

app.use(cors());
app.use(express.json());

// ── AUTH ──────────────────────────────────────────────────────────────────────
app.post('/api/auth/register', async (req, res) => {
  try {
    const { email, password, name } = req.body;
    if (!email || !password || !name) return res.status(400).json({ error: 'email, password, and name are required.' });
    const exists = await prisma.host.findUnique({ where: { email } });
    if (exists) return res.status(400).json({ error: 'Email already registered.' });
    const passwordHash = await bcrypt.hash(password, 12);
    const host = await prisma.host.create({ data: { email, passwordHash, name } });
    const token = jwt.sign({ id: host.id, email: host.email, name: host.name }, process.env.JWT_SECRET, { expiresIn: '30d' });
    res.json({ token, host: { id: host.id, email: host.email, name: host.name } });
  } catch (err) { console.error(err); res.status(500).json({ error: 'Registration failed.' }); }
});

app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const host = await prisma.host.findUnique({ where: { email } });
    if (!host || !(await bcrypt.compare(password, host.passwordHash)))
      return res.status(401).json({ error: 'Invalid email or password.' });
    const token = jwt.sign({ id: host.id, email: host.email, name: host.name }, process.env.JWT_SECRET, { expiresIn: '30d' });
    res.json({ token, host: { id: host.id, email: host.email, name: host.name } });
  } catch (err) { res.status(500).json({ error: 'Login failed.' }); }
});

app.get('/api/auth/me', requireHost, async (req, res) => {
  const host = await prisma.host.findUnique({ where: { id: req.host.id }, select: { id: true, email: true, name: true, createdAt: true } });
  if (!host) return res.status(404).json({ error: 'Not found.' });
  res.json({ host });
});

// ── QUESTION SETS ─────────────────────────────────────────────────────────────
app.get('/api/sets', optionalHost, async (req, res) => {
  try {
    const where = req.host
      ? { OR: [{ isDefault: true }, { hostId: req.host.id }] }
      : { isDefault: true };
    const sets = await prisma.questionSet.findMany({
      where,
      select: { id: true, name: true, description: true, testament: true, isDefault: true, createdAt: true, _count: { select: { questions: true } } },
      orderBy: [{ isDefault: 'desc' }, { createdAt: 'asc' }],
    });
    res.json({ sets });
  } catch (err) { res.status(500).json({ error: 'Failed to fetch sets.' }); }
});

app.delete('/api/sets/:id', requireHost, async (req, res) => {
  try {
    const set = await prisma.questionSet.findUnique({ where: { id: req.params.id } });
    if (!set) return res.status(404).json({ error: 'Set not found.' });
    if (set.isDefault) return res.status(403).json({ error: 'Cannot delete the default set.' });
    if (set.hostId !== null && set.hostId !== req.host.id) return res.status(403).json({ error: 'You do not own this set.' });
    await prisma.questionSet.delete({ where: { id: req.params.id } });
    res.json({ success: true });
  } catch (err) { res.status(500).json({ error: 'Failed to delete set.' }); }
});

app.post('/api/sets', requireHost, async (req, res) => {
  try {
    const { name, testament = 'both', description = '' } = req.body;
    if (!name?.trim()) return res.status(400).json({ error: 'Name is required.' });
    const set = await prisma.questionSet.create({
      data: { name: name.trim(), testament, description, hostId: req.host.id },
    });
    res.json({ set });
  } catch (err) { res.status(500).json({ error: 'Failed to create set.' }); }
});

app.put('/api/sets/:id', requireHost, async (req, res) => {
  try {
    const { name } = req.body;
    if (!name?.trim()) return res.status(400).json({ error: 'Name is required.' });
    const set = await prisma.questionSet.findUnique({ where: { id: req.params.id } });
    if (!set) return res.status(404).json({ error: 'Set not found.' });
    if (set.isDefault) return res.status(403).json({ error: 'Cannot edit the default set.' });
    if (set.hostId !== null && set.hostId !== req.host.id) return res.status(403).json({ error: 'You do not own this set.' });
    const updated = await prisma.questionSet.update({ where: { id: req.params.id }, data: { name: name.trim() } });
    res.json({ set: updated });
  } catch (err) { res.status(500).json({ error: 'Failed to rename set.' }); }
});

app.get('/api/sets/:id/questions', optionalHost, async (req, res) => {
  try {
    const set = await prisma.questionSet.findUnique({ where: { id: req.params.id } });
    if (!set) return res.status(404).json({ error: 'Set not found.' });
    if (set.hostId !== null && (!req.host || set.hostId !== req.host.id)) return res.status(403).json({ error: 'You do not own this set.' });
    const questions = await prisma.question.findMany({ where: { setId: req.params.id }, orderBy: { id: 'asc' } });
    res.json({ questions, setName: set.name, testament: set.testament });
  } catch (err) { res.status(500).json({ error: 'Failed to fetch questions.' }); }
});

app.patch('/api/questions/:id', requireHost, async (req, res) => {
  try {
    const { question, options, answer, category, difficulty, scripture } = req.body;
    const existing = await prisma.question.findUnique({ where: { id: req.params.id }, include: { set: true } });
    if (!existing) return res.status(404).json({ error: 'Question not found.' });
    if (existing.set.hostId !== null && existing.set.hostId !== req.host.id) return res.status(403).json({ error: 'You do not own this question.' });
    const updated = await prisma.question.update({
      where: { id: req.params.id },
      data: { question, options, answer: parseInt(answer), category, difficulty, scripture: scripture || '' },
    });
    res.json({ question: updated });
  } catch (err) { res.status(500).json({ error: 'Failed to update question.' }); }
});

app.delete('/api/questions/:id', requireHost, async (req, res) => {
  try {
    const existing = await prisma.question.findUnique({ where: { id: req.params.id }, include: { set: true } });
    if (!existing) return res.status(404).json({ error: 'Question not found.' });
    if (existing.set.hostId !== null && existing.set.hostId !== req.host.id) return res.status(403).json({ error: 'You do not own this question.' });
    await prisma.question.delete({ where: { id: req.params.id } });
    res.json({ success: true });
  } catch (err) { res.status(500).json({ error: 'Failed to delete question.' }); }
});

app.post('/api/sets/:id/questions', requireHost, async (req, res) => {
  try {
    const { question, options, answer, category, difficulty, scripture } = req.body;
    const set = await prisma.questionSet.findUnique({ where: { id: req.params.id } });
    if (!set) return res.status(404).json({ error: 'Set not found.' });
    if (set.hostId !== null && set.hostId !== req.host.id) return res.status(403).json({ error: 'You do not own this set.' });
    const q = await prisma.question.create({
      data: { setId: req.params.id, question, options, answer: parseInt(answer), category: category || 'General', difficulty: difficulty || 'medium', scripture: scripture || '' },
    });
    res.json({ question: q });
  } catch (err) { res.status(500).json({ error: 'Failed to add question.' }); }
});

// ── GAME HISTORY ──────────────────────────────────────────────────────────────
app.get('/api/games', requireHost, async (req, res) => {
  try {
    const dbGames = await prisma.game.findMany({
      where: { hostId: req.host.id },
      orderBy: { createdAt: 'desc' },
      take: 50,
      select: { id: true, pin: true, status: true, createdAt: true, finishedAt: true, set: { select: { name: true } }, _count: { select: { players: true } } },
    });
    res.json({ games: dbGames });
  } catch (err) { res.status(500).json({ error: 'Failed to fetch games.' }); }
});

app.get('/api/games/:id', requireHost, async (req, res) => {
  try {
    const game = await prisma.game.findFirst({
      where: { id: req.params.id, hostId: req.host.id },
      include: { set: { select: { name: true } }, players: { orderBy: { score: 'desc' } } },
    });
    if (!game) return res.status(404).json({ error: 'Game not found.' });
    res.json({ game });
  } catch (err) { res.status(500).json({ error: 'Failed to fetch game.' }); }
});

app.post('/api/parse-questions', upload.single('file'), optionalHost, async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: 'No file uploaded.' });
    const { originalname, buffer } = req.file;
    const ext = originalname.split('.').pop().toLowerCase();
    let parsed = [];

    let rawText = '';
    if (ext === 'csv') {
      const records = csvParse(buffer.toString('utf8'), { columns: true, skip_empty_lines: true, trim: true });
      parsed = records.map((r) => ({
        question: r.question || r.Question || '',
        options: [r.optionA || r.OptionA || r.A || '', r.optionB || r.OptionB || r.B || '',
                  r.optionC || r.OptionC || r.C || '', r.optionD || r.OptionD || r.D || ''],
        answer: parseInt(r.answer ?? r.Answer ?? 0),
        category: r.category || r.Category || 'General',
        difficulty: (r.difficulty || r.Difficulty || 'medium').toLowerCase(),
        scripture: r.scripture || r.Scripture || '',
      })).filter(q => q.question && q.options.slice(0, 2).every(Boolean) && !isNaN(q.answer));
    } else if (ext === 'docx') {
      const result = await mammoth.extractRawText({ buffer });
      rawText = result.value;
      parsed = parseTextToQuestions(rawText);
    } else if (ext === 'pdf') {
      const data = await pdfParse(buffer);
      rawText = data.text;
      parsed = parseTextToQuestions(rawText);
    } else if (ext === 'txt') {
      rawText = buffer.toString('utf8');
      parsed = parseTextToQuestions(rawText);
    } else {
      return res.status(400).json({ error: 'Unsupported file type. Use CSV, DOCX, PDF, or TXT.' });
    }

    // If rawText present but no parsed questions (plain sermon notes), still return rawText
    if (parsed.length === 0 && !rawText) return res.status(400).json({ error: 'No valid questions found. Check the template format.' });

    // If authenticated host + setName provided → save to DB as a named question set
    let savedSetId = null;
    const setName = req.body.setName;
    if (req.host && setName) {
      const set = await prisma.questionSet.create({
        data: {
          name: setName,
          description: `Imported from ${originalname}`,
          testament: req.body.testament || 'both',
          hostId: req.host.id,
          questions: {
            create: parsed.map(q => ({
              question: q.question, options: q.options, answer: q.answer,
              category: q.category, difficulty: q.difficulty, scripture: q.scripture || '',
            })),
          },
        },
      });
      savedSetId = set.id;
    }

    res.json({ questions: parsed, count: parsed.length, savedSetId, rawText: rawText || undefined });
  } catch (err) {
    console.error('Parse error:', err);
    res.status(500).json({ error: 'Failed to parse file: ' + err.message });
  }
});

app.get('/api/question-template.csv', (req, res) => {
  const header = 'question,optionA,optionB,optionC,optionD,answer,category,difficulty,scripture\n';
  const rows = [
    '"Who built the ark?","Moses","Noah","Abraham","David",1,"Old Testament","easy","Genesis 6:14 — \'So make yourself an ark of cypress wood; make rooms in it and coat it with pitch inside and out.\'"',
    '"What was Jesus\' first miracle?","Healing a blind man","Raising Lazarus","Walking on water","Turning water into wine",3,"New Testament","easy","John 2:9-11 — \'The master of the banquet tasted the water that had been turned into wine... This was the first of the signs through which Jesus revealed his glory.\'"',
    '"How many days and nights did it rain during the flood?","20","30","40","50",2,"Old Testament","easy","Genesis 7:12 — \'And rain fell on the earth forty days and forty nights.\'"',
    '"Who interpreted Pharaoh\'s dreams?","Moses","Aaron","Jacob","Joseph",3,"Old Testament","easy","Genesis 41:15-16 — \'I cannot do it, Joseph replied, but God will give Pharaoh the answer he desires.\'"',
    '"Which disciple denied Jesus three times?","Thomas","Judas","John","Peter",3,"New Testament","easy","Matthew 26:75 — \'Then Peter remembered the word Jesus had spoken: Before the rooster crows, you will disown me three times. And he went outside and wept bitterly.\'"',
  ].join('\n') + '\n';
  res.setHeader('Content-Type', 'text/csv');
  res.setHeader('Content-Disposition', 'attachment; filename="question-template.csv"');
  res.send(header + rows);
});

// ── AI QUIZ GENERATION ─────────────────────────────────────────────────────────

const AUDIENCE_PROMPTS = {
  'Gen Z': 'Use casual, punchy Gen Z language. Short energetic questions with relatable framing.',
  'Youth': 'Use friendly, conversational language for teenagers aged 13-19.',
  'Children': 'Use very simple words and a fun, encouraging tone for children aged 7-12.',
  'Adults': 'Use clear, respectful language suitable for adult church members.',
  'General Church': 'Use warm, accessible language suitable for a mixed church congregation.',
};

const TONE_PROMPTS = {
  'Playful': 'Keep questions light and fun with an energetic tone.',
  'Conversational': 'Sound warm and natural, like a friendly discussion.',
  'Formal': 'Use clear, dignified pastoral language.',
  'Energetic': 'Use exciting, high-energy phrasing that builds excitement.',
  'Simple': 'Use the simplest possible words. Short sentences. Easy to understand.',
};

function buildQuizPrompt(content, audience, tone, customPrompt, count) {
  const audienceInstr = AUDIENCE_PROMPTS[audience] || AUDIENCE_PROMPTS['General Church'];
  const toneInstr = TONE_PROMPTS[tone] || TONE_PROMPTS['Conversational'];
  return `You are a Bible quiz generator for church use. Generate exactly ${count} multiple-choice quiz questions based ONLY on the content provided below.

AUDIENCE: ${audience}. ${audienceInstr}
TONE: ${tone}. ${toneInstr}
${customPrompt ? `ADDITIONAL INSTRUCTION: ${customPrompt}` : ''}

RULES:
- Questions must be based solely on the provided content. Do NOT add outside information.
- Each question has exactly 4 options (A, B, C, D).
- The correct answer must be clearly derivable from the content.
- Include a Bible scripture reference + short quote for each question where applicable.
- Do NOT change biblical doctrine or meaning. Only the style/tone changes.
- Return ONLY a valid JSON array. No markdown, no explanation, no extra text.

JSON format:
[
  {
    "question": "...",
    "options": ["option A", "option B", "option C", "option D"],
    "answer": 0,
    "category": "Old Testament|New Testament|General",
    "difficulty": "easy|medium|hard",
    "scripture": "Reference — 'verse text'"
  }
]

CONTENT TO USE:
${content.slice(0, 8000)}`;
}

function buildRegeneratePrompt(content, audience, tone, existingQuestions, index) {
  const audienceInstr = AUDIENCE_PROMPTS[audience] || AUDIENCE_PROMPTS['General Church'];
  const toneInstr = TONE_PROMPTS[tone] || TONE_PROMPTS['Conversational'];
  const existing = existingQuestions.map((q, i) => `${i + 1}. ${q.question}`).join('\n');
  return `You are a Bible quiz generator. Generate exactly 1 new multiple-choice question based on the content below.

AUDIENCE: ${audience}. ${audienceInstr}
TONE: ${tone}. ${toneInstr}
Make it DIFFERENT from these existing questions:
${existing}

Return ONLY a JSON object (no array, no markdown):
{
  "question": "...",
  "options": ["A", "B", "C", "D"],
  "answer": 0,
  "category": "...",
  "difficulty": "easy|medium|hard",
  "scripture": "Reference — 'verse text'"
}

CONTENT:
${content.slice(0, 6000)}`;
}

app.post('/api/ai/generate-quiz', requireHost, async (req, res) => {
  try {
    const { content, audience = 'General Church', tone = 'Conversational', customPrompt = '', count = 10, testament = 'both' } = req.body;
    if (!content?.trim()) return res.status(400).json({ error: 'Content is required.' });
    if (!process.env.GEMINI_API_KEY) return res.status(503).json({ error: 'AI not configured. Add GEMINI_API_KEY to environment.' });

    const prompt = buildQuizPrompt(content.trim(), audience, tone, customPrompt, count);
    const result = await gemini.generateContent(prompt);
    const text = result.response.text().trim();

    const jsonStr = text.replace(/^```json\s*/i, '').replace(/^```\s*/i, '').replace(/\s*```$/i, '').trim();
    const questions = JSON.parse(jsonStr);

    if (!Array.isArray(questions)) throw new Error('AI returned unexpected format');
    const validated = questions.map(q => ({
      question: String(q.question || ''),
      options: Array.isArray(q.options) ? q.options.slice(0, 4).map(String) : ['', '', '', ''],
      answer: parseInt(q.answer ?? 0),
      category: String(q.category || 'General'),
      difficulty: ['easy', 'medium', 'hard', 'expert'].includes(q.difficulty) ? q.difficulty : 'medium',
      scripture: String(q.scripture || ''),
    })).filter(q => q.question && q.options.length === 4);

    res.json({ questions: validated, count: validated.length });
  } catch (err) {
    console.error('AI generate error:', err.message);
    res.status(500).json({ error: 'AI generation failed: ' + err.message });
  }
});

app.post('/api/ai/regenerate-question', requireHost, async (req, res) => {
  try {
    const { content, audience = 'General Church', tone = 'Conversational', existingQuestions = [], index = 0 } = req.body;
    if (!content?.trim()) return res.status(400).json({ error: 'Content is required.' });

    const prompt = buildRegeneratePrompt(content.trim(), audience, tone, existingQuestions, index);
    const result = await gemini.generateContent(prompt);
    const text = result.response.text().trim();
    const jsonStr = text.replace(/^```json\s*/i, '').replace(/^```\s*/i, '').replace(/\s*```$/i, '').trim();
    const q = JSON.parse(jsonStr);

    res.json({
      question: {
        question: String(q.question || ''),
        options: Array.isArray(q.options) ? q.options.slice(0, 4).map(String) : ['', '', '', ''],
        answer: parseInt(q.answer ?? 0),
        category: String(q.category || 'General'),
        difficulty: ['easy', 'medium', 'hard', 'expert'].includes(q.difficulty) ? q.difficulty : 'medium',
        scripture: String(q.scripture || ''),
      },
    });
  } catch (err) {
    console.error('AI regen error:', err.message);
    res.status(500).json({ error: 'Regeneration failed: ' + err.message });
  }
});

// ── SESSION REPORTS ─────────────────────────────────────────────────────────────

async function buildReportData(gameId) {
  const game = await prisma.game.findUnique({
    where: { id: gameId },
    include: {
      players: { include: { answers: { orderBy: { questionIndex: 'asc' } } } },
      set: { include: { questions: { orderBy: { id: 'asc' } } } },
    },
  });
  if (!game) return null;

  const players = game.players;
  const questions = game.set?.questions || [];
  const totalPlayers = players.length;
  if (totalPlayers === 0 || questions.length === 0) return null;

  const allScores = players.map(p => p.score);
  const avgScore = Math.round(allScores.reduce((a, b) => a + b, 0) / totalPlayers);

  const qStats = questions.map((q, idx) => {
    const answers = players.flatMap(p => p.answers.filter(a => a.questionIndex === idx));
    const total = answers.length;
    const correct = answers.filter(a => a.isCorrect).length;
    const pct = total > 0 ? Math.round((correct / total) * 100) : 0;
    const avgTime = total > 0 ? Math.round(answers.reduce((s, a) => s + (a.responseTimeMs || 0), 0) / total / 1000) : 0;
    let label = pct >= 75 ? 'well_understood' : pct >= 40 ? 'partly_understood' : 'needs_followup';
    return { idx, question: q.question, correctAnswer: q.options[q.answer], pct, correct, total, avgTimeSec: avgTime, label, scripture: q.scripture || '' };
  });

  const totalAnswers = players.flatMap(p => p.answers);
  const correctAnswers = totalAnswers.filter(a => a.isCorrect).length;
  const overallAccuracy = totalAnswers.length > 0 ? Math.round((correctAnswers / totalAnswers.length) * 100) : 0;

  const best = [...qStats].sort((a, b) => b.pct - a.pct)[0];
  const worst = [...qStats].sort((a, b) => a.pct - b.pct)[0];

  return { totalPlayers, avgScore, overallAccuracy, questions: qStats, best, worst, setName: game.set?.name || 'Unknown Set' };
}

async function generateAiSummary(reportData) {
  if (!process.env.GEMINI_API_KEY) return 'Report generated. Review the breakdown below for details.';
  const { totalPlayers, overallAccuracy, questions, best, worst, setName } = reportData;
  const needsFollowup = questions.filter(q => q.label === 'needs_followup').map(q => `"${q.question}"`).join(', ');
  const prompt = `You are a helpful assistant for a church pastor or fellowship leader. Write a short 3-4 sentence understanding summary for a Bible quiz session.

Quiz: "${setName}"
Players: ${totalPlayers}
Overall accuracy: ${overallAccuracy}%
Best understood question (${best?.pct}% correct): "${best?.question}"
Most missed question (${worst?.pct}% correct): "${worst?.question}"
${needsFollowup ? `Questions needing follow-up: ${needsFollowup}` : ''}

Write in plain, warm, church-friendly language. No bullet points. No headings. Just a short paragraph. Mention what people understood well, what they struggled with, and suggest a follow-up if needed. Use language like "participants", "the group", "may need reinforcement", "strongest area". Avoid corporate jargon.`;

  try {
    const result = await gemini.generateContent(prompt);
    return result.response.text().trim();
  } catch (e) {
    return `The session had ${totalPlayers} participants with ${overallAccuracy}% overall accuracy. Review the breakdown below to see which questions may need follow-up.`;
  }
}

app.get('/api/games/:id/report', requireHost, async (req, res) => {
  try {
    const game = await prisma.game.findFirst({ where: { id: req.params.id, hostId: req.host.id } });
    if (!game) return res.status(404).json({ error: 'Game not found.' });

    const existing = await prisma.sessionReport.findUnique({ where: { gameId: req.params.id } });
    if (existing) return res.json({ report: existing });

    const data = await buildReportData(req.params.id);
    if (!data) return res.status(400).json({ error: 'Not enough data to generate report.' });

    const summary = await generateAiSummary(data);
    const report = await prisma.sessionReport.create({
      data: { gameId: req.params.id, hostId: req.host.id, summary, data },
    });
    res.json({ report });
  } catch (err) {
    console.error('Report error:', err);
    res.status(500).json({ error: 'Failed to generate report.' });
  }
});

app.get('/api/reports', requireHost, async (req, res) => {
  try {
    const reports = await prisma.sessionReport.findMany({
      where: { hostId: req.host.id },
      orderBy: { createdAt: 'desc' },
      take: 50,
      include: { game: { select: { pin: true, finishedAt: true, set: { select: { name: true } }, _count: { select: { players: true } } } } },
    });
    res.json({ reports });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch reports.' });
  }
});

const distPath = path.join(__dirname, 'client', 'dist');
if (require('fs').existsSync(distPath)) {
  app.use(express.static(distPath));
}

// In-memory game store
const games = {};

function generatePin() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

function shuffleQuestions(arr) {
  const copy = [...arr];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

function getLeaderboard(game) {
  return [...game.players.values()]
    .sort((a, b) => b.score - a.score)
    .map((p, idx) => ({ rank: idx + 1, name: p.name, score: p.score, streak: p.streak }));
}

const QUESTION_TIME = 20; // seconds
const RESULTS_TIME = 7;   // seconds to show results before auto-advancing
const MAX_POINTS = 1000;

io.on('connection', (socket) => {
  console.log('Connected:', socket.id);

  // HOST: Create game
  socket.on('create-game', async ({ testament, setId, hostToken, offset = 0, questionTime = 20, rounds = 10 } = {}, callback) => {
    try {
      let hostDbId = null;
      if (hostToken) {
        try { const p = jwt.verify(hostToken, process.env.JWT_SECRET); hostDbId = p.id; } catch {}
      }

      let allSetQuestions;
      let resolvedSetId = setId;
      if (setId) {
        allSetQuestions = await prisma.question.findMany({ where: { setId }, orderBy: { id: 'asc' } });
      } else {
        const defaultSet = await prisma.questionSet.findFirst({ where: { isDefault: true } });
        if (defaultSet) {
          resolvedSetId = defaultSet.id;
          const where = { setId: defaultSet.id };
          if (testament && testament !== 'both') where.category = testament;
          allSetQuestions = await prisma.question.findMany({ where, orderBy: { id: 'asc' } });
        }
      }

      const pin = generatePin();
      const questionPool = (allSetQuestions && allSetQuestions.length > 0) ? allSetQuestions : localQuestions;
      const totalQuestions = questionPool.length;

      let gameQuestions;
      if (setId) {
        // Paginated: ordered slice, no shuffle
        gameQuestions = questionPool.slice(offset, offset + rounds);
      } else {
        // Default: filter by testament + shuffle, no pagination
        const filtered = (testament && testament !== 'both')
          ? questionPool.filter(q => q.category === testament)
          : questionPool;
        gameQuestions = shuffleQuestions(filtered.length > 0 ? filtered : questionPool).slice(0, rounds);
      }

      if (gameQuestions.length === 0) return callback({ success: false, error: 'No questions available in this set.' });

      const nextOffset = offset + gameQuestions.length;
      const hasMore = setId ? nextOffset < totalQuestions : false;


      let dbGameId = null;
      try {
        const dbGame = await prisma.game.create({
          data: { pin, hostId: hostDbId, setId: resolvedSetId || null },
        });
        dbGameId = dbGame.id;
      } catch (e) { console.error('DB game create error:', e.message); }

      games[pin] = {
        pin, dbGameId, hostId: socket.id,
        players: new Map(),
        questions: gameQuestions,
        currentQuestion: -1,
        status: 'lobby',
        timer: null,
        questionStartTime: null,
        setId: resolvedSetId || null,
        questionOffset: offset,
        nextOffset,
        hasMore,
        totalQuestions,
        questionTime: Math.min(Math.max(parseInt(questionTime) || 20, 5), 120),
        rounds: Math.min(Math.max(parseInt(rounds) || 10, 1), 50),
      };
      socket.join(pin);
      socket.data.pin = pin;
      socket.data.role = 'host';
      console.log(`Game created: ${pin} (Q${offset + 1}-${nextOffset} of ${totalQuestions}, ${questionTime}s/q)`);
      callback({ success: true, pin });
    } catch (err) {
      console.error('create-game error:', err);
      callback({ success: false, error: 'Failed to create game.' });
    }
  });

  // HOST: Continue game with next question batch
  socket.on('continue-game', async (_, callback) => {
    const pin = socket.data.pin;
    const game = games[pin];
    if (!game || game.hostId !== socket.id) return callback?.({ success: false, error: 'Not authorised.' });
    if (!game.hasMore || !game.setId) return callback?.({ success: false, error: 'No more questions.' });
    try {
      const allQuestions = await prisma.question.findMany({ where: { setId: game.setId }, orderBy: { id: 'asc' } });
      const batch = allQuestions.slice(game.nextOffset, game.nextOffset + 10);
      if (batch.length === 0) return callback?.({ success: false, error: 'No more questions.' });

      const newNextOffset = game.nextOffset + batch.length;
      const stillHasMore = newNextOffset < allQuestions.length;

      game.questions = batch;
      game.currentQuestion = -1;
      game.status = 'lobby';
      game.questionOffset = game.nextOffset;
      game.nextOffset = newNextOffset;
      game.hasMore = stillHasMore;

      for (const [, p] of game.players) { p.answered = false; p.lastAnswer = null; }

      const playerList = [...game.players.values()].map(p => ({ id: p.id, name: p.name, score: p.score }));
      const round = Math.floor(game.questionOffset / 10) + 1;
      io.to(pin).emit('round-starting', {
        round,
        batchStart: game.questionOffset + 1,
        batchEnd: newNextOffset,
        totalQuestions: allQuestions.length,
        players: playerList,
      });
      callback?.({ success: true });
    } catch (e) {
      callback?.({ success: false, error: e.message });
    }
  });

  // PLAYER: Join game
  socket.on('join-game', ({ pin, name }, callback) => {
    const game = games[pin];
    if (!game) return callback({ success: false, error: 'Game not found. Check your PIN.' });
    if (game.status !== 'lobby') return callback({ success: false, error: 'Game already in progress.' });
    if ([...game.players.values()].find(p => p.name.toLowerCase() === name.toLowerCase())) {
      return callback({ success: false, error: 'Name already taken. Choose another.' });
    }

    game.players.set(socket.id, {
      id: socket.id,
      name,
      score: 0,
      streak: 0,
      answered: false,
      lastAnswer: null,
    });

    socket.join(pin);
    socket.data.pin = pin;
    socket.data.role = 'player';
    socket.data.name = name;

    // Persist player to DB
    if (game.dbGameId) {
      prisma.player.upsert({
        where: { name_gameId: { name, gameId: game.dbGameId } },
        update: {},
        create: { name, gameId: game.dbGameId },
      }).catch(e => console.error('DB player upsert:', e.message));
    }

    const playerList = [...game.players.values()].map(p => ({ id: p.id, name: p.name, score: p.score }));
    io.to(pin).emit('player-joined', { players: playerList, name });

    callback({ success: true, pin });
  });

  // HOST: Replace questions from upload
  socket.on('set-questions', (newQuestions, callback) => {
    const pin = socket.data.pin;
    const game = games[pin];
    if (!game || game.hostId !== socket.id) return;
    if (game.status !== 'lobby') return;
    game.questions = shuffleQuestions(newQuestions);
    console.log(`Game ${pin}: questions replaced with ${newQuestions.length} uploaded questions`);
    if (callback) callback({ success: true, count: newQuestions.length });
  });

  // HOST: Start game
  socket.on('start-game', () => {
    const pin = socket.data.pin;
    const game = games[pin];
    if (!game) { socket.emit('error-msg', 'Game not found. Please refresh and try again.'); return; }
    if (game.hostId !== socket.id) {
      // Allow if socket reconnected — re-adopt host role by pin+role
      if (socket.data.role === 'host') {
        game.hostId = socket.id;
      } else {
        socket.emit('error-msg', 'Not authorised to start this game.'); return;
      }
    }
    if (game.players.size === 0) {
      socket.emit('error-msg', 'At least one player must join before starting.');
      return;
    }
    if (game.questions.length === 0) {
      socket.emit('error-msg', 'No questions loaded. Upload questions or check DB connection.');
      return;
    }
    game.status = 'playing';
    io.to(pin).emit('game-started');
    setTimeout(() => sendQuestion(pin), 1000);
  });

  // PLAYER: Submit answer
  socket.on('submit-answer', ({ answerIndex }) => {
    const pin = socket.data.pin;
    const game = games[pin];
    if (!game || game.status !== 'question') return;

    const player = game.players.get(socket.id);
    if (!player || player.answered) return;

    const q = game.questions[game.currentQuestion];
    const timeElapsed = (Date.now() - game.questionStartTime) / 1000;
    const isCorrect = answerIndex === q.answer;

    let pointsEarned = 0;
    if (isCorrect) {
      const timeBonus = Math.max(0, 1 - timeElapsed / (game.questionTime || QUESTION_TIME));
      pointsEarned = Math.round(MAX_POINTS * (0.5 + 0.5 * timeBonus));
      player.streak = (player.streak || 0) + 1;
      if (player.streak >= 3) pointsEarned = Math.round(pointsEarned * 1.2);
      player.score += pointsEarned;
    } else {
      player.streak = 0;
    }

    player.answered = true;
    player.lastAnswer = { answerIndex, isCorrect, pointsEarned };

    socket.emit('answer-result', {
      isCorrect,
      correctAnswer: q.answer,
      pointsEarned,
      totalScore: player.score,
      streak: player.streak,
      scripture: q.scripture,
    });

    // Persist answer to DB
    const responseTimeMs = Date.now() - game.questionStartTime;
    if (game.dbGameId) {
      prisma.playerAnswer.create({
        data: {
          playerName: player.name,
          gameId: game.dbGameId,
          questionIndex: game.currentQuestion,
          answerIndex,
          isCorrect,
          pointsEarned,
          responseTimeMs,
        },
      }).catch(e => console.error('DB answer write:', e.message));
    }

    const answeredCount = [...game.players.values()].filter(p => p.answered).length;
    io.to(pin).emit('answer-progress', {
      answered: answeredCount,
      total: game.players.size,
      leaderboard: getLeaderboard(game),
    });

    if (answeredCount === game.players.size) {
      clearTimeout(game.timer);
      setTimeout(() => showResults(pin), 500);
    }
  });

  // HOST: Next question manually
  socket.on('next-question', () => {
    const pin = socket.data.pin;
    const game = games[pin];
    if (!game) return;
    if (game.hostId !== socket.id && socket.data.role === 'host') game.hostId = socket.id;
    if (game.hostId !== socket.id) return;
    clearTimeout(game.timer);
    clearTimeout(game.resultsTimer);
    // sendQuestion already increments currentQuestion — just call it directly
    sendQuestion(pin);
  });

  // PLAYER: Rejoin after socket reconnect
  socket.on('rejoin-game', ({ pin, name }, callback) => {
    const game = games[pin];
    if (!game) return callback?.({ success: false, error: 'Game not found.' });

    const key = `${pin}:${name}`;
    const pending = disconnectTimers.get(key);

    if (pending) {
      clearTimeout(pending.timerId);
      disconnectTimers.delete(key);
      const playerData = game.players.get(pending.oldSocketId);
      if (playerData) {
        game.players.delete(pending.oldSocketId);
        game.players.set(socket.id, { ...playerData, id: socket.id });
      } else {
        game.players.set(socket.id, { id: socket.id, name, score: 0, streak: 0, answered: false, lastAnswer: null });
      }
    } else {
      const already = [...game.players.values()].find(p => p.name === name);
      if (already) {
        game.players.delete(already.id);
        game.players.set(socket.id, { ...already, id: socket.id });
      } else if (game.status === 'lobby') {
        game.players.set(socket.id, { id: socket.id, name, score: 0, streak: 0, answered: false, lastAnswer: null });
      } else {
        return callback?.({ success: false, error: 'Game already started.' });
      }
    }

    socket.join(pin);
    socket.data.pin = pin;
    socket.data.role = 'player';
    socket.data.name = name;

    const playerList = [...game.players.values()].map(p => ({ id: p.id, name: p.name, score: p.score }));
    io.to(pin).emit('player-joined', { players: playerList, name });
    callback?.({ success: true, status: game.status });
  });

  // HOST: Rejoin after socket reconnect
  socket.on('rejoin-host', ({ pin }, callback) => {
    const game = games[pin];
    if (!game) return callback?.({ success: false, error: 'Game not found.' });

    const hostKey = `host:${pin}`;
    const pending = disconnectTimers.get(hostKey);
    if (pending) {
      clearTimeout(pending.timerId);
      disconnectTimers.delete(hostKey);
    }

    game.hostId = socket.id;
    socket.join(pin);
    socket.data.pin = pin;
    socket.data.role = 'host';

    const playerList = [...game.players.values()].map(p => ({ id: p.id, name: p.name, score: p.score }));
    callback?.({ success: true, status: game.status, players: playerList, pin });
  });

  socket.on('disconnect', () => {
    const pin = socket.data.pin;
    const role = socket.data.role;
    const name = socket.data.name;
    if (!pin || !games[pin]) return;
    const game = games[pin];

    if (role === 'host') {
      const hostKey = `host:${pin}`;
      const timerId = setTimeout(() => {
        disconnectTimers.delete(hostKey);
        if (!games[pin]) return;
        clearTimeout(games[pin].timer);
        clearTimeout(games[pin].resultsTimer);
        io.to(pin).emit('host-disconnected');
        delete games[pin];
      }, 20000);
      disconnectTimers.set(hostKey, { timerId, oldSocketId: socket.id });
    } else if (role === 'player') {
      const key = `${pin}:${name}`;
      const timerId = setTimeout(() => {
        disconnectTimers.delete(key);
        if (!games[pin]) return;
        games[pin].players.delete(socket.id);
        const playerList = [...games[pin].players.values()].map(p => ({ id: p.id, name: p.name, score: p.score }));
        io.to(pin).emit('player-left', { players: playerList, name });
      }, 20000);
      disconnectTimers.set(key, { timerId, oldSocketId: socket.id });
    }
  });
});

function sendQuestion(pin) {
  const game = games[pin];
  if (!game) return;

  game.currentQuestion += 1;

  if (game.currentQuestion >= game.questions.length) {
    endGame(pin);
    return;
  }

  game.status = 'question';
  game.questionStartTime = Date.now();

  // Reset player answered state
  game.players.forEach(p => {
    p.answered = false;
    p.lastAnswer = null;
  });

  const q = game.questions[game.currentQuestion];
  const questionData = {
    index: game.currentQuestion,
    total: game.questions.length,
    question: q.question,
    options: q.options,
    category: q.category,
    difficulty: q.difficulty,
    timeLimit: game.questionTime || QUESTION_TIME,
  };

  io.to(pin).emit('new-question', questionData);

  const qTime = game.questionTime || QUESTION_TIME;
  game.timer = setTimeout(() => {
    showResults(pin);
  }, qTime * 1000 + 500);
}

function showResults(pin) {
  const game = games[pin];
  if (!game) return;
  game.status = 'results';

  const q = game.questions[game.currentQuestion];
  const leaderboard = getLeaderboard(game);
  const isLast = game.currentQuestion === game.questions.length - 1;

  io.to(pin).emit('question-results', {
    correctAnswer: q.answer,
    scripture: q.scripture,
    leaderboard,
    isLastQuestion: isLast,
    autoAdvanceIn: RESULTS_TIME,
  });

  // Auto-advance after RESULTS_TIME seconds
  game.resultsTimer = setTimeout(() => {
    if (game.status !== 'results') return;
    if (isLast) { endGame(pin); } else { sendQuestion(pin); }
  }, RESULTS_TIME * 1000);
}

async function endGame(pin) {
  const game = games[pin];
  if (!game) return;
  game.status = 'ended';
  clearTimeout(game.timer);

  const leaderboard = getLeaderboard(game);
  io.to(pin).emit('game-over', {
    leaderboard,
    dbGameId: game.dbGameId || null,
    hasMore: game.hasMore || false,
    nextOffset: game.nextOffset || 0,
    setId: game.setId || null,
    totalQuestions: game.totalQuestions || 0,
    batchEnd: game.nextOffset || 0,
  });

  // Persist final scores to DB
  if (game.dbGameId) {
    try {
      await prisma.game.update({
        where: { id: game.dbGameId },
        data: { status: 'finished', finishedAt: new Date() },
      });
      await Promise.all(leaderboard.map(p =>
        prisma.player.update({
          where: { name_gameId: { name: p.name, gameId: game.dbGameId } },
          data: { score: p.score, streak: p.streak, rank: p.rank },
        }).catch(() => {})
      ));
    } catch (e) { console.error('DB endGame error:', e.message); }
  }
}

// Serve React app for all other routes (only in local dev where client/dist exists)
app.get('*', (req, res) => {
  const indexPath = path.join(__dirname, 'client', 'dist', 'index.html');
  if (require('fs').existsSync(indexPath)) {
    res.sendFile(indexPath);
  } else {
    res.json({ status: 'Bible Battle API running' });
  }
});

const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
  console.log(`Bible Battle server running on http://localhost:${PORT}`);
});

// ── KEEP-ALIVE: prevent Render backend + Neon DB from sleeping ────────────────
const KEEP_ALIVE_INTERVAL = 5 * 60 * 1000; // 5 minutes

setInterval(async () => {
  // 1. Ping Render backend (self-ping keeps the web service awake)
  const backendUrl = process.env.RENDER_EXTERNAL_URL || `http://localhost:${PORT}`;
  try {
    await fetch(`${backendUrl}/api/ping`);
    console.log('[keep-alive] backend ping ok');
  } catch (e) {
    console.warn('[keep-alive] backend ping failed:', e.message);
  }

  // 2. Ping Neon DB (lightweight query keeps the serverless DB connection warm)
  try {
    await prisma.$queryRaw`SELECT 1`;
    console.log('[keep-alive] neon db ping ok');
  } catch (e) {
    console.warn('[keep-alive] neon db ping failed:', e.message);
  }
}, KEEP_ALIVE_INTERVAL);

// Ping endpoint used by keep-alive above
app.get('/api/ping', (req, res) => res.json({ ok: true, ts: Date.now() }));
