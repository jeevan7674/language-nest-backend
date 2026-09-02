const validateEvent = (body) => {
  const errors = [];
  if (!body.title || !body.title.trim()) {
    errors.push({ field: 'title', message: 'Event title is required' });
  }

  if (!body.date) {
    errors.push({ field: 'date', message: 'Event date is required' });
  }

  if (!body.time || !body.time.trim()) {
    errors.push({ field: 'time', message: 'Event time is required' });
  }

  if (!body.venue || !body.venue.trim()) {
    errors.push({ field: 'venue', message: 'Event venue is required' });
  }

  if (body.capacity === undefined || body.capacity === null || isNaN(Number(body.capacity)) || Number(body.capacity) < 1) {
    errors.push({ field: 'capacity', message: 'Capacity must be a positive number' });
  }

  if (body.status && !['upcoming', 'ongoing', 'completed', 'cancelled', 'scheduled'].includes(body.status)) {
    errors.push({ field: 'status', message: 'Invalid event status' });
  }

  if (body.type && !['Conversation', 'Cultural', 'Workshop', 'Other'].includes(body.type)) {
    errors.push({ field: 'type', message: 'Invalid event type' });
  }

  return errors;
};

const validateUpdateEvent = (body) => {
  const errors = [];
  if (body.title !== undefined && (!body.title || !body.title.trim())) {
    errors.push({ field: 'title', message: 'Event title cannot be empty' });
  }

  if (body.capacity !== undefined && (isNaN(Number(body.capacity)) || Number(body.capacity) < 1)) {
    errors.push({ field: 'capacity', message: 'Capacity must be a positive number' });
  }

  if (body.status && !['upcoming', 'ongoing', 'completed', 'cancelled', 'scheduled'].includes(body.status)) {
    errors.push({ field: 'status', message: 'Invalid event status' });
  }

  if (body.type && !['Conversation', 'Cultural', 'Workshop', 'Other'].includes(body.type)) {
    errors.push({ field: 'type', message: 'Invalid event type' });
  }

  return errors;
};

module.exports = {
  validateEvent,
  validateUpdateEvent,
};
