const validateMember = (body) => {
  const errors = [];
  if (!body.name || !body.name.trim()) {
    errors.push({ field: 'name', message: 'Member name is required' });
  }

  if (!body.email || !body.email.trim()) {
    errors.push({ field: 'email', message: 'Email is required' });
  } else if (!/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/.test(body.email.trim())) {
    errors.push({ field: 'email', message: 'Please provide a valid email address' });
  }

  if (!body.department || !body.department.trim()) {
    errors.push({ field: 'department', message: 'Department is required' });
  }

  if (!body.year || !body.year.trim()) {
    errors.push({ field: 'year', message: 'Year is required' });
  }

  if (body.status && !['active', 'inactive'].includes(body.status)) {
    errors.push({ field: 'status', message: 'Status must be active or inactive' });
  }

  if (body.paymentMode && !['online', 'offline'].includes(body.paymentMode)) {
    errors.push({ field: 'paymentMode', message: 'Payment mode must be online or offline' });
  }

  return errors;
};

const validateUpdateMember = (body) => {
  const errors = [];
  if (body.email && !/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/.test(body.email.trim())) {
    errors.push({ field: 'email', message: 'Please provide a valid email address' });
  }

  if (body.status && !['active', 'inactive'].includes(body.status)) {
    errors.push({ field: 'status', message: 'Status must be active or inactive' });
  }

  if (body.paymentMode && !['online', 'offline'].includes(body.paymentMode)) {
    errors.push({ field: 'paymentMode', message: 'Payment mode must be online or offline' });
  }

  return errors;
};

module.exports = {
  validateMember,
  validateUpdateMember,
};
