/**
 * Parse and validate pagination parameters from request query
 * @param {Object} query - req.query
 * @param {number} [defaultLimit=10] - Default limit per page
 * @param {number} [maxLimit=100] - Max allowable limit per page
 * @returns {Object} - { page, limit, skip }
 */
const getPagination = (query, defaultLimit = 10, maxLimit = 100) => {
  let page = parseInt(query.page, 10) || 1;
  let limit = parseInt(query.limit, 10) || defaultLimit;

  if (page < 1) page = 1;
  if (limit < 1) limit = defaultLimit;
  if (limit > maxLimit) limit = maxLimit;

  const skip = (page - 1) * limit;

  return { page, limit, skip };
};

/**
 * Format pagination metadata response
 * @param {number} total - Total documents count
 * @param {number} page - Current page
 * @param {number} limit - Limit per page
 * @returns {Object} - { page, limit, total, totalPages }
 */
const getPaginationMeta = (total, page, limit) => {
  const totalPages = Math.ceil(total / limit) || 1;
  return {
    page,
    limit,
    total,
    totalPages,
    hasNextPage: page < totalPages,
    hasPrevPage: page > 1,
  };
};

module.exports = {
  getPagination,
  getPaginationMeta,
};
