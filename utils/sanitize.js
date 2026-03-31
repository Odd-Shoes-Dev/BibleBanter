/**
 * Escapes HTML entities to prevent XSS when rendering user-supplied strings.
 */
function sanitize(str) {
  if (typeof str !== 'string') return '';
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;');
}

/**
 * Sanitizes and trims a player display name.
 * Max 30 characters, HTML-escaped.
 */
function sanitizePlayerName(name) {
  if (typeof name !== 'string') return '';
  return sanitize(name.trim()).slice(0, 30);
}

/**
 * Sanitizes a question set or general text field.
 * Max 500 characters, HTML-escaped.
 */
function sanitizeText(text, maxLen = 500) {
  if (typeof text !== 'string') return '';
  return sanitize(text.trim()).slice(0, maxLen);
}

module.exports = { sanitize, sanitizePlayerName, sanitizeText };
