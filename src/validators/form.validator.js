const validateForm = (body) => {
  const errors = [];
  if (!body.title || !body.title.trim()) {
    errors.push({ field: 'title', message: 'Form title is required' });
  }

  if (body.status && !['active', 'closed', 'draft'].includes(body.status)) {
    errors.push({ field: 'status', message: 'Status must be active, closed, or draft' });
  }

  return errors;
};

const validateFormResponse = (body) => {
  const errors = [];
  if (!body.answers || typeof body.answers !== 'object') {
    errors.push({ field: 'answers', message: 'Answers object is required' });
  }
  return errors;
};

module.exports = {
  validateForm,
  validateFormResponse,
};
