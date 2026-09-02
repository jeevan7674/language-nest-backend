const express = require('express');
const router = express.Router();
const contentController = require('../../controllers/content.controller');
const { authenticate } = require('../../middleware/auth.middleware');
const { authorize } = require('../../middleware/role.middleware');
const { validate } = require('../../middleware/validation.middleware');
const { validateResource } = require('../../validators/content.validator');

router.use(authenticate, authorize('Super Admin', 'Workshop Admin', 'super_admin', 'admin'));

router.get('/', contentController.getResources);
router.post('/', validate(validateResource), contentController.createResource);
router.get('/:id', contentController.getResourceById);
router.put('/:id', validate(validateResource), contentController.updateResource);
router.delete('/:id', contentController.deleteResource);

module.exports = router;
