const authService = require('../services/auth.service');
const { setAuthCookie, clearAuthCookie } = require('../utils/token');

const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const result = await authService.login(email, password);

    res.status(200).json({
      success: true,
      message: result.message,
      data: {
        requireOtp: result.requireOtp,
        email: result.email,
      },
    });
  } catch (error) {
    next(error);
  }
};

const verifyOtp = async (req, res, next) => {
  try {
    const { email, otp } = req.body;
    const { admin, token } = await authService.verifyOtp(email, otp);

    // Set HTTP-only cookie
    setAuthCookie(res, token);

    res.status(200).json({
      success: true,
      message: 'Authentication successful',
      data: {
        admin,
        token,
      },
    });
  } catch (error) {
    next(error);
  }
};

const resendOtp = async (req, res, next) => {
  try {
    const { email } = req.body;
    const result = await authService.resendOtp(email);

    res.status(200).json({
      success: true,
      message: result.message,
    });
  } catch (error) {
    next(error);
  }
};

const logout = async (req, res, next) => {
  try {
    clearAuthCookie(res);
    res.status(200).json({
      success: true,
      message: 'Logged out successfully',
    });
  } catch (error) {
    next(error);
  }
};

const getMe = async (req, res, next) => {
  try {
    const admin = await authService.getMe(req.admin._id);
    res.status(200).json({
      success: true,
      message: 'Current admin fetched successfully',
      data: {
        admin,
      },
    });
  } catch (error) {
    next(error);
  }
};

const updateProfile = async (req, res, next) => {
  try {
    const admin = await authService.updateProfile(req.admin._id, req.body);
    res.status(200).json({
      success: true,
      message: 'Profile updated successfully',
      data: {
        admin,
      },
    });
  } catch (error) {
    next(error);
  }
};

const changePassword = async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const result = await authService.changePassword(req.admin._id, currentPassword, newPassword);
    res.status(200).json({
      success: true,
      message: result.message,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  login,
  verifyOtp,
  resendOtp,
  logout,
  getMe,
  updateProfile,
  changePassword,
};
