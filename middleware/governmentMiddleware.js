const jwt = require('jsonwebtoken');

exports.governmentMiddleware = (req, res, next) => {
  try {
    const token = req.cookies?.token || req.header('Authorization')?.replace('Bearer ', '');
    if (!token) {
      return res
        .status(401)
        .json({ message: 'Access denied. No token provided.' });
    }
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if (decoded.role !== 'government') {
      return res
        .status(403)
        .json({ message: 'Access denied. Not a government account.' });
    }
    req.government = decoded;
    next();
  } catch (err) {
    console.error('Token verification failed:', err.message);
    return res.status(400).json({ message: 'Invalid or expired token.' });
  }
};

