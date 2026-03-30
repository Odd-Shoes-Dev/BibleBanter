# Bible Banter — Question Upload Guide

Hosts can upload custom question sets from the **My Sets** tab on the Choose Questions screen.  
Supported formats: **CSV**, **PDF**, **Word (.docx)**

---

## 📥 Quick Start

1. Log in as a host and click **⚔️ Host Game**
2. Go to the **📂 My Sets** tab
3. Click **＋ Upload New Set**
4. Enter a **Set Name**, choose a **Testament category**, then drop your file
5. Review the **preview** — correct answers are highlighted green, scripture shown in amber
6. Click **"⚔️ Use These N Questions"** to save the set to your library
7. Select the set from My Sets to start a game with it

---

## 📊 CSV Format

This is the **recommended format** — most reliable and easiest to prepare in Excel or Google Sheets.  
Download the **⬇ Template** button inside the upload dialog for a ready-to-fill example.

### Columns

| Column | Required | Description | Example |
|--------|----------|-------------|---------|
| `question` | ✅ | The question text | `Who built the ark?` |
| `optionA` | ✅ | Answer option A | `Moses` |
| `optionB` | ✅ | Answer option B | `Noah` |
| `optionC` | ✅ | Answer option C | `Abraham` |
| `optionD` | ✅ | Answer option D | `David` |
| `answer` | ✅ | Index of correct answer **(0 = A, 1 = B, 2 = C, 3 = D)** | `1` |
| `category` | ✅ | `Old Testament` or `New Testament` or `General` | `Old Testament` |
| `difficulty` | ✅ | `easy`, `medium`, `hard`, or `expert` | `easy` |
| `scripture` | ✅ | **Bible reference + verse text** shown after answer is revealed | see below |

### Scripture Format

The `scripture` field must include both the **reference** and the **actual verse text**:

```
Genesis 6:14 — 'So make yourself an ark of cypress wood; make rooms in it and coat it with pitch inside and out.'
```

> ⚠️ **Scripture is required.** Questions missing scripture will show a red warning in the preview. Players see the verse after each answer is revealed.

### Example CSV

```csv
question,optionA,optionB,optionC,optionD,answer,category,difficulty,scripture
"Who built the ark?","Moses","Noah","Abraham","David",1,"Old Testament","easy","Genesis 6:14 — 'So make yourself an ark of cypress wood; make rooms in it and coat it with pitch inside and out.'"
"What was Jesus' first miracle?","Healing a blind man","Raising Lazarus","Walking on water","Turning water into wine",3,"New Testament","easy","John 2:9-11 — 'The master of the banquet tasted the water that had been turned into wine. This was the first of the signs through which Jesus revealed his glory.'"
"Who was thrown into the lions' den?","Shadrach","Daniel","Joseph","Nehemiah",1,"Old Testament","medium","Daniel 6:16 — 'So the king gave the order, and they brought Daniel and threw him into the lions den. The king said to Daniel, May your God, whom you serve continually, rescue you!'"
"Which disciple denied Jesus three times?","Thomas","Judas","John","Peter",3,"New Testament","easy","Matthew 26:75 — 'Then Peter remembered the word Jesus had spoken: Before the rooster crows, you will disown me three times. And he went outside and wept bitterly.'"
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
Scripture: Genesis 6:14 — 'So make yourself an ark of cypress wood; make rooms in it and coat it with pitch inside and out.'

Q: What was Jesus' first miracle?
A: Healing a blind man
B: Raising Lazarus
C: Walking on water
D: Turning water into wine
Answer: D
Category: New Testament
Difficulty: easy
Scripture: John 2:9-11 — 'The master of the banquet tasted the water that had been turned into wine. This was the first of the signs through which Jesus revealed his glory.'
```

### Rules for PDF

- Each question block **must start** with `Q:` or `Question:`
- Options must be labeled **A:**, **B:**, **C:**, **D:** (with colon, period, or bracket: `A.`, `A)`, `A:`)
- `Answer:` must be a single letter: **A**, **B**, **C**, or **D**
- `Scripture:` must include the **reference and the verse text** — e.g. `John 3:16 — 'For God so loved the world...'`
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
Scripture: Exodus 7-12 — 'The LORD said to Moses, "Go to Pharaoh, for I have hardened his heart and the hearts of his officials so that I may perform these signs of mine among them."'

Q: Who replaced Judas Iscariot as the twelfth apostle?
A: Barnabas
B: Silas
C: Matthias
D: Stephen
Answer: C
Category: New Testament
Difficulty: expert
Scripture: Acts 1:26 — 'Then they cast lots, and the lot fell to Matthias; so he was added to the eleven apostles.'

Q: How many days and nights did it rain during the flood?
A: 20
B: 30
C: 40
D: 50
Answer: C
Category: Old Testament
Difficulty: easy
Scripture: Genesis 7:12 — 'And rain fell on the earth forty days and forty nights.'
```

### Rules for Word

- Use **plain paragraph text only** — no tables, no text boxes, no columns
- One blank line between each question block
- `Scripture:` must include both the reference and the actual verse text
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
| ⚠ No scripture badge in preview | Add `Scripture: reference — 'verse text'` to each question |
| No questions found in PDF/Word | Make sure each block starts with `Q:` or `Question:` |
| Wrong answer highlighted | Check that `answer` is 0-indexed in CSV (B = `1`, not `2`) |
| Parse error on CSV | Wrap text containing commas in double quotes: `"Jesus said, ""Follow me"""` |
| Blank options in preview | All four options (A–D) are required per question |
| PDF not parsing well | Try copy-pasting content into a Word doc instead |

---

## 📏 Limits

- Maximum file size: **10 MB**
- Maximum questions previewed: **20** (all are saved, only 20 shown in preview)
- Minimum questions per upload: **1**

---

*Questions are shuffled automatically when a game starts. Sets are saved to your account and reusable across multiple game sessions.*
