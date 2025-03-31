import React from 'react';
import "../TeacherDashboard.css";



const AssignmentsGrading = () => (
    <div className="assignments-container">
      <h2>Assignments & Grading</h2>
      
      <div className="tabs">
        <button className="tab active">Assignments</button>
        <button className="tab">Gradebook</button>
      </div>
      
      <div className="assignments-section">
        <div className="section-header">
          <h3>Current Assignments</h3>
          <button className="btn-primary">Create New Assignment</button>
        </div>
        
        <div className="assignment-cards">
          <div className="assignment-card">
            <div className="assignment-header">
              <h4>Database Design Project</h4>
              <span className="assignment-status">Active</span>
            </div>
            <p><strong>Class:</strong> Data Structures (CS201)</p>
            <p><strong>Due Date:</strong> March 25, 2025</p>
            <p><strong>Submissions:</strong> 15/28</p>
            <p><strong>Description:</strong> Design a normalized database schema for a library management system...</p>
            <div className="assignment-actions">
              <button className="btn-primary">View Submissions</button>
              <button className="btn-secondary">Edit Assignment</button>
              <button className="btn-secondary">Download All</button>
            </div>
          </div>
          
          <div className="assignment-card">
            <div className="assignment-header">
              <h4>JavaScript Quiz</h4>
              <span className="assignment-status">Due Soon</span>
            </div>
            <p><strong>Class:</strong> Web Development (CS305)</p>
            <p><strong>Due Date:</strong> March 21, 2025</p>
            <p><strong>Submissions:</strong> 20/25</p>
            <p><strong>Description:</strong> Online quiz covering JavaScript fundamentals, DOM manipulation, and event handling.</p>
            <div className="assignment-actions">
              <button className="btn-primary">View Submissions</button>
              <button className="btn-secondary">Edit Assignment</button>
              <button className="btn-secondary">Send Reminder</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
  export default AssignmentsGrading;