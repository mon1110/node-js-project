// services/configService.js
const { Settings } = require('../models');

const getSetting = async (key) => {
  const setting = await Settings.findByPk(key);
  return setting ? setting.value : null;
};

module.exports = { getSetting };
