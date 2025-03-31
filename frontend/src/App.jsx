import React from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import Login from './Login.jsx'
import Register from './Register'
import './App.css' 
import CollegeAdminDashboard from './Components/Admin/CollegeAdminDashboard.jsx'
import StudentDashboard from './Components/Student/StudentDashboard.jsx'
import Adduser from './Components/Admin/Adduser.jsx'
import TeacherDashboard from './Components/Teacher/TeacherDashboard.jsx'
import ParentDashboard from './Components/Parent/ParentDashboard .jsx'
import Home from './Components/Home/Home.jsx'
import UserLogin from './Components/User/User.jsx'

function App() {
  return (
    <>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home/>} />
        <Route path="/login" element={<Login />} />
        <Route path="/loginuser" element={<UserLogin />} />
        <Route path="/register" element={<Register />} />
        <Route path="/admin" element={<CollegeAdminDashboard />} />
        <Route path="/admin/user" element={<Adduser/>} />
        <Route path="/teacher" element={<TeacherDashboard />} />
        <Route path="/student" element={<StudentDashboard />} />
        <Route path="/parent" element={<ParentDashboard />} />
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </BrowserRouter>
    </>
  )
}

export default App
