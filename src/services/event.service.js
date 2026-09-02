const Event = require('../models/Event');
const { getPagination, getPaginationMeta } = require('../utils/pagination');
const { getUniqueSlug } = require('../utils/slug');

const getEvents = async (query) => {
  const { page, limit, skip } = getPagination(query);
  const filter = {};

  if (query.search) {
    const searchRegex = new RegExp(query.search, 'i');
    filter.$or = [{ title: searchRegex }, { venue: searchRegex }, { description: searchRegex }];
  }

  if (query.status && query.status !== 'all') {
    filter.status = query.status;
  }

  if (query.type && query.type !== 'all') {
    filter.type = query.type;
  }

  const [events, total] = await Promise.all([
    Event.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit).populate('createdBy', 'name email'),
    Event.countDocuments(filter),
  ]);

  return {
    events,
    pagination: getPaginationMeta(total, page, limit),
  };
};

const getEventById = async (id) => {
  const event = await Event.findById(id).populate('createdBy', 'name email');
  if (!event) {
    const error = new Error('Event not found');
    error.statusCode = 404;
    throw error;
  }
  return event;
};

const createEvent = async (data, creatorId) => {
  const slug = await getUniqueSlug(Event, data.title);
  const event = new Event({
    ...data,
    slug,
    capacity: Number(data.capacity),
    registered: Number(data.registered) || 0,
    createdBy: creatorId,
  });

  await event.save();
  return event;
};

const updateEvent = async (id, data, updaterId) => {
  const event = await Event.findById(id);
  if (!event) {
    const error = new Error('Event not found');
    error.statusCode = 404;
    throw error;
  }

  if (data.title && data.title.trim() !== event.title) {
    event.slug = await getUniqueSlug(Event, data.title, id);
    event.title = data.title.trim();
  }

  const newPoster = data.poster !== undefined ? data.poster : data.image;
  if (newPoster !== undefined && event.poster && event.poster !== newPoster) {
    deleteFromCloudinary(event.poster).catch(() => {});
  }

  if (data.type) event.type = data.type;
  if (data.description !== undefined) event.description = data.description;
  if (data.date) event.date = data.date;
  if (data.time) event.time = data.time;
  if (data.venue) event.venue = data.venue;
  if (data.capacity !== undefined) event.capacity = Number(data.capacity);
  if (data.registered !== undefined) event.registered = Number(data.registered);
  if (data.status) event.status = data.status;
  if (data.poster !== undefined) event.poster = data.poster;
  if (data.image !== undefined) event.poster = data.image;
  if (data.registrationForm !== undefined) event.registrationForm = data.registrationForm;
  if (data.featured !== undefined) event.featured = Boolean(data.featured);

  event.updatedBy = updaterId;
  await event.save();
  return event;
};

const deleteEvent = async (id) => {
  const event = await Event.findByIdAndDelete(id);
  if (!event) {
    const error = new Error('Event not found');
    error.statusCode = 404;
    throw error;
  }

  if (event.poster) {
    deleteFromCloudinary(event.poster).catch(() => {});
  }

  return event;
};

module.exports = {
  getEvents,
  getEventById,
  createEvent,
  updateEvent,
  deleteEvent,
};
