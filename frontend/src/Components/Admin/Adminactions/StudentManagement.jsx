import React, { useState, useEffect } from "react";

const initialForm = {
  name: "",
  regNo: "",
  department: "",
  year: "",
  dob: "",
  gender: "",
  contact: "",
  email: "",
  address: "",
  marks: [],
  attendance: 0,
  cgpa: 0,
  backlogs: 0,
};

const departments = ["AIML", "CSE", "ECE", "EEE", "MECH", "CIVIL","BME"];
const years = [1, 2, 3, 4];
const genders = ["Male", "Female", "Other"];

const LOCAL_KEY = "students";

const StudentManagement = () => {
  const [students, setStudents] = useState([]);
  const [form, setForm] = useState(initialForm);
  const [editingIndex, setEditingIndex] = useState(null);
  const [search, setSearch] = useState("");
  const [showProfile, setShowProfile] = useState(null);
  const [page, setPage] = useState(1);

  // Load from localStorage
  useEffect(() => {
    const data = JSON.parse(localStorage.getItem(LOCAL_KEY)) || [];
    setStudents(data);
  }, []);

  // Sync to localStorage
  useEffect(() => {
    localStorage.setItem(LOCAL_KEY, JSON.stringify(students));
  }, [students]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
  };

  const handleAddOrUpdate = (e) => {
    e.preventDefault();
    if (
      !form.name ||
      !form.regNo ||
      !form.department ||
      !form.year ||
      !form.gender
    )
      return;
    let updated = [...students];
    if (editingIndex !== null) {
      updated[editingIndex] = { ...form };
    } else {
      updated.push({ ...form });
    }
    setStudents(updated);
    setForm(initialForm);
    setEditingIndex(null);
  };

  const handleEdit = (idx) => {
    setForm(students[idx]);
    setEditingIndex(idx);
  };

  const handleDelete = (idx) => {
    if(window.confirm("Are you sure you want to delete this student?")){
      const updated = students.filter((_, i) => i !== idx);
      setStudents(updated);
    }
  };

  const handleProfile = (idx) => {
    setShowProfile(idx);
  };

  const handleCloseProfile = () => setShowProfile(null);

  // Simple search by name, regNo, dept
  const filtered = students.filter(
    (s) =>
      s.name.toLowerCase().includes(search.toLowerCase()) ||
      s.regNo.toLowerCase().includes(search.toLowerCase()) ||
      s.department.toLowerCase().includes(search.toLowerCase())
  );

  // Pagination
  const PAGE_SIZE = 8;
  const pageCount = Math.ceil(filtered.length / PAGE_SIZE) || 1;
  const showList = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);
 
 return (
    <div style={{ minHeight: "100vh", background: "#f3f6fa", padding: "2rem" }}>
      <h2 style={{ textAlign: "center", marginBottom: "1rem" }}>Student Management</h2>

      {/* --- Student Add/Edit Form --- */}
      <form onSubmit={handleAddOrUpdate} style={{ background: '#fff', padding: 16, borderRadius: 8, marginBottom: 24, boxShadow: '0 2px 8px #0001' }}>
        <h3>{editingIndex !== null ? "Edit" : "Add New"} Student</h3>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12 }}>
          <input name="name" value={form.name} onChange={handleChange} placeholder="Name" required style={{ flex: '1 1 150px' }} />
          <input name="regNo" value={form.regNo} onChange={handleChange} placeholder="Register Number" required style={{ flex: '1 1 130px' }} />
          <select name="department" value={form.department} onChange={handleChange} required style={{ flex: '1 1 120px' }}>
            <option value="">Department</option>
            {departments.map(d => <option key={d} value={d}>{d}</option>)}
          </select>
          <select name="year" value={form.year} onChange={handleChange} required style={{ flex: '1 1 80px' }}>
            <option value="">Year</option>
            {years.map(y => <option key={y} value={y}>{y}</option>)}
          </select>
          <input name="dob" value={form.dob} onChange={handleChange} placeholder="DOB" type="date" style={{ flex: '1 1 130px' }} />
          <select name="gender" value={form.gender} onChange={handleChange} required style={{ flex: '1 1 90px' }}>
            <option value="">Gender</option>
            {genders.map(g => <option key={g} value={g}>{g}</option>)}
          </select>
          <input name="contact" value={form.contact} onChange={handleChange} placeholder="Contact" style={{ flex: '1 1 140px' }} />
          <input name="email" value={form.email} onChange={handleChange} placeholder="Email" style={{ flex: '1 1 170px' }} />
          <input name="address" value={form.address} onChange={handleChange} placeholder="Address" style={{ flex: '2 1 200px' }} />
        </div>
        <button type="submit" style={{ marginTop: 12, padding: "8px 22px", background: "#0056b8", color: "#fff", border: "none", borderRadius: 5 }}>
          {editingIndex !== null ? "Update" : "Add Student"}
        </button>
        {editingIndex !== null && (
          <button type="button" onClick={()=>{setForm(initialForm); setEditingIndex(null);}} style={{ marginLeft: 8 }}>Cancel</button>
        )}
      </form>

      {/* --- Search and List --- */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
        <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search by name, RegNo, dept..." style={{ width: 320, padding: 6 }} />
  <div>
          {/* Placeholders for import/export, filters: */}
          <button disabled title="Coming soon!">Import</button>
          <button disabled title="Coming soon!">Export</button>
          <button disabled title="Coming soon!">Advanced Filters</button>
        </div>
      </div>

      {/* --- Student Table --- */}
      <div style={{overflowX: 'auto'}}>
        <table style={{ width: '100%', background: '#fff', borderRadius: 7, overflow: 'hidden', boxShadow: '0 1px 5px #0001' }}>
          <thead>
            <tr style={{ background: '#e9f0fa' }}>
              <th>#</th>
              <th>Name</th>
              <th>RegNo</th>
              <th>Dept</th>
              <th>Year</th>
              <th>Gender</th>
              <th>Contact</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {showList.length === 0 && (
              <tr><td colSpan="8" style={{ textAlign: 'center', color: '#888' }}>No students found</td></tr>
            )}
            {showList.map((s, i) => (
              <tr key={i} style={{ borderTop: '1px solid #dde' }}>
                <td>{(page-1)*PAGE_SIZE + i + 1}</td>
                <td>{s.name}</td>
                <td>{s.regNo}</td>
                <td>{s.department}</td>
                <td>{s.year}</td>
                <td>{s.gender}</td>
                <td>{s.contact}</td>
                <td>
                  <button onClick={()=>handleProfile((page-1)*PAGE_SIZE+i)}>View</button>
                  <button onClick={()=>handleEdit((page-1)*PAGE_SIZE+i)} style={{marginLeft:5}}>Edit</button>
                  <button onClick={()=>handleDelete((page-1)*PAGE_SIZE+i)} style={{marginLeft:5, color: 'red'}}>Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {/* Pagination Controls */}
      <div style={{ display: 'flex', justifyContent: 'center', gap: 12, margin: '12px 0 16px' }}>
        <button onClick={()=>setPage(Math.max(1,page-1))} disabled={page===1}>Prev</button>
        <span>Page {page}/{pageCount}</span>
        <button onClick={()=>setPage(Math.min(page+1,pageCount))} disabled={page===pageCount}>Next</button>
      </div>

      {/* --- Student Profile Modal --- */}
      {showProfile !== null && students[showProfile] && (
        <div style={{position:'fixed',top:0,left:0,right:0,bottom:0,background:'#0004',display:'flex',alignItems:'center',justifyContent:'center',zIndex:99}} onClick={handleCloseProfile}>
          <div style={{background:'#fff',padding:30,borderRadius:7,minWidth:370,maxWidth:450,boxShadow:'0 4px 20px #0003'}} onClick={e=>e.stopPropagation()}>
            <h3>Student Profile</h3>
            <ul style={{listStyle:'none',padding:0}}>
              <li><b>Name</b>: {students[showProfile].name}</li>
              <li><b>RegNo</b>: {students[showProfile].regNo}</li>
              <li><b>Department</b>: {students[showProfile].department}</li>
              <li><b>Year</b>: {students[showProfile].year}</li>
              <li><b>Gender</b>: {students[showProfile].gender}</li>
              <li><b>DOB</b>: {students[showProfile].dob}</li>
              <li><b>Contact</b>: {students[showProfile].contact}</li>
              <li><b>Email</b>: {students[showProfile].email}</li>
              <li><b>Address</b>: {students[showProfile].address}</li>
              {/* Academic section placeholder */}
              <li style={{marginTop:8}}><b>CGPA</b>: {students[showProfile].cgpa || "-"}</li>
              <li><b>Attendance</b>: {students[showProfile].attendance || "-"}%</li>
              <li><b>Backlogs</b>: {students[showProfile].backlogs || 0}</li>
              <li><b>Marks</b>: {students[showProfile].marks && students[showProfile].marks.length>0 ? JSON.stringify(students[showProfile].marks) : "-"}</li>
            </ul>
            <button onClick={handleCloseProfile} style={{marginTop:18}}>Close</button>
          </div>
        </div>
      )}

      {/* --- Analytics Section Placeholder --- */}
      <div style={{marginTop:32,padding:24,background:'#fff',borderRadius:8,boxShadow:'0 2px 8px #0001'}}>
        <h3>Student Analytics</h3>
        {/* TODO: Implement dashboard cards and add Chart.js/Recharts for charts */}
        <div style={{color:'#888'}}>Coming soon...</div>
      </div>
  </div>
 );
};

export default StudentManagement;