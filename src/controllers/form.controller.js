const formService = require('../services/form.service');

const getForms = async (req, res, next) => {
  try {
    const result = await formService.getForms(req.query);
    res.status(200).json({
      success: true,
      message: 'Forms fetched successfully',
      data: result.forms,
      pagination: result.pagination,
    });
  } catch (error) {
    next(error);
  }
};

const getFormById = async (req, res, next) => {
  try {
    const form = await formService.getFormById(req.params.id);
    res.status(200).json({
      success: true,
      message: 'Form fetched successfully',
      data: form,
    });
  } catch (error) {
    next(error);
  }
};

const createForm = async (req, res, next) => {
  try {
    const form = await formService.createForm(req.body, req.admin._id);
    res.status(201).json({
      success: true,
      message: 'Form created successfully',
      data: form,
    });
  } catch (error) {
    next(error);
  }
};

const updateForm = async (req, res, next) => {
  try {
    const form = await formService.updateForm(req.params.id, req.body, req.admin._id);
    res.status(200).json({
      success: true,
      message: 'Form updated successfully',
      data: form,
    });
  } catch (error) {
    next(error);
  }
};

const deleteForm = async (req, res, next) => {
  try {
    await formService.deleteForm(req.params.id);
    res.status(200).json({
      success: true,
      message: 'Form deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};

const getFormResponses = async (req, res, next) => {
  try {
    const result = await formService.getFormResponses(req.params.id, req.query);
    res.status(200).json({
      success: true,
      message: 'Form responses fetched successfully',
      data: result.responses,
      pagination: result.pagination,
    });
  } catch (error) {
    next(error);
  }
};

const deleteFormResponse = async (req, res, next) => {
  try {
    await formService.deleteFormResponse(req.params.id);
    res.status(200).json({
      success: true,
      message: 'Form response deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getForms,
  getFormById,
  createForm,
  updateForm,
  deleteForm,
  getFormResponses,
  deleteFormResponse,
};
