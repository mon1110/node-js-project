require('dotenv').config();

const getEnv = (key, defaultValue = null) => {
  return process.env[key] || defaultValue;
};

module.exports = { getEnv };
