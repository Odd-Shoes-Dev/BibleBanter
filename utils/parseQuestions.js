const { unescapeHtml } = require('./sanitize');

/**
 * Parses free-text (from DOCX / PDF / TXT) into structured question objects.   
 * Looks for patterns like:
 *   Q: ...
 *   A) ...   B) ...   C) ...   D) ...
 *   Answer: B
 *   Category: ...
 *   Difficulty: ...
 *   Scripture: ...
 */
function parseTextToQuestions(text) {
  const questions = [];
  const blocks = text.split(/(?=Q:|Question:)/i).map(b => b.trim()).filter(Boolean);

  for (const block of blocks) {
    const lines = block.split('\n').map(l => unescapeHtml(l.trim())).filter(Boolean);
    const q = {};
    const options = [];

    for (const line of lines) {
      if (/^(Q|Question):\s*/i.test(line)) {
        q.question = line.replace(/^(Q|Question):\s*/i, '').trim();
      } else if (/^A[.):].\s*/i.test(line)) {
        options[0] = line.replace(/^A[.):].\s*/i, '').trim();
      } else if (/^B[.):].\s*/i.test(line)) {
        options[1] = line.replace(/^B[.):].\s*/i, '').trim();
      } else if (/^C[.):].\s*/i.test(line)) {
        options[2] = line.replace(/^C[.):].\s*/i, '').trim();
      } else if (/^D[.):].\s*/i.test(line)) {
        options[3] = line.replace(/^D[.):].\s*/i, '').trim();
      } else if (/^(Answer|Correct)[^:]*:\s*/i.test(line)) {
        const ans = line.replace(/^(Answer|Correct)[^:]*:\s*/i, '').trim().toUpperCase();
        q.answer = ['A', 'B', 'C', 'D'].indexOf(ans[0]);
      } else if (/^Category:\s*/i.test(line)) {
        q.category = line.replace(/^Category:\s*/i, '').trim();
      } else if (/^Difficulty:\s*/i.test(line)) {
        q.difficulty = line.replace(/^Difficulty:\s*/i, '').trim().toLowerCase();
      } else if (/^Scripture:\s*/i.test(line)) {
        q.scripture = line.replace(/^Scripture:\s*/i, '').trim();
      }
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

module.exports = { parseTextToQuestions };
