/**
 * Middleware wrapper for running schema/data validators
 * @param {Function} validatorFn - Function that returns { errors, value } or array of error messages
 */
const validate = (validatorFn) => {
  return (req, res, next) => {
    const errors = validatorFn(req.body, req.query, req.params);
    if (errors && errors.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors,
      });
    }
    next();
  };
};

module.exports = {
  validate,
};
