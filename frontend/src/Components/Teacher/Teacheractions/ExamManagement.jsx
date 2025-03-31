import React from "react";
import "../TeacherDashboard.css";

const ExamManagement = () => (
    <div className="exams-container">
      <h2>Exam Management</h2>
      
      <div className="upcoming-exams">
        <h3>Upcoming Exams</h3>
        <table className="exams-table">
          <thead>
            <tr>
              <th>Course</th>
              <th>Exam Title</th>
              <th>Date</th>
              <th>Time</th>
              <th>Location</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>CS101</td>
              <td>Midterm Examination</td>
              <td>March 26, 2025</td>
              <td>10:00 AM - 12:00 PM</td>
              <td>Hall A</td>
              <td>
                <button className="btn-small">View Details</button>
                <button className="btn-small">Download Paper</button>
              </td>
            </tr>
            <tr>
              <td>CS305</td>
              <td>Practical Assessment</td>
              <td>March 29, 2025</td>
              <td>2:00 PM - 5:00 PM</td>
              <td>Computer Lab B</td>
              <td>
                <button className="btn-small">View Details</button>
                <button className="btn-small">Download Paper</button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      
      <div className="grade-submission">
        <h3>Grade Submission</h3>
        <div className="form-group">
          <label>Select Course:</label>
          <select>
            <option>Introduction to Computer Science (CS101)</option>
            <option>Data Structures (CS201)</option>
            <option>Web Development (CS305)</option>
          </select>
        </div>
        <div className="form-group">
          <label>Select Exam:</label>
          <select>
            <option>Quiz 1</option>
            <option>Midterm Examination</option>
            <option>Practical Assessment</option>
          </select>
        </div>
        <button className="btn-primary">Access Grading Sheet</button>
        <button className="btn-secondary">Upload Grades</button>
      </div>
    </div>
  );
  export default ExamManagement;