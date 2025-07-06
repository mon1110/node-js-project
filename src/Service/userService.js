// services/userService.js
const userRepo = require('../repository/userRepository');
const MessageConstant = require("../constants/MessageConstant");
const { sendEmail } = require("../utils/EmailService");
const jwt = require('jsonwebtoken');
const SECRET_KEY = 'your-secret-key'; 
const bcrypt = require('bcrypt');
const { BadRequestException } = require('../utils/errors');
const getTemplate = require('../utils/mailtemplate'); 
const { sendToMailQueue } = require('../Service/rmqService');
const { User } = require('../models'); 

// const {BadRequestException, NotFoundException,} = require("../utils/errors");
//const MessageConstant = require("../constants/MessageConstant");

const createUser = async (data) => {
  const { name, email, menuIds, password, gender } = data;

  if (!name || !email || !menuIds || !password || !gender) {
    throw new BadRequestException(MessageConstant.USER.ALL_FIELDS_REQUIRED);
  }

  const existingUser = await userRepo.findByEmail(email.toLowerCase());
  if (existingUser) {
    throw new BadRequestException(MessageConstant.USER.EMAIL_EXISTS);
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  const newUser = await userRepo.createUser({
    name,
    email: email.toLowerCase(),
    menuIds,
    password: hashedPassword,
    gender
  });

  // Send welcome email using queue
  const mailPayload = {
    to: email,
    subject: 'Welcome to Our App!',
    html: getTemplate(name) // centralized template
  };

  await sendToMailQueue(mailPayload);

  return newUser;
};

//use for password block/ unblock 
const MAX_ATTEMPTS = 5;
const BLOCK_DURATION_MS = 5 * 60 * 1000; // 5 minutes

const login = async ({ email, password }) => {
  if (!email || !password) {
    throw new Error(MessageConstant.USER.ALL_FIELDS_REQUIRED);
  }

  const user = await User.findOne({ where: { email } });
  if (!user) {
    throw new Error(MessageConstant.USER.INVALID_EMAIL_OR_PASSWORD);
  }

  // Check if user is blocked
  if (user.isBlocked) {
    const unblockTime = new Date(user.blockedAt.getTime() + BLOCK_DURATION_MS);
    const now = new Date();

    if (now < unblockTime) {
      const remainingMs = unblockTime - now;
      const remainingMin = Math.ceil(remainingMs / 60000);
      throw new Error(` Account is blocked. Try again in ${remainingMin} minute(s).`);
    } else {
      // Unblock user after block duration
      await user.update({ isBlocked: false, failedAttempts: 0, blockedAt: null });
    }
  }

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) {
    const attempts = user.failedAttempts + 1;
    const updates = { failedAttempts: attempts };

    if (attempts >= MAX_ATTEMPTS) {
      updates.isBlocked = true;
      updates.blockedAt = new Date();
      await user.update(updates);
      throw new Error(`Invalid credentials. Your account is now blocked for 5 minutes.`);
    }

    await user.update(updates);
    throw new Error(`Invalid credentials (${attempts}/${MAX_ATTEMPTS} attempts)`);
  }

  // Reset attempts on success
  await user.update({ failedAttempts: 0, isBlocked: false, blockedAt: null });

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

const sendWelcomeMailsToAllUsers = async () => {
  const users = await userRepo.getAllUsers(); 

  for (const user of users) {
    const { name, email } = user;

    if (!name || !email) continue;

    const mailPayload = {
      to: email,
      name,
      subject: 'Welcome!',
      html: getTemplate(user.name) 
    };
    console.log('Payload being sent to queue:', mailPayload);

    await sendToMailQueue(mailPayload);
    // console.log('Mail queued:', email, '-', name); 

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
  findByEmail,
  sendWelcomeMailsToAllUsers
};
