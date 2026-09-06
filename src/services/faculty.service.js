const Faculty = require('../models/Faculty');
const { deleteFromCloudinary } = require('./upload.service');

const getFaculty = async (query = {}) => {
  const filter = {};
  if (query.isActive !== undefined) {
    filter.isActive = query.isActive === 'true';
  }
  return await Faculty.find(filter).sort({ displayOrder: 1, createdAt: 1 });
};

const getFacultyById = async (id) => {
  const faculty = await Faculty.findById(id);
  if (!faculty) {
    const error = new Error('Faculty advisor not found');
    error.statusCode = 404;
    throw error;
  }
  return faculty;
};

const createFaculty = async (data) => {
  const faculty = new Faculty({
    name: data.name ? data.name.trim() : '',
    role: data.role ? data.role.trim() : 'Faculty Advisor',
    image: data.image || null,
    displayOrder: data.displayOrder !== undefined ? Number(data.displayOrder) : 0,
    isActive: data.isActive !== undefined ? Boolean(data.isActive) : true,
  });

  await faculty.save();
  return faculty;
};

const updateFaculty = async (id, data) => {
  const faculty = await Faculty.findById(id);
  if (!faculty) {
    const error = new Error('Faculty advisor not found');
    error.statusCode = 404;
    throw error;
  }

  if (data.image !== undefined && faculty.image && faculty.image !== data.image) {
    deleteFromCloudinary(faculty.image).catch(() => {});
  }

  if (data.name) faculty.name = data.name.trim();
  if (data.role) faculty.role = data.role.trim();
  if (data.image !== undefined) faculty.image = data.image;
  if (data.displayOrder !== undefined) faculty.displayOrder = Number(data.displayOrder);
  if (data.isActive !== undefined) faculty.isActive = Boolean(data.isActive);

  await faculty.save();
  return faculty;
};

const deleteFaculty = async (id) => {
  const faculty = await Faculty.findByIdAndDelete(id);
  if (!faculty) {
    const error = new Error('Faculty advisor not found');
    error.statusCode = 404;
    throw error;
  }

  if (faculty.image) {
    deleteFromCloudinary(faculty.image).catch(() => {});
  }

  return faculty;
};

module.exports = {
  getFaculty,
  getFacultyById,
  createFaculty,
  updateFaculty,
  deleteFaculty,
};
