import React from "react";
import "../TeacherDashboard.css";

const MyClasses = () => (
    <div className="classes-container">
      <h2>My Classes</h2>
      <div className="class-cards">
        <div className="class-card">
          <h3>Introduction to Computer Science</h3>
          <p><strong>Course Code:</strong> CS101</p>
          <p><strong>Schedule:</strong> Mon, Wed, Fri 10:00 AM - 11:30 AM</p>
          <p><strong>Room:</strong> B-204</p>
          <p><strong>Students:</strong> 32</p>
          <div className="class-actions">
            <button className="btn-primary">View Students</button>
            <button className="btn-secondary">Upload Materials</button>
            <button className="btn-secondary">View Syllabus</button>
          </div>
        </div>
        
        <div className="class-card">
          <h3>Data Structures</h3>
          <p><strong>Course Code:</strong> CS201</p>
          <p><strong>Schedule:</strong> Tue, Thu 1:00 PM - 3:00 PM</p>
          <p><strong>Room:</strong> A-105</p>
          <p><strong>Students:</strong> 28</p>
          <div className="class-actions">
            <button className="btn-primary">View Students</button>
            <button className="btn-secondary">Upload Materials</button>
            <button className="btn-secondary">View Syllabus</button>
          </div>
        </div>
        
        <div className="class-card">
          <h3>Web Development</h3>
          <p><strong>Course Code:</strong> CS305</p>
          <p><strong>Schedule:</strong> Mon, Wed 2:00 PM - 4:00 PM</p>
          <p><strong>Room:</strong> Lab C</p>
          <p><strong>Students:</strong> 25</p>
          <div className="class-actions">
            <button className="btn-primary">View Students</button>
            <button className="btn-secondary">Upload Materials</button>
            <button className="btn-secondary">View Syllabus</button>
          </div>
        </div>
      </div>
    </div>
  );
  export default MyClasses;
  