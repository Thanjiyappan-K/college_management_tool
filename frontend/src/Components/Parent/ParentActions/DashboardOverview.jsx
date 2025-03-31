import React from "react";
import "../ParentDashboard.css";



const DashboardOverview = ({ stats, childData }) => (
    <div className="dashboard-overview">
      <h2>Dashboard Overview for {childData.name}</h2>
      
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon attendance-icon">✓</div>
          <div className="stat-content">
            <h3>Attendance</h3>
            <p className="stat-value">{stats.attendance}</p>
          </div>
        </div>
        
        <div className="stat-card">
          <div className="stat-icon assignment-icon">📝</div>
          <div className="stat-content">
            <h3>Upcoming Assignments</h3>
            <p className="stat-value">{stats.upcomingAssignments}</p>
          </div>
        </div>
        
        <div className="stat-card">
          <div className="stat-icon grade-icon">🎓</div>
          <div className="stat-content">
            <h3>Current GPA</h3>
            <p className="stat-value">{stats.totalGPA}</p>
          </div>
        </div>
        
        <div className="stat-card">
          <div className="stat-icon message-icon">✉️</div>
          <div className="stat-content">
            <h3>Unread Messages</h3>
            <p className="stat-value">{stats.unreadMessages}</p>
          </div>
        </div>
      </div>
      
      <div className="recent-courses">
        <h3>Current Courses</h3>
        <div className="course-list">
          {childData.classes.map((course, index) => (
            <div key={index} className="course-card">
              <h4>{course.name}</h4>
              <p><strong>Teacher:</strong> {course.teacher}</p>
              <p><strong>Current Grade:</strong> {course.grade}</p>
            </div>
          ))}
        </div>
      </div>
      
      <div className="recent-activities">
        <h3>Recent Announcements</h3>
        <div className="activity-list">
          <div className="activity-item">
            <p><strong>Parent-Teacher Conference</strong> - Scheduled for April 5th</p>
            <span className="activity-time">2 days ago</span>
          </div>
          <div className="activity-item">
            <p><strong>Midterm Exams</strong> - Dates announced for next month</p>
            <span className="activity-time">1 week ago</span>
          </div>
        </div>
      </div>
    </div>
  );
  export default DashboardOverview;