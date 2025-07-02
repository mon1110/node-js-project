const nodemailer = require('nodemailer');
const { getEnv } = require('../utils/envHelper');

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

   //const finalHtml = html || `<h1>Hello ${name || 'User'},</h1><p>Welcome to our platform!</p>`;

  await transporter.sendMail({
    from: `"TechRover Team" <${emailUser}>`,
    to,
    subject: mailSubject,
    html: getTemplate(name)
  });
};

module.exports = { sendMail };
