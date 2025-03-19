import React, { useState } from 'react';
import { Bell, Search } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import './CollegeAdminDashboard.css';
import Adduser from './Adduser';
const CollegeAdminDashboard = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const navigate = useNavigate();

  const dashboardStats = {
    totalStudents: 1250,
    activeTeachers: 75,
    pendingFees: "$24,500",
    upcomingEvents: 8,
    recentAnnouncements: 3,
    attendanceRate: "92%",
    examsPending: 2
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case 'overview': return <DashboardOverview stats={dashboardStats} />;
      case 'students': return <StudentManagement />;
      case 'adduser': return <Adduser />;
      case 'teachers': return <TeacherManagement />;
      case 'courses': return <CourseManagement />;
      case 'attendance': return <AttendanceManagement />;
      case 'fees': return <FeeManagement />;
      case 'exams': return <ExaminationManagement />;
      case 'library': return <LibraryManagement />;
      case 'communication': return <CommunicationCenter />;
      case 'reports': return <ReportsAnalytics />;
      case 'settings': return <SystemSettings />;
      default: return <DashboardOverview stats={dashboardStats} />;
    }
  };

  return (
    <div className="dashboard-container">
      <header className="dashboard-header">
        <h1>College Administrator Dashboard</h1>
        <div className="dashboard-header-right">
          <div className="search-box">
            <Search className="icon" />
            <input type="text" placeholder="Search..." />
          </div>
          <div className="notification-box">
            <Bell className="icon" />
            <span className="notification-badge">3</span>
          </div>
          <div className="profile-box">
            <div className="profile-avatar">A</div>
            <span>Admin</span>
          </div>
        </div>
      </header>
      <div className="dashboard-main">
        <nav className="sidebar">
          <ul>
            {['overview', 'adduser','students', 'teachers', 'courses', 'attendance', 'fees', 'exams', 'library', 'communication', 'reports', 'settings'].map(tab => (
              <li key={tab} className={activeTab === tab ? 'active' : ''}>
                <button onClick={() => {
                  if (tab === 'adduser') {
                    navigate('/admin/user');
                  } else {
                    setActiveTab(tab);
                  }
                }}>
                  {tab.replace(/\b\w/g, c => c.toUpperCase())}
                </button>
              </li>
            ))}
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
        <div className="stat-icon student-icon">👨‍🎓</div>
        <div className="stat-content">
          <h3>Total Students</h3>
          <p className="stat-value">{stats.totalStudents}</p>
        </div>
      </div>
      
      <div className="stat-card">
        <div className="stat-icon teacher-icon">👩‍🏫</div>
        <div className="stat-content">
          <h3>Active Teachers</h3>
          <p className="stat-value">{stats.activeTeachers}</p>
        </div>
      </div>
      
      <div className="stat-card">
        <div className="stat-icon fee-icon">💰</div>
        <div className="stat-content">
          <h3>Pending Fees</h3>
          <p className="stat-value">{stats.pendingFees}</p>
        </div>
      </div>
      
      <div className="stat-card">
        <div className="stat-icon event-icon">📅</div>
        <div className="stat-content">
          <h3>Upcoming Events</h3>
          <p className="stat-value">{stats.upcomingEvents}</p>
        </div>
      </div>
      
      <div className="stat-card">
        <div className="stat-icon announcement-icon">📢</div>
        <div className="stat-content">
          <h3>Recent Announcements</h3>
          <p className="stat-value">{stats.recentAnnouncements}</p>
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
        <div className="stat-icon exam-icon">📝</div>
        <div className="stat-content">
          <h3>Exams Pending</h3>
          <p className="stat-value">{stats.examsPending}</p>
        </div>
      </div>
    </div>
    
    <div className="quick-actions">
      <h3>Quick Actions</h3>
      <div className="action-buttons">
        <button className="action-btn">Add New Student</button>
        <button className="action-btn">Record Payment</button>
        <button className="action-btn">Schedule Event</button>
        <button className="action-btn">Create Announcement</button>
      </div>
    </div>
  </div>
);

const fullScreenStyle = {
  minHeight: '100%',
  width: '100%',
  padding: '20px',
  backgroundColor: '#f5f7fa',
  borderRadius: '8px',
  boxShadow: '0 2px 10px rgba(0, 0, 0, 0.05)'
};

const headerStyle = {
  marginBottom: '20px',
  padding: '10px 0',
  borderBottom: '2px solid #e2e8f0'
};

const StudentManagement = () => (
  <div style={fullScreenStyle}>
    <h2 style={headerStyle}>Student Management</h2>
    {/* Add your content here */}
  </div>
);

const TeacherManagement = () => (
  <div style={fullScreenStyle}>
    <h2 style={headerStyle}>Teacher Management</h2>
    {/* Add your content here */}
  </div>
);

const CourseManagement = () => (
  <div style={fullScreenStyle}>
    <h2 style={headerStyle}>Course Management</h2>
    {/* Add your content here */}
  </div>
);

const AttendanceManagement = () => (
  <div style={fullScreenStyle}>
    <h2 style={headerStyle}>Attendance Management</h2>
    {/* Add your content here */}
  </div>
);

const FeeManagement = () => (
  <div style={fullScreenStyle}>
    <h2 style={headerStyle}>Fee Management</h2>
    {/* Add your content here */}
  </div>
);

const ExaminationManagement = () => (
  <div style={fullScreenStyle}>
    <h2 style={headerStyle}>Examination & Grading</h2>
    {/* Add your content here */}
  </div>
);

const LibraryManagement = () => (
  <div style={fullScreenStyle}>
    <h2 style={headerStyle}>Library Management</h2>
    {/* Add your content here */}
  </div>
);

const CommunicationCenter = () => (
  <div style={fullScreenStyle}>
    <h2 style={headerStyle}>Communication</h2>
    {/* Add your content here */}
  </div>
);

const ReportsAnalytics = () => (
  <div style={fullScreenStyle}>
    <h2 style={headerStyle}>Reports & Analytics</h2>
    {/* Add your content here */}
  </div>
);

const SystemSettings = () => (
  <div style={fullScreenStyle}>
    <h2 style={headerStyle}>Settings</h2>
    {/* Add your content here */}
  </div>
);

export default CollegeAdminDashboard;
