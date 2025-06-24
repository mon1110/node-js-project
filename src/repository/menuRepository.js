const { Op } = require('sequelize');
const Menu = require('../models/menu');
//const User = require('../models/user');

// Create menu
const createMenu = async (data) => {
  return await Menu.create(data);
};

// Get menu by ID
const getMenuById = async (id) => {
  return await Menu.findOne({
    where: {
      id: id,
      softDelete: false
    }
  });
};

// Update menu
const updateMenu = async (id, data) => {
  console.log("id:", id);
  const [updated] = await Menu.update(data, {
    where: { id },
  });
  return updated ? await Menu.findByPk(id) : null;
};

// Soft delete menu
const softDeleteMenu = async (id) => {
  console.log("id: ", id);
  const [deleted] = await Menu.update({ softdelete: true }, {
    where: { id },
    returning: true
  });

  console.log("deleted: ", deleted);
  return deleted;
};

// Inner join with users
const getMenusWithUsers = async () => {
  try {
    const menus = await Menu.findAll({
      include: [
        {
          model: User,
          required: true,
          where: { softDelete: false },
          attributes: ['id', 'name'],
        }
      ],
      where: { softDelete: false },
      attributes: ['id', 'name', 'price', 'userId'],
    });

    return menus;
  } catch (error) {
    console.error('Join error:', error);
    throw error;
  }
};

// Filter by name or IDs
const filterMenuByNameOrIds = async (req) => {
  try {
    const { letter, ids } = req;
    const where = {};

    if (letter) {
      where.name = { [Op.iLike]: `%${letter}%` };
    }

    if (ids?.length > 0) {
      where.id = { [Op.in]: ids };
    }

    const menus = await Menu.findAll({ where });
    return menus;
  } catch (err) {
    console.error('Error in filterMenuByNameOrIds:', err);
    throw err;
  }
};

// Paginated and filtered menu list
const getMenus = async ({ filter, sort, page }) => {
  try {
    const { pageLimit = 10, pageNumber = 1 } = page;
    const whereClause = {};

    if (filter?.search) {
      whereClause.name = { [Op.iLike]: `${filter.search}%` };
    }

    if (filter?.ids?.length > 0) {
      whereClause.id = { [Op.in]: filter.ids };
    }

    const sortField = sort?.sortBy || 'id';
    const sortOrder = sort?.orderBy || 'DESC';

    const offset = (pageNumber - 1) * pageLimit;

    const result = await Menu.findAndCountAll({
      include: [
        {
          model: User,
          required: true,
          where: { softDelete: false },
          attributes: ['id', 'name'],
        }
      ],
      where: { softDelete: false, ...whereClause },
      attributes: ['id', 'name', 'price', 'userId'],
      limit: pageLimit,
      offset: offset,
      order: [[sortField, sortOrder]],
    });

    return {
      data: result.rows,
      currentPage: pageNumber,
      totalPages: pageLimit > 0 ? Math.ceil(result.count / pageLimit) : 0,
      totalItems: result.count
    };
  } catch (error) {
    console.error('Join error:', error);
    throw error;
  }
};

// Simple pagination (for external use)
const findPaginatedMenus = async (limit, offset) => {
  return await Menu.findAndCountAll({
    limit,
    offset,
    include: [{ model: User }],
    order: [['createdAt', 'DESC']]
  });
};

module.exports = {
  createMenu,
  getMenuById,
  updateMenu,
  softDeleteMenu,
  getMenusWithUsers,
  filterMenuByNameOrIds,
  getMenus,
  findPaginatedMenus
};
