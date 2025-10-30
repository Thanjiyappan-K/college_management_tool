import React, { useEffect, useMemo, useState } from "react";

const LOCAL_KEY = "courses";

const departments = ["AIML", "CSE", "ECE", "EEE", "MECH", "CIVIL", "BME"];
const courseTypes = ["Core", "Elective", "Lab"];
const semesters = [1, 2, 3, 4, 5, 6, 7, 8];

const emptyForm = {
  id: "",
  name: "",
  department: "",
  semester: "",
  credits: 0,
  type: "",
  faculty: "",
  description: "",
  syllabus: "",
  prerequisites: [],
  version: new Date().getFullYear(),
};

function nowStamp() {
  const d = new Date();
  const pad = (n) => String(n).padStart(2, "0");
  return `${d.getFullYear()}_${pad(d.getMonth() + 1)}_${pad(d.getDate())}_${pad(d.getHours())}_${pad(d.getMinutes())}_${pad(d.getSeconds())}`;
}

const CourseManagement = () => {
  const [courses, setCourses] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [editingIndex, setEditingIndex] = useState(null);
  const [search, setSearch] = useState("");
  const [filters, setFilters] = useState({ department: "", semester: "", faculty: "", type: "" });
  const [page, setPage] = useState(1);
  const [detailIndex, setDetailIndex] = useState(null);

  // Load from storage
  useEffect(() => {
    try {
      const list = JSON.parse(localStorage.getItem(LOCAL_KEY) || "[]");
      setCourses(Array.isArray(list) ? list : []);
    } catch {
      setCourses([]);
    }
  }, []);

  // Persist
  useEffect(() => {
    localStorage.setItem(LOCAL_KEY, JSON.stringify(courses));
  }, [courses]);

  // Pull teachers for assignment dropdown
  const teachers = useMemo(() => {
    try {
      const t = JSON.parse(localStorage.getItem("teachers") || "[]");
      return Array.isArray(t) ? t : [];
    } catch {
      return [];
    }
  }, [detailIndex, editingIndex]);

  const handleInput = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: name === 'credits' || name === 'semester' || name === 'version' ? Number(value) || 0 : value }));
  };

  const handlePrereqChange = (e) => {
    const list = e.target.value
      .split(',')
      .map((s) => s.trim())
      .filter((s) => s.length > 0);
    setForm((prev) => ({ ...prev, prerequisites: list }));
  };

  const prereqCSV = useMemo(() => (form.prerequisites || []).join(', '), [form.prerequisites]);

  const resetForm = () => {
    setForm(emptyForm);
    setEditingIndex(null);
  };

  const validateForm = () => {
    return form.name && form.department && form.semester && form.credits && form.type;
  };

  // Credit management: warn if semester credits exceed 25
  const semesterCreditTotals = useMemo(() => {
    const totals = {};
    courses.forEach((c) => {
      const sem = Number(c.semester) || 0;
      if (!sem) return;
      totals[sem] = (totals[sem] || 0) + (Number(c.credits) || 0);
    });
    return totals;
  }, [courses]);

  const onSubmit = (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    // ID: auto if empty
    const record = {
      ...form,
      id: form.id?.trim() || `${form.department}-${form.semester}-${Date.now()}`,
      credits: Number(form.credits) || 0,
      semester: Number(form.semester) || 0,
      version: Number(form.version) || new Date().getFullYear(),
    };

    // Prerequisite validation: ensure all exist (soft validation)
    const missing = (record.prerequisites || []).filter((p) => !courses.some((c) => c.id === p));
    if (missing.length > 0 && !window.confirm(`These prerequisites don't exist: ${missing.join(', ')}. Continue?`)) return;

    setCourses((prev) => {
      const next = [...prev];
      if (editingIndex !== null) next[editingIndex] = record; else next.push(record);
      return next;
    });

    // Credit alert
    const afterTotals = { ...semesterCreditTotals };
    const current = afterTotals[record.semester] || 0;
    const delta = editingIndex !== null ? (record.credits - (Number(courses[editingIndex]?.credits) || 0)) : record.credits;
    const newTotal = current + delta;
    if (newTotal > 25) {
      alert(`Warning: Semester ${record.semester} total credits would be ${newTotal} (>25).`);
    }

    resetForm();
  };

  const onEdit = (idx) => {
    setForm({ ...emptyForm, ...courses[idx], prerequisites: courses[idx].prerequisites || [] });
    setEditingIndex(idx);
  };

  const onDelete = (idx) => {
    if (!window.confirm('Delete this course?')) return;
    setCourses((prev) => prev.filter((_, i) => i !== idx));
  };

  // Search/Filter
  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase();
    return courses.filter((c) => {
      const matchesSearch =
        !term ||
        c.id?.toLowerCase().includes(term) ||
        c.name?.toLowerCase().includes(term) ||
        c.department?.toLowerCase().includes(term) ||
        c.faculty?.toLowerCase().includes(term) ||
        c.type?.toLowerCase().includes(term);
      const matchesDept = !filters.department || c.department === filters.department;
      const matchesSem = !filters.semester || Number(c.semester) === Number(filters.semester);
      const matchesFac = !filters.faculty || c.faculty === filters.faculty;
      const matchesType = !filters.type || c.type === filters.type;
      return matchesSearch && matchesDept && matchesSem && matchesFac && matchesType;
    });
  }, [courses, search, filters]);

  // Pagination
  const PAGE_SIZE = 8;
  const pageCount = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const pageItems = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);
  useEffect(() => { if (page > pageCount) setPage(1); }, [pageCount, page]);

  // Analytics
  const analytics = useMemo(() => {
    const byDept = {};
    const byType = { Core: 0, Elective: 0, Lab: 0 };
    const bySemester = {};
    const byFacultyLoad = {};
    courses.forEach((c) => {
      byDept[c.department] = (byDept[c.department] || 0) + 1;
      if (c.type) byType[c.type] = (byType[c.type] || 0) + 1;
      const sem = Number(c.semester) || 0;
      if (sem) bySemester[sem] = (bySemester[sem] || 0) + 1;
      if (c.faculty) byFacultyLoad[c.faculty] = (byFacultyLoad[c.faculty] || 0) + 1;
    });
    return { total: courses.length, byDept, byType, bySemester, byFacultyLoad };
  }, [courses]);

  // Export/Import JSON
  const exportJSON = () => {
    const blob = new Blob([JSON.stringify(courses, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'courses_backup.json';
    a.click();
    URL.revokeObjectURL(url);
  };

  const importJSON = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const data = JSON.parse(reader.result);
        if (!Array.isArray(data)) throw new Error('Invalid JSON');
        setCourses(data);
      } catch {
        alert('Invalid JSON file');
      }
    };
    reader.readAsText(file);
  };

  // CSV export (simple)
  const exportCSV = () => {
    const cols = ['id','name','department','semester','credits','type','faculty','description','syllabus','prerequisites','version'];
    const lines = [cols.join(',')];
    courses.forEach((c) => {
      const row = [
        c.id,
        c.name,
        c.department,
        c.semester,
        c.credits,
        c.type,
        c.faculty,
        (c.description || '').replace(/,/g,';'),
        c.syllabus,
        (c.prerequisites || []).join('|'),
        c.version,
      ];
      lines.push(row.join(','));
    });
    const blob = new Blob([lines.join('\n')], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'courses.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  // CSV import (basic, expects our export format)
  const importCSV = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const text = String(reader.result);
        const [header, ...rows] = text.split(/\r?\n/).filter(Boolean);
        const cols = header.split(',');
        const idx = (key) => cols.indexOf(key);
        const list = rows.map((line) => {
          const parts = line.split(',');
          return {
            id: parts[idx('id')],
            name: parts[idx('name')],
            department: parts[idx('department')],
            semester: Number(parts[idx('semester')]) || 0,
            credits: Number(parts[idx('credits')]) || 0,
            type: parts[idx('type')],
            faculty: parts[idx('faculty')],
            description: parts[idx('description')],
            syllabus: parts[idx('syllabus')],
            prerequisites: (parts[idx('prerequisites')] || '').split('|').filter(Boolean),
            version: Number(parts[idx('version')]) || new Date().getFullYear(),
          };
        });
        setCourses(list);
      } catch {
        alert('Invalid CSV file');
      }
    };
    reader.readAsText(file);
  };

  // Backup with timestamp
  const backupNow = () => {
    const key = `course_backup_${nowStamp()}`;
    localStorage.setItem(key, JSON.stringify(courses));
    alert(`Backup saved to localStorage key: ${key}`);
  };

  // Colors
  const btn = {
    base: { padding: '8px 14px', border: 'none', borderRadius: 6, cursor: 'pointer' },
    primary: { background: '#0b63d1', color: '#fff' },
    secondary: { background: '#e9eef7', color: '#0b63d1' },
    danger: { background: '#e53e3e', color: '#fff' },
    success: { background: '#16a34a', color: '#fff' },
  };

  return (
    <div style={{ minHeight: '100vh', background: '#f5f7fa', padding: 20 }}>
      <h2 style={{ marginBottom: 12 }}>Course Management</h2>

      {/* Form */}
      <form onSubmit={onSubmit} style={{ background: '#fff', padding: 16, borderRadius: 8, boxShadow: '0 2px 8px #0001', marginBottom: 16 }}>
        <h3>{editingIndex !== null ? 'Edit' : 'Add'} Course</h3>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
          <input name="id" value={form.id} onChange={handleInput} placeholder="Course ID (auto if blank)" style={{ flex: '1 1 160px' }} />
          <input name="name" value={form.name} onChange={handleInput} placeholder="Course Name" required style={{ flex: '2 1 240px' }} />
          <select name="department" value={form.department} onChange={handleInput} required style={{ flex: '1 1 160px' }}>
            <option value="">Department</option>
            {departments.map((d) => <option key={d} value={d}>{d}</option>)}
          </select>
          <select name="semester" value={form.semester} onChange={handleInput} required style={{ flex: '1 1 120px' }}>
            <option value="">Semester</option>
            {semesters.map((s) => <option key={s} value={s}>{s}</option>)}
          </select>
          <input name="credits" value={form.credits} onChange={handleInput} placeholder="Credits" type="number" min={0} required style={{ flex: '1 1 100px' }} />
          <select name="type" value={form.type} onChange={handleInput} required style={{ flex: '1 1 120px' }}>
            <option value="">Type</option>
            {courseTypes.map((t) => <option key={t} value={t}>{t}</option>)}
          </select>
          <select name="faculty" value={form.faculty} onChange={handleInput} style={{ flex: '1 1 220px' }}>
            <option value="">Assign Faculty (optional)</option>
            {teachers.map((t, i) => (
              <option key={`${t.empId || t.name}-${i}`} value={t.name}>{t.name} {t.department ? `(${t.department})` : ''}</option>
            ))}
          </select>
          <input name="syllabus" value={form.syllabus} onChange={handleInput} placeholder="Syllabus URL" style={{ flex: '2 1 280px' }} />
          <input name="version" value={form.version} onChange={handleInput} placeholder="Version Year" type="number" min={2000} style={{ flex: '1 1 120px' }} />
          <input value={prereqCSV} onChange={handlePrereqChange} placeholder="Prerequisites (comma separated course IDs)" style={{ flex: '2 1 320px' }} />
          <textarea name="description" value={form.description} onChange={handleInput} placeholder="Description / Syllabus notes" rows={2} style={{ flex: '1 1 100%', resize: 'vertical' }} />
        </div>
        <div style={{ marginTop: 10, display: 'flex', gap: 8 }}>
          <button type="submit" style={{ ...btn.base, ...btn.primary }}>{editingIndex !== null ? 'Update' : 'Add Course'}</button>
          {editingIndex !== null && (
            <button type="button" onClick={resetForm} style={{ ...btn.base, ...btn.secondary }}>Cancel</button>
          )}
          <button type="button" onClick={backupNow} style={{ ...btn.base, ...btn.success, marginLeft: 'auto' }}>Backup Now</button>
        </div>
      </form>

      {/* Search & Filters and Import/Export */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, alignItems: 'center', margin: '8px 0 12px' }}>
        <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search id, name, department, faculty, type..." style={{ flex: '2 1 320px', padding: 6 }} />
        <select value={filters.department} onChange={(e) => setFilters((f) => ({ ...f, department: e.target.value }))} style={{ flex: '1 1 160px' }}>
          <option value="">All Departments</option>
          {departments.map((d) => <option key={d} value={d}>{d}</option>)}
        </select>
        <select value={filters.semester} onChange={(e) => setFilters((f) => ({ ...f, semester: e.target.value }))} style={{ flex: '1 1 140px' }}>
          <option value="">All Semesters</option>
          {semesters.map((s) => <option key={s} value={s}>{s}</option>)}
        </select>
        <select value={filters.type} onChange={(e) => setFilters((f) => ({ ...f, type: e.target.value }))} style={{ flex: '1 1 140px' }}>
          <option value="">All Types</option>
          {courseTypes.map((t) => <option key={t} value={t}>{t}</option>)}
        </select>
        <select value={filters.faculty} onChange={(e) => setFilters((f) => ({ ...f, faculty: e.target.value }))} style={{ flex: '1 1 220px' }}>
          <option value="">All Faculty</option>
          {teachers.map((t, i) => <option key={`${t.empId || t.name}-${i}`} value={t.name}>{t.name}</option>)}
        </select>

        <div style={{ marginLeft: 'auto', display: 'flex', gap: 8 }}>
          <button onClick={exportJSON} style={{ ...btn.base, ...btn.secondary }}>Export JSON</button>
          <label style={{ ...btn.base, ...btn.secondary }}>
            Import JSON
            <input type="file" accept="application/json" onChange={importJSON} style={{ display: 'none' }} />
          </label>
          <button onClick={exportCSV} style={{ ...btn.base, ...btn.secondary }}>Export CSV</button>
          <label style={{ ...btn.base, ...btn.secondary }}>
            Import CSV
            <input type="file" accept="text/csv,.csv" onChange={importCSV} style={{ display: 'none' }} />
          </label>
        </div>
      </div>

      {/* List */}
      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', background: '#fff', borderRadius: 8, overflow: 'hidden', boxShadow: '0 1px 6px #0001' }}>
          <thead>
            <tr style={{ background: '#e9f0fa' }}>
              <th>#</th>
              <th>ID</th>
              <th>Name</th>
              <th>Dept</th>
              <th>Sem</th>
              <th>Credits</th>
              <th>Type</th>
              <th>Faculty</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {pageItems.length === 0 && (
              <tr><td colSpan="9" style={{ textAlign: 'center', color: '#777' }}>No courses found</td></tr>
            )}
            {pageItems.map((c, i) => {
              const idx = (page - 1) * PAGE_SIZE + i;
              return (
                <tr key={idx} style={{ borderTop: '1px solid #e5e9f0' }}>
                  <td>{idx + 1}</td>
                  <td>
                    <button onClick={() => setDetailIndex(idx)} style={{ background: 'none', border: 'none', color: '#0b63d1', cursor: 'pointer' }}>{c.id}</button>
                  </td>
                  <td>{c.name}</td>
                  <td>{c.department}</td>
                  <td>{c.semester}</td>
                  <td>{c.credits}</td>
                  <td>{c.type}</td>
                  <td>{c.faculty || '-'}</td>
                  <td>
                    <button onClick={() => onEdit(idx)} style={{ ...btn.base, ...btn.secondary }}>Edit</button>
                    <button onClick={() => onDelete(idx)} style={{ ...btn.base, ...btn.danger, marginLeft: 6 }}>Delete</button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      <div style={{ display: 'flex', justifyContent: 'center', gap: 12, margin: '12px 0 20px' }}>
        <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1} style={{ ...btn.base, ...btn.secondary }}>Prev</button>
        <span>Page {page}/{pageCount}</span>
        <button onClick={() => setPage((p) => Math.min(pageCount, p + 1))} disabled={page === pageCount} style={{ ...btn.base, ...btn.secondary }}>Next</button>
      </div>

      {/* Detail Modal */}
      {detailIndex !== null && courses[detailIndex] && (
        <div onClick={() => setDetailIndex(null)} style={{ position: 'fixed', inset: 0, background: '#0005', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 99 }}>
          <div onClick={(e) => e.stopPropagation()} style={{ background: '#fff', borderRadius: 8, padding: 20, minWidth: 420, maxWidth: 640, boxShadow: '0 6px 24px #0003' }}>
            <h3>Course Details</h3>
            <ul style={{ listStyle: 'none', padding: 0 }}>
              <li><b>ID</b>: {courses[detailIndex].id}</li>
              <li><b>Name</b>: {courses[detailIndex].name}</li>
              <li><b>Department</b>: {courses[detailIndex].department}</li>
              <li><b>Semester</b>: {courses[detailIndex].semester}</li>
              <li><b>Credits</b>: {courses[detailIndex].credits}</li>
              <li><b>Type</b>: {courses[detailIndex].type}</li>
              <li><b>Faculty</b>: {courses[detailIndex].faculty || '-'}</li>
              <li><b>Version</b>: {courses[detailIndex].version}</li>
              <li><b>Prerequisites</b>: {(courses[detailIndex].prerequisites || []).join(', ') || '-'}</li>
              <li><b>Description</b>: {courses[detailIndex].description || '-'}</li>
              <li><b>Syllabus</b>: {courses[detailIndex].syllabus ? (<a href={courses[detailIndex].syllabus} target="_blank" rel="noreferrer">Open</a>) : '-'}</li>
            </ul>
            <button onClick={() => setDetailIndex(null)} style={{ ...btn.base, ...btn.primary, marginTop: 12 }}>Close</button>
          </div>
        </div>
      )}

      {/* Analytics */}
      <div style={{ marginTop: 20, background: '#fff', padding: 16, borderRadius: 8, boxShadow: '0 2px 8px #0001' }}>
        <h3>Analytics</h3>
        <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
          <div style={{ background: '#f3f6fb', padding: 12, borderRadius: 8 }}>
            <div><b>Total Courses:</b> {analytics.total}</div>
          </div>
          <div style={{ background: '#f3f6fb', padding: 12, borderRadius: 8 }}>
            <div><b>Core/Elective/Lab</b></div>
            <div>Core: {analytics.byType.Core || 0}</div>
            <div>Elective: {analytics.byType.Elective || 0}</div>
            <div>Lab: {analytics.byType.Lab || 0}</div>
          </div>
          <div style={{ background: '#f3f6fb', padding: 12, borderRadius: 8 }}>
            <div><b>By Department</b></div>
            {Object.entries(analytics.byDept).map(([d, c]) => <div key={d}>{d}: {c}</div>)}
          </div>
          <div style={{ background: '#f3f6fb', padding: 12, borderRadius: 8 }}>
            <div><b>Semester-wise Count</b></div>
            {Object.entries(analytics.bySemester).map(([s, c]) => <div key={s}>Sem {s}: {c}</div>)}
          </div>
          <div style={{ background: '#f3f6fb', padding: 12, borderRadius: 8 }}>
            <div><b>Faculty Load</b></div>
            {Object.entries(analytics.byFacultyLoad).map(([f, c]) => <div key={f}>{f}: {c} course(s)</div>)}
          </div>
        </div>
        <div style={{ color: '#7a8599', marginTop: 8 }}>Charts (Bar/Pie) can be added with Chart.js/Recharts.</div>
      </div>
    </div>
  );
};

export default CourseManagement;