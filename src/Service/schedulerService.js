const schedule = require('node-schedule');
const userRepo = require('../repository/userRepository');

const scheduleUserUnblock = async (user, unblockTime) => {
  const jobKey = `unblock-${user.name}-${Date.now()}`;

  schedule.scheduleJob(jobKey, unblockTime, async () => {
    console.log(`Auto-unblocking triggered for: ${user.name}`);

    const User = await userRepo.findByEmail(user.email);
    if (!User) {
      console.log(`User not found: ${user.email}`);
      return;
    }

    await userRepo.updateByEmail(User.email, {
      failedAttempts: 0
    });

    console.log(`Successfully unblocked: ${User.name}`);
  });

  return jobKey;
};

module.exports = {
  scheduleUserUnblock,
};
