const nodemailer = require('nodemailer');

// Set up the transporter with Brevo SMTP credentials
// This relies on environment variables set in Render
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp-relay.brevo.com',
  port: parseInt(process.env.SMTP_PORT || '587', 10),
  secure: parseInt(process.env.SMTP_PORT, 10) === 465, // true for port 465, false for other ports (like 587)
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

const sendResetEmail = async (toEmail, resetToken) => {
  // Determine if it runs locally or deployed on Render
  const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:5173';
  const resetLink = `${FRONTEND_URL}/reset-password/${resetToken}`;

  const mailOptions = {
    from: process.env.SMTP_FROM || '"Bible Banter" <noreply@biblebanter.com>',
    to: toEmail,
    subject: "Reset your Bible Banter password",
    text: `Hello,

We received a request to reset your Bible Banter password.
Please click the link below to set a new password:

${resetLink}

If you didn't request this, you can safely ignore this email.

Blessings,
The Bible Banter Team`,
    html: `
      <h2>Hello,</h2>
      <p>We received a request to reset your Bible Banter password.</p>
      <p>Please click the button below to set a new one:</p>
      <div style="margin: 20px 0;">
        <a href="${resetLink}" style="background-color: #fbbf24; color: #111; padding: 12px 24px; text-decoration: none; border-radius: 8px; font-weight: bold; font-family: sans-serif;">Reset Password</a>
      </div>
      <p>Or copy and paste this link into your browser:<br/> <a href="${resetLink}">${resetLink}</a></p>
      <p>If you didn't request this, you can safely ignore this email.</p>
      <br />
      <p>Blessings,<br />The Bible Banter Team</p>
    `
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log("Email sent: %s", info.messageId);
    return true;
  } catch (error) {
    console.error("Error sending email:", error);
    return false;
  }
};

module.exports = {
  sendResetEmail
};
