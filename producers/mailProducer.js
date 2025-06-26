const { getChannel } = require('../config/rmq');

const sendToMailQueue = async (data) => {
  const channel = getChannel();
  channel.sendToQueue('MAIL_QUEUE', Buffer.from(JSON.stringify(data)), {
    persistent: true
  });
};

module.exports = { sendToMailQueue };
