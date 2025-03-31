require("dotenv").config();

// Add this check after dotenv config
if (!process.env.JWT_SECRET) {
  console.error("JWT_SECRET is not defined in .env file");
  process.exit(1);
}

const express = require("express");
const mysql = require("mysql2");
const cors = require("cors");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const app = express();
app.use(express.json());
app.use(cors());

const db = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "thanji830",
  database: "college_management",
});

db.connect((err) => {
  if (err) throw err;
  console.log("Connected to MySQL Database");
});

// Middleware to verify JWT token
const verifyToken = (req, res, next) => {
  const token = req.headers['authorization']?.split(' ')[1];
  if (!token) return res.status(403).json({ message: "No token provided" });

  jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
    if (err) return res.status(500).json({ message: "Failed to authenticate token" });
    req.userId = decoded.id;
    req.userRole = decoded.role;
    next();
  });
};

// Register Admin (Site or College)
app.post("/register", async (req, res) => {
  const { name, email, password, role } = req.body;
  if (!["site_admin", "college_admin"].includes(role)) {
    return res.status(400).json({ message: "Invalid role" });
  }

  const hashedPassword = await bcrypt.hash(password, 10);
  const sql = "INSERT INTO admins (name, email, password, role) VALUES (?, ?, ?, ?)";
  
  db.query(sql, [name, email, hashedPassword, role], (err, result) => {
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
    const isMatch = await bcrypt.compare(password, admin.password);
    if (!isMatch) return res.status(401).json({ message: "Invalid credentials" });

    const token = jwt.sign({ id: admin.id, role: admin.role }, process.env.JWT_SECRET, { expiresIn: "1h" });
    res.json({ message: "Login successful", token });
  });
});

//Admin Adding users
app.post("/create-user", (req, res) => {
  const { name, email, password, role } = req.body;
  
  // Basic validation
  if (!name || !email || !password || !role) {
    return res.status(400).json({ message: "All fields are required" });
  }
  
  // Check if email already exists
  const checkEmailSql = "SELECT * FROM users WHERE email = ?";
  db.query(checkEmailSql, [email], (err, results) => {
    if (err) {
      console.error("Database error:", err);
      return res.status(500).json({ message: "Server error" });
    }
    
    if (results.length > 0) {
      return res.status(409).json({ message: "Email already in use" });
    }
    
    // Email doesn't exist, proceed with insertion
    const insertSql = "INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)";
    db.query(insertSql, [name, email, password, role], (insertErr, result) => {
      if (insertErr) {
        console.error("Error creating user:", insertErr);
        return res.status(500).json({ message: "Failed to create user" });
      }
      
      return res.status(201).json({ 
        message: "User created successfully", 
        userId: result.insertId 
      });
    });
  });
});

// Endpoint to fetch all users
app.get("/users", (req, res) => {
  const sql = "SELECT id, name, email, role FROM users";
  
  db.query(sql, (err, results) => {
    if (err) {
      console.error("Error fetching users:", err);
      return res.status(500).json({ message: "Failed to fetch users" });
    }
    
    return res.json(results);
  });
});

// Login user endpoint
app.post("/loginuser", (req, res) => {
  const { email, password } = req.body;
  
  // Validate input
  if (!email || !password) {
    return res.status(400).json({ message: "Email and password are required" });
  }

  // Query to get user with the provided email
  const sql = "SELECT * FROM users WHERE email = ?";
  
  db.query(sql, [email], (err, results) => {
    if (err) {
      console.error("Database error:", err);
      return res.status(500).json({ message: "Server error" });
    }

    // Check if user exists
    if (results.length === 0) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    const user = results[0];
    
    // In a real application, you should hash passwords and verify them
    // For example, with bcrypt:
    // const passwordMatch = await bcrypt.compare(password, user.password);
    
    // For simplicity, we're doing a direct comparison here
    // Replace this with proper password verification in production
    if (user.password !== password) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    // Generate a JWT token for authentication (recommended)
    // const token = jwt.sign(
    //   { userId: user.id, role: user.role },
    //   process.env.JWT_SECRET || 'your_jwt_secret',
    //   { expiresIn: '1h' }
    // );
    
    // Determine redirect URL based on role
    let redirectUrl;
    switch (user.role) {
      case 'site_admin':
        redirectUrl = '/admin';
        break;
      case 'college_admin':
        redirectUrl = '/admin';
        break;
      case 'teacher':
        redirectUrl = '/teacher';
        break;
      case 'student':
        redirectUrl = '/student';
        break;
      default:
        redirectUrl = '/';
    }

    // Send response with user info and redirect URL
    return res.status(200).json({
      message: "Login successful",
      userId: user.id,
      name: user.name,
      role: user.role,
      // token: token, // Uncomment if using JWT
      redirectTo: redirectUrl
    });
  });
});
app.listen(5000, () => console.log("Server running on port 5000"));
