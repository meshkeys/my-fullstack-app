const { BrevoClient } = require("@getbrevo/brevo");

const sendEmail = async ({ to, subject, html }) => {
  try {
    const client = new BrevoClient({
      apiKey: process.env.BREVO_API_KEY,
    });

    await client.transactionalEmails.sendTransacEmail({
      sender: {
        name: process.env.FROM_NAME || "CAC Filing",
        email: process.env.FROM_EMAIL,
      },
      to: [{ email: to }],
      subject,
      htmlContent: html,
    });

    console.log("Email sent successfully to:", to);
    return true;
  } catch (error) {
    console.error("Email send error:", error.message);
    return false;
  }
};

const sendPasswordResetEmail = async (email, resetUrl, fullName) => {
  const html = `
    <!DOCTYPE html>
    <html>
    <body style="font-family: Arial, sans-serif; background-color: #f0fdf4; margin: 0; padding: 20px;">
      <div style="max-width: 600px; margin: 0 auto; background: white; border-radius: 16px; overflow: hidden;">
        <div style="background-color: #166534; padding: 30px; text-align: center;">
          <h1 style="color: white; margin: 0;">CAC Filing</h1>
          <p style="color: #86efac; margin: 8px 0 0 0;">Business Compliance Made Easy</p>
        </div>
        <div style="padding: 40px 30px;">
          <h2 style="color: #166534;">Password Reset Request</h2>
          <p style="color: #374151;">Hi <strong>${fullName}</strong>,</p>
          <p style="color: #374151;">We received a request to reset your password. Click the button below to reset it.</p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${resetUrl}" style="background-color: #166534; color: white; padding: 14px 32px; border-radius: 8px; text-decoration: none; font-weight: bold;">
              Reset My Password
            </a>
          </div>
          <p style="color: #6b7280; font-size: 14px;">This link expires in 1 hour. If you didn't request this, ignore this email.</p>
        </div>
        <div style="background: #f9fafb; padding: 20px; text-align: center;">
          <p style="color: #9ca3af; font-size: 12px;">© 2024 CAC Filing. Helping Nigerian businesses stay compliant.</p>
        </div>
      </div>
    </body>
    </html>
  `;

  return sendEmail({
    to: email,
    subject: "Reset Your CAC Filing Password",
    html,
  });
};

const sendFilingConfirmationEmail = async (
  email,
  fullName,
  filingType,
  businessName,
) => {
  const html = `
    <!DOCTYPE html>
    <html>
    <body style="font-family: Arial, sans-serif; background-color: #f0fdf4; margin: 0; padding: 20px;">
      <div style="max-width: 600px; margin: 0 auto; background: white; border-radius: 16px; overflow: hidden;">
        <div style="background-color: #166534; padding: 30px; text-align: center;">
          <h1 style="color: white; margin: 0;">CAC Filing</h1>
          <p style="color: #86efac; margin: 8px 0 0 0;">Business Compliance Made Easy</p>
        </div>
        <div style="padding: 40px 30px; text-align: center;">
          <div style="font-size: 48px;">🎉</div>
          <h2 style="color: #166534;">Filing Submitted Successfully!</h2>
          <p style="color: #374151;">Hi <strong>${fullName}</strong>,</p>
          <p style="color: #374151;">Your <strong>${filingType.replace(/_/g, " ")}</strong> filing for <strong>${businessName}</strong> has been submitted successfully.</p>
          <div style="background: #f0fdf4; border-radius: 8px; padding: 16px; margin: 20px 0; text-align: left;">
            <p style="color: #166534; margin: 0;">✅ Filing received and logged</p>
            <p style="color: #166534; margin: 8px 0 0 0;">⏳ Our team will review within 1 hour</p>
            <p style="color: #166634; margin: 8px 0 0 0;">📤 Filing will be submitted to CAC portal</p>
          </div>
          <a href="${process.env.CLIENT_URL}/dashboard" style="background-color: #166534; color: white; padding: 14px 32px; border-radius: 8px; text-decoration: none; font-weight: bold; display: inline-block; margin-top: 16px;">
            View Dashboard
          </a>
        </div>
        <div style="background: #f9fafb; padding: 20px; text-align: center;">
          <p style="color: #9ca3af; font-size: 12px;">© 2024 CAC Filing. Helping Nigerian businesses stay compliant.</p>
        </div>
      </div>
    </body>
    </html>
  `;

  return sendEmail({
    to: email,
    subject: `✅ Filing Submitted - ${filingType.replace(/_/g, " ")} for ${businessName}`,
    html,
  });
};

module.exports = {
  sendEmail,
  sendPasswordResetEmail,
  sendFilingConfirmationEmail,
};
