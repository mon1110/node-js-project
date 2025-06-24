
// repositories/userRepository.js
const { Op } = require('sequelize');
const product = require('../models/product');
//const product = require('../models/product');

//create
const createproduct = async (data) => {
  return await product.create(data);
};

//find by id
const getproductById = async (id) => {
  return await product.findOne({
    where: {
      id: id,
      softDelete: false
    }
  });
};

//update
const updateproduct = async (id, data) => {
  console.log("id:", id)
  const [updated] = await product.update(data, {
    where: { id },
  });
  return updated ? await product.findByPk(id) : null;
};

//delete
const softDeleteproduct = async (id) => {
  console.log("id: ", id)
  const [deleted] = await product.update({ softdelete: true }, {
    where: { id },
    returning: true
  });

  console.log("deleted: ", deleted)
  return deleted;
};

//innerjoining
const getProductsWithUsers = async (req, res) => {
  try {
    const products = await product.findAll({
      include: [
        {
          model: User,
          required: true,
          where: { softDelete: false }, // Optional
          attributes: ['id', 'name'],
        }
      ],
      where: { softDelete: false },
      attributes: ['id', 'name', 'price', 'userId'],
    });

    return products;
    // res.status(200).json(products);
  } catch (error) {
    console.error('Join error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};


//filter

const filterproductByEmail = async (req) => {
  try {
    console.log(req)
    const { letter } = req;
    const { ids } = req;

    const where = {};
    if (letter) {
      where.name = { [Op.iLike]: `%${letter}%` };
    }

    if (ids?.length > 0) {
      where.id = { [Op.in]: ids };
    }

    const products = await product.findAll({ where });
    return products;

  } catch (err) {
    console.error('Error in filterUsers:', err);
    throw err;
  }

};

const getProducts = async ({ filter, sort, page }) => {
  try {
    const { pageLimit = 10, pageNumber = 1 } = page;
    console.log(page)
    const whereClause = {};

    if (filter?.search) {
      whereClause.name = { [Op.iLike]: `${filter.search}%` };
    }

    if (filter?.ids?.length > 0) {
      whereClause.id = { [Op.in]: filter.ids };
    }

    const sortField = sort?.sortBy || 'id';
    const sortOrder = sort?.orderBy || 'DESC';

    const offset = pageNumber * pageLimit;
    //const offset = ((page?.pageNumber || 2) - 1) * pageLimit;
    // console.log({ limit }, { offset })

     const result = await product.findAndCountAll({
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
      limit: pageLimit,
      offset: offset,
      order: [['createdAt', 'DESC']]
    });

    return({
      data: result.rows,
      currentPage: page,
      totalPages: pageLimit > 0 ? Math.ceil(result.count / pageLimit) : 0,
      totalItems: result.count
    });

  } catch (error) {
    console.error('Join error:', error);
    //return res.status(500).json({ error: 'Internal server error' });
  }
};

const findPaginatedProducts = async (limit, offset) => {
  return await product.findAndCountAll({
    limit,
    offset,
    include: [{ model: User }],
    order: [['createdAt', 'DESC']]
  });
};




module.exports = {
  createproduct,
  getproductById,
  updateproduct,
  getProductsWithUsers,
  softDeleteproduct,
  //getUsersOffset,
  filterproductByEmail,
  getProducts,
  findPaginatedProducts
};
