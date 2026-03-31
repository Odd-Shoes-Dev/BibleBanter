const express = require('express');
const router = express.Router();
const multer = require('multer');
const mammoth = require('mammoth');
const pdfParse = require('pdf-parse');
const { parse: csvParse } = require('csv-parse/sync');
const prisma = require('../lib/prisma');
const { optionalHost } = require('../middleware/auth');
const { parseTextToQuestions } = require('../utils/parseQuestions');

const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 10 * 1024 * 1024 } });

// POST /api/parse-questions
router.post('/parse-questions', upload.single('file'), optionalHost, async (req, res) => {
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
        options: [
          r.optionA || r.OptionA || r.A || '',
          r.optionB || r.OptionB || r.B || '',
          r.optionC || r.OptionC || r.C || '',
          r.optionD || r.OptionD || r.D || '',
        ],
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

    if (parsed.length === 0 && !rawText) {
      return res.status(400).json({ error: 'No valid questions found. Check the template format.' });
    }

    // If authenticated host + setName provided → save to DB
    let savedSetId = null;
    const setName = req.body.setName;
    if (setName && !req.hostUser) {
      return res.status(401).json({ error: 'You must be logged in to save a question set.' });
    }
    if (req.hostUser && setName) {
      const set = await prisma.questionSet.create({
        data: {
          name: setName,
          description: `Imported from ${originalname}`,
          testament: req.body.testament || 'both',
          hostId: req.hostUser.id,
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

// GET /api/question-template.csv
router.get('/question-template.csv', (req, res) => {
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

module.exports = router;
