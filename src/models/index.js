// const userModel = require("./user");
// const model = {};
// model.user = userModel;
// module.exports = model;
const User = require('./user');
const Product = require('./product');
//const Menu = require('./menu');
const menu = require('./menu');
const Settings = require('./Settings'); // ✅ add this
// db.Settings = Settings;


// User.belongsToMany(Menu, { through: 'UserMenus', foreignKey: 'userId' });
// Menu.belongsToMany(User, { through: 'UserMenus', foreignKey: 'menuId' });

User.hasMany(Product, { foreignKey: 'userId' });
Product.belongsTo(User, { foreignKey: 'userId' });



// User.hasMany(menu, { foreignKey: 'menuIds',  as: 'menu'    
// });
User.hasMany(menu, { foreignKey: 'id',  as: 'menu' }); 

module.exports = { User, Product, menu , Settings};


