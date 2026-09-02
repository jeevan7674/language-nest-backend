const express = require('express');
const router = express.Router();
const teamController = require('../../controllers/team.controller');
const { authenticate } = require('../../middleware/auth.middleware');
const { authorize } = require('../../middleware/role.middleware');
const { validate } = require('../../middleware/validation.middleware');
const {
  validateTeam,
  validateUpdateTeam,
  validateTeamMember,
  validateUpdateTeamMember,
} = require('../../validators/team.validator');

// Team management requires Super Admin or Member Admin
router.use(authenticate, authorize('Super Admin', 'Member Admin', 'super_admin', 'admin'));

// Academic Year Teams CRUD
router.get('/', teamController.getTeams);
router.post('/', validate(validateTeam), teamController.createTeam);
router.get('/:id', teamController.getTeamById);
router.put('/:id', validate(validateUpdateTeam), teamController.updateTeam);
router.delete('/:id', teamController.deleteTeam);

// Team Members CRUD
router.get('/:id/members/:memberId', teamController.getTeamMemberById);
router.post('/:id/members', validate(validateTeamMember), teamController.addTeamMember);
router.put('/:id/members/:memberId', validate(validateUpdateTeamMember), teamController.updateTeamMember);
router.delete('/:id/members/:memberId', teamController.removeTeamMember);

module.exports = router;
