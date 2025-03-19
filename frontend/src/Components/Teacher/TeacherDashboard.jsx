import React, { useState } from 'react';
import { Bell, Search, Calendar, Book, Users, CheckSquare, FileText, MessageSquare, User } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import './TeacherDashboard.css';

const TeacherDashboard = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const navigate = useNavigate();

  const teacherStats = {
    assignedClasses: 5,
    totalStudents: 157,
    upcomingAssignments: 4,
    attendanceRate: "95%",
    upcomingExams: 2,
    unreadMessages: 7,
    pendingGrades: 12
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case 'overview': return <DashboardOverview stats={teacherStats} />;
      case 'classes': return <MyClasses />;
      case 'attendance': return <AttendanceManagement />;
      case 'assignments': return <AssignmentsGrading />;
      case 'exams': return <ExamManagement />;
      case 'communication': return <CommunicationCenter />;
      case 'profile': return <TeacherProfile />;
      default: return <DashboardOverview stats={teacherStats} />;
    }
  };

  return (
    <div className="dashboard-container">
      <header className="dashboard-header">
        <h1>Teacher Dashboard</h1>
        <div className="dashboard-header-right">
          <div className="search-box">
            <Search className="icon" />
            <input type="text" placeholder="Search..." />
          </div>
          <div className="notification-box">
            <Bell className="icon" />
            <span className="notification-badge">{teacherStats.unreadMessages}</span>
          </div>
          <div className="profile-box">
            <div className="profile-avatar">T</div>
            <span>Ms. Johnson</span>
          </div>
        </div>
      </header>
      <div className="dashboard-main">
        <nav className="sidebar">
          <ul>
            <li className={activeTab === 'overview' ? 'active' : ''}>
              <button onClick={() => setActiveTab('overview')}>
                <Calendar className="nav-icon" />
                <span>Dashboard Overview</span>
              </button>
            </li>
            <li className={activeTab === 'classes' ? 'active' : ''}>
              <button onClick={() => setActiveTab('classes')}>
                <Book className="nav-icon" />
                <span>My Classes</span>
              </button>
            </li>
            <li className={activeTab === 'attendance' ? 'active' : ''}>
              <button onClick={() => setActiveTab('attendance')}>
                <CheckSquare className="nav-icon" />
                <span>Attendance</span>
              </button>
            </li>
            <li className={activeTab === 'assignments' ? 'active' : ''}>
              <button onClick={() => setActiveTab('assignments')}>
                <FileText className="nav-icon" />
                <span>Assignments & Grading</span>
              </button>
            </li>
            <li className={activeTab === 'exams' ? 'active' : ''}>
              <button onClick={() => setActiveTab('exams')}>
                <Users className="nav-icon" />
                <span>Exams</span>
              </button>
            </li>
            <li className={activeTab === 'communication' ? 'active' : ''}>
              <button onClick={() => setActiveTab('communication')}>
                <MessageSquare className="nav-icon" />
                <span>Communication</span>
              </button>
            </li>
            <li className={activeTab === 'profile' ? 'active' : ''}>
              <button onClick={() => setActiveTab('profile')}>
                <User className="nav-icon" />
                <span>My Profile</span>
              </button>
            </li>
          </ul>
        </nav>
        <main className="dashboard-content">
          {renderTabContent()}
        </main>
      </div>
    </div>
  );
};

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

const MyClasses = () => (
  <div className="classes-container">
    <h2>My Classes</h2>
    <div className="class-cards">
      <div className="class-card">
        <h3>Introduction to Computer Science</h3>
        <p><strong>Course Code:</strong> CS101</p>
        <p><strong>Schedule:</strong> Mon, Wed, Fri 10:00 AM - 11:30 AM</p>
        <p><strong>Room:</strong> B-204</p>
        <p><strong>Students:</strong> 32</p>
        <div className="class-actions">
          <button className="btn-primary">View Students</button>
          <button className="btn-secondary">Upload Materials</button>
          <button className="btn-secondary">View Syllabus</button>
        </div>
      </div>
      
      <div className="class-card">
        <h3>Data Structures</h3>
        <p><strong>Course Code:</strong> CS201</p>
        <p><strong>Schedule:</strong> Tue, Thu 1:00 PM - 3:00 PM</p>
        <p><strong>Room:</strong> A-105</p>
        <p><strong>Students:</strong> 28</p>
        <div className="class-actions">
          <button className="btn-primary">View Students</button>
          <button className="btn-secondary">Upload Materials</button>
          <button className="btn-secondary">View Syllabus</button>
        </div>
      </div>
      
      <div className="class-card">
        <h3>Web Development</h3>
        <p><strong>Course Code:</strong> CS305</p>
        <p><strong>Schedule:</strong> Mon, Wed 2:00 PM - 4:00 PM</p>
        <p><strong>Room:</strong> Lab C</p>
        <p><strong>Students:</strong> 25</p>
        <div className="class-actions">
          <button className="btn-primary">View Students</button>
          <button className="btn-secondary">Upload Materials</button>
          <button className="btn-secondary">View Syllabus</button>
        </div>
      </div>
    </div>
  </div>
);

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

const AssignmentsGrading = () => (
  <div className="assignments-container">
    <h2>Assignments & Grading</h2>
    
    <div className="tabs">
      <button className="tab active">Assignments</button>
      <button className="tab">Gradebook</button>
    </div>
    
    <div className="assignments-section">
      <div className="section-header">
        <h3>Current Assignments</h3>
        <button className="btn-primary">Create New Assignment</button>
      </div>
      
      <div className="assignment-cards">
        <div className="assignment-card">
          <div className="assignment-header">
            <h4>Database Design Project</h4>
            <span className="assignment-status">Active</span>
          </div>
          <p><strong>Class:</strong> Data Structures (CS201)</p>
          <p><strong>Due Date:</strong> March 25, 2025</p>
          <p><strong>Submissions:</strong> 15/28</p>
          <p><strong>Description:</strong> Design a normalized database schema for a library management system...</p>
          <div className="assignment-actions">
            <button className="btn-primary">View Submissions</button>
            <button className="btn-secondary">Edit Assignment</button>
            <button className="btn-secondary">Download All</button>
          </div>
        </div>
        
        <div className="assignment-card">
          <div className="assignment-header">
            <h4>JavaScript Quiz</h4>
            <span className="assignment-status">Due Soon</span>
          </div>
          <p><strong>Class:</strong> Web Development (CS305)</p>
          <p><strong>Due Date:</strong> March 21, 2025</p>
          <p><strong>Submissions:</strong> 20/25</p>
          <p><strong>Description:</strong> Online quiz covering JavaScript fundamentals, DOM manipulation, and event handling.</p>
          <div className="assignment-actions">
            <button className="btn-primary">View Submissions</button>
            <button className="btn-secondary">Edit Assignment</button>
            <button className="btn-secondary">Send Reminder</button>
          </div>
        </div>
      </div>
    </div>
  </div>
);

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

const CommunicationCenter = () => (
  <div className="communication-container">
    <h2>Communication</h2>
    
    <div className="communication-content">
      <div className="contacts-sidebar">
        <div className="contacts-header">
          <h3>Contacts</h3>
          <button className="btn-small">New Message</button>
        </div>
        <div className="contact-filters">
          <button className="filter-btn active">All</button>
          <button className="filter-btn">Students</button>
          <button className="filter-btn">Parents</button>
          <button className="filter-btn">Faculty</button>
          <button className="filter-btn">Admin</button>
        </div>
        <div className="contact-list">
          <div className="contact-item unread">
            <div className="contact-avatar">JD</div>
            <div className="contact-info">
              <h4>Jane Doe</h4>
              <p>Question about the assignment...</p>
            </div>
            <span className="message-time">10:30 AM</span>
          </div>
          <div className="contact-item unread">
            <div className="contact-avatar">MS</div>
            <div className="contact-info">
              <h4>Michael Scott</h4>
              <p>Will the exam cover chapter 7?</p>
            </div>
            <span className="message-time">Yesterday</span>
          </div>
          <div className="contact-item">
            <div className="contact-avatar">AP</div>
            <div className="contact-info">
              <h4>Admin Portal</h4>
              <p>Reminder: Submit grades by...</p>
            </div>
            <span className="message-time">Mar 15</span>
          </div>
        </div>
      </div>
      
      <div className="message-area">
        <div className="message-header">
          <div className="recipient-info">
            <div className="recipient-avatar">JD</div>
            <h3>Jane Doe</h3>
          </div>
          <div className="message-actions">
            <button className="icon-btn"><Bell className="icon" /></button>
            <button className="icon-btn"><Users className="icon" /></button>
          </div>
        </div>
        
        <div className="message-content">
          <div className="message-bubble received">
            <p>Hello Professor, I had a question about the database assignment. Are we supposed to include foreign key constraints in our schema design?</p>
            <span className="message-time">10:25 AM</span>
          </div>
          
          <div className="message-date-separator">
            <span>Today</span>
          </div>
          
          <div className="message-bubble sent">
            <p>Hi Jane, yes please include foreign key constraints as they're essential for maintaining referential integrity in relational databases.</p>
            <span className="message-time">10:28 AM</span>
          </div>
          
          <div className="message-bubble received">
            <p>Thank you! One more question - should we also include indexes in our design?</p>
            <span className="message-time">10:30 AM</span>
          </div>
        </div>
        
        <div className="message-input">
          <input type="text" placeholder="Type your message..." />
          <button className="send-btn">Send</button>
        </div>
      </div>
    </div>
    
    <div className="announcements-section">
      <h3>Create Announcement</h3>
      <div className="announcement-form">
        <div className="form-group">
          <label>Select Recipients:</label>
          <select>
            <option>All Students</option>
            <option>CS101 - Intro to Computer Science</option>
            <option>CS201 - Data Structures</option>
            <option>CS305 - Web Development</option>
          </select>
        </div>
        <div className="form-group">
          <label>Subject:</label>
          <input type="text" placeholder="Announcement subject" />
        </div>
        <div className="form-group">
          <label>Message:</label>
          <textarea placeholder="Enter your announcement"></textarea>
        </div>
        <div className="form-actions">
          <button className="btn-primary">Send Announcement</button>
          <button className="btn-secondary">Save Draft</button>
        </div>
      </div>
    </div>
  </div>
);

const TeacherProfile = () => (
  <div className="profile-container">
    <h2>My Profile</h2>
    
    <div className="profile-content">
      <div className="profile-header">
        <div className="profile-avatar large">TJ</div>
        <div className="profile-title">
          <h3>Ms. Taylor Johnson</h3>
          <p>Computer Science Department</p>
        </div>
      </div>
      
      <div className="profile-sections">
        <div className="profile-section">
          <h3>Personal Information</h3>
          <div className="form-group">
            <label>Full Name:</label>
            <input type="text" defaultValue="Taylor Johnson" />
          </div>
          <div className="form-group">
            <label>Email:</label>
            <input type="email" defaultValue="tjohnson@college.edu" />
          </div>
          <div className="form-group">
            <label>Phone Number:</label>
            <input type="tel" defaultValue="(555) 123-4567" />
          </div>
          <div className="form-group">
            <label>Department:</label>
            <input type="text" defaultValue="Computer Science" />
          </div>
          <div className="form-group">
            <label>Office Location:</label>
            <input type="text" defaultValue="Science Building, Room 305" />
          </div>
          <div className="form-group">
            <label>Office Hours:</label>
            <input type="text" defaultValue="Mon/Wed 1-3PM, Fri 10-11AM" />
          </div>
        </div>
        
        <div className="profile-section">
          <h3>Account Settings</h3>
          <div className="form-group">
            <label>Change Password:</label>
            <input type="password" placeholder="Current password" />
            <input type="password" placeholder="New password" />
            <input type="password" placeholder="Confirm new password" />
          </div>
          
          <h3>Notification Preferences</h3>
          <div className="checkbox-group">
            <div className="checkbox-item">
              <input type="checkbox" id="email-notifications" defaultChecked />
              <label htmlFor="email-notifications">Email Notifications</label>
            </div>
            <div className="checkbox-item">
              <input type="checkbox" id="sms-notifications" />
              <label htmlFor="sms-notifications">SMS Notifications</label>
            </div>
            <div className="checkbox-item">
              <input type="checkbox" id="new-message-notifications" defaultChecked />
              <label htmlFor="new-message-notifications">New Message Alerts</label>
            </div>
            <div className="checkbox-item">
              <input type="checkbox" id="assignment-notifications" defaultChecked />
              <label htmlFor="assignment-notifications">Assignment Submission Alerts</label>
            </div>
          </div>
        </div>
      </div>
      
      <div className="profile-actions">
        <button className="btn-primary">Save Changes</button>
        <button className="btn-secondary">Cancel</button>
      </div>
    </div>
  </div>
);

export default TeacherDashboard;