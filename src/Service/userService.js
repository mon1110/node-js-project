// services/userService.js
const userRepo = require('../repository/userRepository');
const MessageConstant = require("../constants/MessageConstant");
const { sendEmail } = require("../utils/EmailService");
const jwt = require('jsonwebtoken');
const SECRET_KEY = 'your-secret-key'; 
const { BadRequestException } = require('../utils/errors');
const getTemplate = require('../utils/mailtemplate'); 
const { sendToMailQueue } = require('../Service/rmqService');
const { User } = require('../models'); 
const { Settings } = require('../models'); 
const { getAuthConfig } = require('../utils/settingsUtil');
const { generateToken } = require('../utils/jwt'); 
const schedule = require('node-schedule');
const bcrypt = require('bcrypt');
const { scheduleUserUnblock } = require('./schedulerService');



const createUser = async (data,userByIdToken) => {
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
    gender,
    userByIdToken  // yaha save hoga token user ka ID
  });

  const token = jwt.sign(
    { id: newUser.id, email: newUser.email },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '1h' }
  );

  return { user: newUser, token };
};

//tokan se record through krne k liye
const getAllUsersWithSubUsers = async () => {
  return await userRepo.getSubUsersByToken();a
};




//use for password block/ unblock 

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

  // Already blocked
  if (user.blockedAt) {
    const unblockTime = new Date(user.blockedAt.getTime() + blockDurationMs);
    if (now < unblockTime) {
      const remainingMin = Math.ceil((unblockTime - now) / 60000);
      throw new BadRequestException(MessageConstant.USER.blockedWithTimer(remainingMin));
    } else {
      // Unblock after timeout
      await userRepo.updateByEmail(user.email, { failedAttempts: 0 });
      user.failedAttempts = 0;
      // user.blockedAt = null;
    }
  }

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) {
    const attempts = user.failedAttempts + 1;
    const updates = { failedAttempts: attempts };

    if (attempts >= maxAttempts) {
      updates.blockedAt = new Date();
    }

    await userRepo.updateByEmail(user.email, updates);

    // Schedule unblock only at exact block time
    if (attempts === maxAttempts) {
      const unblockTime = new Date(Date.now() + blockDurationMs);
      await scheduleUserUnblock(user, unblockTime);
    }

    throw new BadRequestException(
      MessageConstant.USER.invalidCredentialWithCount(attempts, maxAttempts)
    );
  }

  // Successful login – reset counters
  await userRepo.updateByEmail(user.email, { failedAttempts: 0, blockedAt: null });

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
  Object.assign(user, updateData);
  return await user.save();
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
const updatePassword = async (userId, newPassword) => {
  const user = await User.findByPk(userId);
  if (!user) throw new Error('User not found');

  user.password = newPassword;
  await user.save();  // beforeSave hook trigger hoga, password hash hoga
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
const bulkInsertUsers = async (users) => {
  return await userRepo.bulkSaveUsers(users); // Skip existing softDelete=false
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

  }
  };

  const createCustomIndexService = async () => {
    return await userRepo.createCustomIndexOnEmail();
  };
  
  //token se sub id fatch krne k liye
  // const getSubUsersWithOwner = async (userByIdToken) => {
  //   const subUsers = await User.findAll({
  //     where: {
  //       userByIdToken: userByIdToken.toString(),
  //       softDelete: false
  //     },
  //     attributes: { exclude: ['password'] }
  //   });
  
  //   const ownerUser = await User.findByPk(userByIdToken, {
  //     attributes: ['id', 'name', 'email', 'gender']
  //   });
  
  //   return {
  //     user: ownerUser,
  //     subUsers
  //   };
  // };
  
    



module.exports = {
  createUser,
  getAllUsersWithSubUsers,
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
  bulkInsertUsers,
  saveUser,
  fetchAllUsers,
  login,
  updatePassword,
  findByEmail,
  sendWelcomeMailsToAllUsers,
  createCustomIndexService,
  // getSubUsersWithOwner
};


// [{id:40, ...., subUsers:[{},{},{},]}]