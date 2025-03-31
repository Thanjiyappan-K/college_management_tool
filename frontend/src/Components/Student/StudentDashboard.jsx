import React, { useState } from 'react';
import { Bell, Search, Calendar, Book, Users, CheckSquare, FileText, MessageSquare, User, CreditCard, Library } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import './StudentDashboard.css';
import DashboardOverview from './studentactions/DashboardOverview';
import MyCourses from './studentactions/MyCourses';
import AttendanceRecord from './studentactions/AttendanceRecord';
import AssignmentsSection from './studentactions/AssignmentsSection';
import ExamsAndGrades from './studentactions/ExamsAndGrades';
import LibrarySection from './studentactions/LibrarySection';
import FeeDetails from './studentactions/FeeDetails';
import CommunicationCenter from './studentactions/CommunicationCenter';
import StudentProfile from './studentactions/StudentProfile';
import SaveethaSites from './studentactions/Saveethasites';


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
      case 'saveethasites': return <SaveethaSites />;
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
                <span style={{color:"blue"}}>Dashboard Overview</span>
              </button>
            </li>
            <li className={activeTab === 'courses' ? 'active' : ''}>
              <button onClick={() => setActiveTab('courses')}>
                <Book className="nav-icon" />
                <span style={{color:"blue"}}>My Courses</span>
              </button>
            </li>
            <li className={activeTab === 'saveethasites' ? 'active' : ''}>
              <button onClick={() => setActiveTab('saveethasites')}>
                <Book className="nav-icon" />
                <span style={{color:"blue"}}>Saveetha Sites</span>
              </button>
            </li>
            <li className={activeTab === 'attendance' ? 'active' : ''}>
              <button onClick={() => setActiveTab('attendance')}>
                <CheckSquare className="nav-icon" />
                <span style={{color:"blue"}}>Attendance</span>
              </button>
            </li>
            <li className={activeTab === 'assignments' ? 'active' : ''}>
              <button onClick={() => setActiveTab('assignments')}>
                <FileText className="nav-icon" />
                <span style={{color:"blue"}}>Assignments</span>
              </button>
            </li>
            <li className={activeTab === 'exams' ? 'active' : ''}>
              <button onClick={() => setActiveTab('exams')}>
                <Users className="nav-icon" />
                <span style={{color:"blue"}}>Exams & Grades</span>
              </button>
            </li>
            <li className={activeTab === 'library' ? 'active' : ''}>
              <button onClick={() => setActiveTab('library')}>
                <Library className="nav-icon" />
                <span style={{color:"blue"}}>Library</span>
              </button>
            </li>
            <li className={activeTab === 'communication' ? 'active' : ''}>
              <button onClick={() => setActiveTab('communication')}>
                <Bell className="nav-icon" />
                <span style={{color:"blue"}}>Communication</span>
              </button>
            </li>
            <li className={activeTab === 'fees' ? 'active' : ''}>
              <button onClick={() => setActiveTab('fees')}>
                <CreditCard className="nav-icon" />
                <span style={{color:"blue"}}>Fee Details</span>
              </button>
            </li>
            <li className={activeTab === 'profile' ? 'active' : ''}>
              <button onClick={() => setActiveTab('profile')}>
                <User className="nav-icon" />
                <span style={{color:"blue"}}>My Profile</span>
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
export default StudentDashboard;