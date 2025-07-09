const { Settings } = require('../models');

const getAuthConfig = async () => {
  const rows = await Settings.findAll({ where: { softDelete: false } });

  const settings = Object.fromEntries(
    rows.map(row => [row.key, isNaN(row.value) ? row.value : parseInt(row.value)])
  );

  return {
    maxAttempts: settings.maxLoginAttempts || 5,
    blockDurationMs: (settings.blockDurationMinutes || 5) * 60 * 1000,
  };
};

module.exports = { getAuthConfig };
