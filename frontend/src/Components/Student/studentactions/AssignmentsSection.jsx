import React from "react";
import "../studentactions/StudentCss/AssignmentsSection.css";

const assignments = [
  ,{
    title: "Database Design Project",
    course: "Data Structures",
    dueDate: "March 25, 2025",
    status: "In Progress"
  },
  {
    title: "JavaScript Programming Task",
    course: "Web Development",
    dueDate: "March 21, 2025",
    status: "Not Started"
  }
  ,{
    title: "Database Design Project",
    course: "Data Structures",
    dueDate: "March 25, 2025",
    status: "In Progress"
  },
  {
    title: "JavaScript Programming Task",
    course: "Web Development",
    dueDate: "March 21, 2025",
    status: "Not Started"
  }
  ,{
    title: "Database Design Project",
    course: "Data Structures",
    dueDate: "March 25, 2025",
    status: "In Progress"
  },
  {
    title: "JavaScript Programming Task",
    course: "Web Development",
    dueDate: "March 21, 2025",
    status: "Not Started"
  }
  ,{
    title: "Database Design Project",
    course: "Data Structures",
    dueDate: "March 25, 2025",
    status: "In Progress"
  },
  {
    title: "JavaScript Programming Task",
    course: "Web Development",
    dueDate: "March 21, 2025",
    status: "Not Started"
  }
];

const AssignmentsSection = () => (
  <div className="assignments-container">
    <h2>Assignments</h2>
    <div className="assignments-list">
      {assignments.map((assignment, index) => (
        <div key={index} className="assignment-card">
          <h3>{assignment.title}</h3>
          <p><strong>Course:</strong> {assignment.course}</p>
          <p><strong>Due Date:</strong> {assignment.dueDate}</p>
          <p><strong>Status:</strong> {assignment.status}</p>
          <div className="assignment-actions">
            <button className="btn-primary">View Details</button>
            <button className="btn-secondary">
              {assignment.status === "Not Started" ? "Start Assignment" : "Submit Assignment"}
            </button>
          </div>
        </div>
      ))}
    </div>
  </div>
);

export default AssignmentsSection;