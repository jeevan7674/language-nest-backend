/**
 * Role-based authorization middleware
 * @param  {...string} allowedRoles - List of authorized roles
 */
const authorize = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.admin) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required before checking permissions.',
      });
    }

    const userRoles = req.admin.roles || [];
    
    // Super Admins have universal permission
    const isSuperAdmin = userRoles.some(
      r => r.toLowerCase() === 'super admin' || r.toLowerCase() === 'super_admin'
    );

    if (isSuperAdmin) {
      return next();
    }

    // Check if user has at least one of the allowed roles
    const hasRole = userRoles.some(r =>
      allowedRoles.some(allowed => allowed.toLowerCase() === r.toLowerCase())
    );

    if (!hasRole) {
      return res.status(403).json({
        success: false,
        message: 'Access denied. You do not have permission to perform this action.',
      });
    }

    next();
  };
};

module.exports = {
  authorize,
};
