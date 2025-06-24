const { getChannel } = require('../config/rmq');
const mailService = require('../Service/mailService');
const ApiResponse = require('../utils/ApiResponse'); // ✅ import

const consumeMailQueue = async () => {
  const channel = getChannel();

  if (!channel) {
    console.warn(ApiResponse.error('Channel not ready. Retrying in 2 seconds...'));
    return setTimeout(consumeMailQueue, 2000);
  }

  await channel.assertQueue('MAIL_QUEUE', { durable: true });
//comment this code that time display rabbitMQ response otherwise not show response open popup queue is empty
  channel.consume('MAIL_QUEUE', async (msg) => {
    if (msg !== null) {
      const payload = JSON.parse(msg.content.toString());
      console.log(ApiResponse.success('Message received from queue', payload));

      try {
        await mailService.sendMail(payload);
        console.log(ApiResponse.success('Mail sent successfully to', payload.to));
      } catch (err) {
        console.error(ApiResponse.error('Mail send failed', err.message));
      }

      channel.ack(msg);
    }
  });

  console.log(ApiResponse.success('Listening to MAIL_QUEUE'));
};

module.exports = consumeMailQueue;
