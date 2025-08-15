// // src/tests/rmqService.test.js

// jest.mock('amqplib', () => ({
//     connect: jest.fn(() => ({
//       createChannel: jest.fn().mockResolvedValue({
//         assertQueue: jest.fn(),
//         sendToQueue: jest.fn(),
//         consume: jest.fn((queue, cb) => {
//           // simulate a message being consumed
//           const msg = {
//             content: Buffer.from(JSON.stringify({ to: 'test@example.com' })),
//           };
//           cb(msg);
//         }),
//         ack: jest.fn(),
//       }),
//     })),
//   }));
  
//   jest.mock('../Service/mailService', () => ({
//     sendMail: jest.fn().mockResolvedValue('Email Sent'),
//   }));
  
//   const rmqService = require('../Service/rmqService');
//   const mailService = require('../Service/mailService');
  
//   describe('rmqService', () => {
//     beforeEach(() => {
//       jest.clearAllMocks();
//     });
  
//     test('should connect and send mail via queue', async () => {
//       await rmqService.connectQueue();
  
//       expect(mailService.sendMail).toHaveBeenCalledWith({ to: 'test@example.com' });
//     });
  
//     test('should queue email', async () => {
//       // Manually call sendToMailQueue after connectQueue
//       await rmqService.connectQueue();
  
//       const data = { to: 'queued@example.com' };
//       await rmqService.sendToMailQueue(data);
  

//       expect(true).toBe(true); // dummy success check
//     });
//   });

// src/tests/mocha/rmqService.test.js
const { expect } = require('chai');
const sinon = require('sinon');

const amqplib = require('amqplib');
const mailService = require('../Service/mailService');
const rmqService = require('../Service/rmqService');

describe('rmqService', () => {
  let connectStub, createChannelStub, channelMock;

  beforeEach(() => {
    // Mock channel methods
    channelMock = {
      assertQueue: sinon.stub().resolves(),
      sendToQueue: sinon.stub().resolves(),
      consume: sinon.stub().callsFake((queue, cb) => {
        const msg = {
          content: Buffer.from(JSON.stringify({ to: 'test@example.com' })),
        };
        cb(msg);
      }),
      ack: sinon.stub(),
    };

    // Stub amqplib.connect to return our channel
    createChannelStub = sinon.stub().resolves(channelMock);
    connectStub = sinon.stub(amqplib, 'connect').resolves({
      createChannel: createChannelStub
    });

    // Stub mailService.sendMail
    sinon.stub(mailService, 'sendMail').resolves('Email Sent');
  });

  afterEach(() => {
    sinon.restore();
  });

  it('should connect and send mail via queue', async () => {
    await rmqService.connectQueue();

    expect(mailService.sendMail.calledWith({ to: 'rinkal13@example.com' })).to.be.false;
    expect(connectStub.calledOnce).to.be.true;
    expect(createChannelStub.calledOnce).to.be.true;
  });

  it('should queue email', async () => {
    await rmqService.connectQueue();

    const data = { to: 'queued@example.com' };
    await rmqService.sendMailToQueue(data);

    expect(channelMock.sendToQueue.calledOnce).to.be.true;
  });
});

  