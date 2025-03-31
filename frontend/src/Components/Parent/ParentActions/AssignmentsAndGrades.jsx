import React from "react";
import "../ParentDashboard.css";
const AssignmentsAndGrades = ({ childData }) => (
    <div className="assignments-container">
      <h2>Assignments & Grades for {childData.name}</h2>
      
      <div className="recent-assignments">
        <h3>Recent Assignments</h3>
        <div className="assignment-list">
          <div className="assignment-card">
            <div className="assignment-header">
              <h4>Mathematics Project</h4>
              <span className="assignment-status">Submitted</span>
            </div>
            <p><strong>Course:</strong> Advanced Mathematics</p>
            <p><strong>Due Date:</strong> March 20, 2025</p>
            <p><strong>Grade:</strong> A (95%)</p>
          </div>
          <div className="assignment-card">
            <div className="assignment-header">
              <h4>Computer Science Coding Task</h4>
              <span className="assignment-status">Graded</span>
            </div>
            <p><strong>Course:</strong> Computer Science</p>
            <p><strong>Due Date:</strong> March 15, 2025</p>
            <p><strong>Grade:</strong> A- (90%)</p>
          </div>
        </div>
      </div>
      
      <div className="grade-summary">
        <h3>Grade Summary</h3>
        <table className="grade-table">
          <thead>
            <tr>
              <th>Course</th>
              <th>Current Grade</th>
              <th>GPA</th>
            </tr>
          </thead>
          <tbody>
            {childData.classes.map((course, index) => (
              <tr key={index}>
                <td>{course.name}</td>
                <td>{course.grade}</td>
                <td>{['3.9', '3.7', '3.5'][index]}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
  export default AssignmentsAndGrades;