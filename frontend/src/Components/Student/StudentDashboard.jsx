import React, { useState } from 'react';
import { Bell, Search, Calendar, Book, Users, CheckSquare, FileText, MessageSquare, User, CreditCard, Library } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import './StudentDashboard.css';

const StudentDashboard = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const navigate = useNavigate();

  const studentStats = {
    courses: 5,
    totalAssignments: 12,
    upcomingExams: 2,
    attendanceRate: "92%", 
    unreadMessages: 5,
    pendingAssignments: 3,
    gpa: "3.7",
    outstandingFees: 500
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case 'overview': return <DashboardOverview stats={studentStats} />;
      case 'courses': return <MyCourses />;
      case 'attendance': return <AttendanceRecord />;
      case 'assignments': return <AssignmentsSection />;
      case 'exams': return <ExamsAndGrades />;
      case 'library': return <LibrarySection />;
      case 'communication': return <CommunicationCenter />;
      case 'fees': return <FeeDetails />;
      case 'profile': return <StudentProfile />;
      default: return <DashboardOverview stats={studentStats} />;
    }
  };

  return (
    <div className="dashboard-container">
      <header className="dashboard-header">
        <h1>Student Dashboard</h1>
        <div className="dashboard-header-right">
          <div className="search-box">
            <Search className="icon" />
            <input type="text" placeholder="Search..." />
          </div>
          <div className="notification-box">
            <Bell className="icon" />
            <span className="notification-badge">{studentStats.unreadMessages}</span>
          </div>
          <div className="profile-box">
            <div className="profile-avatar">JS</div>
            <span>John Smith</span>
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
            <li className={activeTab === 'courses' ? 'active' : ''}>
              <button onClick={() => setActiveTab('courses')}>
                <Book className="nav-icon" />
                <span>My Courses</span>
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
                <span>Assignments</span>
              </button>
            </li>
            <li className={activeTab === 'exams' ? 'active' : ''}>
              <button onClick={() => setActiveTab('exams')}>
                <Users className="nav-icon" />
                <span>Exams & Grades</span>
              </button>
            </li>
            <li className={activeTab === 'library' ? 'active' : ''}>
              <button onClick={() => setActiveTab('library')}>
                <Library className="nav-icon" />
                <span>Library</span>
              </button>
            </li>
            <li className={activeTab === 'communication' ? 'active' : ''}>
              <button onClick={() => setActiveTab('communication')}>
                <MessageSquare className="nav-icon" />
                <span>Communication</span>
              </button>
            </li>
            <li className={activeTab === 'fees' ? 'active' : ''}>
              <button onClick={() => setActiveTab('fees')}>
                <CreditCard className="nav-icon" />
                <span>Fee Details</span>
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

const MyCourses = () => (
  <div className="courses-container">
    <h2>My Courses</h2>
    <div className="course-cards">
      <div className="course-card">
        <h3>Introduction to Computer Science</h3>
        <p><strong>Course Code:</strong> CS101</p>
        <p><strong>Instructor:</strong> Dr. Emily Brown</p>
        <p><strong>Schedule:</strong> Mon, Wed, Fri 10:00 AM</p>
        <div className="course-actions">
          <button className="btn-primary">Course Materials</button>
          <button className="btn-secondary">View Grades</button>
        </div>
      </div>
      
      <div className="course-card">
        <h3>Data Structures</h3>
        <p><strong>Course Code:</strong> CS201</p>
        <p><strong>Instructor:</strong> Prof. Michael Lee</p>
        <p><strong>Schedule:</strong> Tue, Thu 1:00 PM</p>
        <div className="course-actions">
          <button className="btn-primary">Course Materials</button>
          <button className="btn-secondary">View Grades</button>
        </div>
      </div>
    </div>
  </div>
);

const AttendanceRecord = () => (
  <div className="attendance-container">
    <h2>Attendance Record</h2>
    <div className="attendance-summary">
      <div className="overall-attendance">
        <h3>Overall Attendance</h3>
        <div className="attendance-percentage">92%</div>
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
          <tr>
            <td>Computer Science</td>
            <td>30</td>
            <td>28</td>
            <td>93%</td>
          </tr>
          <tr>
            <td>Data Structures</td>
            <td>28</td>
            <td>25</td>
            <td>89%</td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
);

const AssignmentsSection = () => (
  <div className="assignments-container">
    <h2>Assignments</h2>
    <div className="assignments-list">
      <div className="assignment-card">
        <h3>Database Design Project</h3>
        <p><strong>Course:</strong> Data Structures</p>
        <p><strong>Due Date:</strong> March 25, 2025</p>
        <p><strong>Status:</strong> In Progress</p>
        <div className="assignment-actions">
          <button className="btn-primary">View Details</button>
          <button className="btn-secondary">Submit Assignment</button>
        </div>
      </div>
      
      <div className="assignment-card">
        <h3>JavaScript Programming Task</h3>
        <p><strong>Course:</strong> Web Development</p>
        <p><strong>Due Date:</strong> March 21, 2025</p>
        <p><strong>Status:</strong> Not Started</p>
        <div className="assignment-actions">
          <button className="btn-primary">View Details</button>
          <button className="btn-secondary">Start Assignment</button>
        </div>
      </div>
    </div>
  </div>
);

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
          <tr>
            <td>CS101</td>
            <td>Midterm Examination</td>
            <td>March 26, 2025</td>
            <td>10:00 AM</td>
            <td>Hall A</td>
          </tr>
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
          <tr>
            <td>Computer Science</td>
            <td>A (93%)</td>
            <td>
              <button className="btn-small">View Details</button>
            </td>
          </tr>
          <tr>
            <td>Data Structures</td>
            <td>B+ (87%)</td>
            <td>
              <button className="btn-small">View Details</button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
);

const LibrarySection = () => (
  <div className="library-container">
    <h2>Library Resources</h2>
    <div className="library-search">
      <input type="text" placeholder="Search books, journals, resources..." />
      <button className="btn-primary">Search</button>
    </div>
    
    <div className="borrowed-books">
      <h3>My Borrowed Books</h3>
      <table className="books-table">
        <thead>
          <tr>
            <th>Title</th>
            <th>Author</th>
            <th>Borrowed Date</th>
            <th>Due Date</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>Introduction to Algorithms</td>
            <td>Thomas H. Cormen</td>
            <td>March 10, 2025</td>
            <td>April 10, 2025</td>
            <td>
              <button className="btn-small">Renew</button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
);

const FeeDetails = () => (
  <div className="fees-container">
    <h2>Fee Details</h2>
    <div className="fee-summary">
      <div className="outstanding-fees">
        <h3>Outstanding Fees</h3>
        <div className="fee-amount">$500</div>
      </div>
      
      <div className="fee-breakdown">
        <h3>Fee Breakdown</h3>
        <table className="fees-table">
          <thead>
            <tr>
              <th>Fee Type</th>
              <th>Amount</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>Tuition</td>
              <td>$4,500</td>
              <td>Paid</td>
            </tr>
            <tr>
              <td>Library Fee</td>
              <td>$100</td>
              <td>Outstanding</td>
            </tr>
          </tbody>
        </table>
      </div>
      
      <div className="payment-actions">
        <button className="btn-primary">Pay Now</button>
        <button className="btn-secondary">Payment History</button>
      </div>
    </div>
  </div>
);

const CommunicationCenter = () => {
  // Similar to the Teacher Dashboard Communication Center, 
  // but adapted for student perspective
  // (Code would be very similar to the teacher version)
  return (
    <div className="communication-container">
      <h2>Communication</h2>
      {/* Similar implementation to teacher communication center */}
    </div>
  );
};

const StudentProfile = () => (
  <div className="profile-container">
    <h2>My Profile</h2>
    
    <div className="profile-content">
      <div className="profile-header">
        <div className="profile-avatar large">JS</div>
        <div className="profile-title">
          <h3>John Smith</h3>
          <p>Computer Science Major</p>
        </div>
      </div>
      
      <div className="profile-sections">
        <div className="profile-section">
          <h3>Personal Information</h3>
          <div className="form-group">
            <label>Full Name:</label>
            <input type="text" defaultValue="John Smith" />
          </div>
          <div className="form-group">
            <label>Student ID:</label>
            <input type="text" defaultValue="CS2025-1234" />
          </div>
          <div className="form-group">
            <label>Email:</label>
            <input type="email" defaultValue="john.smith@college.edu" />
          </div>
          <div className="form-group">
            <label>Phone Number:</label>
            <input type="tel" defaultValue="(555) 987-6543" />
          </div>
          <div className="form-group">
            <label>Major:</label>
            <input type="text" defaultValue="Computer Science" />
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

export default StudentDashboard;