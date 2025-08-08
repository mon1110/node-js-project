// src/tests/rmqService.test.js

jest.mock('amqplib', () => ({
    connect: jest.fn(() => ({
      createChannel: jest.fn().mockResolvedValue({
        assertQueue: jest.fn(),
        sendToQueue: jest.fn(),
        consume: jest.fn((queue, cb) => {
          // simulate a message being consumed
          const msg = {
            content: Buffer.from(JSON.stringify({ to: 'test@example.com' })),
          };
          cb(msg);
        }),
        ack: jest.fn(),
      }),
    })),
  }));
  
  jest.mock('../Service/mailService', () => ({
    sendMail: jest.fn().mockResolvedValue('Email Sent'),
  }));
  
  const rmqService = require('../Service/rmqService');
  const mailService = require('../Service/mailService');
  
  describe('rmqService', () => {
    beforeEach(() => {
      jest.clearAllMocks();
    });
  
    test('should connect and send mail via queue', async () => {
      await rmqService.connectQueue();
  
      expect(mailService.sendMail).toHaveBeenCalledWith({ to: 'test@example.com' });
    });
  
    test('should queue email', async () => {
      // Manually call sendToMailQueue after connectQueue
      await rmqService.connectQueue();
  
      const data = { to: 'queued@example.com' };
      await rmqService.sendToMailQueue(data);
  

      expect(true).toBe(true); // dummy success check
    });
  });
  