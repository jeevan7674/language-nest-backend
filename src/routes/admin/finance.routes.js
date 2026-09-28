const express = require('express');
const router = express.Router();
const financeController = require('../../controllers/finance.controller');
const { authenticate } = require('../../middleware/auth.middleware');
const { authorize } = require('../../middleware/role.middleware');
const { validate } = require('../../middleware/validation.middleware');
const { validateTransaction, validateUpdateTransaction } = require('../../validators/finance.validator');

// Any authenticated admin can submit a finance bill or out-of-pocket reimbursement
router.post('/transactions', authenticate, validate(validateTransaction), financeController.createTransaction);
router.post('/submit-bill', authenticate, validate(validateTransaction), financeController.createTransaction);

// Finance management (viewing all transactions, summary, editing, deleting) requires Super Admin or Finance Admin
router.use(authenticate, authorize('Super Admin', 'Finance Admin', 'super_admin', 'admin'));

router.get('/transactions', financeController.getTransactions);
router.get('/transactions/:id', financeController.getTransactionById);
router.put('/transactions/:id', validate(validateUpdateTransaction), financeController.updateTransaction);
router.patch('/transactions/:id/status', financeController.updateTransactionStatus);
router.delete('/transactions/:id', financeController.deleteTransaction);
router.get('/summary', financeController.getFinanceSummary);

module.exports = router;
