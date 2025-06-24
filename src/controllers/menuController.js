const menuService = require('../Service/menuService');
const Res = require('../utils/Res');

const createMenu = async (req, res) => {
  try {
    const menu = await menuService.createMenu(req.body);
    return Res.success(res, 'Menu created successfully', menu, 201);
  } catch (error) {
    return Res.error(res, error.message, 400);
  }
};

const getMenuById = async (req, res) => {
  try {
    const menu = await menuService.getMenuById(req.params.id);
    if (menu) return Res.success(res, 'Menu fetched successfully', menu);
    else return Res.error(res, 'Menu not found', 404);
  } catch (error) {
    return Res.error(res, error.message, 500);
  }
};

const updateMenu = async (req, res) => {
  try {
    const menu = await menuService.updateMenu(req.params.id, req.body);
    if (menu) return Res.success(res, 'Menu updated successfully', menu);
    else return Res.error(res, 'Menu not found', 404);
  } catch (error) {
    return Res.error(res, error.message, 400);
  }
};

const deleteMenu = async (req, res) => {
  try {
    const deleted = await menuService.deleteMenu(req.params.id);
    if (deleted) return Res.success(res, 'Menu deleted successfully', null, 204);
    else return Res.error(res, 'Menu not found', 404);
  } catch (error) {
    return Res.error(res, error.message, 500);
  }
};

const getMenusByNameLetter = async (req, res) => {
  try {
    const menus = await menuService.getMenuByNameLetter(req.body);
    return Res.success(res, 'Menus fetched successfully', menus);
  } catch (error) {
    return Res.error(res, error.message, 400);
  }
};

const getMenus = async (req, res) => {
  try {
    const result = await menuService.getMenus(req.body);
    return Res.success(res, 'Menus fetched successfully', result);
  } catch (error) {
    return Res.error(res, error.message, 500);
  }
};

const getMenusWithUsers = async (req, res) => {
  try {
    const menus = await menuService.getMenusWithUsers(req.body);
    return Res.success(res, 'Menus with users fetched successfully', menus);
  } catch (error) {
    return Res.error(res, error.message, 400);
  }
};

const getPaginatedMenus = async (req, res) => {
  try {
    const result = await menuService.getPaginatedMenus(req.body);

    if (result.rows.length > 0) {
      return Res.success(res, 'Menus fetched successfully', {
        menus: result.rows,
        total: result.count
      });
    } else {
      return Res.error(res, 'No menus found for this page', 404);
    }
  } catch (error) {
    return Res.error(res, error.message, 500);
  }
};

module.exports = {
  createMenu,
  getMenuById,
  updateMenu,
  deleteMenu,
  getMenusByNameLetter,
  getMenus,
  getMenusWithUsers,
  getPaginatedMenus,
};
