const express = require('express');
const router = express.Router();
const facultyController = require('../../controllers/faculty.controller');
const { authenticate } = require('../../middleware/auth.middleware');
const { authorize } = require('../../middleware/role.middleware');

// Faculty management requires Super Admin or Member Admin
router.use(authenticate, authorize('Super Admin', 'Member Admin', 'super_admin', 'admin'));

router.get('/', facultyController.getFaculty);
router.post('/', facultyController.createFaculty);
router.get('/:id', facultyController.getFacultyById);
router.put('/:id', facultyController.updateFaculty);
router.delete('/:id', facultyController.deleteFaculty);

module.exports = router;
