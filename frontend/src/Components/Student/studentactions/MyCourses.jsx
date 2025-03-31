import React from "react";
import "../studentactions/StudentCss/mycourse.css";

const courses = [
  {
    title: "Introduction to Computer Science",
    code: "CS101",
    instructor: "Dr. Emily Brown",
    schedule: "Mon, Wed, Fri 10:00 AM"
  },
  {
    title: "Data Structures",
    code: "CS201",
    instructor: "Prof. Michael Lee",
    schedule: "Tue, Thu 1:00 PM"
  },
  {
    title: "Introduction to Computer Science",
    code: "CS101",
    instructor: "Dr. Emily Brown",
    schedule: "Mon, Wed, Fri 10:00 AM"
  },
  {
    title: "Data Structures",
    code: "CS201",
    instructor: "Prof. Michael Lee",
    schedule: "Tue, Thu 1:00 PM"
  },
  {
    title: "Introduction to Computer Science",
    code: "CS101",
    instructor: "Dr. Emily Brown",
    schedule: "Mon, Wed, Fri 10:00 AM"
  },
  {
    title: "Data Structures",
    code: "CS201",
    instructor: "Prof. Michael Lee",
    schedule: "Tue, Thu 1:00 PM"
  },
  {
    title: "Introduction to Computer Science",
    code: "CS101",
    instructor: "Dr. Emily Brown",
    schedule: "Mon, Wed, Fri 10:00 AM"
  },
  {
    title: "Data Structures",
    code: "CS201",
    instructor: "Prof. Michael Lee",
    schedule: "Tue, Thu 1:00 PM"
  },
  {
    title: "Introduction to Computer Science",
    code: "CS101",
    instructor: "Dr. Emily Brown",
    schedule: "Mon, Wed, Fri 10:00 AM"
  },
  {
    title: "Data Structures",
    code: "CS201",
    instructor: "Prof. Michael Lee",
    schedule: "Tue, Thu 1:00 PM"
  }
];

const MyCourses = () => (
  <div className="courses-container">
    <h2>My Courses</h2>
    <div className="course-cards">
      {courses.map((course, index) => (
        <div key={index} className="course-card">
          <h3>{course.title}</h3>
          <p><strong>Course Code:</strong> {course.code}</p>
          <p><strong>Instructor:</strong> {course.instructor}</p>
          <p><strong>Schedule:</strong> {course.schedule}</p>
          <div className="course-actions">
            <button className="btn-primary">Course Materials</button>
            <button className="btn-secondary">View Grades</button>
          </div>
        </div>
      ))}
    </div>
  </div>
);

export default MyCourses;
