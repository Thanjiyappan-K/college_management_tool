const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const { verifyToken } = require('../middleware/auth');
const { restrictToRoles } = require('../middleware/rbac');
const { ROLES } = require('../models/role');

// All admin routes require a valid token and site_admin role
router.use(verifyToken);
router.use(restrictToRoles([ROLES.SITE_ADMIN]));

// Get all admins
router.get('/', adminController.getAllAdmins);

module.exports = router;