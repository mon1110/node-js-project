const { verifyToken } = require('../utils/jwt'); // aapka jwt file ka path sahi dena

const jwtMiddleware = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        status: { status: 'error', code: 401, description: 'Authorization header missing or invalid' }
      });
    }

    const token = authHeader.split(' ')[1];
    console.log(token);

    // verify token using your verifyToken function
    const decoded = verifyToken(token);

    // user info decoded token mein mil jayega
    req.user = decoded;

    next();
  } catch (error) {
    console.log(error)
    return res.status(401).json({
      status: { status: 'error', code: 401, description: 'Invalid or expired token' }
    });
  }
};

module.exports = jwtMiddleware;
