const { hasPermission } = require('../models/role');

// Check if user has required permission
const checkPermission = (permission) => {
  return (req, res, next) => {
    // Ensure user and role are available (set by verifyToken middleware)
    if (!req.user || !req.user.role) {
      return res.status(403).json({ message: "Access denied" });
    }

    if (hasPermission(req.user.role, permission)) {
      next();
    } else {
      return res.status(403).json({ message: "You don't have permission to perform this action" });
    }
  };
};

// Restricts access to specific roles
const restrictToRoles = (allowedRoles) => {
  return (req, res, next) => {
    if (!req.user || !req.user.role) {
      return res.status(403).json({ message: "Access denied" });
    }

    if (allowedRoles.includes(req.user.role)) {
      next();
    } else {
      return res.status(403).json({ message: "Access denied for your role" });
    }
  };
};

module.exports = {
  checkPermission,
  restrictToRoles
};