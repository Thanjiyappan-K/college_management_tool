import React from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import Login from './Login.jsx'
import Register from './Register'
import './App.css' 
import CollegeAdminDashboard from './CollegeAdminDashboard.jsx'
import Adduser from './Adduser.jsx'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/login" />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/admin" element={<CollegeAdminDashboard />} />
        <Route path="/admin/user" element={<Adduser/>} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
