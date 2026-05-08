/**
 * Simple in-memory rate limiter middleware.
 *
 * @param {Object} opts
 * @param {number} opts.windowMs  - Time window in milliseconds (default 60 000)
 * @param {number} opts.max       - Max requests per window per IP (default 10)
 * @param {string} opts.message   - Error message on limit exceeded
 */
function createRateLimit({ windowMs = 60_000, max = 10, message = 'Too many requests. Please try again later.' } = {}) {
  const hits = new Map();

  // Purge stale entries every windowMs
  const cleanup = setInterval(() => {
    const now = Date.now();
    for (const [key, data] of hits) {
      if (now - data.start > windowMs) hits.delete(key);
    }
  }, windowMs);
  cleanup.unref(); // don't keep Node alive just for cleanup

  return (req, res, next) => {
    const key = req.ip || req.connection?.remoteAddress || 'unknown';
    const now = Date.now();
    const record = hits.get(key);

    if (!record || now - record.start > windowMs) {
      hits.set(key, { start: now, count: 1 });
      return next();
    }

    record.count++;
    if (record.count > max) {
      return res.status(429).json({ error: message });
    }
    next();
  };
}

module.exports = { createRateLimit };
