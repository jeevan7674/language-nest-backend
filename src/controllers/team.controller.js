const teamService = require('../services/team.service');

const getTeams = async (req, res, next) => {
  try {
    const teams = await teamService.getTeams(req.query);
    res.status(200).json({
      success: true,
      message: 'Teams fetched successfully',
      data: teams,
    });
  } catch (error) {
    next(error);
  }
};

const getTeamById = async (req, res, next) => {
  try {
    const team = await teamService.getTeamById(req.params.id);
    res.status(200).json({
      success: true,
      message: 'Team fetched successfully',
      data: team,
    });
  } catch (error) {
    next(error);
  }
};

const createTeam = async (req, res, next) => {
  try {
    const team = await teamService.createTeam(req.body, req.admin._id);
    res.status(201).json({
      success: true,
      message: 'Team created successfully',
      data: team,
    });
  } catch (error) {
    next(error);
  }
};

const updateTeam = async (req, res, next) => {
  try {
    const team = await teamService.updateTeam(req.params.id, req.body, req.admin._id);
    res.status(200).json({
      success: true,
      message: 'Team updated successfully',
      data: team,
    });
  } catch (error) {
    next(error);
  }
};

const deleteTeam = async (req, res, next) => {
  try {
    await teamService.deleteTeam(req.params.id);
    res.status(200).json({
      success: true,
      message: 'Team deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};

const getTeamMemberById = async (req, res, next) => {
  try {
    const member = await teamService.getTeamMemberById(req.params.id, req.params.memberId);
    res.status(200).json({
      success: true,
      message: 'Team member fetched successfully',
      data: member,
    });
  } catch (error) {
    next(error);
  }
};

const addTeamMember = async (req, res, next) => {
  try {
    const team = await teamService.addTeamMember(req.params.id, req.body, req.admin._id);
    res.status(201).json({
      success: true,
      message: 'Team member added successfully',
      data: team,
    });
  } catch (error) {
    next(error);
  }
};

const updateTeamMember = async (req, res, next) => {
  try {
    const team = await teamService.updateTeamMember(req.params.id, req.params.memberId, req.body, req.admin._id);
    res.status(200).json({
      success: true,
      message: 'Team member updated successfully',
      data: team,
    });
  } catch (error) {
    next(error);
  }
};

const removeTeamMember = async (req, res, next) => {
  try {
    const team = await teamService.removeTeamMember(req.params.id, req.params.memberId, req.admin._id);
    res.status(200).json({
      success: true,
      message: 'Team member removed successfully',
      data: team,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getTeams,
  getTeamById,
  createTeam,
  updateTeam,
  deleteTeam,
  getTeamMemberById,
  addTeamMember,
  updateTeamMember,
  removeTeamMember,
};
