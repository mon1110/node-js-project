// src/controllers/UserController.js

const userService = require('../Service/userService');
const menu = require('../models/menu');
const MessageConstant = require('../constants/MessageConstant');
const { BadRequestException } = require('../utils/errors');
const { sendToMailQueue } = require('../Service/rmqService');
const Res = require('../utils/Res');
const ApiResponse = require('../utils/ApiResponse');
const axios = require('axios');
// const { handleRequest } = require('../Service/jsonapi');
const jsonapi = require('../Service/jsonapi');
const { createCustomIndexOnEmail } = require('../Service/userService');
const User = require('../models/User');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');

// Token model may not exist in some test setups — make it optional so tests won't throw on require
let Token = null;
try {
  // eslint-disable-next-line global-require
  Token = require('../models/Token');
} catch (err) {
  Token = null;
}

/**
 * Helper responses:
 * - Use Res.success(res, data, message)
 * - Use Res.error(res, message, status)
 */

/* ---------------- createUser ---------------- */
const createUser = async (req, res, next) => {
  try {
    const userByIdToken = req.user?.userId || req.user?.id || null;
    if (!req.body || typeof req.body !== 'object') {
      return Res.error(res, MessageConstant.USER.INVALID_PAYLOAD || 'Invalid payload', 400);
    }

    const user = await userService.createUser(req.body, userByIdToken);

    // Ensure we don't leak password
    const { password, ...userWithoutPassword } = user || {};

    return Res.success(res, { user: userWithoutPassword }, MessageConstant.USER.CREATE_SUCCESS);
  } catch (error) {
    next(error);
  }
};

/* ---------------- getAllUserss (with sub users) ---------------- */
const getAllUserss = async (req, res, next) => {
  try {
    const users = await userService.getAllUsersWithSubUsers();
    return Res.success(res, users, MessageConstant.USER.FETCH_SUCCESS);
  } catch (err) {
    // keep logging for debugging but forward error
    // eslint-disable-next-line no-console
    console.error('getAllUserss error:', err?.message || err);
    next(err);
  }
};

/* ---------------- getAllUsers ---------------- */
const getAllUsers = async (req, res, next) => {
  try {
    const users = await userService.getAllUsers();
    return Res.success(res, users, MessageConstant.USER.FETCH_SUCCESS);
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('getAllUsers error:', error?.message || error);
    next(error);
  }
};

/* ---------------- getUserById ---------------- */
const getUserById = async (req, res, next) => {
  try {
    const id = req.params?.id;
    if (!id) {
      return Res.error(res, MessageConstant.USER.ID_REQUIRED || 'User id required', 400);
    }
    const user = await userService.getUserById(id);
    return Res.success(res, user, MessageConstant.USER.FETCH_SUCCESS);
  } catch (error) {
    next(error);
  }
};

/* ---------------- login ---------------- */
const login = async (req, res, next) => {
  try {
    const userData = await userService.login(req.body);
    return Res.success(res, userData, MessageConstant.USER.LOGIN_SUCCESS);
  } catch (error) {
    return next(error);
  }
};
/* ---------------- updatePasswordController (external API) ---------------- */
const updatePasswordController = async (req, res, next) => {
  try {
    const { userId, newPassword } = req.body || {};
    if (!userId || !newPassword) {
      return Res.error(res, MessageConstant.USER.PASSWORD_REQUIRED || 'userId and newPassword required', 400);
    }
    await userService.updatePassword(userId, newPassword);
    return res.status(200).json({ message: 'Password updated successfully' });
  } catch (error) {
    next(error);
  }
};

/* ---------------- updateUser (change own password) ---------------- */
const updateUser = async (req, res, next) => {
  try {
    const userIdFromToken = req.user?.userId;
    const { oldPassword, newPassword } = req.body || {};

    if (!userIdFromToken) {
      return Res.error(res, MessageConstant.USER.UNAUTHORISED || 'User not authorized', 401);
    }

    if (!oldPassword || !newPassword) {
      return Res.error(res, MessageConstant.USER.PASSWORD_REQUIRED || 'Old and new password required', 400);
    }

    const user = await userService.getUserById(userIdFromToken);
    if (!user) {
      return Res.error(res, MessageConstant.USER.NOT_FOUND || 'User not found', 404);
    }

    const isMatch = await bcrypt.compare(oldPassword, user.password);
    if (!isMatch) {
      return Res.error(res, MessageConstant.USER.INVALID_OLD_PASSWORD || 'Invalid old password', 400);
    }

    await userService.updateUser(userIdFromToken, { password: newPassword });

    return Res.success(res, null, MessageConstant.USER.PASSWORD_UPDATED);
  } catch (error) {
    next(error);
  }
};

/* ---------------- findByEmail ---------------- */
const findByEmail = async (req, res, next) => {
  try {
    if (!req.body || Object.keys(req.body).length === 0) {
      return Res.error(res, MessageConstant.USER.INVALID_PAYLOAD || 'Invalid payload', 400);
    }
    const data = await userService.findByEmail(req.body);
    return Res.success(res, data, MessageConstant.USER.EMAIL_FOUND);
  } catch (error) {
    next(error);
  }
};

/* ---------------- deleteUser ---------------- */
const deleteUser = async (req, res, next) => {
  try {
    const deleted = await userService.deleteUser(req.params.id);
    if (deleted) {
      return Res.success(res, null, MessageConstant.USER.DELETE_SUCCESS);
    }
    return Res.error(res, MessageConstant.USER.NOT_FOUND, 404);
  } catch (error) {
    return next(error); // return add kiya
  }
};


const getUsersByEmailLetter = async (req, res, next) => {
  try {
    if (!req.body) {
      return Res.error(res, MessageConstant.USER.INVALID_PAYLOAD || 'Invalid payload', 400);
    }
    const users = await userService.getUsersByEmailStart(req.body);
    return Res.success(res, users, MessageConstant.USER.EMAIL_START_SUCCESS);
  } catch (error) {
    next(error);
  }
};

const getUsersByIds = async (req, res, next) => {
  try {
    const { ids } = req.body || {};
    if (!Array.isArray(ids)) {
      return Res.error(res, 'ids must be an array', 400);
    }

    const users = await userService.getUsersByIds(ids);

    return Res.success(res, users, MessageConstant.USER.IDS_FETCH_SUCCESS);
  } catch (error) {
    next(error);
  }
};

const assignMenusToUser = async (req, res, next) => {
  try {
    const { userId, menuIds } = req.body || {};
    if (!userId || !Array.isArray(menuIds)) {
      return Res.error(res, MessageConstant.USER.INVALID_PAYLOAD || 'userId and menuIds array required', 400);
    }

    await userService.assignMenusToUser(userId, menuIds);
    return Res.success(res, null, MessageConstant.USER.ASSIGN_MENUS_SUCCESS);
  } catch (error) {
    next(error);
  }
};

const paginateUsersWithMenus = async (req, res, next) => {
  try {
    const payload = req.body || {};
    const result = await userService.paginateUsersWithMenus(payload);
    return Res.success(res, result, MessageConstant.USER.PAGINATION_SUCCESS);
  } catch (error) {
    next(error);
  }
};

const getUsersWithmenu = async (req, res, next) => {
  try {
    const payload = req.body || {};
    const result = await userService.getUsersWithmenu(payload);
    return Res.success(res, result, MessageConstant.USER.JOIN_FETCH_SUCCESS);
  } catch (error) {
    next(error);
  }
};

const getUsers = async (params = {}) => {
  const page = params.page || 1;
  const limit = params.limit || 10;
  const offset = (page - 1) * limit;

  // Defensive: Token may be null in test envs
  const include = [];
  if (Token) {
    include.push({
      model: Token,
      attributes: ['id', 'name', 'email'],
      required: false,
    });
  }

  const result = await User.findAndCountAll({
    where: { softDelete: false },
    include,
    limit,
    offset,
  });

  return {
    data: result.rows || [],
    totalItems: result.count || 0,
    totalPages: Math.ceil((result.count || 0) / limit),
    currentPage: page,
    pageLimit: limit,
  };
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
    // expecting body as array with first element containing { users: [...] } per original logic
    const bodyArray = req.body;
    if (!Array.isArray(bodyArray) || bodyArray.length === 0) {
      throw new BadRequestException('Input must be a non-empty array');
    }

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

const processExternalApi = async (req, res, next) => {
  try {
    const { method, url, data } = req.body || {};

    if (!method || !url) {
      return Res.error(res, MessageConstant.USER.METHOD_AND_URL_REQUIRED || 'method and url required', 400);
    }

    const allowedMethods = ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'];
    if (typeof method === 'string' && !allowedMethods.includes(method.toUpperCase())) {
      return Res.error(res, MessageConstant.USER.INVALID_METHOD || 'Invalid HTTP method', 405);
    }

    const result = await handleRequest(method, url, data);
    return Res.success(res, result, MessageConstant.USER.FETCH_SUCCESS);
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('processExternalApi Final Error:', error?.message || error);
    return Res.error(res, MessageConstant.USER.EXTERNAL_API_ERROR || 'External API error', 500);
  }
};

const createCustomIndex = async (req, res, next) => {
  try {
    const result = await userService.createCustomIndexService();
    return Res.success(res, result, MessageConstant.USER.INDEX_CREATED);
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('Index creation failed:', error?.message || error);
    return Res.error(res, MessageConstant.USER.INDEX_CREATION_FAILED || 'Index creation failed', 500);
  }
};

const assignTokenToAnotherUser = async (targetUserId, token) => {
  try {
    if (!targetUserId) {
      throw new Error('Target user id required');
    }
    if (!token) {
      throw new Error('Token required');
    }

    // Decode token
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'test-secret');
    const userIdFromToken = decoded?.id || decoded?.userId;

    if (!userIdFromToken) {
      throw new Error('Invalid token: no user id found');
    }

    // Update target user
    const [updatedCount] = await User.update(
      { userByIdToken: userIdFromToken },
      { where: { id: targetUserId } }
    );

    if (!updatedCount || updatedCount === 0) {
      throw new Error('Target user not found or update failed');
    }

    return { message: 'Token assigned successfully' };
  } catch (error) {
    // rethrow so callers/tests can assert on the error
    throw error;
  }
};

module.exports = {
  createUser,
  getAllUserss,
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
  updatePasswordController,
  findByEmail,
  registerUser,
  processExternalApi,
  createCustomIndex,
  assignTokenToAnotherUser,
};
