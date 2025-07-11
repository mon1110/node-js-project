const schedule = require('node-schedule');
const userRepo = require('../repository/userRepository');

const scheduleUserUnblock = async (user, unblockTime) => {
  // Validate user and unblockTime
  if (!user || !user.email) {
    console.log('Invalid user object provided.');
    return null;
  }

  if (!(unblockTime instanceof Date) || unblockTime <= new Date()) {
    console.log('Invalid or past unblockTime.');
    return null;
  }

  if (!user.blockedAt) {
    console.log(`ℹ️ User "${user.name}" is not blocked, skipping scheduler.`);
    return null;
  }

  // Create a unique job key
  const jobKey = `unblock-${user.name}-${Date.now()}`;

  // Schedule the job
  schedule.scheduleJob(jobKey, unblockTime, async () => {
    console.log(`Auto-unblocking triggered for: ${user.name}`);

    try {
      const User = await userRepo.findByEmail(user.id);

      if (!User) {
        console.log(`User not found: ${user.id}`);
        return;
      }

      if (!User.blockedAt) {
        console.log(`User already unblocked: ${User.name}`);
        return;
      }

      await userRepo.updateByEmail(User.id, {
        failedAttempts: 0
      });

      console.log(`Successfully unblocked: ${User.name}`);
    } catch (error) {
      console.error(`Error during scheduled unblock for ${user.email}:`, error.message);
    }
  });

  return jobKey;
};

module.exports = {
  scheduleUserUnblock,
};
