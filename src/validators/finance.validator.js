const validateTransaction = (body) => {
  const errors = [];
  if (!body.title || !body.title.trim()) {
    errors.push({ field: 'title', message: 'Transaction title is required' });
  }

  if (body.amount === undefined || body.amount === null || isNaN(Number(body.amount)) || Number(body.amount) < 0) {
    errors.push({ field: 'amount', message: 'Amount must be a non-negative number' });
  }

  if (!body.type || !['income', 'expense'].includes(body.type)) {
    errors.push({ field: 'type', message: 'Type must be income or expense' });
  }

  if (!body.category || !body.category.trim()) {
    errors.push({ field: 'category', message: 'Category is required' });
  }

  if (!body.date) {
    errors.push({ field: 'date', message: 'Date is required' });
  }

  return errors;
};

const validateUpdateTransaction = (body) => {
  const errors = [];
  if (body.amount !== undefined && (isNaN(Number(body.amount)) || Number(body.amount) < 0)) {
    errors.push({ field: 'amount', message: 'Amount must be a non-negative number' });
  }

  if (body.type && !['income', 'expense'].includes(body.type)) {
    errors.push({ field: 'type', message: 'Type must be income or expense' });
  }

  return errors;
};

module.exports = {
  validateTransaction,
  validateUpdateTransaction,
};
