const validateAnnouncement = (body) => {
  const errors = [];
  if (!body.title || !body.title.trim()) {
    errors.push({ field: 'title', message: 'Title is required' });
  }

  if (!body.message || !body.message.trim()) {
    errors.push({ field: 'message', message: 'Message is required' });
  }

  if (body.category && !['Event Update', 'Workshop Reminder', 'General'].includes(body.category)) {
    errors.push({ field: 'category', message: 'Invalid announcement category' });
  }

  if (body.target && !['All Members', 'Specific Groups', 'Admins Only'].includes(body.target)) {
    errors.push({ field: 'target', message: 'Invalid target audience' });
  }

  if (body.status && !['draft', 'published', 'archived'].includes(body.status)) {
    errors.push({ field: 'status', message: 'Invalid announcement status' });
  }

  return errors;
};

module.exports = {
  validateAnnouncement,
};
