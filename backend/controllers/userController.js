const { userModel } = require('../models/user');
const { canManageRole } = require('../models/role');

const userController = {
  // Create new user
  createUser: async (req, res) => {
    try {
      const { name, email, password, role } = req.body;
      
      // Check if admin has permission to create this type of user
      if (!req.user || !canManageRole(req.user.role, role)) {
        return res.status(403).json({ message: "You don't have permission to create this type of user" });
      }

      if (!name || !email || !password || !role) {
        return res.status(400).json({ message: "All fields are required" });
      }

      const user = await userModel.create({ name, email, password, role });
      
      res.status(201).json({
        message: "User created successfully",
        user: { id: user.id, name: user.name, email: user.email, role: user.role }
      });
    } catch (error) {
      console.error("User creation error:", error);
      if (error.message === "Email already in use") {
        return res.status(409).json({ message: error.message });
      }
      if (error.message === "Invalid role specified") {
        return res.status(400).json({ message: error.message });
      }
      res.status(500).json({ message: "Server error while creating user" });
    }
  },

  // Get all users
  getAllUsers: async (req, res) => {
    try {
      const users = await userModel.getAll();
      res.json(users);
    } catch (error) {
      console.error("Error fetching users:", error);
      res.status(500).json({ message: "Failed to fetch users" });
    }
  },

  // Get user by ID
  getUserById: async (req, res) => {
    try {
      const user = await userModel.findById(req.params.id);
      
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      
      res.json(user);
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Server error" });
    }
  },

  // Update user
  updateUser: async (req, res) => {
    try {
      const userId = req.params.id;
      const { name, email, role } = req.body;
      
      // Check if user exists
      const existingUser = await userModel.findById(userId);
      
      if (!existingUser) {
        return res.status(404).json({ message: "User not found" });
      }
      
      // Check if admin has permission to update this type of user
      if (!req.user || !canManageRole(req.user.role, existingUser.role) || 
          (role && !canManageRole(req.user.role, role))) {
        return res.status(403).json({ message: "You don't have permission to update this user" });
      }

      const updated = await userModel.update(userId, { name, email, role });
      
      if (!updated) {
        return res.status(500).json({ message: "Failed to update user" });
      }
      
      res.json({ message: "User updated successfully" });
    } catch (error) {
      console.error("Error updating user:", error);
      res.status(500).json({ message: "Server error" });
    }
  },

  // Delete user
  deleteUser: async (req, res) => {
    try {
      const userId = req.params.id;
      
      // Check if user exists
      const existingUser = await userModel.findById(userId);
      
      if (!existingUser) {
        return res.status(404).json({ message: "User not found" });
      }
      
      // Check if admin has permission to delete this type of user
      if (!req.user || !canManageRole(req.user.role, existingUser.role)) {
        return res.status(403).json({ message: "You don't have permission to delete this user" });
      }

      const deleted = await userModel.delete(userId);
      
      if (!deleted) {
        return res.status(500).json({ message: "Failed to delete user" });
      }
      
      res.json({ message: "User deleted successfully" });
    } catch (error) {
      console.error("Error deleting user:", error);
      res.status(500).json({ message: "Server error" });
    }
  }
};

module.exports = userController;