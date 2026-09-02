const Finance = require('../models/Finance');
const { getPagination, getPaginationMeta } = require('../utils/pagination');

const getTransactions = async (query) => {
  const { page, limit, skip } = getPagination(query);
  const filter = {};

  if (query.search) {
    const searchRegex = new RegExp(query.search, 'i');
    filter.$or = [{ title: searchRegex }, { category: searchRegex }, { reference: searchRegex }];
  }

  if (query.type && query.type !== 'all') {
    filter.type = query.type;
  }

  if (query.category && query.category !== 'all') {
    filter.category = query.category;
  }

  const [transactions, total] = await Promise.all([
    Finance.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit).populate('createdBy', 'name email'),
    Finance.countDocuments(filter),
  ]);

  return {
    transactions,
    pagination: getPaginationMeta(total, page, limit),
  };
};

const getTransactionById = async (id) => {
  const transaction = await Finance.findById(id).populate('createdBy', 'name email');
  if (!transaction) {
    const error = new Error('Transaction not found');
    error.statusCode = 404;
    throw error;
  }
  return transaction;
};

const createTransaction = async (data, creatorId) => {
  const transaction = new Finance({
    ...data,
    amount: Number(data.amount),
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

  transaction.updatedBy = updaterId;
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
  const totals = await Finance.aggregate([
    {
      $group: {
        _id: '$type',
        total: { $sum: '$amount' },
        count: { $sum: 1 },
      },
    },
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
  };
};

module.exports = {
  getTransactions,
  getTransactionById,
  createTransaction,
  updateTransaction,
  deleteTransaction,
  getFinanceSummary,
};
