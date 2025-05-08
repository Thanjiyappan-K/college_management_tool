require("dotenv").config();
import express, { json } from "express";
import { createConnection } from "mysql2";
import cors from "cors";
import { hash, compare } from "bcryptjs";
import { sign } from "jsonwebtoken";

const app = express();
app.use(json());
app.use(cors());

// Environment check
if (!process.env.JWT_SECRET) {
  console.error("JWT_SECRET is not defined in .env file");
  process.exit(1);
}

// MySQL DB Connection
const db = createConnection({
  host: "localhost",
  user: "root",
  password: "thanji830",
  database: "collegetool",
});

db.connect((err) => {
  if (err) throw err;
  console.log("Connected to MySQL Database");
  initializeDatabase(); // Ensure tables and default admin
});

// Create tables if they don't exist
const initializeDatabase = () => {
  const createAdminsTable = `
    CREATE TABLE IF NOT EXISTS admins (
      id INT AUTO_INCREMENT PRIMARY KEY,
      name VARCHAR(255) NOT NULL,
      email VARCHAR(255) UNIQUE NOT NULL,
      password VARCHAR(255) NOT NULL,
      role ENUM('site_admin', 'college_admin') NOT NULL
    )
  `;

  const createUsersTable = `
    CREATE TABLE IF NOT EXISTS users (
      id INT AUTO_INCREMENT PRIMARY KEY,
      name VARCHAR(255) NOT NULL,
      email VARCHAR(255) UNIQUE NOT NULL,
      password VARCHAR(255) NOT NULL,
      role ENUM('student', 'teacher', 'college_admin', 'site_admin') NOT NULL
    )
  `;

  db.query(createAdminsTable, (err) => {
    if (err) console.error("Error creating admins table:", err);
    else console.log("Admins table ensured");
  });

  db.query(createUsersTable, (err) => {
    if (err) console.error("Error creating users table:", err);
    else console.log("Users table ensured");
  });

  // Insert default site admin if not exists
  const insertDefaultAdmin = `
    INSERT INTO admins (name, email, password, role)
    SELECT * FROM (SELECT 'Super Admin', 'admin@example.com', ?, 'site_admin') AS tmp
    WHERE NOT EXISTS (
      SELECT email FROM admins WHERE email = 'admin@example.com'
    ) LIMIT 1
  `;

  hash("admin123", 10).then((hashedPwd) => {
    db.query(insertDefaultAdmin, [hashedPwd], (err) => {
      if (err) console.error("Error inserting default admin:", err);
      else console.log("Default admin ensured");
    });
  });
};

// Middleware to verify JWT
// const verifyToken = (req, res, next) => {
//   const token = req.headers["authorization"]?.split(" ")[1];
//   if (!token) return res.status(403).json({ message: "No token provided" });

//   jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
//     if (err) return res.status(500).json({ message: "Invalid token" });
//     req.userId = decoded.id;
//     req.userRole = decoded.role;
//     next();
//   });
// };

// Register Admin
app.post("/register", async (req, res) => {
  const { name, email, password, role } = req.body;
  if (!["site_admin", "college_admin"].includes(role)) {
    return res.status(400).json({ message: "Invalid role" });
  }

  const hashedPassword = await hash(password, 10);
  const sql = "INSERT INTO admins (name, email, password, role) VALUES (?, ?, ?, ?)";
  db.query(sql, [name, email, hashedPassword, role], (err) => {
    if (err) return res.status(500).json({ message: "Error registering admin" });
    res.json({ message: "Admin registered successfully" });
  });
});

// Login Admin
app.post("/login", (req, res) => {
  const { email, password } = req.body;
  const sql = "SELECT * FROM admins WHERE email = ?";

  db.query(sql, [email], async (err, results) => {
    if (err || results.length === 0) return res.status(401).json({ message: "Invalid credentials" });

    const admin = results[0];
    const isMatch = await compare(password, admin.password);
    if (!isMatch) return res.status(401).json({ message: "Invalid credentials" });

    const token = sign({ id: admin.id, role: admin.role }, process.env.JWT_SECRET, { expiresIn: "1h" });
    res.json({ message: "Login successful", token });
  });
});

// Admin creates user
app.post("/create-user", (req, res) => {
  const { name, email, password, role } = req.body;

  if (!name || !email || !password || !role) {
    return res.status(400).json({ message: "All fields are required" });
  }

  const checkEmailSql = "SELECT * FROM users WHERE email = ?";
  db.query(checkEmailSql, [email], (err, results) => {
    if (err) return res.status(500).json({ message: "Server error" });

    if (results.length > 0) {
      return res.status(409).json({ message: "Email already in use" });
    }

    const insertSql = "INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)";
    db.query(insertSql, [name, email, password, role], (insertErr, result) => {
      if (insertErr) return res.status(500).json({ message: "Failed to create user" });

      res.status(201).json({
        message: "User created successfully",
        userId: result.insertId,
      });
    });
  });
});

// Fetch all users
app.get("/users", (req, res) => {
  const sql = "SELECT id, name, email, role FROM users";
  db.query(sql, (err, results) => {
    if (err) return res.status(500).json({ message: "Failed to fetch users" });
    res.json(results);
  });
});

// User Login
app.post("/loginuser", (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) return res.status(400).json({ message: "Email and password are required" });

  const sql = "SELECT * FROM users WHERE email = ?";
  db.query(sql, [email], (err, results) => {
    if (err) return res.status(500).json({ message: "Server error" });

    if (results.length === 0) return res.status(401).json({ message: "Invalid email or password" });

    const user = results[0];

    // You should hash and compare passwords in production
    if (user.password !== password) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    let redirectUrl = "/";
    switch (user.role) {
      case "site_admin":
      case "college_admin":
        redirectUrl = "/admin";
        break;
      case "teacher":
        redirectUrl = "/teacher";
        break;
      case "student":
        redirectUrl = "/student";
        break;
    }

    res.status(200).json({
      message: "Login successful",
      userId: user.id,
      name: user.name,
      role: user.role,
      redirectTo: redirectUrl,
    });
  });
});

// Start server
app.listen(5000, () => {
  console.log("Server running on port 5000");
});















// require('dotenv').config();
// const express = require('express');
// const cors = require('cors');
// const { initializeDatabase } = require('./utils/initDb');

// // Import routes
// const authRoutes = require('./routes/authRoutes');
// const userRoutes = require('./routes/userRoutes');
// const adminRoutes = require('./routes/adminRoutes');

// // Initialize express app
// const app = express();
// app.use(express.json());
// app.use(cors());

// // Initialize database
// initializeDatabase();

// // Routes
// app.use('/api/auth', authRoutes);
// app.use('/api/users', userRoutes);
// app.use('/api/admin', adminRoutes);

// // Start server
// const PORT = process.env.PORT || 5000;
// app.listen(PORT, () => {
//   console.log(`Server running on port ${PORT}`);
// });