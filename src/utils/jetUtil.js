const jwt = require('../utils/jwt');
const config = require('../config/config');

const generateToken = (user) => {
  return jwt.sign({ id: user.id, email: user.email }, config.jwt.secret, {
    expiresIn: config.jwt.expiresIn
  });
};

module.exports = { generateToken };
