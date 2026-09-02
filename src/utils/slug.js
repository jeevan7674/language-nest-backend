/**
 * Generate a URL-friendly slug from text
 * @param {string} text - Input text
 * @returns {string} - Clean slug
 */
const generateSlug = (text) => {
  if (!text) return '';
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/[\s\W-]+/g, '-') // Replace spaces and non-word chars with -
    .replace(/^-+|-+$/g, ''); // Remove leading/trailing -
};

/**
 * Ensure unique slug for a Mongoose model
 * @param {Object} Model - Mongoose Model
 * @param {string} baseText - Base title or text to slugify
 * @param {string} [currentId] - Exclude current document ID if updating
 * @returns {Promise<string>} - Unique slug
 */
const getUniqueSlug = async (Model, baseText, currentId = null) => {
  let baseSlug = generateSlug(baseText);
  if (!baseSlug) {
    baseSlug = 'untitled-' + Math.random().toString(36).substring(2, 8);
  }
  let slug = baseSlug;
  let counter = 1;

  while (true) {
    const query = { slug };
    if (currentId) {
      query._id = { $ne: currentId };
    }
    const existing = await Model.findOne(query);
    if (!existing) {
      return slug;
    }
    slug = `${baseSlug}-${counter}`;
    counter++;
  }
};

module.exports = {
  generateSlug,
  getUniqueSlug,
};
