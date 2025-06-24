const menuRepo = require('../repository/menuRepository');

const createMenu = async (data) => {
  return await menuRepo.createMenu(data);
};

const getMenuById = async (id) => {
  return await menuRepo.getMenuById(id);
};

const updateMenu = async (id, data) => {
  return await menuRepo.updateMenu(id, data);
};

const deleteMenu = async (id) => {
  return await menuRepo.softDeleteMenu(id);
};

const getMenuByNameLetter = async ({ search }) => {
  return await menuRepo.filterMenuByName(search);
};

const filterMenuByIdIn = async ({ search }) => {
  return await menuRepo.filterMenuByIdIn(search);
};

const getMenusWithUsers = async ({ data }) => {
  return await menuRepo.getMenusWithUsers(data);
};

const getMenus = async ({ filter, sort, page }) => {
  return await menuRepo.getMenus({ filter, sort, page }); 
};

const getPaginatedMenus = async (paginationParams) => {
  return await menuRepo.findPaginatedMenus(paginationParams);
};

module.exports = {
  createMenu,
  getMenuById,
  updateMenu,
  getMenusWithUsers,
  deleteMenu,
  getMenuByNameLetter,
  filterMenuByIdIn,
  getMenus,
  getPaginatedMenus
};
