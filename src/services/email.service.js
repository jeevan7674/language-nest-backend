const { Resend } = require('resend');
const env = require('../config/env');

let resendClient = null;
if (env.RESEND_API_KEY) {
  resendClient = new Resend(env.RESEND_API_KEY);
}

/**
 * Send an OTP verification code via Resend email with development console fallback.
 * @param {string} to - Recipient email address
 * @param {string} otp - 6-digit verification code
 * @param {string} name - Recipient name
 */
const sendLoginOtpEmail = async (to, otp, name = 'Admin') => {
  const subject = `Your Language Nest Verification Code: ${otp}`;
  const htmlContent = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f8fafc; margin: 0; padding: 20px; color: #1e293b; }
          .container { max-width: 520px; margin: 0 auto; background: #ffffff; border-radius: 16px; border: 1px solid #e2e8f0; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05); }
          .header { background: linear-gradient(135deg, #3b82f6 0%, #ec4899 100%); padding: 32px 24px; text-align: center; }
          .header h1 { margin: 0; color: #ffffff; font-size: 24px; font-weight: 700; letter-spacing: -0.5px; }
          .content { padding: 32px 24px; text-align: center; }
          .greeting { font-size: 16px; margin-bottom: 16px; color: #334155; }
          .otp-box { background: #f1f5f9; border: 2px dashed #cbd5e1; border-radius: 12px; padding: 20px; margin: 24px 0; display: inline-block; width: 80%; }
          .otp-code { font-size: 36px; font-weight: 800; letter-spacing: 8px; color: #2563eb; margin: 0; font-family: monospace; }
          .notice { font-size: 13px; color: #64748b; line-height: 1.5; margin-top: 16px; }
          .footer { background: #f8fafc; border-top: 1px solid #e2e8f0; padding: 16px; text-align: center; font-size: 12px; color: #94a3b8; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Language Nest</h1>
          </div>
          <div class="content">
            <p class="greeting">Hello <strong>${name}</strong>,</p>
            <p style="font-size: 14px; color: #475569;">Use the verification code below to sign in to your Language Nest Administrative dashboard.</p>
            
            <div class="otp-box">
              <div class="otp-code">${otp}</div>
            </div>
            
            <p class="notice">This code is valid for <strong>10 minutes</strong>. If you did not request this login code, please secure your account immediately.</p>
          </div>
          <div class="footer">
            &copy; ${new Date().getFullYear()} Language Nest Platform. All rights reserved.
          </div>
        </div>
      </body>
    </html>
  `;

  // Always log in development for rapid testing & safety
  console.log('\n======================================================');
  console.log(`🔐 [EMAIL OTP SERVICE] Sending OTP to: ${to}`);
  console.log(`🔑 Verification Code: [ ${otp} ]`);
  console.log(`⏰ Expiry: 10 minutes`);
  console.log('======================================================\n');

  if (resendClient) {
    try {
      const response = await resendClient.emails.send({
        from: env.EMAIL_FROM,
        to,
        subject,
        html: htmlContent,
      });
      console.log(`📧 [Resend] Email successfully dispatched to ${to}. Email ID:`, response.data?.id);
      return response;
    } catch (error) {
      console.error(`❌ [Resend Error] Failed sending to ${to}:`, error.message);
      // Don't crash the server if Resend key is sandbox or unverified domain in dev
      return { success: false, error: error.message };
    }
  } else {
    console.log(`ℹ️ [Resend] RESEND_API_KEY is not set. OTP logged to console above for dev testing.`);
    return { success: true, simulated: true };
  }
};

module.exports = {
  sendLoginOtpEmail,
};
