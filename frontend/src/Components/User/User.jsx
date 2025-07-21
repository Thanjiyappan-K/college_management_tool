import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "../User/userlogin.css"; 

const UserLogin = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError(""); // Clear any previous errors
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      const res = await axios.post("https://college-management-tool-2.onrender.com/loginuser", formData);

      // Store user information in localStorage
      localStorage.setItem("userRole", res.data.role);
      localStorage.setItem("userName", res.data.name);
      localStorage.setItem("userId", res.data.userId);
      localStorage.setItem("userToken", res.data.token || "");

      // Show success message
      alert(res.data.message);

      // Navigate to the appropriate dashboard
      navigate(res.data.redirectTo);
    } catch (err) {
      // Handle different types of errors
      if (err.response) {
        setError(err.response.data.message || "Login failed");
      } else {
        setError("Network error. Please try again.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container">
      <div className="form-container">
        <div className="header">
          <h2 className="title">Sign In</h2>
          <div className="divider"></div>
          <p className="subtitle">
            Don't have an account?{" "}
            <a href="/register" className="link">
              Create one now
            </a>
          </p>
        </div>

        {error && <div className="error-message">{error}</div>}

        <form className="form" onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="email" className="label">
              Email Address
            </label>
            <input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              required
              className="input"
              placeholder="Email"
              onChange={handleChange}
              value={formData.email}
            />
          </div>

          <div className="form-group">
            <label htmlFor="password" className="label">
              Password
            </label>
            <input
              id="password"
              name="password"
              type="password"
              autoComplete="current-password"
              required
              className="input"
              placeholder="••••••••"
              onChange={handleChange}
              value={formData.password}
            />
          </div>

          <div className="checkbox-container">
            <div className="checkbox-group">
              <input id="remember" name="remember" type="checkbox" className="checkbox" />
              <label htmlFor="remember">Remember me</label>
            </div>
            <a href="/forgot-password" className="link">
              Forgot password?
            </a>
          </div>

          <button type="submit" disabled={isLoading} className="button">
            {isLoading ? "Signing in..." : "Sign in"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default UserLogin;