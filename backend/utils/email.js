const sgMail = require("@sendgrid/mail");

// Set SendGrid API key
sgMail.setApiKey(process.env.SENDGRID_API_KEY);

// Function to send email (OTP)
const sendEmail = async (to, subject, text, html) => {
  console.log("📤 Attempting to send email via SendGrid...");
  console.log("   To:", to);
  console.log("   Subject:", subject);

  const msg = {
    to,
    from: {
      email: process.env.SENDGRID_SENDER_EMAIL,
      name: process.env.SENDGRID_SENDER_NAME,
    },
    subject,
    text,
    html,
  };

  try {
    await sgMail.send(msg);
    console.log("✅ Email sent successfully via SendGrid");
  } catch (error) {
    console.error("❌ SendGrid error:", error.response?.body || error);
    throw error;
  }
};

module.exports = { sendEmail };
