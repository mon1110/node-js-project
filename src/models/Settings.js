const { DataTypes } = require('sequelize');
const db = require('../config/db.config');

const Settings = db.define("Settings", {
  key: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
  },
  value: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  softDelete: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: false,
  }
}, {
  tableName: 'settings',
  timestamps: false
});

module.exports = Settings;
