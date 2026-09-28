const Finance = require('../models/Finance');
const { getPagination, getPaginationMeta } = require('../utils/pagination');

const getTransactions = async (query) => {
  const { page, limit, skip } = getPagination(query);
  const filter = {};

  if (query.search) {
    const searchRegex = new RegExp(query.search, 'i');
    filter.$or = [{ title: searchRegex }, { category: searchRegex }, { reference: searchRegex }, { paidBy: searchRegex }];
  }

  if (query.type && query.type !== 'all') {
    filter.type = query.type;
  }

  if (query.category && query.category !== 'all') {
    filter.category = query.category;
  }

  if (query.status && query.status !== 'all') {
    filter.status = query.status;
  }

  const [transactions, total] = await Promise.all([
    Finance.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate('createdBy', 'name email')
      .populate('approvedBy', 'name email'),
    Finance.countDocuments(filter),
  ]);

  return {
    transactions,
    pagination: getPaginationMeta(total, page, limit),
  };
};

const getTransactionById = async (id) => {
  const transaction = await Finance.findById(id)
    .populate('createdBy', 'name email')
    .populate('approvedBy', 'name email');
  if (!transaction) {
    const error = new Error('Transaction not found');
    error.statusCode = 404;
    throw error;
  }
  return transaction;
};

const createTransaction = async (data, creatorId) => {
  const isReimbursement =
    data.category === 'Reimbursement' ||
    (data.reference && String(data.reference).toLowerCase().includes('reimb')) ||
    (data.title && String(data.title).toLowerCase().includes('reimburse'));

  const initialStatus = data.status || (isReimbursement ? 'pending' : 'approved');

  const transaction = new Finance({
    ...data,
    amount: Number(data.amount),
    status: initialStatus,
    createdBy: creatorId,
  });

  await transaction.save();
  return transaction;
};

const updateTransaction = async (id, data, updaterId) => {
  const transaction = await Finance.findById(id);
  if (!transaction) {
    const error = new Error('Transaction not found');
    error.statusCode = 404;
    throw error;
  }

  if (data.title) transaction.title = data.title;
  if (data.amount !== undefined) transaction.amount = Number(data.amount);
  if (data.type) transaction.type = data.type;
  if (data.category) transaction.category = data.category;
  if (data.date) transaction.date = data.date;
  if (data.paymentMode) transaction.paymentMode = data.paymentMode;
  if (data.event !== undefined) transaction.event = data.event;
  if (data.workshop !== undefined) transaction.workshop = data.workshop;
  if (data.reference !== undefined) transaction.reference = data.reference;
  if (data.billImage !== undefined) transaction.billImage = data.billImage;
  if (data.paidBy !== undefined) transaction.paidBy = data.paidBy;
  if (data.notes !== undefined) transaction.notes = data.notes;

  if (data.status) {
    transaction.status = data.status;
    if (data.status === 'approved') {
      transaction.approvedBy = updaterId;
      transaction.approvedAt = new Date();
      transaction.rejectionReason = null;
    } else if (data.status === 'rejected') {
      transaction.approvedBy = updaterId;
      transaction.approvedAt = new Date();
      transaction.rejectionReason = data.rejectionReason || 'Disapproved by Finance Admin';
    }
  }

  transaction.updatedBy = updaterId;
  await transaction.save();
  return transaction;
};

const updateTransactionStatus = async (id, { status, rejectionReason }, updaterId) => {
  const transaction = await Finance.findById(id);
  if (!transaction) {
    const error = new Error('Transaction not found');
    error.statusCode = 404;
    throw error;
  }

  if (!['approved', 'rejected', 'pending'].includes(status)) {
    const error = new Error('Invalid status. Must be approved, rejected, or pending.');
    error.statusCode = 400;
    throw error;
  }

  transaction.status = status;
  transaction.updatedBy = updaterId;

  if (status === 'approved') {
    transaction.approvedBy = updaterId;
    transaction.approvedAt = new Date();
    transaction.rejectionReason = null;
  } else if (status === 'rejected') {
    transaction.approvedBy = updaterId;
    transaction.approvedAt = new Date();
    transaction.rejectionReason = rejectionReason || 'Disapproved by Finance Admin';
  } else if (status === 'pending') {
    transaction.approvedBy = null;
    transaction.approvedAt = null;
    transaction.rejectionReason = null;
  }

  await transaction.save();
  return transaction;
};

const deleteTransaction = async (id) => {
  const transaction = await Finance.findByIdAndDelete(id);
  if (!transaction) {
    const error = new Error('Transaction not found');
    error.statusCode = 404;
    throw error;
  }
  return transaction;
};

const getFinanceSummary = async () => {
  const [totals, pendingCount] = await Promise.all([
    Finance.aggregate([
      {
        $match: {
          status: { $ne: 'rejected' },
        },
      },
      {
        $group: {
          _id: '$type',
          total: { $sum: '$amount' },
          count: { $sum: 1 },
        },
      },
    ]),
    Finance.countDocuments({ status: 'pending' }),
  ]);

  let income = 0;
  let expenses = 0;

  totals.forEach((item) => {
    if (item._id === 'income') income = item.total;
    if (item._id === 'expense') expenses = item.total;
  });

  return {
    income,
    expenses,
    balance: income - expenses,
    pendingClaims: pendingCount,
  };
};

module.exports = {
  getTransactions,
  getTransactionById,
  createTransaction,
  updateTransaction,
  updateTransactionStatus,
  deleteTransaction,
  getFinanceSummary,
};
