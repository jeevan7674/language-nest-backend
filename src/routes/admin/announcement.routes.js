const express = require('express');
const router = express.Router();
const announcementController = require('../../controllers/announcement.controller');
const { authenticate } = require('../../middleware/auth.middleware');
const { authorize } = require('../../middleware/role.middleware');
const { validate } = require('../../middleware/validation.middleware');
const { validateAnnouncement } = require('../../validators/announcement.validator');

// Announcements require Announcement Admin or Super Admin
router.use(authenticate, authorize('Announcement Admin', 'Super Admin', 'super_admin', 'admin'));

router.get('/', announcementController.getAnnouncements);
router.post('/', validate(validateAnnouncement), announcementController.createAnnouncement);
router.get('/:id', announcementController.getAnnouncementById);
router.put('/:id', validate(validateAnnouncement), announcementController.updateAnnouncement);
router.patch('/:id/pin', announcementController.togglePin);
router.delete('/:id', announcementController.deleteAnnouncement);

module.exports = router;
