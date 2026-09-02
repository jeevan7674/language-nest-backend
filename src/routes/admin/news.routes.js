const express = require('express');
const router = express.Router();
const contentController = require('../../controllers/content.controller');
const { authenticate } = require('../../middleware/auth.middleware');
const { authorize } = require('../../middleware/role.middleware');
const { validate } = require('../../middleware/validation.middleware');
const { validateNews } = require('../../validators/content.validator');

router.use(authenticate, authorize('Super Admin', 'Announcement Admin', 'super_admin', 'admin'));

router.get('/', contentController.getNews);
router.post('/', validate(validateNews), contentController.createNews);
router.get('/:id', contentController.getNewsById);
router.put('/:id', validate(validateNews), contentController.updateNews);
router.delete('/:id', contentController.deleteNews);

module.exports = router;
