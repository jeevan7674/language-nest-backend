const Team = require('../models/Team');

const getTeams = async (query = {}) => {
  const filter = {};
  if (query.isAlumni !== undefined) {
    filter.isAlumni = query.isAlumni === 'true';
  }

  let teams = await Team.find(filter).sort({ year: -1 });

  // If search query provided, filter teams or matching members
  if (query.search && query.search.trim()) {
    const searchRegex = new RegExp(query.search.trim(), 'i');
    teams = teams.filter((team) => {
      const matchesYear = searchRegex.test(team.year);
      const matchesMember = team.members.some(
        (m) => searchRegex.test(m.name) || searchRegex.test(m.role) || searchRegex.test(m.email)
      );
      return matchesYear || matchesMember;
    });
  }

  return teams;
};

const getTeamById = async (id) => {
  const team = await Team.findById(id);
  if (!team) {
    const error = new Error('Team not found');
    error.statusCode = 404;
    throw error;
  }
  return team;
};

const createTeam = async (data, creatorId) => {
  const existing = await Team.findOne({ year: data.year.trim() });
  if (existing) {
    const error = new Error(`Team for academic year ${data.year} already exists`);
    error.statusCode = 409;
    throw error;
  }

  const team = new Team({
    year: data.year.trim(),
    isAlumni: Boolean(data.isAlumni),
    members: data.members || [],
    createdBy: creatorId,
  });

  await team.save();
  return team;
};

const updateTeam = async (id, data, updaterId) => {
  const team = await Team.findById(id);
  if (!team) {
    const error = new Error('Team not found');
    error.statusCode = 404;
    throw error;
  }

  if (data.year && data.year.trim() !== team.year) {
    const existing = await Team.findOne({ year: data.year.trim(), _id: { $ne: id } });
    if (existing) {
      const error = new Error(`Team for academic year ${data.year} already exists`);
      error.statusCode = 409;
      throw error;
    }
    team.year = data.year.trim();
  }

  if (data.isAlumni !== undefined) team.isAlumni = Boolean(data.isAlumni);
  if (data.members !== undefined) team.members = data.members;

  team.updatedBy = updaterId;
  await team.save();
  return team;
};

const { deleteFromCloudinary } = require('./upload.service');

const deleteTeam = async (id) => {
  const team = await Team.findByIdAndDelete(id);
  if (!team) {
    const error = new Error('Team not found');
    error.statusCode = 404;
    throw error;
  }

  // Cleanup all member avatars in this team from Cloudinary
  if (Array.isArray(team.members)) {
    for (const member of team.members) {
      if (member.avatar) {
        deleteFromCloudinary(member.avatar).catch(() => {});
      }
    }
  }

  return team;
};

const getTeamMemberById = async (teamId, memberId) => {
  const team = await Team.findById(teamId);
  if (!team) {
    const error = new Error('Team not found');
    error.statusCode = 404;
    throw error;
  }

  const member = team.members.id(memberId);
  if (!member) {
    const error = new Error('Team member not found');
    error.statusCode = 404;
    throw error;
  }

  return member;
};

const addTeamMember = async (teamId, memberData, updaterId) => {
  const team = await Team.findById(teamId);
  if (!team) {
    const error = new Error('Team not found');
    error.statusCode = 404;
    throw error;
  }

  const payload = { ...memberData };
  if (payload.image && !payload.avatar) {
    payload.avatar = payload.image;
  }

  team.members.push(payload);
  team.updatedBy = updaterId;
  await team.save();
  return team;
};

const updateTeamMember = async (teamId, memberId, memberData, updaterId) => {
  const team = await Team.findById(teamId);
  if (!team) {
    const error = new Error('Team not found');
    error.statusCode = 404;
    throw error;
  }

  const member = team.members.id(memberId);
  if (!member) {
    const error = new Error('Team member not found');
    error.statusCode = 404;
    throw error;
  }

  const newAvatar = memberData.image !== undefined ? memberData.image : memberData.avatar;
  if (newAvatar !== undefined && member.avatar && member.avatar !== newAvatar) {
    deleteFromCloudinary(member.avatar).catch(() => {});
  }

  if (memberData.name) member.name = memberData.name.trim();
  if (memberData.role) member.role = memberData.role.trim();
  if (memberData.email) member.email = memberData.email.trim().toLowerCase();
  if (memberData.avatar !== undefined) member.avatar = memberData.avatar;
  if (memberData.image !== undefined) member.avatar = memberData.image;
  if (memberData.department !== undefined) member.department = memberData.department;
  if (memberData.bio !== undefined) member.bio = memberData.bio;
  if (memberData.displayOrder !== undefined) member.displayOrder = Number(memberData.displayOrder);
  if (memberData.isActive !== undefined) member.isActive = Boolean(memberData.isActive);

  team.updatedBy = updaterId;
  await team.save();
  return team;
};

const removeTeamMember = async (teamId, memberId, updaterId) => {
  const team = await Team.findById(teamId);
  if (!team) {
    const error = new Error('Team not found');
    error.statusCode = 404;
    throw error;
  }

  const member = team.members.id(memberId);
  if (!member) {
    const error = new Error('Team member not found');
    error.statusCode = 404;
    throw error;
  }

  if (member.avatar) {
    deleteFromCloudinary(member.avatar).catch(() => {});
  }

  team.members.pull(memberId);
  team.updatedBy = updaterId;
  await team.save();
  return team;
};

module.exports = {
  getTeams,
  getTeamById,
  createTeam,
  updateTeam,
  deleteTeam,
  getTeamMemberById,
  addTeamMember,
  updateTeamMember,
  removeTeamMember,
};
