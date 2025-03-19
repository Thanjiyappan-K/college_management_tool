import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";


const UserLogin = () => {
  let Navigate = useNavigate();
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const res = await axios.post("http://localhost:5000/user", formData);
      localStorage.setItem("token", res.data.token);
      alert(res.data.message);
      Navigate("/teacher");

      }
     catch (err) {
      alert("Login failed");
    } finally {
      setIsLoading(false);
    }
  };
  const containerStyle = {
    minHeight: "100vh",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    background: "linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)",
    padding: "20px"
  };

  const formContainerStyle = {
    maxWidth: "450px",
    width: "100%",
    backgroundColor: "#ffffff",
    padding: "40px",
    borderRadius: "10px",
    boxShadow: "0 15px 30px rgba(0, 0, 0, 0.1)",
    transition: "transform 0.3s ease-in-out",
    animation: "fadeIn 0.5s"
  };

  const headerStyle = {
    textAlign: "center",
    marginBottom: "30px"
  };

  const titleStyle = {
    fontSize: "28px",
    color: "#333",
    fontWeight: "700",
    marginBottom: "10px"
  };

  const subtitleStyle = {
    fontSize: "14px",
    color: "#666",
    marginBottom: "20px"
  };

  const formStyle = {
    display: "flex",
    flexDirection: "column",
    gap: "20px"
  };

  const formGroupStyle = {
    position: "relative"
  };

  const labelStyle = {
    display: "block",
    marginBottom: "8px",
    fontSize: "14px",
    color: "#333",
    fontWeight: "600"
  };

  const inputStyle = {
    width: "100%",
    padding: "12px 15px",
    borderRadius: "8px",
    border: "1px solid #ddd",
    fontSize: "16px",
    color: "#333",
    backgroundColor: "#f9f9f9",
    transition: "border-color 0.3s, box-shadow 0.3s"
  };

  const buttonStyle = {
    backgroundColor: "#4f46e5",
    color: "#ffffff",
    padding: "14px 24px",
    border: "none",
    borderRadius: "8px",
    fontSize: "16px",
    fontWeight: "600",
    cursor: "pointer",
    transition: "background-color 0.3s",
    position: "relative",
    overflow: "hidden",
    marginTop: "15px"
  };

  const linkStyle = {
    color: "#4f46e5",
    textDecoration: "none",
    fontWeight: "600",
    transition: "color 0.3s"
  };

  const dividerStyle = {
    borderBottom: "2px solid #4f46e5",
    width: "60px",
    margin: "10px auto 20px"
  };

  const checkboxContainerStyle = {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: "10px"
  };

  const checkboxGroupStyle = {
    display: "flex",
    alignItems: "center",
    gap: "8px"
  };

  const checkboxStyle = {
    accentColor: "#4f46e5",
    width: "16px",
    height: "16px"
  };

  return (
    <div style={containerStyle}>
      <div style={formContainerStyle}>
        <div style={headerStyle}>
          <h2 style={titleStyle}>Sign In</h2>
          <div style={dividerStyle}></div>
          <p style={subtitleStyle}>
            Don't have an account?{" "}
            <a href="/register" style={linkStyle}>
              Create one now
            </a>
          </p>
        </div>
        
        <form style={formStyle} onSubmit={handleSubmit}>
          <div style={formGroupStyle}>
            <label htmlFor="email" style={labelStyle}>
              Email Address
            </label>
            <input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              required
              style={inputStyle}
              placeholder="Email"
              onChange={handleChange}
            />
          </div>
          
          <div style={formGroupStyle}>
            <label htmlFor="password" style={labelStyle}>
              Password
            </label>
            <input
              id="password"
              name="password"
              type="password"
              autoComplete="current-password"
              required
              style={inputStyle}
              placeholder="••••••••"
              onChange={handleChange}
            />
          </div>
          
          <div style={checkboxContainerStyle}>
            <div style={checkboxGroupStyle}>
              <input
                id="remember"
                name="remember"
                type="checkbox"
                style={checkboxStyle}
              />
              <label htmlFor="remember" style={{fontSize: "14px", color: "#555"}}>
                Remember me
              </label>
            </div>
            <a href="/forgot-password" style={{...linkStyle, fontSize: "14px"}}>
              Forgot password?
            </a>
          </div>
          
          <button
            type="submit"
            disabled={isLoading}
            style={{
              ...buttonStyle,
              backgroundColor: isLoading ? "#6c63ff" : "#4f46e5",
              cursor: isLoading ? "not-allowed" : "pointer"
            }}
          >
            {isLoading ? "Signing in..." : "Sign in"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default UserLogin;