const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');

router.post('/register', authController.registerUser);
router.post('/admin/register', authController.registerAdmin);
router.post('/login', authController.userLogin);
router.post('/admin/login', authController.adminLogin);

module.exports = router;
