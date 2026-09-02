const express = require('express');
const router = express.Router();
const contentController = require('../../controllers/content.controller');
const { authenticate } = require('../../middleware/auth.middleware');
const { authorize } = require('../../middleware/role.middleware');
const { validate } = require('../../middleware/validation.middleware');
const { validateGallery } = require('../../validators/content.validator');

router.use(authenticate, authorize('Super Admin', 'Event Admin', 'super_admin', 'admin'));

router.get('/', contentController.getGalleries);
router.post('/', validate(validateGallery), contentController.createGallery);
router.get('/:id', contentController.getGalleryById);
router.put('/:id', validate(validateGallery), contentController.updateGallery);
router.delete('/:id', contentController.deleteGallery);

module.exports = router;
