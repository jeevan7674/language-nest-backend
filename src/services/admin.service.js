const Admin = require('../models/Admin');
const { getPagination, getPaginationMeta } = require('../utils/pagination');

const getAllAdmins = async (query) => {
  const { page, limit, skip } = getPagination(query);
  const filter = {};

  if (query.search) {
    const searchRegex = new RegExp(query.search, 'i');
    filter.$or = [{ name: searchRegex }, { email: searchRegex }];
  }

  if (query.status && query.status !== 'all') {
    filter.status = query.status;
  }

  if (query.role && query.role !== 'all') {
    filter.roles = query.role;
  }

  const [admins, total] = await Promise.all([
    Admin.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit),
    Admin.countDocuments(filter),
  ]);

  return {
    admins,
    pagination: getPaginationMeta(total, page, limit),
  };
};

const getAdminById = async (id) => {
  const admin = await Admin.findById(id);
  if (!admin) {
    const error = new Error('Admin not found');
    error.statusCode = 404;
    throw error;
  }
  return admin;
};

const createAdmin = async (data, creatorId) => {
  const existing = await Admin.findOne({ email: data.email.toLowerCase().trim() });
  if (existing) {
    const error = new Error('Admin with this email already exists');
    error.statusCode = 409;
    throw error;
  }

  const admin = new Admin({
    name: data.name.trim(),
    email: data.email.toLowerCase().trim(),
    password: data.password || 'Admin@123456', // Default temporary password if none provided
    roles: Array.isArray(data.roles) ? data.roles : [data.role || 'Event Admin'],
    status: data.status || 'active',
    image: data.image || null,
    createdBy: creatorId || null,
  });

  await admin.save();
  return admin;
};

const { deleteFromCloudinary } = require('./upload.service');

const updateAdmin = async (id, data) => {
  const admin = await Admin.findById(id);
  if (!admin) {
    const error = new Error('Admin not found');
    error.statusCode = 404;
    throw error;
  }

  const newAvatar = data.avatar !== undefined ? data.avatar : data.image;
  const currentAvatar = admin.avatar || admin.image;
  if (newAvatar !== undefined && currentAvatar && currentAvatar !== newAvatar) {
    deleteFromCloudinary(currentAvatar).catch(() => {});
  }

  if (data.email && data.email.toLowerCase().trim() !== admin.email) {
    const existing = await Admin.findOne({
      email: data.email.toLowerCase().trim(),
      _id: { $ne: id },
    });
    if (existing) {
      const error = new Error('Admin with this email already exists');
      error.statusCode = 409;
      throw error;
    }
    admin.email = data.email.toLowerCase().trim();
  }

  if (data.name) admin.name = data.name.trim();
  if (data.roles) admin.roles = Array.isArray(data.roles) ? data.roles : [data.roles];
  if (data.role) admin.roles = [data.role];
  if (data.status) admin.status = data.status;
  if (data.image !== undefined) admin.image = data.image;
  if (data.avatar !== undefined) admin.avatar = data.avatar;
  if (data.phone !== undefined) admin.phone = data.phone;
  if (data.bio !== undefined) admin.bio = data.bio;
  if (data.password) admin.password = data.password;

  await admin.save();
  return admin;
};

const deleteAdmin = async (id, currentAdminId) => {
  if (id === currentAdminId.toString()) {
    const error = new Error('You cannot delete your own admin account');
    error.statusCode = 400;
    throw error;
  }

  const admin = await Admin.findByIdAndDelete(id);
  if (!admin) {
    const error = new Error('Admin not found');
    error.statusCode = 404;
    throw error;
  }

  const avatarToDelete = admin.avatar || admin.image;
  if (avatarToDelete) {
    deleteFromCloudinary(avatarToDelete).catch(() => {});
  }

  return admin;
};

module.exports = {
  getAllAdmins,
  getAdminById,
  createAdmin,
  updateAdmin,
  deleteAdmin,
};
