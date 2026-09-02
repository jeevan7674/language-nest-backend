const Resource = require('../models/Resource');
const GalleryAlbum = require('../models/GalleryAlbum');
const NewsArticle = require('../models/NewsArticle');
const Story = require('../models/Story');
const { getPagination, getPaginationMeta } = require('../utils/pagination');
const { getUniqueSlug } = require('../utils/slug');

// --- Resource Services ---
const getResources = async (query) => {
  const { page, limit, skip } = getPagination(query);
  const filter = {};
  if (query.search) {
    const searchRegex = new RegExp(query.search, 'i');
    filter.$or = [{ title: searchRegex }, { description: searchRegex }, { category: searchRegex }];
  }
  if (query.type && query.type !== 'all') filter.type = query.type;
  if (query.category && query.category !== 'all') filter.category = query.category;
  if (query.status && query.status !== 'all') filter.status = query.status;

  const [resources, total] = await Promise.all([
    Resource.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit).populate('createdBy', 'name email'),
    Resource.countDocuments(filter),
  ]);
  return { resources, pagination: getPaginationMeta(total, page, limit) };
};

const getResourceById = async (id) => {
  const resource = await Resource.findById(id).populate('createdBy', 'name email');
  if (!resource) {
    const error = new Error('Resource not found');
    error.statusCode = 404;
    throw error;
  }
  return resource;
};

const createResource = async (data, creatorId) => {
  const slug = await getUniqueSlug(Resource, data.title);
  const resource = new Resource({ ...data, slug, createdBy: creatorId });
  await resource.save();
  return resource;
};

const updateResource = async (id, data, updaterId) => {
  const resource = await Resource.findById(id);
  if (!resource) {
    const error = new Error('Resource not found');
    error.statusCode = 404;
    throw error;
  }
  if (data.title && data.title !== resource.title) {
    resource.slug = await getUniqueSlug(Resource, data.title, id);
    resource.title = data.title;
  }
  Object.assign(resource, data, { updatedBy: updaterId });
  await resource.save();
  return resource;
};

const deleteResource = async (id) => {
  const resource = await Resource.findByIdAndDelete(id);
  if (!resource) {
    const error = new Error('Resource not found');
    error.statusCode = 404;
    throw error;
  }
  return resource;
};

// --- Gallery Services ---
const getGalleries = async (query) => {
  const { page, limit, skip } = getPagination(query);
  const filter = {};
  if (query.search) {
    const searchRegex = new RegExp(query.search, 'i');
    filter.$or = [{ title: searchRegex }, { description: searchRegex }];
  }
  if (query.status && query.status !== 'all') filter.status = query.status;

  const [galleries, total] = await Promise.all([
    GalleryAlbum.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit).populate('createdBy', 'name email'),
    GalleryAlbum.countDocuments(filter),
  ]);
  return { galleries, pagination: getPaginationMeta(total, page, limit) };
};

const getGalleryById = async (id) => {
  const gallery = await GalleryAlbum.findById(id).populate('createdBy', 'name email');
  if (!gallery) {
    const error = new Error('Gallery album not found');
    error.statusCode = 404;
    throw error;
  }
  return gallery;
};

const createGallery = async (data, creatorId) => {
  const slug = await getUniqueSlug(GalleryAlbum, data.title);
  const gallery = new GalleryAlbum({ ...data, slug, createdBy: creatorId });
  await gallery.save();
  return gallery;
};

const updateGallery = async (id, data, updaterId) => {
  const gallery = await GalleryAlbum.findById(id);
  if (!gallery) {
    const error = new Error('Gallery album not found');
    error.statusCode = 404;
    throw error;
  }
  if (data.title && data.title !== gallery.title) {
    gallery.slug = await getUniqueSlug(GalleryAlbum, data.title, id);
    gallery.title = data.title;
  }
  Object.assign(gallery, data, { updatedBy: updaterId });
  await gallery.save();
  return gallery;
};

const deleteGallery = async (id) => {
  const gallery = await GalleryAlbum.findByIdAndDelete(id);
  if (!gallery) {
    const error = new Error('Gallery album not found');
    error.statusCode = 404;
    throw error;
  }
  return gallery;
};

// --- News Services ---
const getNews = async (query) => {
  const { page, limit, skip } = getPagination(query);
  const filter = {};
  if (query.search) {
    const searchRegex = new RegExp(query.search, 'i');
    filter.$or = [{ title: searchRegex }, { summary: searchRegex }, { content: searchRegex }];
  }
  if (query.category && query.category !== 'all') filter.category = query.category;
  if (query.status && query.status !== 'all') filter.status = query.status;

  const [news, total] = await Promise.all([
    NewsArticle.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit).populate('createdBy', 'name email'),
    NewsArticle.countDocuments(filter),
  ]);
  return { news, pagination: getPaginationMeta(total, page, limit) };
};

const getNewsById = async (id) => {
  const article = await NewsArticle.findById(id).populate('createdBy', 'name email');
  if (!article) {
    const error = new Error('News article not found');
    error.statusCode = 404;
    throw error;
  }
  return article;
};

const createNews = async (data, creatorId) => {
  const slug = await getUniqueSlug(NewsArticle, data.title);
  const article = new NewsArticle({ ...data, slug, createdBy: creatorId });
  await article.save();
  return article;
};

const updateNews = async (id, data, updaterId) => {
  const article = await NewsArticle.findById(id);
  if (!article) {
    const error = new Error('News article not found');
    error.statusCode = 404;
    throw error;
  }
  if (data.title && data.title !== article.title) {
    article.slug = await getUniqueSlug(NewsArticle, data.title, id);
    article.title = data.title;
  }
  Object.assign(article, data, { updatedBy: updaterId });
  await article.save();
  return article;
};

const deleteNews = async (id) => {
  const article = await NewsArticle.findByIdAndDelete(id);
  if (!article) {
    const error = new Error('News article not found');
    error.statusCode = 404;
    throw error;
  }
  return article;
};

// --- Story Services ---
const getStories = async (query) => {
  const { page, limit, skip } = getPagination(query);
  const filter = {};
  if (query.search) {
    const searchRegex = new RegExp(query.search, 'i');
    filter.$or = [{ title: searchRegex }, { studentName: searchRegex }, { content: searchRegex }];
  }
  if (query.status && query.status !== 'all') filter.status = query.status;

  const [stories, total] = await Promise.all([
    Story.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit).populate('createdBy', 'name email'),
    Story.countDocuments(filter),
  ]);
  return { stories, pagination: getPaginationMeta(total, page, limit) };
};

const getStoryById = async (id) => {
  const story = await Story.findById(id).populate('createdBy', 'name email');
  if (!story) {
    const error = new Error('Story not found');
    error.statusCode = 404;
    throw error;
  }
  return story;
};

const createStory = async (data, creatorId) => {
  const slug = await getUniqueSlug(Story, data.title);
  const story = new Story({ ...data, slug, createdBy: creatorId });
  await story.save();
  return story;
};

const updateStory = async (id, data, updaterId) => {
  const story = await Story.findById(id);
  if (!story) {
    const error = new Error('Story not found');
    error.statusCode = 404;
    throw error;
  }
  if (data.title && data.title !== story.title) {
    story.slug = await getUniqueSlug(Story, data.title, id);
    story.title = data.title;
  }
  Object.assign(story, data, { updatedBy: updaterId });
  await story.save();
  return story;
};

const deleteStory = async (id) => {
  const story = await Story.findByIdAndDelete(id);
  if (!story) {
    const error = new Error('Story not found');
    error.statusCode = 404;
    throw error;
  }
  return story;
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
