const validateLogin = (body) => {
  const errors = [];
  if (!body.email || !body.email.trim()) {
    errors.push({ field: 'email', message: 'Email is required' });
  } else if (!/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/.test(body.email.trim())) {
    errors.push({ field: 'email', message: 'Please provide a valid email address' });
  }

  if (!body.password || body.password.length < 6) {
    errors.push({ field: 'password', message: 'Password must be at least 6 characters' });
  }

  return errors;
};

const validateVerifyOtp = (body) => {
  const errors = [];
  if (!body.email || !body.email.trim()) {
    errors.push({ field: 'email', message: 'Email is required' });
  }
  if (!body.otp || !body.otp.trim() || body.otp.trim().length !== 6) {
    errors.push({ field: 'otp', message: 'A 6-digit verification code is required' });
  }
  return errors;
};

const validateResendOtp = (body) => {
  const errors = [];
  if (!body.email || !body.email.trim()) {
    errors.push({ field: 'email', message: 'Email is required' });
  }
  return errors;
};

const validateUpdateProfile = (body) => {
  const errors = [];
  if (body.name !== undefined && (!body.name || !body.name.trim())) {
    errors.push({ field: 'name', message: 'Name cannot be empty' });
  }
  if (body.email !== undefined) {
    if (!body.email || !body.email.trim()) {
      errors.push({ field: 'email', message: 'Email cannot be empty' });
    } else if (!/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/.test(body.email.trim())) {
      errors.push({ field: 'email', message: 'Please provide a valid email address' });
    }
  }
  return errors;
};

const validateChangePassword = (body) => {
  const errors = [];
  if (!body.currentPassword) {
    errors.push({ field: 'currentPassword', message: 'Current password is required' });
  }
  if (!body.newPassword || body.newPassword.length < 6) {
    errors.push({ field: 'newPassword', message: 'New password must be at least 6 characters' });
  }
  if (body.confirmPassword !== undefined && body.newPassword !== body.confirmPassword) {
    errors.push({ field: 'confirmPassword', message: 'Passwords do not match' });
  }
  return errors;
};

module.exports = {
  validateLogin,
  validateVerifyOtp,
  validateResendOtp,
  validateUpdateProfile,
  validateChangePassword,
};
