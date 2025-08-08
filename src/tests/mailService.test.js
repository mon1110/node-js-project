// src/tests/mailService.test.js
jest.mock('nodemailer');
jest.mock('../utils/envHelper', () => ({
  getEnv: jest.fn(),
}));

const nodemailer = require('nodemailer');
const { getEnv } = require('../utils/envHelper');

// Import both sendMail and getTemplate from mailService
const mailService = require('../Service/mailService');

describe('mailService', () => {
  let sendMailMock;

  beforeAll(() => {
    sendMailMock = jest.fn().mockResolvedValue(true);
    nodemailer.createTransport.mockReturnValue({ sendMail: sendMailMock });
  });

  beforeEach(() => {
    jest.clearAllMocks();
    getEnv.mockImplementation((key) => {
      if (key === 'EMAIL_USER') return 'testuser@gmail.com';
      if (key === 'EMAIL_PASS') return 'testpass';
      return '';
    });
  });

  it('should send an email with correct parameters', async () => {
    const mailOptions = {
      to: 'recipient@example.com',
      name: 'John Doe',
      subject: 'Welcome!',
      html: '<p>Custom HTML</p>'
    };

    await mailService.sendMail(mailOptions);

    expect(nodemailer.createTransport).toHaveBeenCalledWith({
      service: 'gmail',
      auth: {
        user: 'testuser@gmail.com',
        pass: 'testpass'
      }
    });

    expect(sendMailMock).toHaveBeenCalledWith({
      from: `"TechRover Team" <testuser@gmail.com>`,
      to: mailOptions.to,
      subject: mailOptions.subject,
      html: mailOptions.html,  // because html was passed, not getTemplate
    });
  });

  it('should use default template if html is not provided', async () => {
    const name = 'Jane';

    await mailService.sendMail({ to: 'a@b.com', name });

    expect(sendMailMock).toHaveBeenCalledWith(
      expect.objectContaining({
        html: mailService.getTemplate(name),
        subject: 'No Subject',
      })
    );
  });
});
