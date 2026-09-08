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

  const validPaymentModes = ['online', 'offline', 'qr', 'upi', 'cash'];
  if (body.paymentMode && !validPaymentModes.includes(body.paymentMode.toLowerCase())) {
    errors.push({ field: 'paymentMode', message: 'Payment mode must be QR/Online or Offline/Cash' });
  }

  return errors;
};

const validatePublicRegistration = (body) => {
  const errors = [];
  const name = body.fullName || body.name;
  if (!name || !name.trim()) {
    errors.push({ field: 'fullName', message: 'Full Name is required' });
  }

  if (!body.email || !body.email.trim()) {
    errors.push({ field: 'email', message: 'Email is required' });
  } else if (!/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/.test(body.email.trim())) {
    errors.push({ field: 'email', message: 'Please provide a valid email address' });
  }

  if (!body.phone || !body.phone.trim()) {
    errors.push({ field: 'phone', message: 'Phone number is required' });
  }

  const branch = body.branch || body.department;
  if (!branch || !branch.trim()) {
    errors.push({ field: 'branch', message: 'Branch / Department is required' });
  }

  if (!body.year || !body.year.trim()) {
    errors.push({ field: 'year', message: 'Academic Year is required' });
  }

  const paymentMode = (body.paymentMode || '').toUpperCase();
  if (!paymentMode || !['QR', 'OFFLINE', 'ONLINE', 'UPI', 'CASH'].includes(paymentMode)) {
    errors.push({ field: 'paymentMode', message: 'Please select a valid payment mode (QR or Offline)' });
  } else if (paymentMode === 'QR' || paymentMode === 'ONLINE' || paymentMode === 'UPI') {
    const utr = body.utrNumber || body.transactionId;
    if (!utr || !utr.trim()) {
      errors.push({ field: 'utrNumber', message: 'Transaction ID / UTR Number is required for QR payments' });
    }
  } else if (paymentMode === 'OFFLINE' || paymentMode === 'CASH') {
    if (!body.cashGivenTo || !body.cashGivenTo.trim()) {
      errors.push({ field: 'cashGivenTo', message: 'Please specify the person to whom cash was given' });
    }
  }

  if (body.termsAccepted !== true && body.agreeToTerms !== true && body.terms !== true) {
    errors.push({ field: 'termsAccepted', message: 'You must accept the Terms & Conditions to proceed' });
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

  const validPaymentModes = ['online', 'offline', 'qr', 'upi', 'cash'];
  if (body.paymentMode && !validPaymentModes.includes(body.paymentMode.toLowerCase())) {
    errors.push({ field: 'paymentMode', message: 'Payment mode must be QR/Online or Offline/Cash' });
  }

  return errors;
};

module.exports = {
  validateMember,
  validatePublicRegistration,
  validateUpdateMember,
};
