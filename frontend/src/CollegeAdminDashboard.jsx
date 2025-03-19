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
  <div>
    <h2>Dashboard Overview</h2>
    <pre>{JSON.stringify(stats, null, 2)}</pre>
  </div>
);
const StudentManagement = () => <div><h2>Student Management</h2></div>;
const TeacherManagement = () => <div><h2>Teacher Management</h2></div>;
const CourseManagement = () => <div><h2>Course Management</h2></div>;
const AttendanceManagement = () => <div><h2>Attendance Management</h2></div>;
const FeeManagement = () => <div><h2>Fee Management</h2></div>;
const ExaminationManagement = () => <div><h2>Examination & Grading</h2></div>;
const LibraryManagement = () => <div><h2>Library Management</h2></div>;
const CommunicationCenter = () => <div><h2>Communication</h2></div>;
const ReportsAnalytics = () => <div><h2>Reports & Analytics</h2></div>;
const SystemSettings = () => <div><h2>Settings</h2></div>;

export default CollegeAdminDashboard;
