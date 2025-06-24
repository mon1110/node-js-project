const { User, Product, Menu } = require('../models');

exports.getAllUsers = async () => {
  return await User.findAll({ raw: true });
};

exports.getAllProducts = async () => {
  return await Product.findAll({ raw: true });
};

exports.getAllMenus = async () => {
  return await Menu.findAll({ raw: true });
};
