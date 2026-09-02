const workshopService = require('../services/workshop.service');

const getWorkshops = async (req, res, next) => {
  try {
    const result = await workshopService.getWorkshops(req.query);
    res.status(200).json({
      success: true,
      message: 'Workshops fetched successfully',
      data: result.workshops,
      pagination: result.pagination,
    });
  } catch (error) {
    next(error);
  }
};

const getWorkshopById = async (req, res, next) => {
  try {
    const workshop = await workshopService.getWorkshopById(req.params.id);
    res.status(200).json({
      success: true,
      message: 'Workshop fetched successfully',
      data: workshop,
    });
  } catch (error) {
    next(error);
  }
};

const createWorkshop = async (req, res, next) => {
  try {
    const workshop = await workshopService.createWorkshop(req.body, req.admin._id);
    res.status(201).json({
      success: true,
      message: 'Workshop created successfully',
      data: workshop,
    });
  } catch (error) {
    next(error);
  }
};

const updateWorkshop = async (req, res, next) => {
  try {
    const workshop = await workshopService.updateWorkshop(req.params.id, req.body, req.admin._id);
    res.status(200).json({
      success: true,
      message: 'Workshop updated successfully',
      data: workshop,
    });
  } catch (error) {
    next(error);
  }
};

const deleteWorkshop = async (req, res, next) => {
  try {
    await workshopService.deleteWorkshop(req.params.id);
    res.status(200).json({
      success: true,
      message: 'Workshop deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getWorkshops,
  getWorkshopById,
  createWorkshop,
  updateWorkshop,
  deleteWorkshop,
};
