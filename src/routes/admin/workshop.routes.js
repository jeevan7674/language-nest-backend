const express = require('express');
const router = express.Router();
const workshopController = require('../../controllers/workshop.controller');
const { authenticate } = require('../../middleware/auth.middleware');
const { authorize } = require('../../middleware/role.middleware');
const { validate } = require('../../middleware/validation.middleware');
const { validateWorkshop, validateUpdateWorkshop } = require('../../validators/workshop.validator');

// Workshops require Workshop Admin or Super Admin
router.use(authenticate, authorize('Workshop Admin', 'Super Admin', 'super_admin', 'admin'));

router.get('/', workshopController.getWorkshops);
router.post('/', validate(validateWorkshop), workshopController.createWorkshop);
router.get('/:id', workshopController.getWorkshopById);
router.put('/:id', validate(validateUpdateWorkshop), workshopController.updateWorkshop);
router.delete('/:id', workshopController.deleteWorkshop);

module.exports = router;
