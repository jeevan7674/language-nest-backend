const jwt = require('jsonwebtoken');
const env = require('../config/env');

/**
 * Generate a JWT token for an admin
 * @param {Object} payload - Data to encode (e.g. { id, email, roles })
 * @param {string} [expiresIn] - Optional expiration string
 * @returns {string} - JWT string
 */
const generateToken = (payload, expiresIn = env.JWT_EXPIRES_IN) => {
  return jwt.sign(payload, env.JWT_SECRET, { expiresIn });
};

/**
 * Verify a JWT token
 * @param {string} token - JWT string
 * @returns {Object} - Decoded payload
 */
const verifyToken = (token) => {
  return jwt.verify(token, env.JWT_SECRET);
};

/**
 * Set HTTP-only auth cookie on response
 * @param {Object} res - Express response object
 * @param {string} token - JWT token string
 */
const setAuthCookie = (res, token) => {
  const cookieOptions = {
    httpOnly: true,
    secure: env.COOKIE_SECURE,
    sameSite: env.COOKIE_SAME_SITE,
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days in ms
  };
  res.cookie('token', token, cookieOptions);
};

/**
 * Clear auth cookie from response
 * @param {Object} res - Express response object
 */
const clearAuthCookie = (res) => {
  const cookieOptions = {
    httpOnly: true,
    secure: env.COOKIE_SECURE,
    sameSite: env.COOKIE_SAME_SITE,
  };
  res.clearCookie('token', cookieOptions);
};

module.exports = {
  generateToken,
  verifyToken,
  setAuthCookie,
  clearAuthCookie,
};
