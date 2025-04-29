const bcrypt = require('bcryptjs');
const { adminModel, userModel } = require('../models/user');
const { generateToken } = require('../config/auth');
const { getRoleRedirectPath } = require('../models/role');

const authController = {
  // Admin login
  adminLogin: async (req, res) => {
    try {
      const { email, password } = req.body;
      
      if (!email || !password) {
        return res.status(400).json({ message: "Email and password are required" });
      }

      const admin = await adminModel.findByEmail(email);
      
      if (!admin) {
        return res.status(401).json({ message: "Invalid credentials" });
      }

      const isMatch = await bcrypt.compare(password, admin.password);
      
      if (!isMatch) {
        return res.status(401).json({ message: "Invalid credentials" });
      }

      const token = generateToken({ id: admin.id, role: admin.role });
      
      res.json({
        message: "Login successful",
        token,
        user: {
          id: admin.id,
          name: admin.name,
          email: admin.email,
          role: admin.role
        }
      });
    } catch (error) {
      console.error("Admin login error:", error);
      res.status(500).json({ message: "Server error during login" });
    }
  },

  // User login
  userLogin: async (req, res) => {
    try {
      const { email, password } = req.body;
      
      if (!email || !password) {
        return res.status(400).json({ message: "Email and password are required" });
      }

      const user = await userModel.findByEmail(email);
      
      if (!user) {
        return res.status(401).json({ message: "Invalid email or password" });
      }

      // In the future, hash and compare passwords
      // For now, direct comparison as per original code
      if (user.password !== password) {
        return res.status(401).json({ message: "Invalid email or password" });
      }

      // You might want to generate a token here as well
      const redirectUrl = getRoleRedirectPath(user.role);

      res.status(200).json({
        message: "Login successful",
        userId: user.id,
        name: user.name,
        role: user.role,
        redirectTo: redirectUrl
      });
    } catch (error) {
      console.error("User login error:", error);
      res.status(500).json({ message: "Server error during login" });
    }
  },

  // Register admin
  registerAdmin: async (req, res) => {
    try {
      const { name, email, password, role } = req.body;
      
      if (!name || !email || !password || !role) {
        return res.status(400).json({ message: "All fields are required" });
      }

      const admin = await adminModel.create({ name, email, password, role });
      
      res.status(201).json({
        message: "Admin registered successfully",
        admin: { id: admin.id, name: admin.name, email: admin.email, role: admin.role }
      });
    } catch (error) {
      console.error("Admin registration error:", error);
      if (error.message === "Email already in use") {
        return res.status(409).json({ message: error.message });
      }
      if (error.message === "Invalid admin role") {
        return res.status(400).json({ message: error.message });
      }
      res.status(500).json({ message: "Server error during registration" });
    }
  },

  // Register user
  registerUser: async (req, res) => {
    try {
      const { name, email, password, role } = req.body;
      
      if (!name || !email || !password || !role) {
        return res.status(400).json({ message: "All fields are required" });
      }

      const user = await userModel.create({ name, email, password, role });
      
      res.status(201).json({
        message: "User registered successfully",
        user: { id: user.id, name: user.name, email: user.email, role: user.role }
      });
    } catch (error) {
      console.error("User registration error:", error);
      if (error.message === "Email already in use") {
        return res.status(409).json({ message: error.message });
      }
      res.status(500).json({ message: "Server error during registration" });
    }
  }
};

module.exports = authController;