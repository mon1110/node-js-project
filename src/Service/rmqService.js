const amqp = require('amqplib');
const { sendMail } = require('./mailService');
const QUEUE = 'MAIL_QUEUE';

let channel = null;

// Connect to RabbitMQ and initialize queue
const connectQueue = async () => {
  try {
    const connection = await amqp.connect('amqp://localhost');
    channel = await connection.createChannel();
    await channel.assertQueue(QUEUE, { durable: true });
    console.log('RabbitMQ connected & channel initialized');
    consumeMailQueue(); 
  } catch (err) {
    console.error('RabbitMQ connection failed:', err.message);
    setTimeout(connectQueue, 5000); // retry connection every 5 seconds
  }
};

// Producer: Push email payload to queue
const sendMailToQueue = async (data) => {
  if (!channel) {
    console.warn('Channel not ready, retrying in 2s...');
    setTimeout(() => sendMailToQueue(data), 2000);
    return;
  }
  channel.sendToQueue(QUEUE, Buffer.from(JSON.stringify(data)), { persistent: true });
  console.log('Mail queued:', data.to);
};

// Consumer: Process email queue and send email
const consumeMailQueue = () => {
  if (!channel) return;

  channel.consume(QUEUE, async (msg) => {
    if (msg !== null) {
      const payload = JSON.parse(msg.content.toString());
      console.log('Consumed message:', payload);

      try {
        await sendMail(payload); 
        console.log('Mail sent to:', payload.to);
      } catch (err) {
        console.error('Mail send failed:', err.message);
      }

      channel.ack(msg);
    }
  });
};

module.exports = {
  connectQueue,
  sendMailToQueue};
