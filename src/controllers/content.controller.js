const contentService = require('../services/content.service');

// --- Resource Controller ---
const getResources = async (req, res, next) => {
  try {
    const result = await contentService.getResources(req.query);
    res.status(200).json({
      success: true,
      message: 'Resources fetched successfully',
      data: result.resources,
      pagination: result.pagination,
    });
  } catch (error) {
    next(error);
  }
};

const getResourceById = async (req, res, next) => {
  try {
    const resource = await contentService.getResourceById(req.params.id);
    res.status(200).json({
      success: true,
      message: 'Resource fetched successfully',
      data: resource,
    });
  } catch (error) {
    next(error);
  }
};

const createResource = async (req, res, next) => {
  try {
    const resource = await contentService.createResource(req.body, req.admin._id);
    res.status(201).json({
      success: true,
      message: 'Resource created successfully',
      data: resource,
    });
  } catch (error) {
    next(error);
  }
};

const updateResource = async (req, res, next) => {
  try {
    const resource = await contentService.updateResource(req.params.id, req.body, req.admin._id);
    res.status(200).json({
      success: true,
      message: 'Resource updated successfully',
      data: resource,
    });
  } catch (error) {
    next(error);
  }
};

const deleteResource = async (req, res, next) => {
  try {
    await contentService.deleteResource(req.params.id);
    res.status(200).json({
      success: true,
      message: 'Resource deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};

// --- Gallery Controller ---
const getGalleries = async (req, res, next) => {
  try {
    const result = await contentService.getGalleries(req.query);
    res.status(200).json({
      success: true,
      message: 'Gallery albums fetched successfully',
      data: result.galleries,
      pagination: result.pagination,
    });
  } catch (error) {
    next(error);
  }
};

const getGalleryById = async (req, res, next) => {
  try {
    const gallery = await contentService.getGalleryById(req.params.id);
    res.status(200).json({
      success: true,
      message: 'Gallery album fetched successfully',
      data: gallery,
    });
  } catch (error) {
    next(error);
  }
};

const createGallery = async (req, res, next) => {
  try {
    const gallery = await contentService.createGallery(req.body, req.admin._id);
    res.status(201).json({
      success: true,
      message: 'Gallery album created successfully',
      data: gallery,
    });
  } catch (error) {
    next(error);
  }
};

const updateGallery = async (req, res, next) => {
  try {
    const gallery = await contentService.updateGallery(req.params.id, req.body, req.admin._id);
    res.status(200).json({
      success: true,
      message: 'Gallery album updated successfully',
      data: gallery,
    });
  } catch (error) {
    next(error);
  }
};

const deleteGallery = async (req, res, next) => {
  try {
    await contentService.deleteGallery(req.params.id);
    res.status(200).json({
      success: true,
      message: 'Gallery album deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};

// --- News Controller ---
const getNews = async (req, res, next) => {
  try {
    const result = await contentService.getNews(req.query);
    res.status(200).json({
      success: true,
      message: 'News articles fetched successfully',
      data: result.news,
      pagination: result.pagination,
    });
  } catch (error) {
    next(error);
  }
};

const getNewsById = async (req, res, next) => {
  try {
    const article = await contentService.getNewsById(req.params.id);
    res.status(200).json({
      success: true,
      message: 'News article fetched successfully',
      data: article,
    });
  } catch (error) {
    next(error);
  }
};

const createNews = async (req, res, next) => {
  try {
    const article = await contentService.createNews(req.body, req.admin._id);
    res.status(201).json({
      success: true,
      message: 'News article created successfully',
      data: article,
    });
  } catch (error) {
    next(error);
  }
};

const updateNews = async (req, res, next) => {
  try {
    const article = await contentService.updateNews(req.params.id, req.body, req.admin._id);
    res.status(200).json({
      success: true,
      message: 'News article updated successfully',
      data: article,
    });
  } catch (error) {
    next(error);
  }
};

const deleteNews = async (req, res, next) => {
  try {
    await contentService.deleteNews(req.params.id);
    res.status(200).json({
      success: true,
      message: 'News article deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};

// --- Story Controller ---
const getStories = async (req, res, next) => {
  try {
    const result = await contentService.getStories(req.query);
    res.status(200).json({
      success: true,
      message: 'Stories fetched successfully',
      data: result.stories,
      pagination: result.pagination,
    });
  } catch (error) {
    next(error);
  }
};

const getStoryById = async (req, res, next) => {
  try {
    const story = await contentService.getStoryById(req.params.id);
    res.status(200).json({
      success: true,
      message: 'Story fetched successfully',
      data: story,
    });
  } catch (error) {
    next(error);
  }
};

const createStory = async (req, res, next) => {
  try {
    const story = await contentService.createStory(req.body, req.admin._id);
    res.status(201).json({
      success: true,
      message: 'Story created successfully',
      data: story,
    });
  } catch (error) {
    next(error);
  }
};

const updateStory = async (req, res, next) => {
  try {
    const story = await contentService.updateStory(req.params.id, req.body, req.admin._id);
    res.status(200).json({
      success: true,
      message: 'Story updated successfully',
      data: story,
    });
  } catch (error) {
    next(error);
  }
};

const deleteStory = async (req, res, next) => {
  try {
    await contentService.deleteStory(req.params.id);
    res.status(200).json({
      success: true,
      message: 'Story deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getResources,
  getResourceById,
  createResource,
  updateResource,
  deleteResource,
  getGalleries,
  getGalleryById,
  createGallery,
  updateGallery,
  deleteGallery,
  getNews,
  getNewsById,
  createNews,
  updateNews,
  deleteNews,
  getStories,
  getStoryById,
  createStory,
  updateStory,
  deleteStory,
};
