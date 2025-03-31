import React, { useState } from 'react';
import { Bell, Search, Calendar, Book, Users, CheckSquare, FileText, CreditCard, User } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import './ParentDashboard.css';
import AttendanceTracking from './ParentActions/AttendanceTracking';
import DashboardOverview from './ParentActions/DashboardOverview';
import AssignmentsAndGrades from './ParentActions/AssignmentsAndGrades';
import CommunicationCenter from './ParentActions/CommunicationCenter';
import FeeManagement from './ParentActions/FeeManagement';
import ParentProfile from './ParentActions/ParentProfile';

const ParentDashboard = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [selectedChild, setSelectedChild] = useState('child1');
  const navigate = useNavigate();

  // Mock data for multiple children
  const childrenData = {
    child1: {
      name: 'Emily Johnson',
      grade: '11th Grade',
      studentId: 'ST2024-101',
      stats: {
        attendance: "92%",
        upcomingAssignments: 3,
        totalGPA: 3.7,
        unreadMessages: 5,
        pendingFees: 2500
      },
      classes: [
        { name: 'Advanced Mathematics', teacher: 'Mr. Anderson', grade: 'A' },
        { name: 'Computer Science', teacher: 'Ms. Rodriguez', grade: 'A-' },
        { name: 'Biology', teacher: 'Dr. Lee', grade: 'B+' }
      ]
    },
    child2: {
      name: 'Michael Johnson',
      grade: '9th Grade',
      studentId: 'ST2024-102',
      stats: {
        attendance: "88%",
        upcomingAssignments: 2,
        totalGPA: 3.4,
        unreadMessages: 3,
        pendingFees: 1800
      },
      classes: [
        { name: 'Algebra', teacher: 'Mrs. Thompson', grade: 'B' },
        { name: 'Physical Science', teacher: 'Mr. Garcia', grade: 'B+' },
        { name: 'World History', teacher: 'Ms. Wilson', grade: 'A-' }
      ]
    }
  };

  const renderTabContent = () => {
    const childData = childrenData[selectedChild];
    switch (activeTab) {
      case 'overview': return <DashboardOverview stats={childData.stats} childData={childData} />;
      case 'attendance': return <AttendanceTracking childData={childData} />;
      case 'assignments': return <AssignmentsAndGrades childData={childData} />;
      case 'communication': return <CommunicationCenter childData={childData} />;
      case 'fees': return <FeeManagement childData={childData} />;
      case 'profile': return <ParentProfile />;
      default: return <DashboardOverview stats={childData.stats} childData={childData} />;
    }
  };

  return (
    <div className="dashboard-container">
      <header className="dashboard-header">
        <h1>Parent Dashboard</h1>
        <div className="dashboard-header-right">
          <div className="child-selector">
            <select 
              value={selectedChild} 
              onChange={(e) => setSelectedChild(e.target.value)}
            >
              <option value="child1">Emily Johnson</option>
              <option value="child2">Michael Johnson</option>
            </select>
          </div>
          <div className="search-box">
            <Search className="icon" />
            <input type="text" placeholder="Search..." />
          </div>
          <div className="notification-box">
            <Bell className="icon" />
            <span className="notification-badge">
              {childrenData[selectedChild].stats.unreadMessages}
            </span>
          </div>
          <div className="profile-box">
            <div className="profile-avatar">P</div>
            <span>Mrs. Johnson</span>
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
            <li className={activeTab === 'attendance' ? 'active' : ''}>
              <button onClick={() => setActiveTab('attendance')}>
                <CheckSquare className="nav-icon" />
                <span>Attendance</span>
              </button>
            </li>
            <li className={activeTab === 'assignments' ? 'active' : ''}>
              <button onClick={() => setActiveTab('assignments')}>
                <FileText className="nav-icon" />
                <span>Assignments & Grades</span>
              </button>
            </li>
            <li className={activeTab === 'communication' ? 'active' : ''}>
              <button onClick={() => setActiveTab('communication')}>
                <Users className="nav-icon" />
                <span>Communication</span>
              </button>
            </li>
            <li className={activeTab === 'fees' ? 'active' : ''}>
              <button onClick={() => setActiveTab('fees')}>
                <CreditCard className="nav-icon" />
                <span>Fee Management</span>
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


export default ParentDashboard;