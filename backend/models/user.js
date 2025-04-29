const db = require('../config/db');
const bcrypt = require('bcryptjs');
const { ROLES } = require('./role');

// User operations
const userModel = {
  // Find user by email
  findByEmail: async (email) => {
    try {
      const [rows] = await db.query('SELECT * FROM users WHERE email = ?', [email]);
      return rows.length ? rows[0] : null;
    } catch (error) {
      throw error;
    }
  },

  // Create a new user
  create: async (userData) => {
    try {
      const { name, email, password, role } = userData;
      
      // Check for valid role
      const validRoles = Object.values(ROLES);
      if (!validRoles.includes(role)) {
        throw new Error("Invalid role specified");
      }
      
      // Check if user already exists
      const [existingUsers] = await db.query('SELECT * FROM users WHERE email = ?', [email]);
      if (existingUsers.length > 0) {
        throw new Error("Email already in use");
      }
      
      // Create the user
      const [result] = await db.query(
        'INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)',
        [name, email, password, role]
      );
      
      return { id: result.insertId, name, email, role };
    } catch (error) {
      throw error;
    }
  },

  // Get all users
  getAll: async () => {
    try {
      const [rows] = await db.query('SELECT id, name, email, role FROM users');
      return rows;
    } catch (error) {
      throw error;
    }
  },

  // Find user by ID
  findById: async (id) => {
    try {
      const [rows] = await db.query('SELECT id, name, email, role FROM users WHERE id = ?', [id]);
      return rows.length ? rows[0] : null;
    } catch (error) {
      throw error;
    }
  },

  // Update user
  update: async (id, updateData) => {
    try {
      const { name, email, role } = updateData;
      const [result] = await db.query(
        'UPDATE users SET name = ?, email = ?, role = ? WHERE id = ?',
        [name, email, role, id]
      );
      return result.affectedRows > 0;
    } catch (error) {
      throw error;
    }
  },

  // Delete user
  delete: async (id) => {
    try {
      const [result] = await db.query('DELETE FROM users WHERE id = ?', [id]);
      return result.affectedRows > 0;
    } catch (error) {
      throw error;
    }
  }
};

// Admin operations
const adminModel = {
  // Find admin by email
  findByEmail: async (email) => {
    try {
      const [rows] = await db.query('SELECT * FROM admins WHERE email = ?', [email]);
      return rows.length ? rows[0] : null;
    } catch (error) {
      throw error;
    }
  },

  // Create a new admin
  create: async (adminData) => {
    try {
      const { name, email, password, role } = adminData;
      
      // Validate admin role
      if (role !== ROLES.SITE_ADMIN && role !== ROLES.COLLEGE_ADMIN) {
        throw new Error("Invalid admin role");
      }
      
      // Check if admin already exists
      const [existingAdmins] = await db.query('SELECT * FROM admins WHERE email = ?', [email]);
      if (existingAdmins.length > 0) {
        throw new Error("Email already in use");
      }
      
      // Hash password
      const hashedPassword = await bcrypt.hash(password, 10);
      
      // Create the admin
      const [result] = await db.query(
        'INSERT INTO admins (name, email, password, role) VALUES (?, ?, ?, ?)',
        [name, email, hashedPassword, role]
      );
      
      return { id: result.insertId, name, email, role };
    } catch (error) {
      throw error;
    }
  },

  // Get all admins
  getAll: async () => {
    try {
      const [rows] = await db.query('SELECT id, name, email, role FROM admins');
      return rows;
    } catch (error) {
      throw error;
    }
  }
};

module.exports = {
  userModel,
  adminModel
};