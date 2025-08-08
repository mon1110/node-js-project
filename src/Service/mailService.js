// mailService.js
const nodemailer = require('nodemailer');
const { getEnv } = require('../utils/envHelper');

const getTemplate = (name) => {
  return `<h1>Hello ${name || 'User'},</h1><p>Welcome to our platform!</p>`;
};

const sendMail = async ({ to, name, subject, html }) => {
  const emailUser = getEnv('EMAIL_USER'); 
  const mailSubject = subject || 'No Subject'; 

  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: emailUser,
      pass: getEnv('EMAIL_PASS')
    }
  });

  await transporter.sendMail({
    from: `"TechRover Team" <${emailUser}>`,
    to,
    subject: mailSubject,
    html: html || getTemplate(name),
  });
};

module.exports = { sendMail, getTemplate };
