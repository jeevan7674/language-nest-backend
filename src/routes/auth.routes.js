const express = require('express');
const router = express.Router();
const authController = require('../controllers/auth.controller');
const { validate } = require('../middleware/validation.middleware');
const {
  validateLogin,
  validateVerifyOtp,
  validateResendOtp,
  validateUpdateProfile,
  validateChangePassword,
} = require('../validators/auth.validator');
const { authenticate } = require('../middleware/auth.middleware');

router.post('/login', validate(validateLogin), authController.login);
router.post('/verify-otp', validate(validateVerifyOtp), authController.verifyOtp);
router.post('/resend-otp', validate(validateResendOtp), authController.resendOtp);
router.post('/logout', authController.logout);
router.get('/me', authenticate, authController.getMe);
router.put('/profile', authenticate, validate(validateUpdateProfile), authController.updateProfile);
router.put('/change-password', authenticate, validate(validateChangePassword), authController.changePassword);

module.exports = router;
