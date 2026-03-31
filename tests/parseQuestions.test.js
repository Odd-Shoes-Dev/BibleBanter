const { parseTextToQuestions } = require('../utils/parseQuestions');

describe('parseTextToQuestions()', () => {
  test('parses a well-formatted question block', () => {
    const text = `Q: Who built the ark?
A) Moses
B) Noah
C) Abraham
D) David
Answer: B
Category: Old Testament
Difficulty: easy
Scripture: Genesis 6:14`;

    const questions = parseTextToQuestions(text);
    expect(questions).toHaveLength(1);
    expect(questions[0].question).toBe('Who built the ark?');
    expect(questions[0].options).toEqual(['Moses', 'Noah', 'Abraham', 'David']);
    expect(questions[0].answer).toBe(1); // B = index 1
    expect(questions[0].category).toBe('Old Testament');
    expect(questions[0].difficulty).toBe('easy');
    expect(questions[0].scripture).toBe('Genesis 6:14');
  });

  test('parses multiple question blocks', () => {
    const text = `Q: Question one?
A) A
B) B
C) C
D) D
Answer: A

Q: Question two?
A) X
B) Y
C) Z
D) W
Answer: C`;

    const questions = parseTextToQuestions(text);
    expect(questions).toHaveLength(2);
    expect(questions[0].answer).toBe(0); // A
    expect(questions[1].answer).toBe(2); // C
  });

  test('accepts "Question:" prefix', () => {
    const text = `Question: What is love?
A) Baby don't hurt me
B) A feeling
C) An action
D) All of the above
Answer: D`;

    const questions = parseTextToQuestions(text);
    expect(questions).toHaveLength(1);
    expect(questions[0].question).toBe('What is love?');
    expect(questions[0].answer).toBe(3); // D
  });

  test('defaults category to General and difficulty to medium', () => {
    const text = `Q: Simple question?
A) Yes
B) No
C) Maybe
D) Sure
Answer: A`;

    const questions = parseTextToQuestions(text);
    expect(questions[0].category).toBe('General');
    expect(questions[0].difficulty).toBe('medium');
  });

  test('requires at least 2 options', () => {
    const text = `Q: Bad question?
A) Only one option
Answer: A`;

    const questions = parseTextToQuestions(text);
    expect(questions).toHaveLength(0);
  });

  test('requires a valid answer', () => {
    const text = `Q: No answer provided?
A) One
B) Two
C) Three
D) Four`;

    const questions = parseTextToQuestions(text);
    expect(questions).toHaveLength(0);
  });

  test('returns empty array for non-question text', () => {
    const text = 'This is just a random paragraph about the Bible.';
    const questions = parseTextToQuestions(text);
    expect(questions).toHaveLength(0);
  });

  test('pads missing options to 4', () => {
    const text = `Q: Two option question?
A) First
B) Second
Answer: B`;

    const questions = parseTextToQuestions(text);
    expect(questions).toHaveLength(1);
    expect(questions[0].options).toHaveLength(4);
    expect(questions[0].options[2]).toBe('');
    expect(questions[0].options[3]).toBe('');
  });
});
