// services/userService.js
const userRepo = require('../repository/userRepository');
const MessageConstant = require("../constants/MessageConstant");
const { sendEmail } = require("../utils/EmailService");
const jwt = require('jsonwebtoken');
const SECRET_KEY = 'your-secret-key'; 
const bcrypt = require('bcrypt');
const { BadRequestException } = require('../utils/errors');

// const {BadRequestException, NotFoundException,} = require("../utils/errors");
//const MessageConstant = require("../constants/MessageConstant");

const createUser = async (data) => {
  const { name, email, menuIds , password, gender } = data;

  if (!name || !email || !menuIds || !password || !gender) {
    throw new BadRequestException(MessageConstant.USER.ALL_FIELDS_REQUIRED);
  }

  const existingUser = await userRepo.findByEmail(email);
  console.log(email);
  if (existingUser) {
    throw new BadRequestException(MessageConstant.USER.EMAIL_EXISTS);
  }
  const hashedPassword = await bcrypt.hash(password, 10); // ✅ HASH the password
  const newUser = await userRepo.createUser({
    name: name,
    email: email.toLowerCase(),
    menuIds,
    password: hashedPassword,
    gender
  });
    // Send welcome email
    const subject = "Welcome to Our App!";
    const html = `<h1>Hello ${name},</h1><p>Thank you for registering!</p>`;
    await sendEmail(email, subject, html);
  
    return newUser;
};

const login = async (data) => {
  const { email, password } = data;

  if (!email || !password) {
    throw new BadRequestException(MessageConstant.USER.ALL_FIELDS_REQUIRED);
  }

  const user = await userRepo.findByEmail(email);
  if (!user) {
    throw new BadRequestException(MessageConstant.USER.INVALID_EMAIL_OR_PASSWORD);
  }

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) {
    throw new BadRequestException(MessageConstant.USER.INVALID_EMAIL_OR_PASSWORD);
  }

  const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET, { expiresIn: '1h' });

  return { user, token };
};



//nodemailer ke liye
const getAllUsers = async () => {
  return await userRepo.findAll();
};


//custom error ke liye ye use hoga

const getUserById = async (id) => {
  if (!id || isNaN(id)) {
    throw new BadRequestException(MessageConstant.USER.INVALID_ID);
  }

  const user = await userRepo.getUserById(id);
  if (!user) {
    throw new NotFoundException(`${MessageConstant.USER.NOT_FOUND} ID: ${id}`);
  }

  return user;
};

const updateUser = async (id, updateData) => {
  const user = await userRepo.findById(id);
  if (!user) {
    throw new NotFoundException("User not found");
  }

  return await userRepo.updateUser(id, updateData);
};




const findByEmail = async (req) => {
  const { email } = req;

  if (!email) {
    throw new BadRequestException(MessageConstant.USER.EMAIL_REQUIRED);
  }

  const user = await userRepo.findByEmail(email);

  if (!user) {
    throw new BadRequestException(MessageConstant.USER.NOT_FOUND);
  }

  return user;
};


//update password
const updatePassword = async (id, password) => {
  return await userRepo.updatePassword(id, password);
};


const deleteUser = async (id) => {
  return await userRepo.softDeleteUser(id);
};

const getUsersByEmailStart = async ({ search }) => {
  return await userRepo.filterUsersByEmail(search);
};

const getUsersByIds = async (ids) => {
  return await userRepo.findUsersByIds(ids);
};

const assignMenusToUser = async (userId, menuIds) => {
  const user = await userRepo.findUserById(userId);
  if (!user) throw new Error('User not found');

  return await userRepo.updateUserMenus(user, menuIds);
};

const getAllUsersWithMenus = async () => {
  return await userRepo.findAllUsersWithMenus(); 
};



//pagination
const getUsers = async ({ filter, sort, page }) => {
  try {
    const result = await userRepo.getUsers({ filter, sort, page });

    // Optional: Check if result is empty or null
    if (!result || !result.data || result.data.length === 0) {
      throw new ApiError("No users found", 404); // optional
    }

    return result;
  } catch (error) {
    throw error; // pass error to controller -> then to errorHandler
  }
};


//upsert
const upsertUser = async (data) => {
  return await userRepo.upsertUser(data);
};

//joining
const getUsersWithmenu = async () => {
  return await userRepo.getUsersWithmenu();
};

//bulk
const bulkSaveUsers = async (users) => {
  return await userRepo.bulkSaveUsers(users);
};

//single api
const saveUser = async (userData) => {
  return await userRepo.saveUser(userData);
};

//swagger ke liye

const fetchAllUsers = async () => {
  try {
    return await userRepo.getAllUsers();
  } catch (error) {
    throw error;
  }
};

module.exports = {
  createUser,
  getAllUsers,
  getUserById,
  updateUser,
  deleteUser,
  getUsersByEmailStart,
  getUsersByIds,
  assignMenusToUser,
  getAllUsers,
  getAllUsersWithMenus,
  getUsersWithmenu,
  getUsers,
  upsertUser,
  bulkSaveUsers,
  saveUser,
  fetchAllUsers,
  login,
  updatePassword,
  findByEmail
};
