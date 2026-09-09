const Admin = require('../models/Admin');
const { generateToken } = require('../utils/token');
const { sendLoginOtpEmail } = require('./email.service');

/**
 * Generate a cryptographically secure 6-digit OTP
 */
const generateOtp = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

/**
 * Login admin user - Step 1: Validate credentials and dispatch Email OTP
 * @param {string} email 
 * @param {string} password 
 * @returns {Promise<{ requireOtp: boolean, email: string, message: string }>}
 */
const login = async (email, password) => {
  if (!email || !password) {
    const error = new Error('Both email and password are required.');
    error.statusCode = 400;
    throw error;
  }

  const admin = await Admin.findOne({ email: email.toLowerCase().trim() }).select('+password');
  if (!admin) {
    const error = new Error('Invalid email or password');
    error.statusCode = 401;
    throw error;
  }

  const isMatch = await admin.comparePassword(password);
  if (!isMatch) {
    const error = new Error('Invalid email or password');
    error.statusCode = 401;
    throw error;
  }

  if (admin.status !== 'active') {
    const error = new Error('Your account is deactivated. Please contact a Super Administrator.');
    error.statusCode = 403;
    throw error;
  }

  // Generate 6-digit OTP with 10-minute expiration & reset attempt counter
  const otp = generateOtp();
  admin.loginOtp = otp;
  admin.loginOtpExpiresAt = new Date(Date.now() + 10 * 60 * 1000);
  admin.loginOtpAttempts = 0;
  await admin.save();

  // Send OTP email
  await sendLoginOtpEmail(admin.email, otp, admin.name);

  return {
    requireOtp: true,
    email: admin.email,
    message: `A 6-digit verification code has been sent to ${admin.email}.`,
  };
};

/**
 * Verify OTP - Step 2: Validate OTP and issue JWT session token
 * @param {string} email 
 * @param {string} otp 
 * @returns {Promise<{ admin: Object, token: string }>}
 */
const verifyOtp = async (email, otp) => {
  if (!email || !otp) {
    const error = new Error('Email and 6-digit verification code are required');
    error.statusCode = 400;
    throw error;
  }

  const cleanOtp = String(otp).trim();
  if (cleanOtp.length !== 6 || !/^\d{6}$/.test(cleanOtp)) {
    const error = new Error('Verification code must be exactly 6 numeric digits');
    error.statusCode = 400;
    throw error;
  }

  const admin = await Admin.findOne({ email: email.toLowerCase().trim() })
    .select('+loginOtp +loginOtpExpiresAt +loginOtpAttempts');

  if (!admin) {
    const error = new Error('Account not found');
    error.statusCode = 404;
    throw error;
  }

  if (admin.status !== 'active') {
    const error = new Error('Account is deactivated. Access denied.');
    error.statusCode = 403;
    throw error;
  }

  if (!admin.loginOtp || !admin.loginOtpExpiresAt) {
    const error = new Error('No verification code active. Please sign in with your password again.');
    error.statusCode = 400;
    throw error;
  }

  if (new Date() > admin.loginOtpExpiresAt) {
    admin.loginOtp = null;
    admin.loginOtpExpiresAt = null;
    admin.loginOtpAttempts = 0;
    await admin.save();
    const error = new Error('Verification code has expired. Please request a new code.');
    error.statusCode = 400;
    throw error;
  }

  if (admin.loginOtp !== cleanOtp) {
    admin.loginOtpAttempts = (admin.loginOtpAttempts || 0) + 1;
    if (admin.loginOtpAttempts >= 5) {
      admin.loginOtp = null;
      admin.loginOtpExpiresAt = null;
      admin.loginOtpAttempts = 0;
      await admin.save();
      const error = new Error('Too many invalid attempts. Your verification code has been invalidated. Please sign in again.');
      error.statusCode = 400;
      throw error;
    }
    await admin.save();
    const remaining = 5 - admin.loginOtpAttempts;
    const error = new Error(`Invalid verification code. (${remaining} attempt${remaining === 1 ? '' : 's'} remaining)`);
    error.statusCode = 400;
    throw error;
  }

  // Clear OTP on successful verification
  admin.loginOtp = null;
  admin.loginOtpExpiresAt = null;
  admin.loginOtpAttempts = 0;
  admin.lastLogin = new Date();
  admin.lastActive = new Date();
  await admin.save();

  const token = generateToken({
    id: admin._id,
    email: admin.email,
    roles: admin.roles,
  });

  return {
    admin: admin.toJSON(),
    token,
  };
};

/**
 * Resend a new OTP to the admin's email
 * @param {string} email 
 * @returns {Promise<{ success: boolean, message: string }>}
 */
const resendOtp = async (email) => {
  if (!email) {
    const error = new Error('Email is required');
    error.statusCode = 400;
    throw error;
  }

  const admin = await Admin.findOne({ email: email.toLowerCase().trim() });
  if (!admin) {
    const error = new Error('Account not found');
    error.statusCode = 404;
    throw error;
  }

  const otp = generateOtp();
  admin.loginOtp = otp;
  admin.loginOtpExpiresAt = new Date(Date.now() + 10 * 60 * 1000);
  await admin.save();

  await sendLoginOtpEmail(admin.email, otp, admin.name);

  return {
    success: true,
    message: `A new 6-digit verification code has been sent to ${admin.email}.`,
  };
};

/**
 * Get current admin profile
 * @param {string} id 
 * @returns {Promise<Object>}
 */
const getMe = async (id) => {
  const admin = await Admin.findById(id);
  if (!admin) {
    const error = new Error('User not found');
    error.statusCode = 404;
    throw error;
  }
  return admin;
};

/**
 * Update current admin profile details
 * @param {string} id 
 * @param {Object} updateData 
 * @returns {Promise<Object>}
 */
const { deleteFromCloudinary } = require('./upload.service');

const updateProfile = async (id, updateData) => {
  const admin = await Admin.findById(id);
  if (!admin) {
    const error = new Error('Admin not found');
    error.statusCode = 404;
    throw error;
  }

  const newAvatar = updateData.avatar !== undefined ? updateData.avatar : updateData.image;
  const currentAvatar = admin.avatar || admin.image;
  if (newAvatar !== undefined && currentAvatar && currentAvatar !== newAvatar) {
    deleteFromCloudinary(currentAvatar).catch(() => {});
  }

  if (updateData.name) admin.name = updateData.name.trim();
  if (updateData.phone !== undefined) admin.phone = updateData.phone ? updateData.phone.trim() : '';
  if (updateData.avatar !== undefined) {
    admin.image = updateData.avatar ? updateData.avatar.trim() : '';
    admin.avatar = updateData.avatar ? updateData.avatar.trim() : '';
  }
  if (updateData.image !== undefined) {
    admin.image = updateData.image ? updateData.image.trim() : admin.image;
    admin.avatar = updateData.image ? updateData.image.trim() : admin.avatar;
  }
  if (updateData.bio !== undefined) admin.bio = updateData.bio ? updateData.bio.trim() : '';
  
  if (updateData.email && updateData.email.toLowerCase().trim() !== admin.email) {
    const existing = await Admin.findOne({ email: updateData.email.toLowerCase().trim(), _id: { $ne: id } });
    if (existing) {
      const error = new Error('Email address is already in use by another admin');
      error.statusCode = 400;
      throw error;
    }
    admin.email = updateData.email.toLowerCase().trim();
  }

  admin.lastActive = new Date();
  await admin.save();
  return admin;
};

/**
 * Change admin password
 * @param {string} id 
 * @param {string} currentPassword 
 * @param {string} newPassword 
 * @returns {Promise<{ message: string }>}
 */
const changePassword = async (id, currentPassword, newPassword) => {
  const admin = await Admin.findById(id).select('+password');
  if (!admin) {
    const error = new Error('Admin not found');
    error.statusCode = 404;
    throw error;
  }

  const isMatch = await admin.comparePassword(currentPassword);
  if (!isMatch) {
    const error = new Error('Incorrect current password');
    error.statusCode = 400;
    throw error;
  }

  admin.password = newPassword;
  admin.lastActive = new Date();
  await admin.save();

  return { message: 'Password changed successfully' };
};

module.exports = {
  login,
  verifyOtp,
  resendOtp,
  getMe,
  updateProfile,
  changePassword,
};
