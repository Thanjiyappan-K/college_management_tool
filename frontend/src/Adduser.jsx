import React, { useState, useEffect } from "react";
import axios from "axios";

const Adduser = () => {
  const [users, setUsers] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showUsers, setShowUsers] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    role: "student"
  });

  // Fetch users on component mount
  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setIsLoading(true);
      const token = localStorage.getItem("token");
      const res = await axios.get("http://localhost:5000/users", {
        headers: { Authorization: `Bearer ${token}` }
      });
      setUsers(res.data);
      setIsLoading(false);
    } catch (err) {
      console.error("Failed to fetch users", err);
      setIsLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const token = localStorage.getItem("token");
      const res = await axios.post(
        "http://localhost:5000/create-user",
        formData,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      alert(res.data.message);
      setFormData({ name: "", email: "", password: "", role: "student" });
      fetchUsers(); // Refresh user list
    } catch (err) {
      alert("Failed to create user");
    } finally {
      setIsLoading(false);
    }
  };

  const toggleUsersList = () => {
    setShowUsers(!showUsers);
    if (!showUsers) {
      fetchUsers(); // Refresh users when showing the list
    }
  };

  return (
    <div style={styles.dashboard}>
      <div style={styles.container}>
        <header style={styles.header}>
          <h1 style={styles.heading}>College Admin Dashboard</h1>
          <p style={styles.subheading}>Manage users and access control</p>
        </header>

        {/* User Registration Form */}
        <div style={styles.card}>
          <h2 style={styles.cardTitle}>Add New User</h2>
          <form style={styles.form} onSubmit={handleSubmit}>
            <div style={styles.inputGroup}>
              <label style={styles.label}>Name</label>
              <input 
                style={styles.input} 
                type="text" 
                name="name" 
                placeholder="Enter full name" 
                value={formData.name} 
                onChange={handleChange} 
                required 
              />
            </div>
            <div style={styles.inputGroup}>
              <label style={styles.label}>Email</label>
              <input 
                style={styles.input} 
                type="email" 
                name="email" 
                placeholder="Enter email address" 
                value={formData.email} 
                onChange={handleChange} 
                required 
              />
            </div>
            <div style={styles.inputGroup}>
              <label style={styles.label}>Password</label>
              <input 
                style={styles.input} 
                type="password" 
                name="password" 
                placeholder="Enter password" 
                value={formData.password} 
                onChange={handleChange} 
                required 
              />
            </div>
            <div style={styles.inputGroup}>
              <label style={styles.label}>Role</label>
              <select 
                style={styles.select} 
                name="role" 
                value={formData.role} 
                onChange={handleChange}
              >
                <option value="student">Student</option>
                <option value="teacher">Teacher</option>
                <option value="admin">Admin</option>
              </select>
            </div>
            <button 
              type="submit" 
              style={styles.submitButton} 
              disabled={isLoading}
            >
              {isLoading ? "Adding..." : "Add User"}
            </button>
          </form>
        </div>

        {/* User List Section */}
        <div style={styles.card}>
          <div style={styles.userListHeader}>
            <h2 style={styles.cardTitle}>Registered Users</h2>
            <button 
              onClick={toggleUsersList} 
              style={styles.toggleButton}
            >
              {showUsers ? "Hide Users" : "Show Users"}
            </button>
          </div>
          
          {isLoading && <div style={styles.loader}>Loading users...</div>}
          
          {showUsers && !isLoading && (
            <div style={styles.tableContainer}>
              <table style={styles.table}>
                <thead>
                  <tr>
                    <th style={styles.tableHeader}>Name</th>
                    <th style={styles.tableHeader}>Email</th>
                    <th style={styles.tableHeader}>Role</th>
                  </tr>
                </thead>
                <tbody>
                  {users.length > 0 ? (
                    users.map((user) => (
                      <tr key={user.id} style={styles.tableRow}>
                        <td style={styles.tableCell}>{user.name}</td>
                        <td style={styles.tableCell}>{user.email}</td>
                        <td style={styles.tableCell}>
                          <span style={{
                            ...styles.badge,
                            backgroundColor: 
                              user.role === "admin" ? "#ff5722" : 
                              user.role === "teacher" ? "#2196f3" : "#4caf50"
                          }}>
                            {user.role}
                          </span>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="3" style={styles.emptyMessage}>No users found</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// Enhanced Styles
const styles = {
  dashboard: {
    minHeight: "100vh",
    backgroundColor: "#f5f7fa",
    padding: "20px",
    fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif"
  },
  container: {
    maxWidth: "1200px",
    margin: "0 auto",
  },
  header: {
    textAlign: "center",
    marginBottom: "40px",
    padding: "20px",
    borderRadius: "10px",
    backgroundColor: "#fff",
    boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
    border: "1px solid #e0e0e0"
  },
  heading: {
    color: "#333",
    fontSize: "32px",
    margin: "0 0 10px 0"
  },
  subheading: {
    color: "#666",
    fontSize: "16px",
    margin: 0
  },
  card: {
    backgroundColor: "#fff",
    borderRadius: "10px",
    boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
    padding: "25px",
    marginBottom: "30px",
    border: "1px solid #e0e0e0"
  },
  cardTitle: {
    color: "#333",
    fontSize: "20px",
    marginTop: 0,
    marginBottom: "20px",
    borderBottom: "2px solid #f0f0f0",
    paddingBottom: "10px"
  },
  form: {
    display: "flex",
    flexDirection: "column",
    maxWidth: "500px",
    margin: "0 auto",
    gap: "15px"
  },
  inputGroup: {
    display: "flex",
    flexDirection: "column",
    gap: "5px"
  },
  label: {
    fontSize: "14px",
    fontWeight: "bold",
    color: "#555",
    textAlign: "left"
  },
  input: {
    padding: "12px",
    borderRadius: "5px",
    border: "1px solid #ddd",
    fontSize: "14px",
    transition: "border 0.3s ease",
    outline: "none",
    ":focus": {
      border: "1px solid #4285f4"
    }
  },
  select: {
    padding: "12px",
    borderRadius: "5px",
    border: "1px solid #ddd",
    fontSize: "14px",
    backgroundColor: "#fff",
    cursor: "pointer"
  },
  submitButton: {
    padding: "12px",
    backgroundColor: "#4285f4",
    color: "white",
    border: "none",
    borderRadius: "5px",
    fontSize: "16px",
    fontWeight: "bold",
    cursor: "pointer",
    transition: "background-color 0.3s ease",
    marginTop: "10px",
    ":hover": {
      backgroundColor: "#3367d6"
    },
    ":disabled": {
      backgroundColor: "#95b8f6",
      cursor: "not-allowed"
    }
  },
  userListHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "20px"
  },
  toggleButton: {
    padding: "10px 15px",
    backgroundColor: "#ff5722",
    color: "white",
    border: "none",
    borderRadius: "5px",
    fontSize: "14px",
    fontWeight: "bold",
    cursor: "pointer",
    transition: "background-color 0.3s ease",
    ":hover": {
      backgroundColor: "#e64a19"
    }
  },
  tableContainer: {
    overflowX: "auto"
  },
  table: {
    width: "100%",
    borderCollapse: "separate",
    borderSpacing: "0",
    borderRadius: "5px",
    overflow: "hidden"
  },
  tableHeader: {
    backgroundColor: "#f5f5f5",
    padding: "15px",
    textAlign: "left",
    fontSize: "14px",
    fontWeight: "bold",
    color: "#333",
    borderBottom: "2px solid #ddd"
  },
  tableRow: {
    transition: "background-color 0.2s ease",
    ":hover": {
      backgroundColor: "#f9f9f9"
    }
  },
  tableCell: {
    padding: "15px",
    borderBottom: "1px solid #eee",
    color: "#666",
    fontSize: "14px"
  },
  badge: {
    padding: "5px 10px",
    borderRadius: "20px",
    color: "white",
    fontWeight: "bold",
    fontSize: "12px",
    display: "inline-block"
  },
  loader: {
    textAlign: "center",
    padding: "20px",
    color: "#666"
  },
  emptyMessage: {
    textAlign: "center",
    padding: "20px",
    color: "#666",
    fontStyle: "italic"
  }
};

export default Adduser;