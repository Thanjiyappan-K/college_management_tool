import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./Home.css";

const LoadingAnimation = () => {
  return (
    <div className="loading-container">
      <div className="loading-circle"></div>
      <div className="loading-text">
        <span>L</span>
        <span>O</span>
        <span>A</span>
        <span>D</span>
        <span>I</span>
        <span>N</span>
        <span>G</span>
      </div>
    </div>
  );
};

const Home = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [showContent, setShowContent] = useState(false);

  useEffect(() => {
    // Initial loading animation
    setTimeout(() => {
      setIsLoading(false);
    }, 2500);
    
    // Delay showing content for smooth transition
    setTimeout(() => {
      setShowContent(true);
    }, 3000);
  }, []);

  return (
    <>
      {isLoading && <LoadingAnimation />}
      
      <div className={`home-container ${showContent ? 'show' : ''}`}>
        <header className="home-header">
          <h1 className="animate-in">Welcome to Our Platform</h1>
          <p className="animate-in">Select your role to proceed</p>
          <div className="credentials-container animate-in">
            <div className="credential-group">
              <h2>Admin</h2>
              <div className="credential-item">
                <span>admin@gmail.com</span>
                <span>1234567</span>
              </div>
            </div>
            
            <div className="credential-group">
              <h2>User</h2>
              <div className="credential-item">
                <span>students@gmail.com</span>
                <span>1234567</span>
              </div>
              <div className="credential-item">
                <span>teachers@gmail.com</span>
                <span>1234567</span>
              </div>
            </div>
          </div>
        </header>

        <div className="user-selection animate-in">
          <button 
            className="btn admin-btn" 
            onClick={() => {
              document.querySelector('.home-container').classList.add('fade-out');
              setTimeout(() => navigate("/login"), 600);
            }}
          >
            Admin Login
          </button>
          <button 
            className="btn user-btn" 
            onClick={() => {
              document.querySelector('.home-container').classList.add('fade-out');
              setTimeout(() => navigate("/loginuser"), 600);
            }}
          >
            User Login
          </button>
        </div>

        <footer className="home-footer animate-in">
          <p>&copy; {new Date().getFullYear()} Your Company. All Rights Reserved.</p>
        </footer>
      </div>
    </>
  );
};

export default Home;