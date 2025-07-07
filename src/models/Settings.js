const { DataTypes } = require('sequelize');
const db = require('../config/db.config'); // your sequelize instance

const Settings = db.define("Settings", {
  maxLoginAttempts: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 5
  },
  blockDurationMinutes: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 5
  }

}, {
  tableName: 'settings',
  timestamps: false
});

module.exports = Settings;
