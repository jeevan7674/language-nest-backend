const financeService = require('../services/finance.service');

const getTransactions = async (req, res, next) => {
  try {
    const result = await financeService.getTransactions(req.query);
    res.status(200).json({
      success: true,
      message: 'Transactions fetched successfully',
      data: result.transactions,
      pagination: result.pagination,
    });
  } catch (error) {
    next(error);
  }
};

const getTransactionById = async (req, res, next) => {
  try {
    const transaction = await financeService.getTransactionById(req.params.id);
    res.status(200).json({
      success: true,
      message: 'Transaction fetched successfully',
      data: transaction,
    });
  } catch (error) {
    next(error);
  }
};

const createTransaction = async (req, res, next) => {
  try {
    const transaction = await financeService.createTransaction(req.body, req.admin._id);
    res.status(201).json({
      success: true,
      message: 'Transaction created successfully',
      data: transaction,
    });
  } catch (error) {
    next(error);
  }
};

const updateTransaction = async (req, res, next) => {
  try {
    const transaction = await financeService.updateTransaction(req.params.id, req.body, req.admin._id);
    res.status(200).json({
      success: true,
      message: 'Transaction updated successfully',
      data: transaction,
    });
  } catch (error) {
    next(error);
  }
};

const deleteTransaction = async (req, res, next) => {
  try {
    await financeService.deleteTransaction(req.params.id);
    res.status(200).json({
      success: true,
      message: 'Transaction deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};

const getFinanceSummary = async (req, res, next) => {
  try {
    const summary = await financeService.getFinanceSummary();
    res.status(200).json({
      success: true,
      message: 'Finance summary fetched successfully',
      data: summary,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getTransactions,
  getTransactionById,
  createTransaction,
  updateTransaction,
  deleteTransaction,
  getFinanceSummary,
};
