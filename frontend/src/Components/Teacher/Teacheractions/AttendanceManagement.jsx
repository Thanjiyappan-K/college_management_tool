import React from "react";

import "../TeacherDashboard.css";

const AttendanceManagement = () => (
    <div className="attendance-container">
      <h2>Attendance Management</h2>
      
      <div className="class-selector">
        <label htmlFor="class-select">Select Class:</label>
        <select id="class-select">
          <option>Introduction to Computer Science (CS101)</option>
          <option>Data Structures (CS201)</option>
          <option>Web Development (CS305)</option>
        </select>
        <input type="date" defaultValue="2025-03-19" />
        <button className="btn-primary">Load</button>
      </div>
      
      <div className="attendance-table">
        <table>
          <thead>
            <tr>
              <th>Roll No.</th>
              <th>Student Name</th>
              <th>Status</th>
              <th>Notes</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>CS101-01</td>
              <td>Alice Johnson</td>
              <td>
                <select defaultValue="present">
                  <option value="present">Present</option>
                  <option value="absent">Absent</option>
                  <option value="late">Late</option>
                  <option value="excused">Excused</option>
                </select>
              </td>
              <td><input type="text" placeholder="Optional notes" /></td>
            </tr>
            <tr>
              <td>CS101-02</td>
              <td>Bob Smith</td>
              <td>
                <select defaultValue="present">
                  <option value="present">Present</option>
                  <option value="absent">Absent</option>
                  <option value="late">Late</option>
                  <option value="excused">Excused</option>
                </select>
              </td>
              <td><input type="text" placeholder="Optional notes" /></td>
            </tr>
            <tr>
              <td>CS101-03</td>
              <td>Charlie Davis</td>
              <td>
                <select defaultValue="late">
                  <option value="present">Present</option>
                  <option value="absent">Absent</option>
                  <option value="late">Late</option>
                  <option value="excused">Excused</option>
                </select>
              </td>
              <td><input type="text" defaultValue="10 minutes late" placeholder="Optional notes" /></td>
            </tr>
          </tbody>
        </table>
      </div>
      
      <div className="attendance-actions">
        <button className="btn-primary">Save Attendance</button>
        <button className="btn-secondary">Generate Report</button>
        <button className="btn-secondary">View Previous Records</button>
      </div>
    </div>
  );
  export default AttendanceManagement;