const express = require('express');
const router = express.Router();
const formController = require('../../controllers/form.controller');
const { authenticate } = require('../../middleware/auth.middleware');
const { authorize } = require('../../middleware/role.middleware');
const { validate } = require('../../middleware/validation.middleware');
const { validateForm } = require('../../validators/form.validator');

// Form builder requires Super Admin or Event Admin / Workshop Admin
router.use(authenticate, authorize('Super Admin', 'Event Admin', 'Workshop Admin', 'super_admin', 'admin'));

router.get('/', formController.getForms);
router.post('/', validate(validateForm), formController.createForm);
router.get('/:id', formController.getFormById);
router.put('/:id', validate(validateForm), formController.updateForm);
router.delete('/:id', formController.deleteForm);

// Form responses
router.get('/:id/responses', formController.getFormResponses);
router.delete('/responses/:id', formController.deleteFormResponse);

module.exports = router;
