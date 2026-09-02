const express = require('express');
const router = express.Router();
const financeController = require('../../controllers/finance.controller');
const { authenticate } = require('../../middleware/auth.middleware');
const { authorize } = require('../../middleware/role.middleware');
const { validate } = require('../../middleware/validation.middleware');
const { validateTransaction, validateUpdateTransaction } = require('../../validators/finance.validator');

// Finance management requires Super Admin or Finance Admin
router.use(authenticate, authorize('Super Admin', 'Finance Admin', 'super_admin', 'admin'));

router.get('/transactions', financeController.getTransactions);
router.post('/transactions', validate(validateTransaction), financeController.createTransaction);
router.get('/transactions/:id', financeController.getTransactionById);
router.put('/transactions/:id', validate(validateUpdateTransaction), financeController.updateTransaction);
router.delete('/transactions/:id', financeController.deleteTransaction);
router.get('/summary', financeController.getFinanceSummary);

module.exports = router;
