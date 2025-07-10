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
const { Settings } = require('../models'); 
const { getAuthConfig } = require('../utils/settingsUtil');
const { generateToken } = require('../utils/jwt'); 


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
    html: getTemplate(name) 
  };
  await sendToMailQueue(mailPayload);
  return newUser;
};


//use for password block/ unblock 
const schedule = require('node-schedule');
const login = async ({ email, password }) => {
  if (!email || !password) {
    throw new BadRequestException(MessageConstant.USER.ALL_FIELDS_REQUIRED);
  }

  const user = await userRepo.findByEmail(email);
  if (!user) {
    throw new BadRequestException(MessageConstant.USER.INVALID_EMAIL_OR_PASSWORD);
  }

  const { maxAttempts, blockDurationMs } = await getAuthConfig();
  const now = new Date();

  if (user.blockedAt) {
    const unblockTime = new Date(user.blockedAt.getTime() + blockDurationMs);
    if (now < unblockTime) {
      const remainingMin = Math.ceil((unblockTime - now) / 60000);
      throw new BadRequestException(MessageConstant.USER.blockedWithTimer(remainingMin));
    } else {
      await userRepo.updateUser(user.id, { failedAttempts: 0, blockedAt: null });
      return await login({ email, password }); // Retry login
    }
  }

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) {
    const attempts = user.failedAttempts + 1;
    const updates = { failedAttempts: attempts };

    if (attempts >= maxAttempts) {
      updates.blockedAt = new Date();

      const unblockTime = new Date(Date.now() + blockDurationMs);
      schedule.scheduleJob(user.id,unblockTime, async () => {
        console.log(`Auto-unblocking user with ID: ${user.id} at ${new Date().toLocaleString()}`);
        await userRepo.updateUser(user.id, { failedAttempts: 0 });
      });
    }

    await user.update(updates);
    throw new BadRequestException(
      MessageConstant.USER.invalidCredentialWithCount(attempts, maxAttempts)
    );
  }

  await userRepo.updateUser(user.id, { failedAttempts: 0, blockedAt: null });
  const token = generateToken({ userId: user.id });
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
    throw new Error(MessageConstant.USER.NOT_FOUND);
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
  if (!user) throw new Error(MessageConstant.USER.NOT_FOUND);

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