const userService = require('../Service/userService');
const User = require('../models');
const menu = require('../models/menu');
const MessageConstant = require("../constants/MessageConstant");
const { BadRequestException } = require('../utils/errors');
// const {getTemplate} = require("../utils/mailTemplate");
const { sendToMailQueue } = require('../Service/rmqService');
const Res = require('../utils/Res');
const ApiResponse = require('../utils/ApiResponse');
const axios = require('axios');
const { handleRequest } = require('../Service/jsonapi'); 


const createUser = async (req, res, next) => {
  try {
    const user = await userService.createUser(req.body);
    const { password: _, ...userWithoutPassword } = user.toJSON();
    return Res.success(res, userWithoutPassword, MessageConstant.USER.CREATE_SUCCESS, 201);
  } catch (error) {
    next(error);
  }
};

const getAllUsers = async (req, res, next) => {
  try {
    const users = await userService.getAllUsers();
    return Res.success(res, users, MessageConstant.USER.FETCH_SUCCESS);
  } catch (error) {
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

const bulkSaveUsers = async (req, res, next) => {
  try {
    if (!req.body || (Array.isArray(req.body) && req.body.length === 0)) {
      return Res.error(res, "Request body cannot be empty", 400);
    }

    const users = Array.isArray(req.body) ? req.body : [req.body];
    const data = await userService.bulkSaveUsers(users);
    return Res.success(res, data, MessageConstant.USER.BULK_SAVE_SUCCESS);
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





// GET all
// const getAllPosts = async (req, res, next) => {
//   try {
//     const response = await axios.get('https://jsonplaceholder.typicode.com/posts');
//     return res.status(200).json(
//       ApiResponse.success(response.data, MessageConstant.USER.FETCH_SUCCESS)
//     );
//   } catch (error) {
//     console.log(error)
//     return res.status(500).json(
//       ApiResponse.error(null, 500, MessageConstant.USER.FETCH_FAILED)
//     );
//   }
// };



// // GET by ID
// const getPostById = async (req, res, next) => {
//   try {
//     const post = await userService.fetchExternalPostById(req.params.id);
//     res.status(200).json({ data: post });
//   } catch (err) {
//     next(err);
//   }
// };

// // CREATE
// const createPost = async (req, res, next) => {
//   try {
//     const post = await userService.createExternalPost(req.body);
//     res.status(201).json({ data: post });
//   } catch (err) {
//     next(err);
//   }
// };

// // UPDATE
// const updatePost = async (req, res, next) => {
//   try {
//     const post = await userService.updateExternalPost(req.params.id, req.body);
//     res.status(200).json({ data: post });
//   } catch (err) {
//     next(err);
//   }
// };

// // DELETE
// const deletePost = async (req, res, next) => {
//   try {
//     await userService.deleteExternalPost(req.params.id);
//     res.status(204).json({ message: "Deleted successfully" });
//   } catch (err) {
//     next(err);
//   }
// };

const processExternalApi = async (req, res, next) => {
  try {
    const result = await handleRequest(req.body); 
    return Res.success(res, result, MessageConstant.USER.FETCH_SUCCESS);
  } catch (error) {
    console.error(error);
    return Res.error(res, MessageConstant.USER.EXTERNAL_API_ERROR);
  }
};



module.exports = {
  createUser,
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
  bulkSaveUsers,
  saveUser,
  fetchAllUsers,
  login,
  updateUserPassword,
  findByEmail,
  registerUser,
  processExternalApi
  // getAllPosts,
  // getPostById,
  // createPost,
  // updatePost,
  // deletePost
};