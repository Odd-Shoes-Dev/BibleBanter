/**
 * Escapes HTML entities to prevent XSS when rendering user-supplied strings.
 */
function sanitize(str) {
  if (typeof str !== 'string') return '';
  return str
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

/** * Unescapes common HTML entities back to characters.
 * Helpful for normalizing AI output or parsed documents.
 */
function unescapeHtml(str) {
  if (typeof str !== 'string') return '';
  return str
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&#x27;/g, "'")
    .replace(/&#039;/g, "'")
    .replace(/&#x22;/g, '"')
    .replace(/&nbsp;/g, ' ');
}

/** * Sanitizes and trims a player display name.
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

module.exports = { sanitize, unescapeHtml, sanitizePlayerName, sanitizeText };
