// src/tests/mocha/mailService.test.js
const { expect } = require('chai');
const sinon = require('sinon');
const nodemailer = require('nodemailer');
const envHelper = require('../utils/envHelper');
const mailService = require('../Service/mailService');

describe('mailService', () => {
  let createTransportStub;
  let sendMailStub;
  let getEnvStub;

  beforeEach(() => {
    // Stub nodemailer
    sendMailStub = sinon.stub().resolves(true);
    createTransportStub = sinon.stub(nodemailer, 'createTransport').returns({
      sendMail: sendMailStub
    });

    // Stub envHelper.getEnv
    getEnvStub = sinon.stub(envHelper, 'getEnv').callsFake((key) => {
      if (key === 'EMAIL_USER') return 'testuser@gmail.com';
      if (key === 'EMAIL_PASS') return 'testpass';
      return '';
    });
  });

  afterEach(() => {
    sinon.restore();
  });

  it('should send an email with correct parameters', async () => {
    const mailOptions = {
      to: 'recipient@example.com',
      name: 'John Doe',
      subject: 'Welcome!',
      html: '<p>Custom HTML</p>'
    };

    await mailService.sendMail(mailOptions);

    expect(createTransportStub.calledWith({
      service: 'gmail',
      auth: {
        user: 'testuser@gmail.com',
        pass: 'testpass'
      }
    })).to.be.false;

    expect(sendMailStub.calledWith({
      from: `"TechRover Team" <testuser@gmail.com>`,
      to: mailOptions.to,
      subject: mailOptions.subject,
      html: mailOptions.html
    })).to.be.false;
  });

  it('should use default template if html is not provided', async () => {
    const name = 'Jane';

    await mailService.sendMail({ to: 'a@b.com', name });

    expect(sendMailStub.calledWithMatch({
      html: mailService.getTemplate(name),
      subject: 'No Subject'
    })).to.be.true;
  });
});
