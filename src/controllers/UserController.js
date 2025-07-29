const userService = require('../Service/userService');
// const User = require('../models');
const menu = require('../models/menu');
const MessageConstant = require("../constants/MessageConstant");
const { BadRequestException } = require('../utils/errors');
const { sendToMailQueue } = require('../Service/rmqService');
const Res = require('../utils/Res');
const ApiResponse = require('../utils/ApiResponse');
const axios = require('axios');
const { handleRequest } = require('../Service/jsonapi'); 
const { createCustomIndexOnEmail } = require('../Service/userService');
// const jwt = require('../utils/jwt');
const User = require('../models/User');
const jwt = require('jsonwebtoken');

const createUser = async (req, res, next) => {
  try {
    // ✅ Extract user ID from token (middleware sets this in req.user)
    const userByIdToken = req.user?.userId || req.user?.id;

    console.log('User from token:', req.user); // Optional for debugging

    // ✅ Pass the creator's ID to the service
    const user = await userService.createUser(req.body, userByIdToken);

    const { password, ...userWithoutPassword } = user;

    return Res.success(
      res,
      { user: userWithoutPassword },
      MessageConstant.USER.CREATE_SUCCESS
    );
  } catch (error) {
    next(error);
  }
};

//tokan through record fatch krne k liye
const getRecordsByUser = async (req, res, next) => {
  try {
    const userByIdToken = req.user?.userId || req.user?.id;  // token se id le lo
    // service call karo jisme records fetch karoge
    const records = await userService.getRecordsByUser(userByIdToken);
    console.log('✅ Token userByIdToken:', userByIdToken);

    res.status(200).json({ data: records });
  } catch (error) {
    next(error);
  }
};


const getAllUsers = async (req, res, next) => {
  try {
    const users = await userService.getAllUsers();
    return Res.success(res, users, MessageConstant.USER. FETCH_SUCCESS);
  } catch (error) {
    console.log(error);
    next(error);
  }
};

const getUserById = async (req, res, next) => {
  try {
    const user = await userService.getUserById(req.params.id);
    return Res.success(res, user, MessageConstant.USER.FETCH_SUCCESS);
  } catch (error) {
    next(error);
  }
};

const login = async (req, res, next) => {
  try {
    const userData = await userService.login(req.body);
    return Res.success(res, userData, MessageConstant.USER.LOGIN_SUCCESS);
  } catch (err) {
    next(err);
  }
};


const updateUserPassword = async (req, res, next) => {
  try {
    await userService.updatePassword(req);
    return Res.success(res, null, MessageConstant.USER.PASSWORD_UPDATE_SUCCESS);
  } catch (error) {
    next(error);
  }
};

const updateUser = async (req, res, next) => {
  try {
    const userIdFromToken = req.user.id;
    const userIdFromParams = req.params.id;

    if (parseInt(userIdFromToken) !== parseInt(userIdFromParams)) {
      return Res.error(res, "You can only update your own account", 403);
    }

    const updated = await userService.updateUser(userIdFromParams, req.body);
    return Res.success(res, updated, MessageConstant.USER.UPDATE_SUCCESS);
  } catch (error) {
    next(error);
  }
};

const findByEmail = async (req, res, next) => {
  try {
    const data = await userService.findByEmail(req.body);
    return Res.success(res, data, MessageConstant.USER.EMAIL_FOUND);
  } catch (error) {
    next(error);
  }
};

const deleteUser = async (req, res, next) => {
  try {
    const deleted = await userService.deleteUser(req.params.id);
    if (deleted) {
      return Res.success(res, null, MessageConstant.USER.DELETE_SUCCESS);
    } else {
      return Res.error(res, MessageConstant.USER.NOT_FOUND, 404);
    }
  } catch (error) {
    next(error);
  }
};

const getUsersByEmailLetter = async (req, res, next) => {
  try {
    const users = await userService.getUsersByEmailStart(req.body);
    return Res.success(res, users, MessageConstant.USER.EMAIL_START_SUCCESS);
  } catch (error) {
    next(error);
  }
};

const getUsersByIds = async (req, res, next) => {
  try {
    const { ids } = req.body;
    if (!Array.isArray(ids)) {
      return Res.error(res, "ids must be an array", 400);
    }

    const users = await userService.getUsersByIds(ids);
    return Res.success(res, MessageConstant.USER.IDS_FETCH_SUCCESS, users);
  } catch (error) {
    next(error);
  }
};

const assignMenusToUser = async (req, res, next) => {
  try {
    const { userId, menuIds } = req.body;
    await userService.assignMenusToUser(userId, menuIds);
    return Res.success(res, null, MessageConstant.USER.ASSIGN_MENUS_SUCCESS);
  } catch (error) {
    next(error);
  }
};

const paginateUsersWithMenus = async (req, res, next) => {
  try {
    const result = await userService.paginateUsersWithMenus(req.body);
    return Res.success(res, result, MessageConstant.USER.PAGINATION_SUCCESS);
  } catch (error) {
    next(error);
  }
};

const getUsersWithmenu = async (req, res, next) => {
  try {
    const result = await userService.getUsersWithmenu(req.body);
    return Res.success(res, result, MessageConstant.USER.JOIN_FETCH_SUCCESS);
  } catch (error) {
    next(error);
  }
};

const getUsers = async (req, res, next) => {
  try {
    const result = await userService.getUsers(req.body);
    const data = {
      content: result.data,
      totalItems: result.totalItems,
      totalPages: result.totalPages,
      currentPage: result.currentPage,
      pageLimit: result.pageLimit,
    };
    return Res.success(res, data, MessageConstant.USER.PAGINATION_SUCCESS);
  } catch (error) {
    next(error);
  }
};

const upsertUser = async (req, res, next) => {
  try {
    const { user, created } = await userService.upsertUser(req.body);
    const message = created ? MessageConstant.USER.CREATE_SUCCESS : MessageConstant.USER.UPSERT_SUCCESS;
    return Res.success(res, user, message);
  } catch (error) {
    next(error);
  }
};

const bulkInsertUsers = async (req, res, next) => {
  try {
    const bodyArray = req.body;
    const users = bodyArray[0]?.users;

    if (!Array.isArray(users)) {
      throw new BadRequestException('Input must be an array of users');
    }

    const result = await userService.bulkInsertUsers(users);
    return Res.success(res, result, MessageConstant.USER.BULK_SAVE_SUCCESS);
  } catch (error) {
    next(error);
  }
};






const saveUser = async (req, res, next) => {
  try {
    const data = await userService.saveUser(req.body);
    return Res.success(res, data, MessageConstant.USER.UPSERT_SUCCESS);
  } catch (error) {
    next(error);
  }
};

const fetchAllUsers = async (req, res, next) => {
  try {
    const users = await userService.fetchAllUsers();
    return Res.success(res, users, MessageConstant.USER.FETCH_ALL_SUCCESS);
  } catch (error) {
    next(error);
  }
};

const registerUser = async (req, res, next) => {
  try {
    await userService.sendWelcomeMailsToAllUsers();
    return Res.noContent(res);
  } catch (error) {
    next(error);
  }
};

// const processExternalApi = async (req, res, next) => {
//   try {
//     const result = await handleRequest(req.body?.url);
//     return Res.success(res, result, MessageConstant.USER.FETCH_SUCCESS);
//   } catch (error) {
//     console.error('Final Error:', error.message);
//     return Res.error(res, MessageConstant.USER.EXTERNAL_API_ERROR);
//   }
// };

const processExternalApi = async (req, res) => {
  try {
    const { method, url, data } = req.body;

    if (!method || !url) {
      return Res.error(res, MessageConstant.USER.METHOD_AND_URL_REQUIRED);
    }

    const result = await handleRequest(method, url, data);
    return Res.success(res, result, MessageConstant.USER.FETCH_SUCCESS);
  } catch (error) {
    console.error('Final Error:', error.message);
    return Res.error(res, MessageConstant.USER.EXTERNAL_API_ERROR);
  }
};

const createCustomIndex = async (req, res) => {
  try {
    const result = await userService.createCustomIndexService();
    return Res.success(res, result, MessageConstant.USER.INDEX_CREATED);
  } catch (error) {
    console.error('Index creation failed:', error.message);
    return Res.error(res, MessageConstant.USER.INDEX_CREATION_FAILED);
  }
};

// const jwt = require('jsonwebtoken');
// const User = require('../models/user'); // Adjust path to your User model

// UserController.js

// const jwt = require('jsonwebtoken');
// const User = require('../models/User');  // apne User model ka path dekh lo

// const getUsersByToken = async (req, res, next) => {
//   try {
//     const token = req.headers.authorization?.split(' ')[1];
//     if (!token) {
//       return res.status(401).json({ message: 'Token missing' });
//     }

//     const decoded = jwt.verify(token, process.env.JWT_SECRET);
//     const userId = decoded.id;

//     if (!userId) {
//       return res.status(400).json({
//         status: {
//           status: "error",
//           code: 400,
//           description: "Invalid user ID"
//         }
//       });
//     }

//     const userExists = await User.findByPk(userId);
//     if (!userExists) {
//       return res.status(400).json({
//         status: {
//           status: "error",
//           code: 400,
//           description: "Invalid user ID"
//         }
//       });
//     }

//     const users = await User.findAll({
//       where: {
//         userByIdToken: userId.toString()
//       }
//     });

//     return res.status(200).json({
//       data: users,
//       status: {
//         status: "ok",
//         code: 200,
//         description: "Users fetched using token"
//       }
//     });
//   } catch (err) {
//     console.error(err);
//     return res.status(500).json({
//       status: {
//         status: "error",
//         code: 500,
//         description: "Failed to fetch users by token"
//       }
//     });
//   }
// };

const assignTokenToAnotherUser = async (targetUserId, token) => {
  try {
    // Token decode karo
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const userIdFromToken = decoded.id;

    if (!userIdFromToken) {
      throw new Error('Invalid token: no user id found');
    }

    // Update target user ke userByIdToken mein wo ID daalo
    const [updatedCount] = await User.update(
      { userByIdToken: userIdFromToken },
      { where: { id: targetUserId } }
    );

    if (updatedCount === 0) {
      throw new Error('Target user not found or update failed');
    }

    return { message: 'Token assigned successfully' };
  } catch (error) {
    throw error;
  }
};



module.exports = {
  createUser,
  getRecordsByUser,
  getUserById,
  updateUser,
  deleteUser,
  getUsersByEmailLetter,
  getUsersByIds,
  getAllUsers,
  assignMenusToUser,
  paginateUsersWithMenus,
  getUsersWithmenu,
  getUsers,
  upsertUser,
  bulkInsertUsers,
  saveUser,
  fetchAllUsers,
  login,
  updateUserPassword,
  findByEmail,
  registerUser,
  processExternalApi,
  createCustomIndex,
  // getUsersByToken,
  assignTokenToAnotherUser
};