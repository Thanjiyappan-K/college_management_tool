import React, { useState, useEffect } from "react";
import axios from "axios";
import "./AddUser.css";

const AddUser = () => {
  const [users, setUsers] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showUsers, setShowUsers] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    role: "student" // Default role
  });
  const [errors, setErrors] = useState({});
  const [message, setMessage] = useState({ text: "", type: "" });

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setIsLoading(true);
      const res = await axios.get("http://localhost:5000/users");
      setUsers(res.data);
    } catch (err) {
      console.error("Failed to fetch users", err);
      setMessage({ text: "Failed to load users", type: "error" });
    } finally {
      setIsLoading(false);
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.name) newErrors.name = "Name is required";
    if (!formData.email) {
      newErrors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Email is invalid";
    }
    
    if (!formData.password) {
      newErrors.password = "Password is required";
    } else if (formData.password.length < 6) {
      newErrors.password = "Password must be at least 6 characters";
    }
    
    if (!formData.role) newErrors.role = "Role is required";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ 
      ...formData, 
      [name]: value 
    });
    
    // Clear specific error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: undefined
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setIsLoading(true);
    try {
      // const res = await axios.post("http://localhost:5000/create-user", formData);
      const res = await axios.post("https://college-management-tool-2.onrender.com/create-user", formData);
      
      // Show success message
      setMessage({ text: res.data.message, type: "success" });
      
      // Reset form
      setFormData({
        name: "",
        email: "",
        password: "",
        role: "student"
      });
      
      // Refresh user list
      fetchUsers();
      
      // Clear message after 3 seconds
      setTimeout(() => {
        setMessage({ text: "", type: "" });
      }, 3000);
    } catch (err) {
      console.error("Failed to create user", err);
      setMessage({ 
        text: err.response?.data?.message || "Failed to create user", 
        type: "error" 
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="add-user-container">
      <form onSubmit={handleSubmit} className="user-form">
        <h2>Add New User</h2>
        
        {message.text && (
          <div className={`message ${message.type}`}>
            {message.text}
          </div>
        )}
        
        <div className="form-group">
          <label>Name</label>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            placeholder="Enter name"
          />
          {errors.name && <p className="error">{errors.name}</p>}
        </div>
        
        <div className="form-group">
          <label>Email</label>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            placeholder="Enter email"
          />
          {errors.email && <p className="error">{errors.email}</p>}
        </div>
        
        <div className="form-group">
          <label>Password</label>
          <input
            type="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            placeholder="Enter password"
          />
          {errors.password && <p className="error">{errors.password}</p>}
        </div>
        
        <div className="form-group">
          <label>Role</label>
          <select
            name="role"
            value={formData.role}
            onChange={handleChange}
          >
            <option value="student">Student</option>
            <option value="teacher">Teacher</option>
            <option value="college_admin">College Admin</option>
            <option value="site_admin">Site Admin</option>
          </select>
          {errors.role && <p className="error">{errors.role}</p>}
        </div>
        
        <button 
          type="submit" 
          disabled={isLoading}
          className="submit-btn"
        >
          {isLoading ? "Adding..." : "Add User"}
        </button>
      </form>

      <div className="user-list-section">
        <button 
          onClick={() => setShowUsers(!showUsers)}
          className="toggle-users-btn"
        >
          {showUsers ? "Hide Users" : "Show Users"}
        </button>

        {showUsers && (
          <div className="user-list">
            <h3>Registered Users</h3>
            {isLoading ? (
              <p>Loading users...</p>
            ) : users.length === 0 ? (
              <p>No users found</p>
            ) : (
              <table>
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Email</th>
                    <th>Role</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((user) => (
                    <tr key={user.id}>
                      <td>{user.name}</td>
                      <td>{user.email}</td>
                      <td>{user.role}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default AddUser;