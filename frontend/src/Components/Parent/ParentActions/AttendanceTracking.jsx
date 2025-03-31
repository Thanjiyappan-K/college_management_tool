import React from 'react';
import "../ParentDashboard.css";

// AttendanceTracking component moved from Parent Dashboard.jsx
const AttendanceTracking = ({ childData }) => (
  <div className="attendance-container">
    <h2>Attendance for {childData.name}</h2>
    <div className="attendance-summary">
      <div className="attendance-card">
        <h3>Overall Attendance</h3>
        <p className="attendance-percentage">{childData.stats.attendance}</p>
        <p>Total Present Days: 85/92</p>
      </div>
    </div>
    <div className="attendance-details">
      <h3>Course-wise Attendance</h3>
      <table className="attendance-table">
        <thead>
          <tr>
            <th>Course</th>
            <th>Teacher</th>
            <th>Attendance %</th>
            <th>Absent Days</th>
          </tr>
        </thead>
        <tbody>
          {childData.classes.map((course, index) => (
            <tr key={index}>
              <td>{course.name}</td>
              <td>{course.teacher}</td>
              <td>{['92%', '89%', '95%'][index]}</td>
              <td>{[3, 4, 2][index]} days</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  </div>
);

export default AttendanceTracking;
