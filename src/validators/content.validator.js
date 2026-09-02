const validateResource = (body) => {
  const errors = [];
  if (!body.title || !body.title.trim()) {
    errors.push({ field: 'title', message: 'Resource title is required' });
  }
  if (!body.category || !body.category.trim()) {
    errors.push({ field: 'category', message: 'Category is required' });
  }
  if (body.type && !['pdf', 'doc', 'audio', 'video', 'link', 'other'].includes(body.type)) {
    errors.push({ field: 'type', message: 'Invalid resource type' });
  }
  return errors;
};

const validateGallery = (body) => {
  const errors = [];
  if (!body.title || !body.title.trim()) {
    errors.push({ field: 'title', message: 'Album title is required' });
  }
  return errors;
};

const validateNews = (body) => {
  const errors = [];
  if (!body.title || !body.title.trim()) {
    errors.push({ field: 'title', message: 'News title is required' });
  }
  if (!body.content || !body.content.trim()) {
    errors.push({ field: 'content', message: 'News content is required' });
  }
  return errors;
};

const validateStory = (body) => {
  const errors = [];
  if (!body.title || !body.title.trim()) {
    errors.push({ field: 'title', message: 'Story title is required' });
  }
  if (!body.content || !body.content.trim()) {
    errors.push({ field: 'content', message: 'Story content is required' });
  }
  if (!body.studentName || !body.studentName.trim()) {
    errors.push({ field: 'studentName', message: 'Student name is required' });
  }
  if (!body.department || !body.department.trim()) {
    errors.push({ field: 'department', message: 'Department is required' });
  }
  if (!body.batch || !body.batch.trim()) {
    errors.push({ field: 'batch', message: 'Batch is required' });
  }
  return errors;
};

module.exports = {
  validateResource,
  validateGallery,
  validateNews,
  validateStory,
};
