const dbConfig = require('../config/db.config');
const schedule = require('node-schedule');
const userRepo = require('../repository/userRepository');

let __testCallback = null; // <-- for test hook

const scheduleUserUnblock = async (user, unblockTime) => {
  // ... tumhara existing code yahin rahega ...
};

// Add this function to expose getAuthConfig for tests
const getAuthConfig = async () => {
  return await dbConfig.getAuthConfig();
};

const __triggerUnblockJobManually = async () => {
  if (__testCallback) {
    await __testCallback();
  }
};

module.exports = {
  scheduleUserUnblock,
  __triggerUnblockJobManually,
  getAuthConfig,   // <--- export karo yeh bhi
};
