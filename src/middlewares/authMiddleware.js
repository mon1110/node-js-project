const jwt = require('../utils/jwt');
const ApiResponse = require('../utils/ApiResponse');
const Res = require('../utils/Res');

const SECRET_KEY = process.env.JWT_SECRET || 'your_fallback_secret';

const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return Res.error(res, 'Authorization token is required', 401);
  }

  const token = authHeader.split(' ')[1];

  jwt.verify(token, SECRET_KEY, (err, decoded) => {
    if (err) {
      return Res.error(res, 'Invalid or expired token', 401);
    }

    req.user = decoded;
    next();
  });
};

module.exports = authenticateToken;
