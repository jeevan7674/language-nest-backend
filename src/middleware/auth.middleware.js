const { verifyToken } = require('../utils/token');
const Admin = require('../models/Admin');

/**
 * Authentication middleware
 * Protects routes by validating JWT from Cookie or Authorization Bearer header
 */
const authenticate = async (req, res, next) => {
  try {
    let token = null;

    // 1. Check cookies
    if (req.cookies && req.cookies.token) {
      token = req.cookies.token;
    }
    // 2. Check Authorization Header (Bearer token)
    else if (req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required. Please log in.',
      });
    }

    // Verify token
    let decoded;
    try {
      decoded = verifyToken(token);
    } catch (err) {
      return res.status(401).json({
        success: false,
        message: 'Invalid or expired authentication token. Please log in again.',
      });
    }

    // Find admin user
    const admin = await Admin.findById(decoded.id);
    if (!admin) {
      return res.status(401).json({
        success: false,
        message: 'User belonging to this token no longer exists.',
      });
    }

    if (admin.status !== 'active') {
      return res.status(403).json({
        success: false,
        message: 'Your account is deactivated. Please contact an administrator.',
      });
    }

    // Attach admin to request object
    req.admin = admin;
    next();
  } catch (error) {
    next(error);
  }
};

module.exports = {
  authenticate,
};
