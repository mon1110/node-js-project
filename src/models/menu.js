const { DataTypes } = require("sequelize");
const db = require("../config/db.config");

const menu = db.define('menu', {
  // id: {
  //   type: DataTypes.INTEGER,
  //   allowNull: false,
  //   primaryKey: true,
  //   autoIncrement: true,
  // },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  price: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  softDelete: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: false,
  },

}, {
  tableName: 'menu',  // ✅ changed table name
  timestamps: true, 
});

// menu.associate = (models) => {
//   menu.hasMany(models.User, { foreignKey: 'menuIds' });
// };



module.exports = menu;
