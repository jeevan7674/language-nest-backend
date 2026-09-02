const validateTeam = (body) => {
  const errors = [];
  if (!body.year || !body.year.trim()) {
    errors.push({ field: 'year', message: 'Academic year is required (e.g., 2024-25)' });
  }
  return errors;
};

const validateUpdateTeam = (body) => {
  const errors = [];
  if (body.year !== undefined && (!body.year || !body.year.trim())) {
    errors.push({ field: 'year', message: 'Academic year cannot be empty' });
  }
  return errors;
};

const validateTeamMember = (body) => {
  const errors = [];
  if (!body.name || !body.name.trim()) {
    errors.push({ field: 'name', message: 'Member name is required' });
  }
  if (!body.role || !body.role.trim()) {
    errors.push({ field: 'role', message: 'Role is required' });
  }
  if (!body.email || !body.email.trim()) {
    errors.push({ field: 'email', message: 'Email is required' });
  } else if (!/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/.test(body.email.trim())) {
    errors.push({ field: 'email', message: 'Please provide a valid email address' });
  }
  return errors;
};

const validateUpdateTeamMember = (body) => {
  const errors = [];
  if (body.email && !/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/.test(body.email.trim())) {
    errors.push({ field: 'email', message: 'Please provide a valid email address' });
  }
  return errors;
};

module.exports = {
  validateTeam,
  validateUpdateTeam,
  validateTeamMember,
  validateUpdateTeamMember,
};
