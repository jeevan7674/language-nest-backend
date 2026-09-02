const validateWorkshop = (body) => {
  const errors = [];
  if (!body.title || !body.title.trim()) {
    errors.push({ field: 'title', message: 'Workshop title is required' });
  }

  if (!body.trainer || !body.trainer.trim()) {
    errors.push({ field: 'trainer', message: 'Trainer name is required' });
  }

  if (!body.duration || !body.duration.trim()) {
    errors.push({ field: 'duration', message: 'Duration is required' });
  }

  if (body.sessions === undefined || body.sessions === null || isNaN(Number(body.sessions)) || Number(body.sessions) < 1) {
    errors.push({ field: 'sessions', message: 'Sessions must be a positive number' });
  }

  if (body.maxParticipants === undefined || body.maxParticipants === null || isNaN(Number(body.maxParticipants)) || Number(body.maxParticipants) < 1) {
    errors.push({ field: 'maxParticipants', message: 'Max participants must be a positive number' });
  }

  if (body.status && !['upcoming', 'ongoing', 'completed'].includes(body.status)) {
    errors.push({ field: 'status', message: 'Invalid workshop status' });
  }

  return errors;
};

const validateUpdateWorkshop = (body) => {
  const errors = [];
  if (body.title !== undefined && (!body.title || !body.title.trim())) {
    errors.push({ field: 'title', message: 'Workshop title cannot be empty' });
  }

  if (body.sessions !== undefined && (isNaN(Number(body.sessions)) || Number(body.sessions) < 1)) {
    errors.push({ field: 'sessions', message: 'Sessions must be a positive number' });
  }

  if (body.maxParticipants !== undefined && (isNaN(Number(body.maxParticipants)) || Number(body.maxParticipants) < 1)) {
    errors.push({ field: 'maxParticipants', message: 'Max participants must be a positive number' });
  }

  if (body.status && !['upcoming', 'ongoing', 'completed'].includes(body.status)) {
    errors.push({ field: 'status', message: 'Invalid workshop status' });
  }

  return errors;
};

module.exports = {
  validateWorkshop,
  validateUpdateWorkshop,
};
