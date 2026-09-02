const adminService = require('../services/admin.service');

const getAllAdmins = async (req, res, next) => {
  try {
    const result = await adminService.getAllAdmins(req.query);
    res.status(200).json({
      success: true,
      message: 'Admins fetched successfully',
      data: result.admins,
      pagination: result.pagination,
    });
  } catch (error) {
    next(error);
  }
};

const getAdminById = async (req, res, next) => {
  try {
    const admin = await adminService.getAdminById(req.params.id);
    res.status(200).json({
      success: true,
      message: 'Admin fetched successfully',
      data: admin,
    });
  } catch (error) {
    next(error);
  }
};

const createAdmin = async (req, res, next) => {
  try {
    const admin = await adminService.createAdmin(req.body, req.admin._id);
    res.status(201).json({
      success: true,
      message: 'Admin created successfully',
      data: admin,
    });
  } catch (error) {
    next(error);
  }
};

const updateAdmin = async (req, res, next) => {
  try {
    const admin = await adminService.updateAdmin(req.params.id, req.body);
    res.status(200).json({
      success: true,
      message: 'Admin updated successfully',
      data: admin,
    });
  } catch (error) {
    next(error);
  }
};

const deleteAdmin = async (req, res, next) => {
  try {
    await adminService.deleteAdmin(req.params.id, req.admin._id);
    res.status(200).json({
      success: true,
      message: 'Admin deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAllAdmins,
  getAdminById,
  createAdmin,
  updateAdmin,
  deleteAdmin,
};
