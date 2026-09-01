const Brevo = require("@getbrevo/brevo");

const sendEmail = async ({ to, subject, html }) => {
  const apiInstance = new Brevo.TransactionalEmailsApi();
  apiInstance.setApiKey(
    Brevo.TransactionalEmailsApiApiKeys.apiKey,
    process.env.BREVO_API_KEY,
  );

  const sendSmtpEmail = new Brevo.SendSmtpEmail();
  sendSmtpEmail.sender = {
    name: process.env.FROM_NAME || "CAC Filing",
    email: process.env.FROM_EMAIL,
  };
  sendSmtpEmail.to = [{ email: to }];
  sendSmtpEmail.subject = subject;
  sendSmtpEmail.htmlContent = html;

  try {
    await apiInstance.sendTransacEmail(sendSmtpEmail);
    console.log("Email sent successfully to:", to);
    return true;
  } catch (error) {
    console.error("Email send error:", error.message);
    return false;
  }
};

// Password Reset Email Template
const sendPasswordResetEmail = async (email, resetUrl, fullName) => {
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
    </head>
    <body style="font-family: Arial, sans-serif; background-color: #f0fdf4; margin: 0; padding: 20px;">
      <div style="max-width: 600px; margin: 0 auto; background: white; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
        
        <!-- Header -->
        <div style="background-color: #166534; padding: 30px; text-align: center;">
          <h1 style="color: white; margin: 0; font-size: 24px;">CAC Filing</h1>
          <p style="color: #86efac; margin: 8px 0 0 0; font-size: 14px;">Business Compliance Made Easy</p>
        </div>

        <!-- Body -->
        <div style="padding: 40px 30px;">
          <h2 style="color: #166534; margin-top: 0;">Password Reset Request</h2>
          <p style="color: #374151; line-height: 1.6;">Hi <strong>${fullName}</strong>,</p>
          <p style="color: #374151; line-height: 1.6;">
            We received a request to reset your password for your CAC Filing account. 
            Click the button below to reset your password.
          </p>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${resetUrl}" 
               style="background-color: #166534; color: white; padding: 14px 32px; 
                      border-radius: 8px; text-decoration: none; font-weight: bold; 
                      font-size: 16px; display: inline-block;">
              Reset My Password
            </a>
          </div>

          <p style="color: #6b7280; font-size: 14px; line-height: 1.6;">
            This link will expire in <strong>1 hour</strong>. If you didn't request a password reset, 
            please ignore this email — your account is safe.
          </p>

          <div style="background: #f0fdf4; border-radius: 8px; padding: 16px; margin-top: 20px;">
            <p style="color: #166534; font-size: 13px; margin: 0;">
              🔒 For security, this link can only be used once and expires in 1 hour.
            </p>
          </div>
        </div>

        <!-- Footer -->
        <div style="background: #f9fafb; padding: 20px 30px; text-align: center; border-top: 1px solid #e5e7eb;">
          <p style="color: #9ca3af; font-size: 12px; margin: 0;">
            © 2024 CAC Filing. Helping Nigerian businesses stay compliant.
          </p>
          <p style="color: #9ca3af; font-size: 12px; margin: 8px 0 0 0;">
            If you need help, contact us at support@cacfiling.com
          </p>
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

// Filing Confirmation Email Template
const sendFilingConfirmationEmail = async (
  email,
  fullName,
  filingType,
  businessName,
) => {
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
    </head>
    <body style="font-family: Arial, sans-serif; background-color: #f0fdf4; margin: 0; padding: 20px;">
      <div style="max-width: 600px; margin: 0 auto; background: white; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
        
        <!-- Header -->
        <div style="background-color: #166534; padding: 30px; text-align: center;">
          <h1 style="color: white; margin: 0; font-size: 24px;">CAC Filing</h1>
          <p style="color: #86efac; margin: 8px 0 0 0; font-size: 14px;">Business Compliance Made Easy</p>
        </div>

        <!-- Body -->
        <div style="padding: 40px 30px;">
          <div style="text-align: center; margin-bottom: 24px;">
            <div style="font-size: 48px;">🎉</div>
          </div>
          <h2 style="color: #166534; margin-top: 0; text-align: center;">Filing Submitted Successfully!</h2>
          <p style="color: #374151; line-height: 1.6;">Hi <strong>${fullName}</strong>,</p>
          <p style="color: #374151; line-height: 1.6;">
            Your CAC filing has been submitted successfully and is now being processed by our team.
          </p>

          <!-- Filing Details -->
          <div style="background: #f0fdf4; border-radius: 8px; padding: 20px; margin: 20px 0;">
            <h3 style="color: #166534; margin-top: 0; font-size: 14px; text-transform: uppercase; letter-spacing: 1px;">
              Filing Details
            </h3>
            <table style="width: 100%; border-collapse: collapse;">
              <tr>
                <td style="padding: 8px 0; color: #6b7280; font-size: 14px;">Filing Type</td>
                <td style="padding: 8px 0; color: #111827; font-weight: bold; font-size: 14px; text-align: right;">
                  ${filingType.replace(/_/g, " ")}
                </td>
              </tr>
              <tr>
                <td style="padding: 8px 0; color: #6b7280; font-size: 14px;">Business</td>
                <td style="padding: 8px 0; color: #111827; font-weight: bold; font-size: 14px; text-align: right;">
                  ${businessName}
                </td>
              </tr>
              <tr>
                <td style="padding: 8px 0; color: #6b7280; font-size: 14px;">Status</td>
                <td style="padding: 8px 0; text-align: right;">
                  <span style="background: #fef3c7; color: #92400e; padding: 4px 10px; border-radius: 20px; font-size: 12px; font-weight: bold;">
                    PENDING REVIEW
                  </span>
                </td>
              </tr>
            </table>
          </div>

          <!-- What happens next -->
          <h3 style="color: #166534;">What happens next?</h3>
          <div style="space-y: 8px;">
            ${[
              "📥 Filing received and logged in our system",
              "👀 Our team will review within 1 hour",
              "📤 Filing submitted to CAC portal",
              "✅ Confirmation sent when completed",
            ]
              .map(
                (step) => `
              <div style="display: flex; align-items: center; padding: 8px 0; color: #374151; font-size: 14px;">
                ${step}
              </div>
            `,
              )
              .join("")}
          </div>

          <div style="text-align: center; margin-top: 30px;">
            <a href="${process.env.CLIENT_URL}/dashboard" 
               style="background-color: #166534; color: white; padding: 14px 32px; 
                      border-radius: 8px; text-decoration: none; font-weight: bold; 
                      font-size: 16px; display: inline-block;">
              View Dashboard
            </a>
          </div>
        </div>

        <!-- Footer -->
        <div style="background: #f9fafb; padding: 20px 30px; text-align: center; border-top: 1px solid #e5e7eb;">
          <p style="color: #9ca3af; font-size: 12px; margin: 0;">
            © 2024 CAC Filing. Helping Nigerian businesses stay compliant.
          </p>
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
