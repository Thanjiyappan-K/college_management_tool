import React from "react";
import "../studentactions/StudentCss/Saveethasite.css";

const sites = [
  {
    title: "Database Design Project",
    link: "https://example.com/database-project"
  },
  {
    title: "LMS2 AI SAVEETHA",
    link: "https://lms2.ai.saveetha.in/"
  },
  {
    title: "Database Design Project",
    link: "https://example.com/database-project"
  },
  {
    title: "LMS2 AI SAVEETHA",
    link: "https://lms2.ai.saveetha.in/"
  },
  {
    title: "Database Design Project",
    link: "https://example.com/database-project"
  },
  {
    title: "LMS2 AI SAVEETHA",
    link: "https://lms2.ai.saveetha.in/"
  },
  {
    title: "Database Design Project",
    link: "https://example.com/database-project"
  },
  {
    title: "LMS2 AI SAVEETHA",
    link: "https://lms2.ai.saveetha.in/"
  },
];

const SaveethaSites = () => (
  <div className="sites-container">
    <h2>Sites</h2>
    <div className="sites-list">
      {sites.map((site, index) => (
        <div 
          key={index} 
          className="site-card" 
          onClick={() => window.open(site.link, "_blank")}
          style={{ cursor: "pointer" }}
        >
          <h3>{site.title}</h3>
        </div>
      ))}
    </div>
  </div>
);

export default SaveethaSites;
