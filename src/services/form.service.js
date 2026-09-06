const Form = require('../models/Form');
const FormResponse = require('../models/FormResponse');
const { getPagination, getPaginationMeta } = require('../utils/pagination');
const { getUniqueSlug } = require('../utils/slug');

const getForms = async (query) => {
  const { page, limit, skip } = getPagination(query);
  const filter = {};

  if (query.search) {
    const searchRegex = new RegExp(query.search, 'i');
    filter.$or = [{ title: searchRegex }, { description: searchRegex }];
  }

  if (query.status && query.status !== 'all') {
    filter.status = query.status;
  }

  const [forms, total] = await Promise.all([
    Form.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit).populate('createdBy', 'name email'),
    Form.countDocuments(filter),
  ]);

  return {
    forms,
    pagination: getPaginationMeta(total, page, limit),
  };
};

const mongoose = require('mongoose');

const getFormById = async (idOrSlug) => {
  const isMongoId = mongoose.Types.ObjectId.isValid(idOrSlug);
  const form = isMongoId
    ? await Form.findById(idOrSlug).populate('createdBy', 'name email')
    : await Form.findOne({ slug: idOrSlug }).populate('createdBy', 'name email');
  if (!form) {
    const error = new Error('Form not found');
    error.statusCode = 404;
    throw error;
  }
  return form;
};

const createForm = async (data, creatorId) => {
  const slug = await getUniqueSlug(Form, data.title);
  const form = new Form({
    ...data,
    slug,
    createdBy: creatorId,
  });

  await form.save();
  return form;
};

const updateForm = async (id, data, updaterId) => {
  const form = await Form.findById(id);
  if (!form) {
    const error = new Error('Form not found');
    error.statusCode = 404;
    throw error;
  }

  if (data.title && data.title !== form.title) {
    form.slug = await getUniqueSlug(Form, data.title, id);
    form.title = data.title;
  }

  if (data.description !== undefined) form.description = data.description;
  if (data.status) form.status = data.status;
  if (data.fields !== undefined) form.fields = data.fields;
  if (data.settings !== undefined) form.settings = { ...form.settings, ...data.settings };

  form.updatedBy = updaterId;
  await form.save();
  return form;
};

const deleteForm = async (id) => {
  const form = await Form.findByIdAndDelete(id);
  if (!form) {
    const error = new Error('Form not found');
    error.statusCode = 404;
    throw error;
  }
  // Delete all responses belonging to this form
  await FormResponse.deleteMany({ form: id });
  return form;
};

const getFormResponses = async (formId, query) => {
  const { page, limit, skip } = getPagination(query);
  const filter = {};
  if (formId && formId !== 'all') {
    filter.form = formId;
  }

  const [responses, total] = await Promise.all([
    FormResponse.find(filter).sort({ submittedAt: -1 }).skip(skip).limit(limit).populate('form', 'title name description slug'),
    FormResponse.countDocuments(filter),
  ]);

  return {
    responses,
    pagination: getPaginationMeta(total, page, limit),
  };
};

const deleteFormResponse = async (responseId) => {
  const response = await FormResponse.findByIdAndDelete(responseId);
  if (!response) {
    const error = new Error('Form response not found');
    error.statusCode = 404;
    throw error;
  }
  await Form.findByIdAndUpdate(response.form, { $inc: { responseCount: -1 } });
  return response;
};

const submitFormResponse = async (formIdOrSlug, data) => {
  const isMongoId = mongoose.Types.ObjectId.isValid(formIdOrSlug);
  const form = isMongoId
    ? await Form.findById(formIdOrSlug)
    : await Form.findOne({ slug: formIdOrSlug });

  if (!form) {
    const error = new Error('Form not found');
    error.statusCode = 404;
    throw error;
  }

  const answers = data.answers || data;
  const respondentEmail = data.email || data.respondentEmail || (answers && (answers.email || answers.Email || answers['College Email'] || answers['Email Address']));
  const respondentName = data.name || data.respondentName || (answers && (answers.name || answers.Name || answers['Full Name']));

  const response = new FormResponse({
    form: form._id,
    answers,
    respondentEmail: respondentEmail || null,
    respondentName: respondentName || null,
  });

  await response.save();
  await Form.findByIdAndUpdate(form._id, { $inc: { responseCount: 1 } });
  return response;
};

module.exports = {
  getForms,
  getFormById,
  createForm,
  updateForm,
  deleteForm,
  getFormResponses,
  deleteFormResponse,
  submitFormResponse,
};
