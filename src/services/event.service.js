const mongoose = require('mongoose');
const Event = require('../models/Event');
const { getPagination, getPaginationMeta } = require('../utils/pagination');
const { getUniqueSlug } = require('../utils/slug');
const { deleteFromCloudinary } = require('./upload.service');

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

const getEventById = async (idOrSlug) => {
  const isMongoId = mongoose.Types.ObjectId.isValid(idOrSlug);
  const event = isMongoId
    ? await Event.findById(idOrSlug).populate('createdBy', 'name email')
    : await Event.findOne({ slug: idOrSlug }).populate('createdBy', 'name email');

  if (!event) {
    const error = new Error('Event not found');
    error.statusCode = 404;
    throw error;
  }
  return event;
};

const createEvent = async (data, creatorId) => {
  const slug = await getUniqueSlug(Event, data.title);
  const winners = data.winners || {
    first: data.winner_1st || data.winner || null,
    second: data.winner_2nd || null,
    third: data.winner_3rd || null,
  };
  const winner = data.winner || winners.first || null;

  const scheduleList = data.schedule || data.agenda || [];
  const guidelinesList = data.guidelines || data.rules || [];

  const event = new Event({
    ...data,
    slug,
    winners,
    winner,
    schedule: scheduleList,
    agenda: scheduleList,
    guidelines: guidelinesList,
    rules: guidelinesList,
    accessFee: data.accessFee || data.registrationFee || 'Free for members',
    organizer: data.organizer || 'Language Nest Club',
    tagline: data.tagline || '',
    capacity: Number(data.capacity) || 50,
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
  if (data.tagline !== undefined) event.tagline = data.tagline;
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
  if (data.prize !== undefined) event.prize = data.prize;
  if (data.accessFee !== undefined) event.accessFee = data.accessFee;
  if (data.registrationFee !== undefined) event.accessFee = data.registrationFee;
  if (data.organizer !== undefined) event.organizer = data.organizer;

  if (data.schedule !== undefined || data.agenda !== undefined) {
    const list = data.schedule !== undefined ? data.schedule : data.agenda;
    event.schedule = list;
    event.agenda = list;
  }

  if (data.guidelines !== undefined || data.rules !== undefined) {
    const list = data.guidelines !== undefined ? data.guidelines : data.rules;
    event.guidelines = list;
    event.rules = list;
  }
  
  if (data.winners !== undefined || data.winner_1st !== undefined || data.winner_2nd !== undefined || data.winner_3rd !== undefined) {
    event.winners = data.winners || {
      first: data.winner_1st !== undefined ? data.winner_1st : (event.winners?.first || null),
      second: data.winner_2nd !== undefined ? data.winner_2nd : (event.winners?.second || null),
      third: data.winner_3rd !== undefined ? data.winner_3rd : (event.winners?.third || null),
    };
    event.winner = event.winners.first || data.winner || event.winner;
  } else if (data.winner !== undefined) {
    event.winner = data.winner;
  }

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

const registerForEvent = async (idOrSlug, registrationData = {}) => {
  const isMongoId = mongoose.Types.ObjectId.isValid(idOrSlug);
  const event = isMongoId
    ? await Event.findById(idOrSlug)
    : await Event.findOne({ slug: idOrSlug });

  if (!event) {
    const error = new Error('Event not found');
    error.statusCode = 404;
    throw error;
  }

  if (event.status === 'completed' || event.status === 'cancelled') {
    const error = new Error('This event is no longer accepting registrations');
    error.statusCode = 400;
    throw error;
  }

  event.registered = (event.registered || 0) + 1;
  await event.save();

  if (event.registrationForm) {
    try {
      const Form = require('../models/Form');
      const FormResponse = require('../models/FormResponse');
      const isFormMongoId = mongoose.Types.ObjectId.isValid(event.registrationForm);
      const form = isFormMongoId
        ? await Form.findById(event.registrationForm)
        : await Form.findOne({ slug: event.registrationForm });

      if (form) {
        const response = new FormResponse({
          form: form._id,
          answers: registrationData.answers || registrationData,
          respondentEmail: registrationData.email || (registrationData.answers && registrationData.answers.email),
          respondentName: registrationData.name || (registrationData.answers && registrationData.answers.name),
        });
        await response.save();
        await Form.findByIdAndUpdate(form._id, { $inc: { responseCount: 1 } });
      }
    } catch (err) {
      console.warn('Form response save warning:', err.message);
    }
  }

  return event;
};

module.exports = {
  getEvents,
  getEventById,
  createEvent,
  updateEvent,
  deleteEvent,
  registerForEvent,
};
