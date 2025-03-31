import React from "react";
import "../studentactions/StudentCss/Exam.css";

const exams = [
  {
    course: "CS101",
    exam: "Midterm Examination",
    date: "March 26, 2025",
    time: "10:00 AM",
    location: "Hall A"
  },
  {
    course: "CS101",
    exam: "Midterm Examination",
    date: "March 26, 2025",
    time: "10:00 AM",
    location: "Hall A"
  },
  {
    course: "CS101",
    exam: "Midterm Examination",
    date: "March 26, 2025",
    time: "10:00 AM",
    location: "Hall A"
  }
];

const grades = [
  {
    course: "Computer Science",
    grade: "A (93%)"
  },
  {
    course: "Data Structures",
    grade: "B+ (87%)"
  },
  {
    course: "Computer Science",
    grade: "A (93%)"
  },
  {
    course: "Data Structures",
    grade: "B+ (87%)"
  },
  {
    course: "Computer Science",
    grade: "A (93%)"
  },
  {
    course: "Data Structures",
    grade: "B+ (87%)"
  }
];

const ExamsAndGrades = () => (
  <div className="exams-container">
    <h2>Exams & Grades</h2>
    
    <div className="upcoming-exams">
      <h3>Upcoming Exams</h3>
      <table className="exams-table">
        <thead>
          <tr>
            <th>Course</th>
            <th>Exam</th>
            <th>Date</th>
            <th>Time</th>
            <th>Location</th>
          </tr>
        </thead>
        <tbody>
          {exams.map((exam, index) => (
            <tr key={index}>
              <td>{exam.course}</td>
              <td>{exam.exam}</td>
              <td>{exam.date}</td>
              <td>{exam.time}</td>
              <td>{exam.location}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
    
    <div className="grades-section">
      <h3>Course Grades</h3>
      <table className="grades-table">
        <thead>
          <tr>
            <th>Course</th>
            <th>Current Grade</th>
            <th>Grade Breakdown</th>
          </tr>
        </thead>
        <tbody>
          {grades.map((grade, index) => (
            <tr key={index}>
              <td>{grade.course}</td>
              <td>{grade.grade}</td>
              <td>
                <button className="btn-small">View Details</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  </div>
);

export default ExamsAndGrades;
