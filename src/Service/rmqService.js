// services/rmqService.js
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
    console.log(' RabbitMQ connected & channel initialized');
    consumeMailQueue(); // Start listening after connection
  } catch (err) {
    console.error('RabbitMQ connection failed:', err.message);
    setTimeout(connectQueue, 5000);
  }
};

// Producer: Push email payload to queue
const sendToMailQueue  = async (data) => {
  if (!channel) {
    console.warn(' Channel not ready, retrying in 2s...');
    setTimeout(() => sendToMailQueue(data), 2000);
    return;
  }

  channel.sendToQueue(QUEUE, Buffer.from(JSON.stringify(data)), { persistent: true });
  console.log(' Mail queued:', data.to);
};

// Consumer: Process email queue and send email
const consumeMailQueue = () => {
  if (!channel) return;
//comment this code at that time rmq show the data otherwise don't display any data 
//   channel.consume(QUEUE, async (msg) => {
//     if (msg !== null) {
//       const payload = JSON.parse(msg.content.toString());
//       console.log(' Consumed message:', payload.to);

//       try {
//         await sendMail(payload);
//         console.log(' Mail sent to:', payload.to);
//       } catch (err) {
//         console.error(' Mail send failed:', err.message);
//       }

//       channel.ack(msg);
//     }
//   });
};

module.exports = {
  connectQueue,
  sendToMailQueue 
};
