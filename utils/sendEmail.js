require("dotenv").config();  // MUST be first
const nodemailer = require("nodemailer");
console.log("EMAIL_FROM:", process.env.EMAIL_FROM);
console.log("GMAIL_APP_PASSWORD:", process.env.GMAIL_APP_PASSWORD);

const sendEmail = async ({ to, subject, html }) => {
  if (!to) throw new Error("Recipient email required");

  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.EMAIL_FROM,
      pass: process.env.GMAIL_APP_PASSWORD,
    },
  });

  await transporter.sendMail({
    from: process.env.EMAIL_FROM,
    to,
    subject,
    html,
  });
};

module.exports = sendEmail;
