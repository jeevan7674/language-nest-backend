const express = require('express');
const router = express.Router();
const contentController = require('../../controllers/content.controller');
const { authenticate } = require('../../middleware/auth.middleware');
const { authorize } = require('../../middleware/role.middleware');
const { validate } = require('../../middleware/validation.middleware');
const { validateStory } = require('../../validators/content.validator');

router.use(authenticate, authorize('Super Admin', 'Member Admin', 'super_admin', 'admin'));

router.get('/', contentController.getStories);
router.post('/', validate(validateStory), contentController.createStory);
router.get('/:id', contentController.getStoryById);
router.put('/:id', validate(validateStory), contentController.updateStory);
router.delete('/:id', contentController.deleteStory);

module.exports = router;
