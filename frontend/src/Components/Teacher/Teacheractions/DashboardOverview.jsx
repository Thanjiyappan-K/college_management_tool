import React from "react";
import "../TeacherDashboard.css";

const DashboardOverview = ({ stats }) => (
    <div className="dashboard-overview">
      <h2>Dashboard Overview</h2>
      
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon class-icon">📚</div>
          <div className="stat-content">
            <h3>Assigned Classes</h3>
            <p className="stat-value">{stats.assignedClasses}</p>
          </div>
        </div>
        
        <div className="stat-card">
          <div className="stat-icon student-icon">👨‍🎓</div>
          <div className="stat-content">
            <h3>Total Students</h3>
            <p className="stat-value">{stats.totalStudents}</p>
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
          <div className="stat-icon attendance-icon">✓</div>
          <div className="stat-content">
            <h3>Attendance Rate</h3>
            <p className="stat-value">{stats.attendanceRate}</p>
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
          <div className="stat-icon message-icon">✉️</div>
          <div className="stat-content">
            <h3>Unread Messages</h3>
            <p className="stat-value">{stats.unreadMessages}</p>
          </div>
        </div>
        
        <div className="stat-card">
          <div className="stat-icon grade-icon">🔖</div>
          <div className="stat-content">
            <h3>Pending Grades</h3>
            <p className="stat-value">{stats.pendingGrades}</p>
          </div>
        </div>
      </div>
      
      <div className="quick-actions">
        <h3>Quick Actions</h3>
        <div className="action-buttons">
          <button className="action-btn">Mark Attendance</button>
          <button className="action-btn">Create Assignment</button>
          <button className="action-btn">Grade Submissions</button>
          <button className="action-btn">Send Announcement</button>
        </div>
      </div>
      
      <div className="recent-activities">
        <h3>Recent Announcements</h3>
        <div className="activity-list">
          <div className="activity-item">
            <p><strong>Midterm Schedule Published</strong> - Please review the exam schedule for next week.</p>
            <span className="activity-time">2 hours ago</span>
          </div>
          <div className="activity-item">
            <p><strong>Faculty Meeting</strong> - Reminder: Faculty meeting on Friday at 3 PM.</p>
            <span className="activity-time">Yesterday</span>
          </div>
          <div className="activity-item">
            <p><strong>Grade Submission Deadline</strong> - All midterm grades due by March 25.</p>
            <span className="activity-time">2 days ago</span>
          </div>
        </div>
      </div>
    </div>
  );
  export default DashboardOverview;