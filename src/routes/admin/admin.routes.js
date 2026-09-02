const express = require('express');
const router = express.Router();
const adminController = require('../../controllers/admin.controller');
const { authenticate } = require('../../middleware/auth.middleware');
const { authorize } = require('../../middleware/role.middleware');
const { validate } = require('../../middleware/validation.middleware');
const { validateCreateAdmin, validateUpdateAdmin } = require('../../validators/admin.validator');

// All admin management routes require authentication and Super Admin authorization
router.use(authenticate, authorize('Super Admin', 'super_admin'));

router.get('/', adminController.getAllAdmins);
router.post('/', validate(validateCreateAdmin), adminController.createAdmin);
router.get('/:id', adminController.getAdminById);
router.put('/:id', validate(validateUpdateAdmin), adminController.updateAdmin);
router.delete('/:id', adminController.deleteAdmin);

module.exports = router;
