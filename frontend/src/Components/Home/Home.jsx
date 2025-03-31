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
        <h1>hello</h1>
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
