const db = require('../config/db');
const bcrypt = require('bcryptjs');

const initializeDatabase = async () => {
  try {
    console.log("Initializing database...");
    
    // Create admins table if not exists
    await db.query(`
      CREATE TABLE IF NOT EXISTS admins (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        email VARCHAR(255) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        role ENUM('site_admin', 'college_admin') NOT NULL
      )
    `);
    console.log("Admins table ensured");

    // Create users table if not exists
    await db.query(`
      CREATE TABLE IF NOT EXISTS users (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        email VARCHAR(255) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        role ENUM('student', 'teacher', 'college_admin', 'site_admin') NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log("Users table ensured");

    // Check if default admin exists
    const [existingAdmin] = await db.query(
      "SELECT * FROM admins WHERE email = 'admin@example.com'"
    );

    // If no default admin, create one
    if (existingAdmin.length === 0) {
      const hashedPwd = await bcrypt.hash("admin123", 10);
      await db.query(
        "INSERT INTO admins (name, email, password, role) VALUES (?, ?, ?, ?)",
        ["Super Admin", "admin@example.com", hashedPwd, "site_admin"]
      );
      console.log("Default admin created");
    } else {
      console.log("Default admin already exists");
    }

  } catch (error) {
    console.error("Database initialization error:", error);
    process.exit(1);
  }
};

module.exports = {
  initializeDatabase
};