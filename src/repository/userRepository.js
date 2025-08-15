// repositories/userRepository.js
const { Op, literal } = require('sequelize');
const User = require('../models/User');
const  menu  = require('../models/menu');
const Sequelize = require('sequelize');
const bcrypt = require("bcrypt");
// const sequelize = db.sequelize;
const sequelize = require('../config/db.config');


const createUser = async (data) => {
  return await User.create(data);
};

//nodemailer ke liye
const findAll = async () => {
  return await User.findAll({
    where: { softDelete: false },
    include: [
      {
        model: User,
        as: 'subUsers',
        attributes: ['id', 'name', 'email', 'gender'],
      },
    ],
  });
};



const getSubUsersByToken = async () => {
  return await User.findAll({
    where: { softDelete: false }, 
    include: [
      {
        model: User,
        as: 'subUsers',
        attributes: ['id', 'name', 'email', 'gender'],
        where: { softDelete: false }, 
        required: true,  
        // separate: true,   
        order: [['name', 'ASC']]
      }
    ],
    order: [['name', 'ASC']]
  });
};


const findById = async (id) => {
  return await User.findByPk(id);
};

const updateUser = async (id, data) => {
  const [updated] = await User.update(data, {
    where: { id, softDelete: false },
    returning: true
  });
  return updated;
};

// ✅ Update by Email (used for unblock)
const updateByEmail = async (email, data) => {
  const [updated] = await User.update(data, {
    where: { email },
    returning: true
  });
  return updated;
};


//update password
const updatePassword = async (id, rawPassword) => {
  const hashedPassword = await bcrypt.hash(rawPassword, 10);
  await User.update({ password: hashedPassword }, { where: { id } });
  return hashedPassword; 
};

//node mailer ke liye
// const findByEmail = async (email) => {
//   if (!email || typeof email !== "string") return null;

//   return await User.findOne({
//     where: { email: email.toLowerCase(),
//       softDelete: false }
//   });
// };
const findByEmail = async (email) => {
  console.log(`[findByEmail] Called with email: ${email}`);

  if (!email) {
    console.log('[findByEmail] No email provided, returning null');
    return null;
  }

  try {
    const user = await User.findOne({
      where: { email: email.toLowerCase(), softDelete: false }
    });
    console.log('[findByEmail] User found:', user);
    return user;
  } catch (err) {
    console.error('[findByEmail] Error during User.findOne:', err);
    throw err;
  }
};


//login ke liye
const findUserByEmail = async (email) => {
  return await User.findOne({ where: { email, softDelete: false } });
};

//custom error ke liye ye use hoga
const getUserById = async (id) => {
  return await User.findOne({ where: { id, softDelete: false } });
};




const softDeleteUser = async (id) => {
  console.log("id: ", id)
  const [deleted] = await User.update({ softDelete: true }, {
    where: { id },
    returning: true
  });

  console.log("deleted: ", deleted)
  return deleted;
};

const filterUsersByEmail = async ({ letter }) => {
  try {
    if (!letter) return [];

    const where = {
      [Op.or]: [
        { name: { [Op.iLike]: `%${letter}%` } },
        { email: { [Op.iLike]: `%${letter}%` } }
      ],
      softDelete: false
    };

    return await User.findAll({ where });
  } catch (err) {
    console.error(err);
    throw err;
  }
};



const findUsersByIds = async (ids) => {
  return await User.findAll({
    where: {
      id: ids
    }
  });
};


const findUserById = async (id) => {
  return await User.findOne({ where: { id, softDelete: false } });
};



const updateUserMenus = async (user, menuIds) => {
  user.menuIds = menuIds;
  return await user.save();
};

const findAllUsersWithMenus = async () => {
  return await User.findAll({where: {softDelete: false}});
};

const findAllUsers = async () => {
  return await User.findAll({
    attributes: ['id', 'name', 'email', 'menuIds'],
  });
};

const findAllMenus = async () => {
  return await menu.findAll({
    attributes: ['id', 'name', 'price'],
  });
};

const getMenusByIds = async (menuIds) => {
  return await menu.findAll({
    where: {
      id: menuIds
    }
  });
};

//joining
const getUsersWithmenu = async (req, res) => {
  try {
    const Users = await User.findAll({
      include: [
        {
          model: menu,
          required: true,
          where: { softDelete: false },
          attributes: ['id', 'name'],
          as: 'menu',
          on: Sequelize.literal(`"menu"."id" = ANY("users"."menuIds")`)
        }],
      where: { softDelete: false },
      attributes: ['id', 'name', 'email', 'id'],
    });

    return Users;
  } catch (error) {
    console.error('Join error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

//pagination
const getUsers = async ({ filter = {}, sort = {}, page = {} }) => {
  try {
    const pageLimit = page?.pageLimit || 5;
    const pageNumber = page?.pageNumber ?? 0;

    const whereClause = { softDelete: false };

    if (filter.search) {
      whereClause.name = { [Op.iLike]: `${filter.search}%` };
    }

    if (filter.ids?.length > 0) {
      whereClause.id = { [Op.in]: filter.ids };
    }

    // Sorting
    const sortField = sort.sortBy || 'id';
    const sortOrder = sort.orderBy || 'DESC';

    const offset = pageNumber * pageLimit;

    const result = await User.findAndCountAll({
      where: whereClause,
      limit: pageLimit,
      offset: offset,
      order: [[sortField, sortOrder]],
      attributes: ['id', 'name', 'email', 'menuIds', 'createdAt', 'updatedAt', 'softDelete'],
      include: [
        {
          model: menu,
          as: 'menu',
          required: false,
          where: { softDelete: false },
          attributes: ['id', 'name', 'price'],
          on: literal(`"menu"."id" = ANY("users"."menuIds")`)
        }
      ]
    });

    const totalPages = Math.ceil(result.count / pageLimit);

    return {
      data: result.rows,
      totalItems: result.count,
      totalPages,
      currentPage: pageNumber + 1,
      pageLimit
    };

  } catch (error) {
    console.error("Join error:", error);
    throw error;
  }
};


//upsert
const upsertUser = async (data) => {
  try {
    const [user, created] = await User.upsert(data, { returning: true });
    return { user, created };
  } catch (error) {
    if (error.name === 'SequelizeUniqueConstraintError') {
      throw new Error('Partial match found (only email or name exists), upsert skipped');
    }
    throw error;
  }
};

//bulk
const findExistingUsers = async (emails) => {
  return await User.findAll({
    where: {
      email: { [Op.in]: emails },
      softDelete: false
    }
  });
};

const bulkSaveUsers = async (users) => {
  const t = await sequelize.transaction();

  try {
    const savedUsers = await User.bulkCreate(users, {
      returning: true,
      transaction: t,
      updateOnDuplicate: ['name', 'gender', 'menuIds'],
      validate: true 
    });

    await t.commit(); // Commit if successful
    return savedUsers;

  } catch (error) {
    await t.rollback(); // Rollback if error
    throw error;
  }
};

//single api
const saveUser = async (userData) => {
  if (!userData || typeof userData !== "object") {
    throw new Error("Invalid user data");
  }

  // If ID is given, try update
  if (userData.id) {
    const [affectedRows] = await User.update(userData, { where: { id: userData.id } });
    if (affectedRows > 0) {
      return { ...userData, _action: "updated" };
    }
  }

  // Otherwise insert
  const created = await User.create(userData);
  return { ...created.dataValues, _action: "created" };
};

//swagger ke liye
const getAllUsers = async () => {
  try {
    const users = await User.findAll();
    return users;
  } catch (error) {
    throw error;
  }
};

const createCustomIndexOnEmail = async () => {
  return await sequelize.getQueryInterface().addIndex('users', {
    fields: ['email'],
    unique: true,
    name: 'unique_email_not_soft_deleted',
    where: {
      softDelete: false,
    },
  });
};






module.exports = {
  createUser,
  getUserById,
  updateUser,
  softDeleteUser,
  filterUsersByEmail,
  findUsersByIds,
  findUserById,
  updateUserMenus,
  findAllUsers,
  findAllMenus,
  findAllUsersWithMenus,
  getUsersWithmenu,
  getMenusByIds,
  getUsers,
  upsertUser,
  findExistingUsers,
  bulkSaveUsers,
  saveUser,
  getAllUsers,
  findUserByEmail,
  updatePassword,
  findByEmail,
  findAll,
  getSubUsersByToken,
  findById,
   updateByEmail,
   createCustomIndexOnEmail,
}