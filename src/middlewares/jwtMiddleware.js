// src/middleware/authenticate.js
const { verifyToken } = require('../utils/jwt'); // aapke JWT helper ka path adjust karein
const MessageConstant = require('../constants/MessageConstant');

const authenticate = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  if (!authHeader) {
    return res.status(401).json({
      status: 'error',
      code: 401,
      description: MessageConstant.AUTH_HEADER_MISSING || 'Authorization header missing or invalid',
    });
  }

  const token = authHeader.split(' ')[1]; // 'Bearer tokenstring' se token nikal rahe hain
  if (!token) {
    return res.status(401).json({
      status: 'error',
      code: 401,
      description: MessageConstant.TOKEN_MISSING || 'Token is not defined',
    });
  }

  try {
    const decoded = verifyToken(token);
    req.user = decoded; // user info request me daal rahe hain for next middleware/controller
    next();
  } catch (error) {
    return res.status(403).json({
      status: 'error',
      code: 403,
      description: 'Token is invalid or expired',
    });
  }
};

module.exports = authenticate;
