import React, { useState } from 'react';
import { Bell, Search, Calendar, Book, Users, CheckSquare, FileText, MessageSquare, User } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import './TeacherDashboard.css';
import DashboardOverview from './Teacheractions/DashboardOverview';
import MyClasses from './Teacheractions/MyClasses ';
import  Upload  from './Teacheractions/Upload';
import AttendanceManagement from './Teacheractions/AttendanceManagement';
import AssignmentsGrading from './Teacheractions/AssignmentsGrading';
import ExamManagement from './Teacheractions/ExamManagement';
import CommunicationCenter from './Teacheractions/CommunicationCenter';
import TeacherProfile from './Teacheractions/TeacherProfile';

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
      case 'upload': return <Upload />;
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
            <li className={activeTab === 'upload' ? 'active' : ''}>
              <button onClick={() => setActiveTab('upload')}>
                <FileText className="nav-icon" />
                <span>File Upload</span>
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

export default TeacherDashboard;