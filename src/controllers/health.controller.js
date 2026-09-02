const env = require('../config/env');

const getHealth = (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Language Nest API is running',
    environment: env.NODE_ENV,
  });
};

module.exports = {
  getHealth,
};
