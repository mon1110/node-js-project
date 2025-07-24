const { DataTypes } = require('sequelize');
const db = require('../config/db.config');
const User = require('../models/User');

const Product = db.define('Product', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  price: {
    type: DataTypes.FLOAT,
    allowNull: false,
  },
  userId: {
    type: DataTypes.INTEGER,
    references: {
      model: User,
      key: 'id',
    },
  },
}, {
  tableName: 'products',
  timestamps: true,

  indexes: [
    {
      fields: ['userId'] 
    }
  ]

});


module.exports = Product;