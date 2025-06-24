// controllers/userController.js
const userService = require('../Service/userService');
const  User  = require('../models');
const menu = require('../models/menu');
const ApiResponse = require('../utils/ApiResponse');
const MessageConstant = require("../constants/MessageConstant");
const { BadRequestException } = require('../utils/errors');
const { sendToMailQueue } = require('../producers/mailProducer');
const getTemplate = require('../utils/mailTemplate');


const createUser = async (req, res, next) => {
  try {
    const user = await userService.createUser(req.body);
    const { password: _, ...userWithoutPassword } = user.toJSON();
    
    return res.status(201).json(
      ApiResponse.success(userWithoutPassword, MessageConstant.USER.CREATE_SUCCESS, 201)
    );
  } catch (error) {
    next(error); 
  }
};

//nodemailer ke liye
const getAllUsers = async (req, res, next) => {
  try {
    const users = await userService.getAllUsers();
    
    return res.status(200).json(
      ApiResponse.success(users, MessageConstant.USER.FETCH_SUCCESS, 200)
    );
  } catch (error) {
    next(error);
  }
};


//custom error ke liye ye use hoga

const getUserById = async (req, res, next) => {
  try {
    const user = await userService.getUserById(req.params.id);
    return res.status(200).json(
      ApiResponse.success(user, MessageConstant. NOT_FOUND) 
    );
  } catch (error) {
    next(error);
  }
};

//login ke liye
const login = async (req, res, next) => {
  try {
    const userData = await userService.login(req.body);
    res.status(200).json(ApiResponse.success(userData, MessageConstant.USER.LOGIN_SUCCESS));
  } catch (err) {
    console.log(err)
    next(err);
  }
};


//update password
const updateUserPassword = async (req, res, next) => {
  try {
    await userService.updatePassword(req);
    return res.status(200).json(ApiResponse.success(null, MessageConstant.USER.PASSWORD_UPDATE_SUCCESS));
  } catch (error) {
    next(error);
  }
};

const updateUser = async (req, res, next) => {
  try {
    const userIdFromToken = req.user.id;
    const userIdFromParams = req.params.id;

    if (parseInt(userIdFromToken) !== parseInt(userIdFromParams)) {
      return res.status(403).json(ApiResponse.error("You can only update your own account", 403));
    }

    const updated = await userService.updateUser(userIdFromParams, req.body);
    res.status(200).json(ApiResponse.success(updated, MessageConstant.USER.UPDATE_SUCCESS));
  } catch (error) {
    next(error);
  }
};


const findByEmail = async (req, res, next) => {
  try {
    const data = await userService.findByEmail(req.body);
    return res.status(200).json(ApiResponse.success(data, MessageConstant.USER.EMAIL_FOUND));
  } catch (error) {
    next(error);
  }
};

const deleteUser = async (req, res, next) => {
  try {
    const deleted = await userService.deleteUser(req.params.id);
    if (deleted) {
      return res.status(200).json(ApiResponse.success(null, MessageConstant.USER.DELETE_SUCCESS));
    } else {
      return res.status(404).json(ApiResponse.error(MessageConstant.USER.NOT_FOUND));
    }
  } catch (error) {
    next(error);
  }
};

const getUsersByEmailLetter = async (req, res, next) => {
  try {
    const users = await userService.getUsersByEmailStart(req.body);
    return res.status(200).json(ApiResponse.success(users, MessageConstant.USER.EMAIL_START_SUCCESS));
  } catch (error) {
    next(error);
  }
};

const getUsersByIds = async (req, res, next) => {
  try {
    const { ids } = req.body;
    if (!Array.isArray(ids)) {
      return res.status(400).json(ApiResponse.error(MessageConstant.USER.VALIDATION_FAILED, "ids must be an array"));
    }

    const users = await userService.getUsersByIds(ids);
    return res.status(200).json(ApiResponse.success(users, MessageConstant.USER.IDS_FETCH_SUCCESS));
  } catch (error) {
    next(error);
  }
};

const assignMenusToUser = async (req, res, next) => {
  try {
    const { userId, menuIds } = req.body;
    const message = await userService.assignMenusToUser(userId, menuIds);
    return res.status(200).json(ApiResponse.success(null, MessageConstant.USER.ASSIGN_MENUS_SUCCESS));
  } catch (error) {
    next(error);
  }
};

const paginateUsersWithMenus = async (req, res, next) => {
  try {
    const result = await userService.paginateUsersWithMenus(req.body);
    return res.status(200).json(ApiResponse.success(result, MessageConstant.USER.PAGINATION_SUCCESS));
  } catch (error) {
    next(error);
  }
};

const getUsersWithmenu = async (req, res, next) => {
  try {
    const result = await userService.getUsersWithmenu(req.body);
    return res.status(200).json(ApiResponse.success(result, MessageConstant.USER.JOIN_FETCH_SUCCESS));
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
    return res.status(200).json(ApiResponse.success(data, MessageConstant.USER.PAGINATION_SUCCESS));
  } catch (error) {
    next(error);
  }
};

const upsertUser = async (req, res, next) => {
  try {
    const { user, created } = await userService.upsertUser(req.body);
    const message = created ? MessageConstant.USER.CREATE_SUCCESS : MessageConstant.USER.UPSERT_SUCCESS;
    return res.status(200).json(ApiResponse.success(user, message));
  } catch (error) {
    next(error);
  }
};

const bulkSaveUsers = async (req, res, next) => {
  try {
    if (!req.body || (Array.isArray(req.body) && req.body.length === 0)) {
      return res.status(400).json(ApiResponse.error(MessageConstant.USER.VALIDATION_FAILED, "Request body cannot be empty"));
    }

    const users = Array.isArray(req.body) ? req.body : [req.body];
    const data = await userService.bulkSaveUsers(users);
    return res.status(200).json(ApiResponse.success(data, MessageConstant.USER.BULK_SAVE_SUCCESS));
  } catch (error) {
    next(error);
  }
};

const saveUser = async (req, res, next) => {
  try {
    const data = await userService.saveUser(req.body);
    return res.status(200).json(ApiResponse.success(data, MessageConstant.USER.UPSERT_SUCCESS));
  } catch (error) {
    next(error);
  }
};

const fetchAllUsers = async (req, res, next) => {
  try {
    const users = await userService.fetchAllUsers();
    return res.status(200).json(ApiResponse.success(users, MessageConstant.USER.FETCH_ALL_SUCCESS));
  } catch (error) {
    next(error);
  }
};

const registerUser = async (req, res) => {
  const { name, email } = req.body;

  // Simulate DB save
  console.log(`📝 User created: ${name} - ${email}`);

  // Send email to queue
  await sendToMailQueue({
    to: email,
    subject: 'Welcome!',
    html: getTemplate(name)
  });

  res.status(201).json({ message: 'User registered, mail queued' });
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
  registerUser
};
