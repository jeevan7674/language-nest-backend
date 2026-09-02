const validateCreateAdmin = (body) => {
  const errors = [];
  if (!body.name || !body.name.trim()) {
    errors.push({ field: 'name', message: 'Name is required' });
  }

  if (!body.email || !body.email.trim()) {
    errors.push({ field: 'email', message: 'Email is required' });
  } else if (!/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/.test(body.email.trim())) {
    errors.push({ field: 'email', message: 'Please provide a valid email address' });
  }

  if (body.password && body.password.length < 6) {
    errors.push({ field: 'password', message: 'Password must be at least 6 characters' });
  }

  if (body.status && !['active', 'inactive'].includes(body.status)) {
    errors.push({ field: 'status', message: 'Status must be active or inactive' });
  }

  return errors;
};

const validateUpdateAdmin = (body) => {
  const errors = [];
  if (body.email && !/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/.test(body.email.trim())) {
    errors.push({ field: 'email', message: 'Please provide a valid email address' });
  }

  if (body.status && !['active', 'inactive'].includes(body.status)) {
    errors.push({ field: 'status', message: 'Status must be active or inactive' });
  }

  return errors;
};

module.exports = {
  validateCreateAdmin,
  validateUpdateAdmin,
};
