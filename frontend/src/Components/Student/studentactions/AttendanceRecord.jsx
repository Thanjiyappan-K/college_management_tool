import React from "react";
import "../StudentDashboard.css";

const attendanceData = {
  overallPercentage: "92%",
  records: [
    { course: "Computer Science", totalClasses: 30, attended: 28, percentage: "93%" },
    { course: "Data Structures", totalClasses: 28, attended: 25, percentage: "89%" },
    { course: "Computer Science", totalClasses: 30, attended: 28, percentage: "93%" },
    { course: "Data Structures", totalClasses: 28, attended: 25, percentage: "89%" }
  
  ]
};


const AttendanceRecord = () => (
    <div className="attendance-container">
      <h2>Attendance Record</h2>
      <div className="attendance-summary">
        <div className="overall-attendance">
          <h3>Overall Attendance</h3>
          <div className="attendance-percentage">{attendanceData.overallPercentage}</div>
        </div>
        <table className="attendance-table">
          <thead>
            <tr>
              <th>Course</th>
              <th>Total Classes</th>
              <th>Attended</th>
              <th>Percentage</th>
            </tr>
          </thead>
          <tbody>
            {attendanceData.records.map((record, index) => (
              <tr key={index}>
                <td>{record.course}</td>
                <td>{record.totalClasses}</td>
                <td>{record.attended}</td>
                <td>{record.percentage}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
);

export default AttendanceRecord;


