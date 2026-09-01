const Brevo = require("@getbrevo/brevo");

const sendEmail = async ({ to, subject, html }) => {
  try {
    const apiInstance = new Brevo.TransactionalEmailsApi();

    apiInstance.authentications["apiKey"].apiKey = process.env.BREVO_API_KEY;

    const sendSmtpEmail = {
      sender: {
        name: process.env.FROM_NAME || "CAC Filing",
        email: process.env.FROM_EMAIL,
      },
      to: [{ email: to }],
      subject,
      htmlContent: html,
    };

    await apiInstance.sendTransacEmail(sendSmtpEmail);
    console.log("Email sent successfully to:", to);
    return true;
  } catch (error) {
    console.error("Email send error:", error.message);
    return false;
  }
};
