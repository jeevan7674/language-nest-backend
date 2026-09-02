const Workshop = require('../models/Workshop');
const { getPagination, getPaginationMeta } = require('../utils/pagination');
const { getUniqueSlug } = require('../utils/slug');

const getWorkshops = async (query) => {
  const { page, limit, skip } = getPagination(query);
  const filter = {};

  if (query.search) {
    const searchRegex = new RegExp(query.search, 'i');
    filter.$or = [{ title: searchRegex }, { trainer: searchRegex }, { language: searchRegex }, { description: searchRegex }];
  }

  if (query.status && query.status !== 'all') {
    filter.status = query.status;
  }

  if (query.language && query.language !== 'all') {
    filter.language = query.language;
  }

  const [workshops, total] = await Promise.all([
    Workshop.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit).populate('createdBy', 'name email'),
    Workshop.countDocuments(filter),
  ]);

  return {
    workshops,
    pagination: getPaginationMeta(total, page, limit),
  };
};

const getWorkshopById = async (id) => {
  const workshop = await Workshop.findById(id).populate('createdBy', 'name email');
  if (!workshop) {
    const error = new Error('Workshop not found');
    error.statusCode = 404;
    throw error;
  }
  return workshop;
};

const createWorkshop = async (data, creatorId) => {
  const slug = await getUniqueSlug(Workshop, data.title);
  const workshop = new Workshop({
    ...data,
    slug,
    sessions: Number(data.sessions),
    participants: Number(data.participants) || 0,
    maxParticipants: Number(data.maxParticipants),
    createdBy: creatorId,
  });

  await workshop.save();
  return workshop;
};

const { deleteFromCloudinary } = require('./upload.service');

const updateWorkshop = async (id, data, updaterId) => {
  const workshop = await Workshop.findById(id);
  if (!workshop) {
    const error = new Error('Workshop not found');
    error.statusCode = 404;
    throw error;
  }

  if (data.title && data.title !== workshop.title) {
    workshop.slug = await getUniqueSlug(Workshop, data.title, id);
    workshop.title = data.title;
  }

  const newPoster = data.poster !== undefined ? data.poster : data.image;
  if (newPoster !== undefined && workshop.poster && workshop.poster !== newPoster) {
    deleteFromCloudinary(workshop.poster).catch(() => {});
  }

  if (data.language) workshop.language = data.language;
  if (data.trainer) workshop.trainer = data.trainer;
  if (data.duration) workshop.duration = data.duration;
  if (data.sessions !== undefined) workshop.sessions = Number(data.sessions);
  if (data.participants !== undefined) workshop.participants = Number(data.participants);
  if (data.maxParticipants !== undefined) workshop.maxParticipants = Number(data.maxParticipants);
  if (data.status) workshop.status = data.status;
  if (data.description !== undefined) workshop.description = data.description;
  if (data.poster !== undefined) workshop.poster = data.poster;
  if (data.image !== undefined) workshop.poster = data.image;

  workshop.updatedBy = updaterId;
  await workshop.save();
  return workshop;
};

const deleteWorkshop = async (id) => {
  const workshop = await Workshop.findByIdAndDelete(id);
  if (!workshop) {
    const error = new Error('Workshop not found');
    error.statusCode = 404;
    throw error;
  }

  if (workshop.poster) {
    deleteFromCloudinary(workshop.poster).catch(() => {});
  }

  return workshop;
};

module.exports = {
  getWorkshops,
  getWorkshopById,
  createWorkshop,
  updateWorkshop,
  deleteWorkshop,
};
