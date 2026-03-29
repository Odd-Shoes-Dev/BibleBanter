# Bible Battle — Question Upload Guide

The host can replace the default questions with custom ones by uploading a file in the lobby screen.  
Supported formats: **CSV**, **PDF**, **Word (.docx)**

---

## 📥 Quick Start

1. In the **Host Lobby**, click **📂 Upload Custom Questions**
2. Download the **⬇ Template** CSV to see the exact format
3. Fill in your questions, save, and upload
4. Review the **preview table** — correct answers are highlighted in green
5. Click **"⚔️ Use These N Questions"** to replace the question pool

---

## 📊 CSV Format

This is the **recommended format** — most reliable and easiest to prepare in Excel or Google Sheets.

### Columns

| Column | Required | Description | Example |
|--------|----------|-------------|---------|
| `question` | ✅ | The question text | `Who built the ark?` |
| `optionA` | ✅ | Answer option A | `Moses` |
| `optionB` | ✅ | Answer option B | `Noah` |
| `optionC` | ✅ | Answer option C | `Abraham` |
| `optionD` | ✅ | Answer option D | `David` |
| `answer` | ✅ | Index of correct answer **(0 = A, 1 = B, 2 = C, 3 = D)** | `1` |
| `category` | ✅ | Question category | `Old Testament` |
| `difficulty` | ✅ | `easy`, `medium`, `hard`, or `expert` | `easy` |
| `scripture` | ❌ | Optional Bible reference shown after answer | `Genesis 6:14` |

### Example CSV

```csv
question,optionA,optionB,optionC,optionD,answer,category,difficulty,scripture
"Who built the ark?","Moses","Noah","Abraham","David",1,"Old Testament","easy","Genesis 6:14"
"What was Jesus' first miracle?","Healing a blind man","Raising Lazarus","Walking on water","Turning water into wine",3,"New Testament","easy","John 2:1-11"
"How many disciples did Jesus choose?","7","10","12","15",2,"New Testament","easy","Matthew 10:1"
"Who was thrown into the lions' den?","Shadrach","Daniel","Joseph","Nehemiah",1,"Old Testament","medium","Daniel 6:16"
```

> **Tip:** `answer` value `1` means **option B is correct** (0-indexed: A=0, B=1, C=2, D=3)

---

## 📄 PDF Format

Export or write your questions as a PDF following this **block structure**.  
Each question block must start with `Q:` or `Question:`.

### Structure

```
Q: Who built the ark?
A: Moses
B: Noah
C: Abraham
D: David
Answer: B
Category: Old Testament
Difficulty: easy
Scripture: Genesis 6:14

Q: What was Jesus' first miracle?
A: Healing a blind man
B: Raising Lazarus
C: Walking on water
D: Turning water into wine
Answer: D
Category: New Testament
Difficulty: easy
Scripture: John 2:1-11
```

### Rules for PDF

- Each question block **must start** with `Q:` or `Question:`
- Options must be labeled **A:**, **B:**, **C:**, **D:** (with colon, period, or bracket: `A.`, `A)`, `A:`)
- `Answer:` must be a single letter: **A**, **B**, **C**, or **D**
- `Category:`, `Difficulty:`, and `Scripture:` are optional but recommended
- Leave a **blank line** between question blocks
- Avoid tables, text boxes, or multi-column layouts — plain paragraph text works best

---

## 📝 Word (.docx) Format

Same structure as PDF above. Write each question as plain paragraphs — **do not use tables or text boxes**.

### Example Word Document Content

```
Q: How many plagues did God send on Egypt?
A: 7
B: 8
C: 10
D: 12
Answer: C
Category: Old Testament
Difficulty: medium
Scripture: Exodus 7-12

Q: Who replaced Judas Iscariot as the twelfth apostle?
A: Barnabas
B: Silas
C: Matthias
D: Stephen
Answer: C
Category: New Testament
Difficulty: expert
Scripture: Acts 1:26
```

### Rules for Word

- Use **plain paragraph text only** — no tables, no text boxes, no columns
- One blank line between each question block
- Headings, bold, and italic text are ignored — only the plain text content is parsed
- Save as `.docx` (not `.doc`)

---

## ✅ Field Reference

### `answer` values (CSV)
| Value | Correct Option |
|-------|---------------|
| `0` | A |
| `1` | B |
| `2` | C |
| `3` | D |

### `answer` values (PDF / Word)
| Value | Correct Option |
|-------|---------------|
| `A` | Option A |
| `B` | Option B |
| `C` | Option C |
| `D` | Option D |

### `difficulty` values
| Value | Description |
|-------|-------------|
| `easy` | Basic Bible knowledge |
| `medium` | Some study required |
| `hard` | Advanced knowledge |
| `expert` | Deep scripture mastery |

---

## ⚠️ Common Mistakes

| Problem | Fix |
|---------|-----|
| No questions found in PDF/Word | Make sure each block starts with `Q:` or `Question:` |
| Wrong answer highlighted | Check that `answer` is 0-indexed in CSV (B = `1`, not `2`) |
| Parse error on CSV | Wrap text containing commas in double quotes: `"Jesus said, ""Follow me"""` |
| Blank options in preview | All four options (A–D) are required per question |
| PDF not parsing well | Try copy-pasting content into a Word doc instead |

---

## 📏 Limits

- Maximum file size: **10 MB**
- Maximum questions previewed: **20** (all are imported, only 20 shown in preview)
- Minimum questions per upload: **1**

---

*Questions are shuffled automatically after import. The default built-in questions are replaced for that game session only.*
