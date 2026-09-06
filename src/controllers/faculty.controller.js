const facultyService = require('../services/faculty.service');

const getFaculty = async (req, res, next) => {
  try {
    const faculty = await facultyService.getFaculty(req.query);
    res.status(200).json({
      success: true,
      message: 'Faculty advisors fetched successfully',
      data: faculty,
    });
  } catch (error) {
    next(error);
  }
};

const getFacultyById = async (req, res, next) => {
  try {
    const faculty = await facultyService.getFacultyById(req.params.id);
    res.status(200).json({
      success: true,
      message: 'Faculty advisor fetched successfully',
      data: faculty,
    });
  } catch (error) {
    next(error);
  }
};

const createFaculty = async (req, res, next) => {
  try {
    const faculty = await facultyService.createFaculty(req.body);
    res.status(201).json({
      success: true,
      message: 'Faculty advisor added successfully',
      data: faculty,
    });
  } catch (error) {
    next(error);
  }
};

const updateFaculty = async (req, res, next) => {
  try {
    const faculty = await facultyService.updateFaculty(req.params.id, req.body);
    res.status(200).json({
      success: true,
      message: 'Faculty advisor updated successfully',
      data: faculty,
    });
  } catch (error) {
    next(error);
  }
};

const deleteFaculty = async (req, res, next) => {
  try {
    await facultyService.deleteFaculty(req.params.id);
    res.status(200).json({
      success: true,
      message: 'Faculty advisor removed successfully',
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getFaculty,
  getFacultyById,
  createFaculty,
  updateFaculty,
  deleteFaculty,
};
