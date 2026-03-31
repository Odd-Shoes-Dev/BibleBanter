const jwt = require('jsonwebtoken');

function requireHost(req, res, next) {
  const auth = req.headers.authorization;
  if (!auth || !auth.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Authentication required.' });
  }
  try {
    const payload = jwt.verify(auth.slice(7), process.env.JWT_SECRET);
    req.hostUser = payload;
    next();
  } catch {
    return res.status(401).json({ error: 'Invalid or expired token.' });
  }
}

function optionalHost(req, res, next) {
  const auth = req.headers.authorization;
  if (auth && auth.startsWith('Bearer ')) {
    try {
      req.hostUser = jwt.verify(auth.slice(7), process.env.JWT_SECRET);
    } catch {}
  }
  next();
}

module.exports = { requireHost, optionalHost };
