const express = require('express');
const router = express.Router();
const formController = require('../../controllers/form.controller');
const { authenticate } = require('../../middleware/auth.middleware');
const { authorize } = require('../../middleware/role.middleware');
const { validate } = require('../../middleware/validation.middleware');
const { validateForm } = require('../../validators/form.validator');

// Form builder requires Super Admin or Event Admin / Workshop Admin
router.use(authenticate, authorize('Super Admin', 'Event Admin', 'Workshop Admin', 'super_admin', 'admin'));

// Form responses routes (defined before /:id)
router.get('/responses/all', formController.getAllFormResponses);
router.get('/responses', formController.getAllFormResponses);
router.delete('/responses/:id', formController.deleteFormResponse);

// Forms CRUD routes
router.get('/', formController.getForms);
router.post('/', validate(validateForm), formController.createForm);
router.get('/:id', formController.getFormById);
router.put('/:id', validate(validateForm), formController.updateForm);
router.delete('/:id', formController.deleteForm);
router.get('/:id/responses', formController.getFormResponses);

module.exports = router;
