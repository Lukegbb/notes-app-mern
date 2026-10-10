const jwt = require('jsonwebtoken');
const { JWT_SECRET } = require('../config');

module.exports = function requireAuth(req, res, next) {
  const header = req.headers.authorization || '';
  const [scheme, token] = header.split(' ');

  if (scheme !== 'Bearer' || !token) {
    return res.status(401).json({ message: 'Authentication required' });
  }

  try {
    const payload = jwt.verify(token, JWT_SECRET);
    req.userId = payload.sub;
    return next();
  } catch (err) {
    return res.status(401).json({ message: 'Invalid or expired token' });
  }
};
