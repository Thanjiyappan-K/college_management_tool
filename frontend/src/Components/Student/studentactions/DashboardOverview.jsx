import React from "react";
import "../StudentDashboard.css";

const DashboardOverview = ({ stats }) => (
    <div className="dashboard-overview">
      <h2>Dashboard Overview</h2>
      
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon course-icon">📚</div>
          <div className="stat-content">
            <h3>Enrolled Courses</h3>
            <p className="stat-value">{stats.courses}</p>
          </div>
        </div>
        
        <div className="stat-card">
          <div className="stat-icon assignment-icon">📝</div>
          <div className="stat-content">
            <h3>Total Assignments</h3>
            <p className="stat-value">{stats.totalAssignments}</p>
          </div>
        </div>
        
        <div className="stat-card">
          <div className="stat-icon exam-icon">📋</div>
          <div className="stat-content">
            <h3>Upcoming Exams</h3>
            <p className="stat-value">{stats.upcomingExams}</p>
          </div>
        </div>
        
        <div className="stat-card">
          <div className="stat-icon attendance-icon">✓</div>
          <div className="stat-content">
            <h3>Attendance Rate</h3>
            <p className="stat-value">{stats.attendanceRate}</p>
          </div>
        </div>
        
        <div className="stat-card">
          <div className="stat-icon gpa-icon">🎓</div>
          <div className="stat-content">
            <h3>Current GPA</h3>
            <p className="stat-value">{stats.gpa}</p>
          </div>
        </div>
        
        <div className="stat-card">
          <div className="stat-icon message-icon">✉️</div>
          <div className="stat-content">
            <h3>Unread Messages</h3>
            <p className="stat-value">{stats.unreadMessages}</p>
          </div>
        </div>
        
        <div className="stat-card">
          <div className="stat-icon pending-icon">⏳</div>
          <div className="stat-content">
            <h3>Pending Assignments</h3>
            <p className="stat-value">{stats.pendingAssignments}</p>
          </div>
        </div>
      </div>
      
      <div className="recent-activities">
        <h3>Recent Announcements</h3>
        <div className="activity-list">
          <div className="activity-item">
            <p><strong>Midterm Schedule</strong> - Exam schedules for next week have been published.</p>
            <span className="activity-time">2 hours ago</span>
          </div>
          <div className="activity-item">
            <p><strong>Library Resources</strong> - New online research materials available.</p>
            <span className="activity-time">Yesterday</span>
          </div>
          <div className="activity-item">
            <p><strong>Assignment Reminder</strong> - Database design project due March 25.</p>
            <span className="activity-time">2 days ago</span>
          </div>
        </div>
      </div>
    </div>
  );
  export default DashboardOverview;