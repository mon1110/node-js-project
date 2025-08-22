const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 465,           // use 465 for SSL, 587 for TLS
  secure: true,        // true for 465, false for 587
  auth: {
    user: process.env.EMAIL_USER, // Gmail address
    pass: process.env.EMAIL_PASS, // App password (16 char, not normal Gmail pwd)
  },
  tls: {
    rejectUnauthorized: false, // avoid self-signed cert errors
  },
});

const sendEmail = async (to, subject, html) => {
  try {
    const mailOptions = {
      from: `"My App" <${process.env.EMAIL_USER}>`,
      to,
      subject,
      html,
    };

    let info = await transporter.sendMail(mailOptions);
    console.log("Message sent: %s", info.messageId);
    return info;
  } catch (err) {
    console.error("Mail send failed:", err.message);
    throw err;
  }
};

module.exports = { sendEmail };
