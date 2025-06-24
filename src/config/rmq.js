const amqp = require('amqplib');

const RMQ_URL = 'amqp://localhost';
let channel = null;

const connectToQueue = async () => {
  try {
    const connection = await amqp.connect(RMQ_URL);
    channel = await connection.createChannel();
    await channel.assertQueue('MAIL_QUEUE', { durable: true }); // added durable
    console.log('✅ Connected to RabbitMQ');
  } catch (error) {
    console.error(' RabbitMQ connection failed:', error.message);
    process.exit(1); // Exit if connection fails
  }
};

// Safely get channel (returns null if not ready)
const getChannel = () => {
  if (!channel) {
    console.warn(' RabbitMQ channel not initialized yet');
  }
  return channel;
};

module.exports = { connectToQueue, getChannel };
