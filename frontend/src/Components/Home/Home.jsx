import React from "react";
import { useNavigate } from "react-router-dom";
import "./Home.css";

const Home = () => {
  const navigate = useNavigate();

  return (
    <div className="home-container">
      <header className="home-header">
        <h1>Welcome to Our Platform</h1>
        <p>Select your role to proceed</p>
        <h2>credentials</h2>
        <h3>admin@gmail.com </h3>
        <h3>1234567</h3>

        <h2>user</h2>
        <h3>students@gmail.com  - 1234567</h3>
        <h3>teachers@gmail.com - 1234567 </h3>
      </header>

      <div className="user-selection">
        <button className="btn admin-btn" onClick={() => navigate("/login")}>
          Admin Login
        </button>
        <button className="btn user-btn" onClick={() => navigate("/loginuser")}>
          User Login
        </button>
      </div>

      <footer className="home-footer">
        <p>&copy; {new Date().getFullYear()} Your Company. All Rights Reserved.</p>
      </footer>
    </div>
  );
};

export default Home;
