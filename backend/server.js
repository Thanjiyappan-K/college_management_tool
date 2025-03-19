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


// Protected route to get users
app.get("/users", verifyToken, (req, res) => {
  const sql = "SELECT id, name, email, role FROM admins";
  db.query(sql, (err, results) => {
    if (err) return res.status(500).json({ message: "Error fetching users" });
    res.json(results);
  });
});


// Protected route to create user
app.post("/create-user", verifyToken, async (req, res) => {
  const { name, email, password, role } = req.body;
  const hashedPassword = await bcrypt.hash(password, 10);
  const sql = "INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)";
  
  db.query(sql, [name, email, hashedPassword, role], (err, result) => {
    if (err) return res.status(500).json({ message: "Error creating user" });
    res.json({ message: "User added successfully" });
  });
});

app.listen(5000, () => console.log("Server running on port 5000"));
