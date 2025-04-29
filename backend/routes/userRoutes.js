

const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { verifyToken } = require('../middleware/auth');
const { checkPermission, restrictToRoles } = require('../middleware/rbac');
const { ROLES } = require('../models/role');

// All user routes require a valid token
router.use(verifyToken);

// Create new user - restricted to admins and teachers
router.post(
  '/', 
  restrictToRoles([ROLES.SITE_ADMIN, ROLES.COLLEGE_ADMIN, ROLES.TEACHER]),
  userController.createUser
);

// Get all users - requires view_all_users permission
router.get(
  '/', 
  checkPermission('view_all_users'),
  userController.getAllUsers
);

// Get user by ID - check permissions based on role
router.get('/:id', userController.getUserById);

// Update user - check permissions based on role
router.put('/:id', userController.updateUser);

// Delete user - check permissions based on role
router.delete('/:id', userController.deleteUser);

module.exports = router;