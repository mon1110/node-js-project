const schedule = require('node-schedule');
const userRepo = require('../repository/userRepository');

let __testCallback = null; // <-- for test hook

const scheduleUserUnblock = async (user, unblockTime) => {
  const jobKey = `unblock-${user.name}-${Date.now()}`;

  const callback = async () => {
    console.log(`Auto-unblocking triggered for: ${user.name}`);

    const User = await userRepo.findByEmail(user.email);
    if (!User) {
      console.log(`User not found: ${user.email}`);
      return;
    }

    await userRepo.updateByEmail(User.email, {
      failedAttempts: 0,
    });

    console.log(`Successfully unblocked: ${User.name}`);
  };

  // Store callback for testing
  if (process.env.NODE_ENV === 'test') {
    __testCallback = callback;
  }

  schedule.scheduleJob(jobKey, unblockTime, callback);

  return jobKey;
};

// For testing only
const __triggerUnblockJobManually = async () => {
  if (__testCallback) {
    await __testCallback();
  }
};

module.exports = {
  scheduleUserUnblock,
  __triggerUnblockJobManually, // <- test helper
};
