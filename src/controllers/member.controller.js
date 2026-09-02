const memberService = require('../services/member.service');

const getMembers = async (req, res, next) => {
  try {
    const result = await memberService.getMembers(req.query);
    res.status(200).json({
      success: true,
      message: 'Members fetched successfully',
      data: result.members,
      pagination: result.pagination,
    });
  } catch (error) {
    next(error);
  }
};

const getMemberById = async (req, res, next) => {
  try {
    const member = await memberService.getMemberById(req.params.id);
    res.status(200).json({
      success: true,
      message: 'Member fetched successfully',
      data: member,
    });
  } catch (error) {
    next(error);
  }
};

const createMember = async (req, res, next) => {
  try {
    const member = await memberService.createMember(req.body, req.admin._id);
    res.status(201).json({
      success: true,
      message: 'Member registered successfully',
      data: member,
    });
  } catch (error) {
    next(error);
  }
};

const updateMember = async (req, res, next) => {
  try {
    const member = await memberService.updateMember(req.params.id, req.body, req.admin._id);
    res.status(200).json({
      success: true,
      message: 'Member updated successfully',
      data: member,
    });
  } catch (error) {
    next(error);
  }
};

const deleteMember = async (req, res, next) => {
  try {
    await memberService.deleteMember(req.params.id);
    res.status(200).json({
      success: true,
      message: 'Member deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getMembers,
  getMemberById,
  createMember,
  updateMember,
  deleteMember,
};
