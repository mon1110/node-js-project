// utils/settingsUtil.js
const { Settings } = require('../models');

const getAppSettings = async () => {
  const settings = await Settings.findOne();
  return {
    maxAttempts: settings?.maxLoginAttempts || 5,
    blockDurationMs: (settings?.blockDurationMinutes || 5) * 60 * 1000,
    
  };
};

module.exports = { getAppSettings };
