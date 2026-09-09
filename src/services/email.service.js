const { Resend } = require('resend');
const env = require('../config/env');

let resendClient = null;
if (env.RESEND_API_KEY) {
  resendClient = new Resend(env.RESEND_API_KEY);
}

/**
 * Check if an email address is a synthetic test address (RFC 2606)
 */
const isTestEmail = (email) => {
  if (!email) return false;
  const lower = email.toLowerCase().trim();
  return (
    lower.endsWith('@example.com') ||
    lower.endsWith('@test.com') ||
    lower.startsWith('test.') ||
    lower.includes('test.qr') ||
    lower.includes('test.offline')
  );
};

/**
 * Send an OTP verification code via Resend email with development console fallback.
 * @param {string} to - Recipient email address
 * @param {string} otp - 6-digit verification code
 * @param {string} name - Recipient name
 */
const sendLoginOtpEmail = async (to, otp, name = 'Admin') => {
  if (isTestEmail(to)) {
    console.log(`ℹ️ [Email Service] Skipping dispatch for synthetic test email: ${to}`);
    return { success: true, testSimulated: true };
  }
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

/**
 * Send a welcome email to a newly registered Language Nest club member.
 * @param {Object} member - Member document
 * @param {string} whatsappGroupUrl - Configured WhatsApp invite link
 */
const sendMemberWelcomeEmail = async (member, whatsappGroupUrl = '') => {
  const to = member.email;
  if (isTestEmail(to)) {
    console.log(`ℹ️ [Email Service] Skipping member welcome email dispatch for synthetic test address: ${to}`);
    return { success: true, testSimulated: true };
  }
  const name = member.name;
  const memberId = member.memberId || 'GLN-MEMBER';
  const branch = member.department || 'All Departments';
  const year = member.year || '';
  const paymentMode = member.paymentMode === 'QR' || member.paymentMode === 'online' ? 'UPI / QR Payment' : 'Offline / Cash Payment';
  const refInfo = member.utrNumber ? `UTR: ${member.utrNumber}` : member.cashGivenTo ? `Cash Received By: ${member.cashGivenTo}` : 'Recorded';

  const subject = `Welcome to Gayaz Language Nest! 🎉 (ID: ${memberId})`;
  const htmlContent = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #0b0f19; margin: 0; padding: 24px 12px; color: #f1f5f9; }
          .container { max-width: 540px; margin: 0 auto; background: #111827; border-radius: 20px; border: 1px solid #1f2937; overflow: hidden; box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.5); }
          .header { background: linear-gradient(135deg, #3b82f6 0%, #ec4899 100%); padding: 36px 24px; text-align: center; }
          .header h1 { margin: 0; color: #ffffff; font-size: 26px; font-weight: 800; letter-spacing: -0.5px; }
          .header p { margin: 6px 0 0 0; color: rgba(255, 255, 255, 0.9); font-size: 14px; font-weight: 500; }
          .content { padding: 32px 24px; }
          .greeting { font-size: 18px; margin-bottom: 16px; color: #ffffff; font-weight: 600; }
          .id-badge { background: #1e293b; border: 1px solid #3b82f6; border-radius: 12px; padding: 18px; margin: 20px 0; text-align: center; }
          .id-label { font-size: 11px; text-transform: uppercase; letter-spacing: 2px; color: #94a3b8; font-weight: 700; margin-bottom: 4px; }
          .id-number { font-size: 30px; font-weight: 800; letter-spacing: 3px; color: #60a5fa; font-family: monospace; }
          .info-table { width: 100%; border-collapse: collapse; margin: 20px 0; font-size: 13px; }
          .info-table td { padding: 10px 12px; border-bottom: 1px solid #1f2937; color: #94a3b8; }
          .info-table td.val { color: #f3f4f6; font-weight: 600; text-align: right; }
          .cta-box { text-align: center; margin: 28px 0 16px 0; }
          .btn-wa { display: inline-block; background: #22c55e; color: #ffffff; text-decoration: none; padding: 14px 28px; border-radius: 9999px; font-weight: 700; font-size: 15px; box-shadow: 0 4px 14px rgba(34, 197, 94, 0.4); }
          .btn-wa:hover { background: #16a34a; }
          .quote { background: rgba(59, 130, 246, 0.08); border-left: 3px solid #3b82f6; padding: 12px 16px; border-radius: 0 8px 8px 0; margin: 24px 0; font-size: 13px; color: #cbd5e1; font-style: italic; }
          .footer { background: #0b0f19; border-top: 1px solid #1f2937; padding: 20px; text-align: center; font-size: 12px; color: #64748b; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Gayaz Language Nest</h1>
            <p>Official Membership Confirmation</p>
          </div>
          <div class="content">
            <p class="greeting">Welcome to the family, ${name}! 🌟</p>
            <p style="font-size: 14px; line-height: 1.6; color: #94a3b8;">
              Your registration for <strong>Gayaz Language Nest</strong> has been officially received and recorded. We are thrilled to have you step up to the mic and build your public speaking, debating, and leadership journey with us.
            </p>

            <div class="id-badge">
              <div class="id-label">Assigned Member ID</div>
              <div class="id-number">${memberId}</div>
            </div>

            <table class="info-table">
              <tr>
                <td>Full Name</td>
                <td class="val">${name}</td>
              </tr>
              <tr>
                <td>Branch / Department</td>
                <td class="val">${branch}</td>
              </tr>
              <tr>
                <td>Academic Year</td>
                <td class="val">${year}</td>
              </tr>
              <tr>
                <td>Payment Mode</td>
                <td class="val">${paymentMode}</td>
              </tr>
              <tr>
                <td>Reference</td>
                <td class="val">${refInfo}</td>
              </tr>
            </table>

            ${
              whatsappGroupUrl
                ? `
            <div class="cta-box">
              <p style="font-size: 14px; color: #e2e8f0; margin-bottom: 12px; font-weight: 500;">
                Stay updated with weekly practice circles & announcements:
              </p>
              <a href="${whatsappGroupUrl}" target="_blank" class="btn-wa">
                📲 Join WhatsApp Community
              </a>
            </div>
            `
                : ''
            }

            <div class="quote">
              "Every great speaker once started with a single step. We are here to cheer you on every step of the way."
            </div>
          </div>
          <div class="footer">
            &copy; ${new Date().getFullYear()} Gayaz Language Nest. All rights reserved.
          </div>
        </div>
      </body>
    </html>
  `;

  console.log('\n======================================================');
  console.log(`✉️ [WELCOME EMAIL] Sending to: ${to} (${name})`);
  console.log(`🎫 Member ID: ${memberId}`);
  console.log(`🔗 WhatsApp URL: ${whatsappGroupUrl || 'Not configured'}`);
  console.log('======================================================\n');

  if (resendClient) {
    try {
      const response = await resendClient.emails.send({
        from: env.EMAIL_FROM,
        to,
        subject,
        html: htmlContent,
      });
      console.log(`📧 [Resend] Welcome email successfully sent to ${to}. Email ID:`, response.data?.id);
      return response;
    } catch (error) {
      console.error(`❌ [Resend Error] Failed sending welcome email to ${to}:`, error.message);
      return { success: false, error: error.message };
    }
  } else {
    console.log(`ℹ️ [Resend] RESEND_API_KEY is not set. Welcome email simulated and logged to console.`);
    return { success: true, simulated: true };
  }
};

/**
 * Send an onboarding invitation email with initial login credentials to a newly created admin.
 * @param {string} to - Recipient admin email
 * @param {string} rawPassword - Initial/temporary password
 * @param {string} name - Admin full name
 * @param {Array<string>} roles - Assigned admin roles
 */
const sendAdminWelcomeEmail = async (to, rawPassword, name = 'Admin', roles = ['Event Admin']) => {
  if (isTestEmail(to)) {
    console.log(`ℹ️ [Email Service] Skipping admin welcome email dispatch for synthetic test address: ${to}`);
    return { success: true, testSimulated: true };
  }
  const subject = `Welcome to the Language Nest Admin Team! 🛡️ (Your Access Credentials)`;
  const loginUrl = `${env.CORS_ORIGIN || 'http://localhost:5173'}/login`;
  const rolesText = Array.isArray(roles) ? roles.join(', ') : roles;

  const htmlContent = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #0b0f19; margin: 0; padding: 24px 12px; color: #f1f5f9; }
          .container { max-width: 540px; margin: 0 auto; background: #111827; border-radius: 20px; border: 1px solid #1f2937; overflow: hidden; box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.5); }
          .header { background: linear-gradient(135deg, #3b82f6 0%, #ec4899 100%); padding: 36px 24px; text-align: center; }
          .header h1 { margin: 0; color: #ffffff; font-size: 26px; font-weight: 800; letter-spacing: -0.5px; }
          .header p { margin: 6px 0 0 0; color: rgba(255, 255, 255, 0.9); font-size: 14px; font-weight: 500; }
          .content { padding: 32px 24px; }
          .greeting { font-size: 18px; margin-bottom: 16px; color: #ffffff; font-weight: 600; }
          .cred-box { background: #1e293b; border: 1px solid #3b82f6; border-radius: 14px; padding: 20px; margin: 24px 0; }
          .cred-row { display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #334155; font-size: 13px; }
          .cred-row:last-child { border-bottom: none; }
          .cred-label { color: #94a3b8; font-weight: 600; text-transform: uppercase; font-size: 11px; letter-spacing: 1px; }
          .cred-val { color: #60a5fa; font-family: monospace; font-weight: 700; font-size: 14px; }
          .cta-box { text-align: center; margin: 28px 0 16px 0; }
          .btn-login { display: inline-block; background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%); color: #ffffff; text-decoration: none; padding: 14px 32px; border-radius: 9999px; font-weight: 700; font-size: 14px; box-shadow: 0 4px 14px rgba(37, 99, 235, 0.4); }
          .notice-box { background: rgba(245, 158, 11, 0.1); border: 1px solid rgba(245, 158, 11, 0.3); padding: 14px 16px; border-radius: 10px; margin: 20px 0; font-size: 12px; color: #fbbf24; line-height: 1.5; }
          .footer { background: #0b0f19; border-top: 1px solid #1f2937; padding: 20px; text-align: center; font-size: 12px; color: #64748b; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Language Nest</h1>
            <p>Admin Portal Access Granted</p>
          </div>
          <div class="content">
            <p class="greeting">Hello ${name},</p>
            <p style="font-size: 14px; line-height: 1.6; color: #94a3b8;">
              You have been granted administrator access to the <strong>Language Nest Management Platform</strong> with the following assigned role(s): <strong style="color: #f3f4f6;">${rolesText}</strong>.
            </p>

            <div class="cred-box">
              <div class="cred-row">
                <span class="cred-label">Login Email</span>
                <span class="cred-val">${to}</span>
              </div>
              <div class="cred-row">
                <span class="cred-label">Initial Password</span>
                <span class="cred-val">${rawPassword}</span>
              </div>
              <div class="cred-row">
                <span class="cred-label">Assigned Roles</span>
                <span class="cred-val" style="color: #ec4899;">${rolesText}</span>
              </div>
            </div>

            <div class="cta-box">
              <a href="${loginUrl}" target="_blank" class="btn-login">
                Sign In to Admin Portal &rarr;
              </a>
            </div>

            <div class="notice-box">
              <strong>🔒 Security Notice:</strong> Upon your first sign-in, you will receive a 6-digit 2FA verification code on this email. For security, please navigate to your <strong>Profile</strong> page after logging in to update your password.
            </div>
          </div>
          <div class="footer">
            &copy; ${new Date().getFullYear()} Language Nest Platform. All rights reserved.
          </div>
        </div>
      </body>
    </html>
  `;

  console.log('\n======================================================');
  console.log(`🛡️ [ADMIN ONBOARDING EMAIL] Sending credentials to: ${to} (${name})`);
  console.log(`🔑 Login Email: ${to}`);
  console.log(`🔑 Temporary Password: [ ${rawPassword} ]`);
  console.log(`🎭 Roles: ${rolesText}`);
  console.log('======================================================\n');

  if (resendClient) {
    try {
      const response = await resendClient.emails.send({
        from: env.EMAIL_FROM,
        to,
        subject,
        html: htmlContent,
      });
      console.log(`📧 [Resend] Admin credentials email successfully sent to ${to}. Email ID:`, response.data?.id);
      return response;
    } catch (error) {
      console.error(`❌ [Resend Error] Failed sending admin credentials email to ${to}:`, error.message);
      return { success: false, error: error.message };
    }
  } else {
    console.log(`ℹ️ [Resend] RESEND_API_KEY is not set. Admin credentials email simulated and logged to console.`);
    return { success: true, simulated: true };
  }
};

module.exports = {
  sendLoginOtpEmail,
  sendMemberWelcomeEmail,
  sendAdminWelcomeEmail,
};

