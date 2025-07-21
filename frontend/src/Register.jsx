import React, { useState } from "react";
import axios from "axios";

const Register = () => {
  const [formData, setFormData] = useState({ 
    name: "", 
    email: "", 
    password: "", 
    role: "site_admin" 
  });
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      // const res = await axios.post("http://localhost:5000/register", formData);
      const res = await axios.post("https://college-management-tool-2.onrender.com/register", formData);
      alert(res.data.message);
    } catch (err) {
      alert("Registration failed");
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

  const selectStyle = {
    ...inputStyle,
    appearance: "none",
    backgroundImage: "url('data:image/svg+xml;charset=US-ASCII,<svg xmlns=\"http://www.w3.org/2000/svg\" width=\"24\" height=\"24\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\" stroke-linecap=\"round\" stroke-linejoin=\"round\"><path d=\"M6 9l6 6 6-6\"/></svg>')",
    backgroundRepeat: "no-repeat",
    backgroundPosition: "right 10px center",
    backgroundSize: "20px"
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

  return (
    <div style={containerStyle}>
      <div style={formContainerStyle}>
        <div style={headerStyle}>
          <h2 style={titleStyle}>Create Your Account</h2>
          <div style={dividerStyle}></div>
          <p style={subtitleStyle}>
            Already have an account?{" "}
            <a href="/login" style={linkStyle}>
              Sign in instead
            </a>
          </p>
        </div>
        
        <form style={formStyle} onSubmit={handleSubmit}>
          <div style={formGroupStyle}>
            <label htmlFor="name" style={labelStyle}>
              Full Name
            </label>
            <input
              id="name"
              name="name"
              type="text"
              autoComplete="name"
              required
              style={inputStyle}
              placeholder="John Doe"
              onChange={handleChange}
            />
          </div>
          
          <div style={formGroupStyle}>
            <label htmlFor="email-address" style={labelStyle}>
              Email Address
            </label>
            <input
              id="email-address"
              name="email"
              type="email"
              autoComplete="email"
              required
              style={inputStyle}
              placeholder="john@example.com"
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
              autoComplete="new-password"
              required
              style={inputStyle}
              placeholder="••••••••"
              onChange={handleChange}
            />
          </div>
          
          <div style={formGroupStyle}>
            <label htmlFor="role" style={labelStyle}>
              Role
            </label>
            <select
              id="role"
              name="role"
              required
              style={selectStyle}
              onChange={handleChange}
              defaultValue="site_admin"
            >
              <option value="site_admin">Site Admin</option>
              <option value="college_admin">College Admin</option>
            </select>
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
            {isLoading ? "Creating account..." : "Create account"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Register;