const express = require('express');
const router = express.Router();
const memberController = require('../../controllers/member.controller');
const { authenticate } = require('../../middleware/auth.middleware');
const { authorize } = require('../../middleware/role.middleware');
const { validate } = require('../../middleware/validation.middleware');
const { validateMember, validateUpdateMember } = require('../../validators/member.validator');

// Members require Member Admin or Super Admin
router.use(authenticate, authorize('Member Admin', 'Super Admin', 'super_admin', 'admin'));

// Metrics & Settings routes (must precede /:id)
router.get('/metrics', memberController.getMemberMetrics);
router.get('/settings', memberController.getAdminPaymentSettings);
router.put('/settings', memberController.updateAdminPaymentSettings);

// Export route (must precede /:id)
router.get('/export', memberController.exportMembers);

// Member CRUD routes
router.get('/', memberController.getMembers);
router.post('/', validate(validateMember), memberController.createMember);
router.get('/:id', memberController.getMemberById);
router.put('/:id', validate(validateUpdateMember), memberController.updateMember);
router.delete('/:id', memberController.deleteMember);

module.exports = router;
