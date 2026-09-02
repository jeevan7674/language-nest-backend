const Announcement = require('../models/Announcement');
const { getPagination, getPaginationMeta } = require('../utils/pagination');

const getAnnouncements = async (query) => {
  const { page, limit, skip } = getPagination(query);
  const filter = {};

  if (query.search) {
    const searchRegex = new RegExp(query.search, 'i');
    filter.$or = [{ title: searchRegex }, { message: searchRegex }, { author: searchRegex }];
  }

  if (query.category && query.category !== 'all') {
    filter.category = query.category;
  }

  if (query.target && query.target !== 'all') {
    filter.target = query.target;
  }

  if (query.isPinned !== undefined) {
    filter.isPinned = query.isPinned === 'true';
  }

  const [announcements, total] = await Promise.all([
    Announcement.find(filter).sort({ isPinned: -1, createdAt: -1 }).skip(skip).limit(limit).populate('createdBy', 'name email'),
    Announcement.countDocuments(filter),
  ]);

  return {
    announcements,
    pagination: getPaginationMeta(total, page, limit),
  };
};

const getAnnouncementById = async (id) => {
  const announcement = await Announcement.findById(id).populate('createdBy', 'name email');
  if (!announcement) {
    const error = new Error('Announcement not found');
    error.statusCode = 404;
    throw error;
  }
  return announcement;
};

const createAnnouncement = async (data, creatorId) => {
  const announcement = new Announcement({
    ...data,
    isPinned: Boolean(data.isPinned),
    createdBy: creatorId,
  });

  await announcement.save();
  return announcement;
};

const { deleteFromCloudinary } = require('./upload.service');

const updateAnnouncement = async (id, data, updaterId) => {
  const announcement = await Announcement.findById(id);
  if (!announcement) {
    const error = new Error('Announcement not found');
    error.statusCode = 404;
    throw error;
  }

  if (data.image !== undefined && announcement.image && announcement.image !== data.image) {
    deleteFromCloudinary(announcement.image).catch(() => {});
  }

  if (data.title) announcement.title = data.title;
  if (data.message) announcement.message = data.message;
  if (data.category) announcement.category = data.category;
  if (data.target) announcement.target = data.target;
  if (data.author) announcement.author = data.author;
  if (data.date) announcement.date = data.date;
  if (data.isPinned !== undefined) announcement.isPinned = Boolean(data.isPinned);
  if (data.image !== undefined) announcement.image = data.image;
  if (data.status) announcement.status = data.status;

  announcement.updatedBy = updaterId;
  await announcement.save();
  return announcement;
};

const togglePin = async (id, updaterId) => {
  const announcement = await Announcement.findById(id);
  if (!announcement) {
    const error = new Error('Announcement not found');
    error.statusCode = 404;
    throw error;
  }

  announcement.isPinned = !announcement.isPinned;
  announcement.updatedBy = updaterId;
  await announcement.save();
  return announcement;
};

const deleteAnnouncement = async (id) => {
  const announcement = await Announcement.findByIdAndDelete(id);
  if (!announcement) {
    const error = new Error('Announcement not found');
    error.statusCode = 404;
    throw error;
  }

  if (announcement.image) {
    deleteFromCloudinary(announcement.image).catch(() => {});
  }

  return announcement;
};

module.exports = {
  getAnnouncements,
  getAnnouncementById,
  createAnnouncement,
  updateAnnouncement,
  togglePin,
  deleteAnnouncement,
};
