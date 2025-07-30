const User = require('./User');
const Product = require('./product');
const menu = require('./menu');
const Settings = require('./Settings');

// Association setup
User.hasMany(Product, { foreignKey: 'userId' });
Product.belongsTo(User, { foreignKey: 'userId' });

User.hasMany(menu, { foreignKey: 'id', as: 'menu' });

// Sub-user association (self-referencing)
User.associate = function (models) {
  User.hasMany(models.User, {
    foreignKey: 'userByIdToken',
    as: 'subUsers',
  });

  User.belongsTo(models.User, {
    foreignKey: 'userByIdToken',
    as: 'parentUser',
  });
};

// Prepare db object
const db = {User,  Product,  menu,  Settings,};

// Call associate methods
Object.values(db).forEach(model => {
  if (model.associate) {
    model.associate(db);
  }
});

module.exports = db;
