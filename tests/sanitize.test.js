const { sanitize, sanitizePlayerName, sanitizeText } = require('../utils/sanitize');

describe('sanitize()', () => {
  test('escapes HTML special characters', () => {
    expect(sanitize('<script>alert("xss")</script>')).toBe(
      '&lt;script&gt;alert("xss")&lt;/script&gt;'
    );
  });

  test('does not escape ampersands', () => {
    expect(sanitize('Tom & Jerry')).toBe('Tom & Jerry');
  });

  test('does not escape single quotes', () => {
    expect(sanitize("it's")).toBe("it's");
  });

  test('returns empty string for non-string input', () => {
    expect(sanitize(null)).toBe('');
    expect(sanitize(undefined)).toBe('');
    expect(sanitize(42)).toBe('');
  });

  test('leaves safe strings unchanged', () => {
    expect(sanitize('Hello World')).toBe('Hello World');
    expect(sanitize('Genesis 3:16')).toBe('Genesis 3:16');
  });
});

describe('sanitizePlayerName()', () => {
  test('trims whitespace', () => {
    expect(sanitizePlayerName('  Moses  ')).toBe('Moses');
  });

  test('truncates to 30 characters', () => {
    const longName = 'A'.repeat(50);
    expect(sanitizePlayerName(longName).length).toBe(30);
  });

  test('escapes HTML in names', () => {
    expect(sanitizePlayerName('<b>Bold</b>')).toBe('&lt;b&gt;Bold&lt;/b&gt;');
  });

  test('returns empty string for non-string input', () => {
    expect(sanitizePlayerName(null)).toBe('');
    expect(sanitizePlayerName(123)).toBe('');
  });

  test('handles normal names correctly', () => {
    expect(sanitizePlayerName('David')).toBe('David');
    expect(sanitizePlayerName('Mary Jane')).toBe('Mary Jane');
  });
});

describe('sanitizeText()', () => {
  test('trims and escapes text', () => {
    expect(sanitizeText('  Hello <World>  ')).toBe('Hello &lt;World&gt;');
  });

  test('truncates to specified max length', () => {
    const text = 'A'.repeat(100);
    expect(sanitizeText(text, 50).length).toBe(50);
  });

  test('defaults to 500 character limit', () => {
    const text = 'A'.repeat(600);
    expect(sanitizeText(text).length).toBe(500);
  });

  test('returns empty string for non-string input', () => {
    expect(sanitizeText(null)).toBe('');
  });
});
