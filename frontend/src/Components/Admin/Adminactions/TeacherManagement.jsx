import React, { useEffect, useMemo, useState } from "react";

const LOCAL_KEY = "teachers";

const departments = ["AIML", "CSE", "ECE", "EEE", "MECH", "CIVIL", "BME"];
const designations = [
  "Assistant Professor",
  "Associate Professor",
  "Professor",
  "HOD",
  "Lecturer",
];

const experienceRanges = [
  { label: "All", min: 0, max: 100 },
  { label: "0-3 yrs", min: 0, max: 3 },
  { label: "3-5 yrs", min: 3, max: 5 },
  { label: "5-10 yrs", min: 5, max: 10 },
  { label: "10+ yrs", min: 10, max: 100 },
];

const emptyForm = {
  name: "",
  empId: "",
  department: "",
  designation: "",
  email: "",
  contact: "",
  doj: "",
  subjects: [],
  qualification: "",
  experience: 0, // computed from doj if provided
  load: 0, // hours/week
  rating: 0,
  gender: "",
  researchPapers: 0,
  researchArea: "",
};

function calculateExperienceYears(doj) {
  if (!doj) return 0;
  const join = new Date(doj);
  if (Number.isNaN(join.getTime())) return 0;
  const now = new Date();
  const diffMs = now.getTime() - join.getTime();
  const years = diffMs / (1000 * 60 * 60 * 24 * 365.25);
  return Math.max(0, Math.round(years));
}

const TeacherManagement = () => {
  const [teachers, setTeachers] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [editingIndex, setEditingIndex] = useState(null);
  const [search, setSearch] = useState("");
  const [filters, setFilters] = useState({ department: "", designation: "", expRange: experienceRanges[0] });
  const [page, setPage] = useState(1);
  const [profileIndex, setProfileIndex] = useState(null);

  // Load from localStorage
  useEffect(() => {
    try {
      const data = JSON.parse(localStorage.getItem(LOCAL_KEY) || "[]");
      setTeachers(Array.isArray(data) ? data : []);
    } catch {
      setTeachers([]);
    }
  }, []);

  // Persist
  useEffect(() => {
    localStorage.setItem(LOCAL_KEY, JSON.stringify(teachers));
  }, [teachers]);

  const handleInput = (e) => {
    const { name, value } = e.target;
    setForm((prev) => {
      const next = { ...prev, [name]: value };
      if (name === "doj") {
        next.experience = calculateExperienceYears(value);
      }
      return next;
    });
  };

  const handleSubjectsChange = (e) => {
    const csv = e.target.value;
    const list = csv
      .split(",")
      .map((s) => s.trim())
      .filter((s) => s.length > 0);
    setForm((prev) => ({ ...prev, subjects: list }));
  };

  const subjectsCSV = useMemo(() => (form.subjects || []).join(", "), [form.subjects]);

  const resetForm = () => {
    setForm(emptyForm);
    setEditingIndex(null);
  };

  const validateForm = () => {
    return (
      form.name &&
      form.empId &&
      form.department &&
      form.designation &&
      form.email &&
      form.contact
    );
  };

  const onSubmit = (e) => {
    e.preventDefault();
    if (!validateForm()) return;
    const teacherRecord = {
      ...form,
      experience: form.doj ? calculateExperienceYears(form.doj) : Number(form.experience) || 0,
      load: Number(form.load) || 0,
      rating: Number(form.rating) || 0,
      researchPapers: Number(form.researchPapers) || 0,
    };

    setTeachers((prev) => {
      const next = [...prev];
      if (editingIndex !== null) {
        next[editingIndex] = teacherRecord;
      } else {
        next.push(teacherRecord);
      }
      return next;
    });
    resetForm();
  };

  const onEdit = (index) => {
    const t = teachers[index];
    setForm({
      ...emptyForm,
      ...t,
    });
    setEditingIndex(index);
  };

  const onDelete = (index) => {
    if (!window.confirm("Are you sure you want to delete this teacher?")) return;
    setTeachers((prev) => prev.filter((_, i) => i !== index));
  };

  // Search + Filters
  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase();
    const { department, designation, expRange } = filters;
    return teachers.filter((t) => {
      const matchesSearch =
        !term ||
        t.name?.toLowerCase().includes(term) ||
        t.department?.toLowerCase().includes(term) ||
        (t.subjects || []).some((s) => s.toLowerCase().includes(term));

      const matchesDept = !department || t.department === department;
      const matchesDesig = !designation || t.designation === designation;
      const expYears = Number(t.experience) || 0;
      const matchesExp = expYears >= expRange.min && expYears < expRange.max;

      return matchesSearch && matchesDept && matchesDesig && matchesExp;
    });
  }, [teachers, search, filters]);

  // Pagination
  const PAGE_SIZE = 8;
  const pageCount = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const pageItems = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  useEffect(() => {
    if (page > pageCount) setPage(1);
  }, [pageCount, page]);

  // Analytics (basic numbers without charts for now)
  const analytics = useMemo(() => {
    const byDept = {};
    const expBuckets = { "0-5": 0, "5-10": 0, "10+": 0 };
    let totalLoad = 0;
    let avgRating = 0;
    teachers.forEach((t) => {
      byDept[t.department] = (byDept[t.department] || 0) + 1;
      const exp = Number(t.experience) || 0;
      if (exp < 5) expBuckets["0-5"] += 1;
      else if (exp < 10) expBuckets["5-10"] += 1;
      else expBuckets["10+"] += 1;
      totalLoad += Number(t.load) || 0;
      avgRating += Number(t.rating) || 0;
    });
    return {
      total: teachers.length,
      byDept,
      expBuckets,
      totalLoad,
      avgRating: teachers.length ? (avgRating / teachers.length).toFixed(2) : 0,
    };
  }, [teachers]);

  // Import/Export JSON (simple offline backup)
  const exportJSON = () => {
    const blob = new Blob([JSON.stringify(teachers, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "teachers_backup.json";
    a.click();
    URL.revokeObjectURL(url);
  };

  const importJSON = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const data = JSON.parse(reader.result);
        if (!Array.isArray(data)) throw new Error("Invalid JSON structure");
        setTeachers(data);
      } catch (e) {
        alert("Invalid JSON file");
      }
    };
    reader.readAsText(file);
  };

  // Role-based access simulation
  const currentUser = useMemo(() => {
    try {
      return JSON.parse(localStorage.getItem("currentUser") || "null");
    } catch {
      return null;
    }
  }, []);

  const canManageTeacher = (t) => {
    if (!currentUser) return true;
    if (currentUser.role === "superAdmin" || currentUser.role === "admin") return true;
    if (currentUser.role === "departmentAdmin") return currentUser.dept === t.department;
    return false;
  };

  const canCreate = !currentUser || currentUser.role !== "departmentAdmin" || (form.department && currentUser.dept === form.department);

  return (
    <div style={{ minHeight: '100vh', background: '#f5f7fa', padding: 20 }}>
      <h2 style={{ marginBottom: 12 }}>Teacher Management</h2>

      {/* Form */}
      <form onSubmit={onSubmit} style={{ background: '#fff', padding: 16, borderRadius: 8, boxShadow: '0 2px 8px #0001', marginBottom: 16 }}>
        <h3>{editingIndex !== null ? 'Edit' : 'Add'} Teacher</h3>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
          <input name="name" value={form.name} onChange={handleInput} placeholder="Name" required style={{ flex: '1 1 160px' }} />
          <input name="empId" value={form.empId} onChange={handleInput} placeholder="Employee ID" required style={{ flex: '1 1 120px' }} />
          <select name="department" value={form.department} onChange={handleInput} required style={{ flex: '1 1 140px' }}>
            <option value="">Department</option>
            {departments.map((d) => (
              <option key={d} value={d}>{d}</option>
            ))}
          </select>
          <select name="designation" value={form.designation} onChange={handleInput} required style={{ flex: '1 1 160px' }}>
            <option value="">Designation</option>
            {designations.map((d) => (
              <option key={d} value={d}>{d}</option>
            ))}
          </select>
          <input name="email" value={form.email} onChange={handleInput} placeholder="Email" type="email" required style={{ flex: '1 1 200px' }} />
          <input name="contact" value={form.contact} onChange={handleInput} placeholder="Contact" required style={{ flex: '1 1 140px' }} />
          <input name="doj" value={form.doj} onChange={handleInput} placeholder="Date of Joining" type="date" style={{ flex: '1 1 160px' }} />
          <input value={subjectsCSV} onChange={handleSubjectsChange} placeholder="Subjects (comma separated)" style={{ flex: '2 1 240px' }} />
          <input name="qualification" value={form.qualification} onChange={handleInput} placeholder="Qualification" style={{ flex: '1 1 160px' }} />
          <input name="experience" value={form.experience} onChange={handleInput} placeholder="Experience (yrs)" type="number" min={0} style={{ flex: '1 1 140px' }} />
          <input name="load" value={form.load} onChange={handleInput} placeholder="Load (hrs/week)" type="number" min={0} style={{ flex: '1 1 140px' }} />
          <input name="rating" value={form.rating} onChange={handleInput} placeholder="Rating (0-5)" type="number" min={0} max={5} step={0.1} style={{ flex: '1 1 120px' }} />
          <select name="gender" value={form.gender} onChange={handleInput} style={{ flex: '1 1 120px' }}>
            <option value="">Gender (optional)</option>
            <option value="Male">Male</option>
            <option value="Female">Female</option>
            <option value="Other">Other</option>
          </select>
          <input name="researchPapers" value={form.researchPapers} onChange={handleInput} placeholder="Publications count" type="number" min={0} style={{ flex: '1 1 140px' }} />
          <input name="researchArea" value={form.researchArea} onChange={handleInput} placeholder="Research area" style={{ flex: '2 1 200px' }} />
        </div>
        <div style={{ marginTop: 10 }}>
          <button type="submit" disabled={!canCreate} style={{ padding: '8px 16px', background: '#0056b8', color: '#fff', border: 'none', borderRadius: 6 }}>
            {editingIndex !== null ? 'Update' : 'Add Teacher'}
          </button>
          {editingIndex !== null && (
            <button type="button" onClick={resetForm} style={{ marginLeft: 8 }}>Cancel</button>
          )}
        </div>
      </form>

      {/* Search & Filters */}
      <div style={{ display: 'flex', gap: 10, alignItems: 'center', margin: '8px 0 12px' }}>
        <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search by name, department, subject..." style={{ flex: '2 1 260px', padding: 6 }} />
        <select value={filters.department} onChange={(e) => setFilters((f) => ({ ...f, department: e.target.value }))} style={{ flex: '1 1 150px' }}>
          <option value="">All Departments</option>
          {departments.map((d) => (
            <option key={d} value={d}>{d}</option>
          ))}
        </select>
        <select value={filters.designation} onChange={(e) => setFilters((f) => ({ ...f, designation: e.target.value }))} style={{ flex: '1 1 170px' }}>
          <option value="">All Designations</option>
          {designations.map((d) => (
            <option key={d} value={d}>{d}</option>
          ))}
        </select>
        <select
          value={filters.expRange.label}
          onChange={(e) => setFilters((f) => ({ ...f, expRange: experienceRanges.find((r) => r.label === e.target.value) }))}
          style={{ flex: '1 1 140px' }}
        >
          {experienceRanges.map((r) => (
            <option key={r.label} value={r.label}>{r.label}</option>
          ))}
        </select>

        {/* Backup/Restore */}
        <button onClick={exportJSON} style={{ marginLeft: 'auto' }}>Export JSON</button>
        <label style={{ display: 'inline-block', padding: '6px 10px', background: '#eee', borderRadius: 6, cursor: 'pointer' }}>
          Import JSON
          <input type="file" accept="application/json" onChange={importJSON} style={{ display: 'none' }} />
        </label>
      </div>

      {/* List */}
      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', background: '#fff', borderRadius: 8, overflow: 'hidden', boxShadow: '0 1px 6px #0001' }}>
          <thead>
            <tr style={{ background: '#e9f0fa' }}>
              <th>#</th>
              <th>Name</th>
              <th>Emp ID</th>
              <th>Department</th>
              <th>Designation</th>
              <th>Experience</th>
              <th>Subjects</th>
              <th>Load</th>
              <th>Rating</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {pageItems.length === 0 && (
              <tr>
                <td colSpan="10" style={{ textAlign: 'center', color: '#777' }}>No teachers found</td>
              </tr>
            )}
            {pageItems.map((t, i) => {
              const idx = (page - 1) * PAGE_SIZE + i;
              const allowManage = canManageTeacher(t);
              return (
                <tr key={idx} style={{ borderTop: '1px solid #e5e9f0' }}>
                  <td>{idx + 1}</td>
                  <td>
                    <button onClick={() => setProfileIndex(idx)} style={{ background: 'none', border: 'none', color: '#0b63d1', cursor: 'pointer' }}>{t.name}</button>
                  </td>
                  <td>{t.empId}</td>
                  <td>{t.department}</td>
                  <td>{t.designation}</td>
                  <td>{Number(t.experience) || 0} yrs</td>
                  <td>{(t.subjects || []).join(', ')}</td>
                  <td>{Number(t.load) || 0} hrs</td>
                  <td>{Number(t.rating) || 0}</td>
                  <td>
                    <button onClick={() => onEdit(idx)} disabled={!allowManage}>Edit</button>
                    <button onClick={() => onDelete(idx)} disabled={!allowManage} style={{ marginLeft: 6, color: 'red' }}>Delete</button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      <div style={{ display: 'flex', justifyContent: 'center', gap: 12, margin: '12px 0 20px' }}>
        <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1}>Prev</button>
        <span>Page {page}/{pageCount}</span>
        <button onClick={() => setPage((p) => Math.min(pageCount, p + 1))} disabled={page === pageCount}>Next</button>
      </div>

      {/* Profile Modal */}
      {profileIndex !== null && teachers[profileIndex] && (
        <div onClick={() => setProfileIndex(null)} style={{ position: 'fixed', inset: 0, background: '#0005', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 99 }}>
          <div onClick={(e) => e.stopPropagation()} style={{ background: '#fff', borderRadius: 8, padding: 20, minWidth: 360, maxWidth: 520, boxShadow: '0 6px 24px #0003' }}>
            <h3>Teacher Profile</h3>
            <ul style={{ listStyle: 'none', padding: 0 }}>
              <li><b>Name</b>: {teachers[profileIndex].name}</li>
              <li><b>Employee ID</b>: {teachers[profileIndex].empId}</li>
              <li><b>Department</b>: {teachers[profileIndex].department}</li>
              <li><b>Designation</b>: {teachers[profileIndex].designation}</li>
              <li><b>Email</b>: {teachers[profileIndex].email}</li>
              <li><b>Contact</b>: {teachers[profileIndex].contact}</li>
              <li><b>DOJ</b>: {teachers[profileIndex].doj || '-'}</li>
              <li><b>Experience</b>: {Number(teachers[profileIndex].experience) || 0} yrs</li>
              <li><b>Subjects</b>: {(teachers[profileIndex].subjects || []).join(', ') || '-'}</li>
              <li><b>Qualification</b>: {teachers[profileIndex].qualification || '-'}</li>
              <li><b>Load</b>: {Number(teachers[profileIndex].load) || 0} hrs/week</li>
              <li><b>Rating</b>: {Number(teachers[profileIndex].rating) || 0}</li>
              <li><b>Publications</b>: {Number(teachers[profileIndex].researchPapers) || 0}</li>
              <li><b>Research Area</b>: {teachers[profileIndex].researchArea || '-'}</li>
            </ul>
            <button onClick={() => setProfileIndex(null)} style={{ marginTop: 12 }}>Close</button>
          </div>
        </div>
      )}

      {/* Analytics (basic) */}
      <div style={{ marginTop: 20, background: '#fff', padding: 16, borderRadius: 8, boxShadow: '0 2px 8px #0001' }}>
        <h3>Analytics</h3>
        <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
          <div style={{ background: '#f3f6fb', padding: 12, borderRadius: 8 }}>
            <div><b>Total Teachers:</b> {analytics.total}</div>
            <div><b>Avg. Rating:</b> {analytics.avgRating}</div>
            <div><b>Total Load (hrs/week):</b> {analytics.totalLoad}</div>
          </div>
          <div style={{ background: '#f3f6fb', padding: 12, borderRadius: 8 }}>
            <div><b>Experience Distribution</b></div>
            <div>0-5 yrs: {analytics.expBuckets['0-5']}</div>
            <div>5-10 yrs: {analytics.expBuckets['5-10']}</div>
            <div>10+ yrs: {analytics.expBuckets['10+']}</div>
          </div>
          <div style={{ background: '#f3f6fb', padding: 12, borderRadius: 8 }}>
            <div><b>By Department</b></div>
            {Object.entries(analytics.byDept).map(([dept, count]) => (
              <div key={dept}>{dept}: {count}</div>
            ))}
          </div>
        </div>
        <div style={{ color: '#7a8599', marginTop: 8 }}>Charts (Pie/Bar) can be added with Chart.js/Recharts.</div>
      </div>
    </div>
  );
};

export default TeacherManagement;