const Member = require('../models/Member');
const { getPagination, getPaginationMeta } = require('../utils/pagination');

const getMembers = async (query) => {
  const { page, limit, skip } = getPagination(query);
  const filter = {};

  if (query.search) {
    const searchRegex = new RegExp(query.search, 'i');
    filter.$or = [{ name: searchRegex }, { email: searchRegex }, { phone: searchRegex }, { transactionId: searchRegex }];
  }

  if (query.status && query.status !== 'all') {
    filter.status = query.status;
  }

  if (query.department && query.department !== 'all') {
    filter.department = query.department;
  }

  if (query.paymentMode && query.paymentMode !== 'all') {
    filter.paymentMode = query.paymentMode;
  }

  const [members, total] = await Promise.all([
    Member.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit).populate('createdBy', 'name email'),
    Member.countDocuments(filter),
  ]);

  return {
    members,
    pagination: getPaginationMeta(total, page, limit),
  };
};

const getMemberById = async (id) => {
  const member = await Member.findById(id).populate('createdBy', 'name email');
  if (!member) {
    const error = new Error('Member not found');
    error.statusCode = 404;
    throw error;
  }
  return member;
};

const createMember = async (data, creatorId) => {
  const existing = await Member.findOne({ email: data.email.toLowerCase().trim() });
  if (existing) {
    const error = new Error('Member with this email already exists');
    error.statusCode = 409;
    throw error;
  }

  const member = new Member({
    ...data,
    email: data.email.toLowerCase().trim(),
    createdBy: creatorId,
  });

  await member.save();
  return member;
};

const { deleteFromCloudinary } = require('./upload.service');

const updateMember = async (id, data, updaterId) => {
  const member = await Member.findById(id);
  if (!member) {
    const error = new Error('Member not found');
    error.statusCode = 404;
    throw error;
  }

  const newAvatar = data.image !== undefined ? data.image : data.avatar;
  const currentAvatar = member.image || member.avatar;
  if (newAvatar !== undefined && currentAvatar && currentAvatar !== newAvatar) {
    deleteFromCloudinary(currentAvatar).catch(() => {});
  }

  if (data.email && data.email.toLowerCase().trim() !== member.email) {
    const existing = await Member.findOne({
      email: data.email.toLowerCase().trim(),
      _id: { $ne: id },
    });
    if (existing) {
      const error = new Error('Member with this email already exists');
      error.statusCode = 409;
      throw error;
    }
    member.email = data.email.toLowerCase().trim();
  }

  if (data.name) member.name = data.name.trim();
  if (data.phone !== undefined) member.phone = data.phone;
  if (data.department) member.department = data.department;
  if (data.year) member.year = data.year;
  if (data.status) member.status = data.status;
  if (data.paymentMode) member.paymentMode = data.paymentMode;
  if (data.transactionId !== undefined) member.transactionId = data.transactionId;
  if (data.image !== undefined) member.image = data.image;
  if (data.avatar !== undefined) member.avatar = data.avatar;

  member.updatedBy = updaterId;
  await member.save();
  return member;
};

const deleteMember = async (id) => {
  const member = await Member.findByIdAndDelete(id);
  if (!member) {
    const error = new Error('Member not found');
    error.statusCode = 404;
    throw error;
  }

  const avatarToDelete = member.image || member.avatar;
  if (avatarToDelete) {
    deleteFromCloudinary(avatarToDelete).catch(() => {});
  }

  return member;
};

module.exports = {
  getMembers,
  getMemberById,
  createMember,
  updateMember,
  deleteMember,
};
