const express = require("express");
const router = express.Router();
const prisma = require("../lib/prisma");
const gemini = require("../lib/gemini");
const { requireHost } = require("../middleware/auth");
const { createRateLimit } = require("../utils/rateLimit");
const { unescapeHtml } = require("../utils/sanitize");

// Rate-limit: 20 AI requests per minute (Gemini free tier is generous, but protect against abuse)
const aiLimiter = createRateLimit({
  windowMs: 60_000,
  max: 15,
  message: "AI rate limit reached. Try again in a minute.",
});

// ── Prompt builders ──────────────────────────────────────────────────────────

const AUDIENCE_PROMPTS = {
  "Gen Z":
    "Use casual, punchy Gen Z language. Short energetic questions with relatable framing.",
  Youth: "Use friendly, conversational language for teenagers aged 13-19.",
  Children:
    "Use very simple words and a fun, encouraging tone for children aged 7-12.",
  Adults: "Use clear, respectful language suitable for adult church members.",
  "General Church":
    "Use warm, accessible language suitable for a mixed church congregation.",
};

const TONE_PROMPTS = {
  Playful: "Keep questions light and fun with an energetic tone.",
  Conversational: "Sound warm and natural, like a friendly discussion.",
  Formal: "Use clear, dignified pastoral language.",
  Energetic: "Use exciting, high-energy phrasing that builds excitement.",
  Simple:
    "Use the simplest possible words. Short sentences. Easy to understand.",
};

function buildQuizPrompt(content, audience, tone, customPrompt, count) {
  const audienceInstr =
    AUDIENCE_PROMPTS[audience] || AUDIENCE_PROMPTS["General Church"];
  const toneInstr = TONE_PROMPTS[tone] || TONE_PROMPTS["Conversational"];
  return `You are a Bible quiz generator for church use. Generate exactly ${count} multiple-choice quiz questions based ONLY on the content provided below.

AUDIENCE: ${audience}. ${audienceInstr}
TONE: ${tone}. ${toneInstr}
${customPrompt ? `ADDITIONAL INSTRUCTION: ${customPrompt}` : ""}

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
${content.slice(0, 20000)}`;
}

function buildRegeneratePrompt(content, audience, tone, existingQuestions) {
  const audienceInstr =
    AUDIENCE_PROMPTS[audience] || AUDIENCE_PROMPTS["General Church"];
  const toneInstr = TONE_PROMPTS[tone] || TONE_PROMPTS["Conversational"];
  const existing = existingQuestions
    .map((q, i) => `${i + 1}. ${q.question}`)
    .join("\n");
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

// ── Validation helpers ───────────────────────────────────────────────────────

function validateQuestion(q) {
  return {
    question: unescapeHtml(String(q.question || "")),
    options: Array.isArray(q.options)
      ? q.options.slice(0, 4).map(o => unescapeHtml(String(o)))
      : ["", "", "", ""],
    answer: parseInt(q.answer ?? 0),
    category: unescapeHtml(String(q.category || "General")),
    difficulty: ["easy", "medium", "hard", "expert"].includes(unescapeHtml(q.difficulty))
      ? unescapeHtml(q.difficulty)
      : "medium",
    scripture: unescapeHtml(String(q.scripture || "")),
  };
}

function parseJsonFromAI(text) {
  const cleaned = text
    .replace(/^```json\s*/i, "")
    .replace(/^```\s*/i, "")
    .replace(/\s*```$/i, "")
    .trim();
  return JSON.parse(cleaned);
}

// ── Routes ───────────────────────────────────────────────────────────────────

// POST /api/ai/generate-quiz
router.post("/generate-quiz", requireHost, aiLimiter, async (req, res) => {
  try {
    const {
      content,
      audience = "General Church",
      tone = "Conversational",
      customPrompt = "",
      count = 10,
    } = req.body;
    if (!content?.trim())
      return res.status(400).json({ error: "Content is required." });
    if (!process.env.GEMINI_API_KEY)
      return res
        .status(503)
        .json({
          error: "AI not configured. Add GEMINI_API_KEY to environment.",
        });

    const prompt = buildQuizPrompt(
      content.trim(),
      audience,
      tone,
      customPrompt,
      count,
    );
    const result = await gemini.generateContent(prompt);
    const questions = parseJsonFromAI(result.response.text().trim());

    if (!Array.isArray(questions))
      throw new Error("AI returned unexpected format");
    const validated = questions
      .map(validateQuestion)
      .filter((q) => q.question && q.options.length === 4);

    res.json({ questions: validated, count: validated.length });
  } catch (err) {
    console.error("AI generate error:", err.message);
    res.status(500).json({ error: "AI generation failed: " + err.message });
  }
});

// POST /api/ai/regenerate-question
router.post(
  "/regenerate-question",
  requireHost,
  aiLimiter,
  async (req, res) => {
    try {
      const {
        content,
        audience = "General Church",
        tone = "Conversational",
        existingQuestions = [],
      } = req.body;
      if (!content?.trim())
        return res.status(400).json({ error: "Content is required." });

      const prompt = buildRegeneratePrompt(
        content.trim(),
        audience,
        tone,
        existingQuestions,
      );
      const result = await gemini.generateContent(prompt);
      const q = parseJsonFromAI(result.response.text().trim());

      res.json({ question: validateQuestion(q) });
    } catch (err) {
      console.error("AI regen error:", err.message);
      res.status(500).json({ error: "Regeneration failed: " + err.message });
    }
  },
);

// POST /api/ai/generate-from-reference
router.post(
  "/generate-from-reference",
  requireHost,
  aiLimiter,
  async (req, res) => {
    try {
      const {
        reference,
        audience = "General Church",
        tone = "Conversational",
        count = 10,
      } = req.body;
      if (!reference?.trim())
        return res.status(400).json({ error: "Bible reference is required." });
      if (!process.env.GEMINI_API_KEY)
        return res.status(503).json({ error: "AI not configured." });

      // Fetch from Bible API
      const response = await fetch(
        `https://bible-api.com/${encodeURIComponent(reference)}`,
      );
      if (!response.ok)
        return res
          .status(400)
          .json({ error: "Could not fetch Bible verse. Check the reference." });
      const data = await response.json();

      // the content is the raw text from the verse(s)
      const content = `Scripture Reference: ${data.reference}\n\n${data.text}`;

      const prompt = buildQuizPrompt(content.trim(), audience, tone, "", count);
      const result = await gemini.generateContent(prompt);
      const questions = parseJsonFromAI(result.response.text().trim());

      if (!Array.isArray(questions))
        throw new Error("AI returned unexpected format");
      const validated = questions
        .map(validateQuestion)
        .filter((q) => q.question && q.options.length === 4);

      res.json({
        questions: validated,
        count: validated.length,
        referenceText: data.text,
        resolvedReference: data.reference,
      });
    } catch (err) {
      console.error("AI verse generate error:", err.message);
      res
        .status(500)
        .json({ error: "AI verse generation failed: " + err.message });
    }
  },
);

module.exports = router;
