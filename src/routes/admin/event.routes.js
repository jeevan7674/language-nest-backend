const express = require('express');
const router = express.Router();
const eventController = require('../../controllers/event.controller');
const { authenticate } = require('../../middleware/auth.middleware');
const { authorize } = require('../../middleware/role.middleware');
const { validate } = require('../../middleware/validation.middleware');
const { validateEvent, validateUpdateEvent } = require('../../validators/event.validator');

// Events require Event Admin or Super Admin
router.use(authenticate, authorize('Event Admin', 'Super Admin', 'super_admin', 'admin'));

router.get('/', eventController.getEvents);
router.post('/', validate(validateEvent), eventController.createEvent);
router.get('/:id', eventController.getEventById);
router.put('/:id', validate(validateUpdateEvent), eventController.updateEvent);
router.delete('/:id', eventController.deleteEvent);

module.exports = router;
