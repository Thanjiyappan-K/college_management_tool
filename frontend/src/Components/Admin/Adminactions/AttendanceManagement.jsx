import React, { useEffect, useMemo, useState } from "react";

const KEYS = {
  attendance: "attendance",
  attendanceReports: "attendanceReports",
  lockSettings: "attendance.settings",
};

const semesters = [1,2,3,4,5,6,7,8];
const departments = ["AIML","CSE","ECE","EEE","MECH","CIVIL","BME"];

function todayStr() {
  const d = new Date();
  const pad = (n) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())}`;
}

function parseDate(d) {
  const x = new Date(d);
  return isNaN(x.getTime()) ? null : x;
}

const btn = {
  base: { padding: '8px 14px', border: 'none', borderRadius: 6, cursor: 'pointer' },
  primary: { background: '#0b63d1', color: '#fff' },
  secondary: { background: '#e9eef7', color: '#0b63d1' },
  danger: { background: '#e53e3e', color: '#fff' },
  success: { background: '#16a34a', color: '#fff' },
  warning: { background: '#f59e0b', color: '#fff' },
};

const emptyMarkForm = {
  date: todayStr(),
  department: "",
  semester: "",
  courseId: "",
};

const AttendanceManagement = () => {
  const [records, setRecords] = useState([]); // [{date, courseId, department, semester, records:[{studentId,status}]}]
  const [markForm, setMarkForm] = useState(emptyMarkForm);
  const [filter, setFilter] = useState({ department: "", courseId: "", dateFrom: "", dateTo: "", student: "" });
  const [page, setPage] = useState(1);
  const [studentModalId, setStudentModalId] = useState(null);
  const [lockSettings, setLockSettings] = useState({ lockBefore: "" });

  // linked local data
  const students = useMemo(() => {
    try { const s = JSON.parse(localStorage.getItem("students")||"[]"); return Array.isArray(s)?s:[]; } catch { return []; }
  }, []);
  const courses = useMemo(() => {
    try { const c = JSON.parse(localStorage.getItem("courses")||"[]"); return Array.isArray(c)?c:[]; } catch { return []; }
  }, []);

  // load/persist
  useEffect(() => {
    try { const a = JSON.parse(localStorage.getItem(KEYS.attendance)||"[]"); setRecords(Array.isArray(a)?a:[]); } catch { setRecords([]); }
    try { const s = JSON.parse(localStorage.getItem(KEYS.lockSettings)||"{}"); setLockSettings(s || {}); } catch { setLockSettings({}); }
  }, []);
  useEffect(() => { localStorage.setItem(KEYS.attendance, JSON.stringify(records)); }, [records]);
  useEffect(() => { localStorage.setItem(KEYS.lockSettings, JSON.stringify(lockSettings)); }, [lockSettings]);

  // options derived
  const courseOptions = useMemo(() => {
    const { department, semester } = markForm;
    return courses.filter(c => (
      (!department || c.department===department) && (!semester || Number(c.semester)===Number(semester))
    ));
  }, [courses, markForm.department, markForm.semester]);

  const enrolledStudents = useMemo(() => {
    const { department, semester } = markForm;
    // Simulate enrollment by department+semester from students store
    return students.filter(s => (
      (!department || s.department===department) && (!semester || Number(s.year)===Number(semester))
    ));
  }, [students, markForm.department, markForm.semester]);

  // in-memory mark map for current form
  const [markMap, setMarkMap] = useState({}); // studentId => 'Present'|'Absent'
  useEffect(() => {
    // initialize to Present for all listed students
    const next = {};
    enrolledStudents.forEach(s => { next[s.regNo || s.id || s.email || s.name] = 'Present'; });
    setMarkMap(next);
  }, [enrolledStudents]);

  const isLockedDate = (dStr) => {
    if (!lockSettings?.lockBefore) return false;
    const lockDate = parseDate(lockSettings.lockBefore);
    const d = parseDate(dStr);
    if (!lockDate || !d) return false;
    return d < lockDate; // locked for dates before lockBefore
  };

  const handleMarkSubmit = (e) => {
    e.preventDefault();
    if (!markForm.department || !markForm.semester || !markForm.date) return;
    if (isLockedDate(markForm.date)) { alert('Attendance is locked for this date'); return; }
    const list = Object.entries(markMap).map(([studentId, status]) => ({ studentId, status }));
    const newEntry = { date: markForm.date, courseId: markForm.courseId || '', department: markForm.department, semester: Number(markForm.semester)||0, records: list, verified: false };
    setRecords(prev => {
      // if existing entry for same date/course/department/semester, replace
      const idx = prev.findIndex(r => r.date===newEntry.date && r.courseId===newEntry.courseId && r.department===newEntry.department && Number(r.semester)===newEntry.semester);
      if (idx >= 0) {
        const copy = [...prev];
        copy[idx] = newEntry;
        return copy;
      }
      return [...prev, newEntry];
    });
  };

  // Records view filters
  const filtered = useMemo(() => {
    const { department, courseId, dateFrom, dateTo, student } = filter;
    const fromD = dateFrom ? parseDate(dateFrom) : null;
    const toD = dateTo ? parseDate(dateTo) : null;
    const studentTerm = (student||'').trim().toLowerCase();
    return records.filter(r => {
      const matchesDept = !department || r.department===department;
      const matchesCourse = !courseId || r.courseId===courseId;
      const rd = parseDate(r.date);
      const matchesFrom = !fromD || (rd && rd >= fromD);
      const matchesTo = !toD || (rd && rd <= toD);
      const matchesStudent = !studentTerm || (r.records||[]).some(x => (x.studentId||'').toLowerCase().includes(studentTerm));
      return matchesDept && matchesCourse && matchesFrom && matchesTo && matchesStudent;
    });
  }, [records, filter]);

  // Pagination
  const PAGE_SIZE = 8;
  const pageCount = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const pageItems = filtered.slice((page-1)*PAGE_SIZE, page*PAGE_SIZE);
  useEffect(()=>{ if(page>pageCount) setPage(1); }, [pageCount, page]);

  // Edit single record cell
  const toggleStatus = (entryIndex, studentId) => {
    const entry = filtered[entryIndex];
    if (!entry) return;
    if (isLockedDate(entry.date) || entry.verified) { alert('Locked/Verified: cannot edit'); return; }
    setRecords(prev => {
      const idx = prev.findIndex(r => r.date===entry.date && r.courseId===entry.courseId && r.department===entry.department && Number(r.semester)===Number(entry.semester));
      if (idx<0) return prev;
      const copy = [...prev];
      const recCopy = [...copy[idx].records];
      const rIdx = recCopy.findIndex(r => r.studentId===studentId);
      if (rIdx>=0) {
        recCopy[rIdx] = { ...recCopy[rIdx], status: recCopy[rIdx].status==='Present'?'Absent':'Present' };
      }
      copy[idx] = { ...copy[idx], records: recCopy };
      return copy;
    });
  };

  // Percentage calculations
  const courseAttendancePercent = (entry) => {
    const total = (entry.records||[]).length || 1;
    const present = (entry.records||[]).filter(r => r.status==='Present').length;
    return Math.round((present/total)*100);
  };

  const studentOverallPercent = (studentId) => {
    const all = records.flatMap(e => e.records.map(r => ({ date:e.date, courseId:e.courseId, ...r })) ).filter(r => r.studentId===studentId);
    const total = all.length || 1;
    const present = all.filter(r => r.status==='Present').length;
    return Math.round((present/total)*100);
  };

  const pctBadge = (pct) => {
    const style = pct>90?btn.success: pct>=75?btn.warning:btn.danger;
    return <span style={{ ...btn.base, ...style, padding: '2px 8px' }}>{pct}%</span>;
  };

  // Analytics (basic numbers; chart placeholders)
  const analytics = useMemo(() => {
    const byDept = {};
    const byCourse = {};
    const studentMissCount = {};
    records.forEach(e => {
      byDept[e.department] = (byDept[e.department]||{ total:0, present:0 });
      const present = e.records.filter(r=>r.status==='Present').length;
      byDept[e.department].total += e.records.length;
      byDept[e.department].present += present;
      byCourse[e.courseId||'N/A'] = (byCourse[e.courseId||'N/A']||{ total:0, present:0 });
      byCourse[e.courseId||'N/A'].total += e.records.length;
      byCourse[e.courseId||'N/A'].present += present;
      e.records.forEach(r=>{ if(r.status==='Absent'){ studentMissCount[r.studentId]=(studentMissCount[r.studentId]||0)+1; }});
    });
    const avgDept = Object.fromEntries(Object.entries(byDept).map(([k,v]) => [k, v.total? Math.round((v.present/v.total)*100):0]));
    const avgCourse = Object.fromEntries(Object.entries(byCourse).map(([k,v]) => [k, v.total? Math.round((v.present/v.total)*100):0]));
    const topIrregular = Object.entries(studentMissCount).sort((a,b)=>b[1]-a[1]).slice(0,5).map(([id,count])=>({id,count}));
    return { avgDept, avgCourse, topIrregular };
  }, [records]);

  // Export/Import JSON
  const exportJSON = () => {
    const blob = new Blob([JSON.stringify(records, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob); const a = document.createElement('a');
    a.href=url; a.download='attendance_backup.json'; a.click(); URL.revokeObjectURL(url);
  };
  const importJSON = (e) => {
    const f = e.target.files?.[0]; if(!f) return; const reader = new FileReader();
    reader.onload = () => { try { const d = JSON.parse(reader.result); if(!Array.isArray(d)) throw new Error(); setRecords(d);} catch { alert('Invalid JSON'); } };
    reader.readAsText(f);
  };

  // CSV export/import
  const exportCSV = () => {
    const cols = ['date','courseId','department','semester','studentId','status'];
    const lines = [cols.join(',')];
    records.forEach(e => {
      e.records.forEach(r => {
        lines.push([e.date, e.courseId||'', e.department, e.semester, r.studentId, r.status].join(','));
      });
    });
    const blob = new Blob([lines.join('\n')], { type: 'text/csv' });
    const url = URL.createObjectURL(blob); const a = document.createElement('a');
    a.href=url; a.download='attendance.csv'; a.click(); URL.revokeObjectURL(url);
  };
  const importCSV = (e) => {
    const f = e.target.files?.[0]; if(!f) return; const reader = new FileReader();
    reader.onload = () => {
      try {
        const text = String(reader.result);
        const [header, ...rows] = text.split(/\r?\n/).filter(Boolean);
        const cols = header.split(','); const idx = (k)=>cols.indexOf(k);
        const grouped = {};
        rows.forEach(line => {
          const p = line.split(',');
          const key = `${p[idx('date')]}|${p[idx('courseId')]}|${p[idx('department')]}|${p[idx('semester')]}`;
          grouped[key] = grouped[key] || { date:p[idx('date')], courseId:p[idx('courseId')], department:p[idx('department')], semester:Number(p[idx('semester')])||0, records:[] };
          grouped[key].records.push({ studentId:p[idx('studentId')], status:p[idx('status')] });
        });
        setRecords(Object.values(grouped));
      } catch { alert('Invalid CSV'); }
    };
    reader.readAsText(f);
  };

  // Reports & lock
  const saveMonthlyReport = () => {
    const monthName = new Date().toLocaleString('default', { month: 'long', year: 'numeric' });
    const report = {
      month: monthName,
      avgDept: analytics.avgDept,
      topIrregular: analytics.topIrregular,
      createdAt: new Date().toISOString(),
    };
    try {
      const list = JSON.parse(localStorage.getItem(KEYS.attendanceReports)||'[]');
      list.push(report); localStorage.setItem(KEYS.attendanceReports, JSON.stringify(list));
      alert('Monthly report saved.');
    } catch { alert('Unable to save report'); }
  };

  const toggleVerify = (entry) => {
    if (isLockedDate(entry.date)) { alert('Locked: cannot verify'); return; }
    setRecords(prev => prev.map(e => (e===entry? { ...e, verified: !e.verified }: e)));
  };

  const studentsForModal = useMemo(() => {
    if (!studentModalId) return [];
    return records.flatMap(e => ({ date:e.date, courseId:e.courseId, department:e.department, semester:e.semester, rec:e.records.find(r=>r.studentId===studentModalId)}))
      .filter(x=>x.rec).map(x=>({ date:x.date, courseId:x.courseId, status:x.rec.status }));
  }, [studentModalId, records]);

  return (
    <div style={{ minHeight: '100vh', background: '#f5f7fa', padding: 20 }}>
      <h2 style={{ marginBottom: 12 }}>Attendance Management</h2>

      {/* Mark Attendance */}
      <form onSubmit={handleMarkSubmit} style={{ background:'#fff', padding:16, borderRadius:8, boxShadow:'0 2px 8px #0001', marginBottom:16 }}>
        <h3>Mark Attendance</h3>
        <div style={{ display:'flex', flexWrap:'wrap', gap:10 }}>
          <input type="date" name="date" value={markForm.date} onChange={(e)=>setMarkForm(f=>({ ...f, date:e.target.value }))} style={{ flex:'1 1 150px' }} />
          <select name="department" value={markForm.department} onChange={(e)=>setMarkForm(f=>({ ...f, department:e.target.value }))} style={{ flex:'1 1 160px' }}>
            <option value="">Department</option>
            {departments.map(d=>(<option key={d} value={d}>{d}</option>))}
          </select>
          <select name="semester" value={markForm.semester} onChange={(e)=>setMarkForm(f=>({ ...f, semester:e.target.value }))} style={{ flex:'1 1 120px' }}>
            <option value="">Semester</option>
            {semesters.map(s=>(<option key={s} value={s}>{s}</option>))}
          </select>
          <select name="courseId" value={markForm.courseId} onChange={(e)=>setMarkForm(f=>({ ...f, courseId:e.target.value }))} style={{ flex:'2 1 240px' }}>
            <option value="">Course (optional)</option>
            {courseOptions.map(c=>(<option key={c.id} value={c.id}>{c.id} - {c.name}</option>))}
          </select>
        </div>

        <div style={{ marginTop:10 }}>
          <h4>Students ({enrolledStudents.length})</h4>
          <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill, minmax(220px,1fr))', gap:8 }}>
            {enrolledStudents.map(s => {
              const id = s.regNo || s.id || s.email || s.name;
              return (
                <label key={id} style={{ display:'flex', alignItems:'center', gap:8, background:'#f6f8fc', padding:'6px 8px', borderRadius:6 }}>
                  <input type="checkbox" checked={(markMap[id]||'Present')==='Present'} onChange={()=>setMarkMap(mm=>({ ...mm, [id]:(mm[id]==='Present'?'Absent':'Present') }))} />
                  <span style={{ fontWeight:600 }}>{s.name}</span>
                  <span style={{ color:'#6b7280' }}>{id}</span>
                </label>
              );
            })}
          </div>
        </div>
        <div style={{ marginTop:10 }}>
          <button type="submit" style={{ ...btn.base, ...btn.primary }} disabled={isLockedDate(markForm.date)}>Save Attendance</button>
        </div>
      </form>

      {/* Records Filters + Import/Export */}
      <div style={{ display:'flex', flexWrap:'wrap', gap:10, alignItems:'center', margin:'8px 0 12px' }}>
        <select value={filter.department} onChange={(e)=>setFilter(f=>({ ...f, department:e.target.value }))} style={{ flex:'1 1 160px' }}>
          <option value="">All Departments</option>
          {departments.map(d=>(<option key={d} value={d}>{d}</option>))}
        </select>
        <select value={filter.courseId} onChange={(e)=>setFilter(f=>({ ...f, courseId:e.target.value }))} style={{ flex:'1 1 200px' }}>
          <option value="">All Courses</option>
          {courses.map(c=>(<option key={c.id} value={c.id}>{c.id} - {c.name}</option>))}
        </select>
        <input type="date" value={filter.dateFrom} onChange={(e)=>setFilter(f=>({ ...f, dateFrom:e.target.value }))} style={{ flex:'1 1 150px' }} />
        <input type="date" value={filter.dateTo} onChange={(e)=>setFilter(f=>({ ...f, dateTo:e.target.value }))} style={{ flex:'1 1 150px' }} />
        <input placeholder="Student name/ID" value={filter.student} onChange={(e)=>setFilter(f=>({ ...f, student:e.target.value }))} style={{ flex:'1 1 200px' }} />

        <div style={{ marginLeft:'auto', display:'flex', gap:8 }}>
          <button onClick={exportJSON} style={{ ...btn.base, ...btn.secondary }}>Export JSON</button>
          <label style={{ ...btn.base, ...btn.secondary }}>
            Import JSON
            <input type="file" accept="application/json" onChange={importJSON} style={{ display:'none' }} />
          </label>
          <button onClick={exportCSV} style={{ ...btn.base, ...btn.secondary }}>Export CSV</button>
          <label style={{ ...btn.base, ...btn.secondary }}>
            Import CSV
            <input type="file" accept="text/csv,.csv" onChange={importCSV} style={{ display:'none' }} />
          </label>
        </div>
      </div>

      {/* Records Table */}
      <div style={{ overflowX:'auto' }}>
        <table style={{ width:'100%', background:'#fff', borderRadius:8, overflow:'hidden', boxShadow:'0 1px 6px #0001' }}>
          <thead>
            <tr style={{ background:'#e9f0fa' }}>
              <th>#</th>
              <th>Date</th>
              <th>Course</th>
              <th>Dept</th>
              <th>Sem</th>
              <th>Present%</th>
              <th>Verified</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {pageItems.length===0 && (<tr><td colSpan="8" style={{ textAlign:'center', color:'#777' }}>No records</td></tr>)}
            {pageItems.map((e, i) => {
              const idx = (page-1)*PAGE_SIZE + i;
              const pct = courseAttendancePercent(e);
              return (
                <tr key={idx} style={{ borderTop:'1px solid #e5e9f0' }}>
                  <td>{idx+1}</td>
                  <td>{e.date}</td>
                  <td>{e.courseId || '-'}</td>
                  <td>{e.department}</td>
                  <td>{e.semester}</td>
                  <td>{pctBadge(pct)}</td>
                  <td>{e.verified? 'Yes':'No'}</td>
                  <td>
                    <button onClick={()=>toggleVerify(e)} style={{ ...btn.base, ...btn.success }} disabled={isLockedDate(e.date)}>{e.verified? 'Unverify':'Verify'}</button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      <div style={{ display:'flex', justifyContent:'center', gap:12, margin:'12px 0 16px' }}>
        <button onClick={()=>setPage(p=>Math.max(1,p-1))} disabled={page===1} style={{ ...btn.base, ...btn.secondary }}>Prev</button>
        <span>Page {page}/{pageCount}</span>
        <button onClick={()=>setPage(p=>Math.min(pageCount,p+1))} disabled={page===pageCount} style={{ ...btn.base, ...btn.secondary }}>Next</button>
      </div>

      {/* Quick Analytics */}
      <div style={{ marginTop:20, background:'#fff', padding:16, borderRadius:8, boxShadow:'0 2px 8px #0001' }}>
        <h3>Analytics</h3>
        <div style={{ display:'flex', gap:16, flexWrap:'wrap' }}>
          <div style={{ background:'#f3f6fb', padding:12, borderRadius:8 }}>
            <div><b>Avg by Dept</b></div>
            {Object.entries(analytics.avgDept).map(([d,p])=>(<div key={d}>{d}: {pctBadge(p)}</div>))}
          </div>
          <div style={{ background:'#f3f6fb', padding:12, borderRadius:8 }}>
            <div><b>Avg by Course</b></div>
            {Object.entries(analytics.avgCourse).map(([c,p])=>(<div key={c}>{c}: {pctBadge(p)}</div>))}
          </div>
          <div style={{ background:'#f3f6fb', padding:12, borderRadius:8 }}>
            <div><b>Top 5 Irregular</b></div>
            {analytics.topIrregular.map(s=> (
              <div key={s.id}>
                <button onClick={()=>setStudentModalId(s.id)} style={{ background:'none', border:'none', color:'#0b63d1', cursor:'pointer' }}>{s.id}</button> missed {s.count}
              </div>
            ))}
          </div>
        </div>
        <div style={{ color:'#7a8599', marginTop:8 }}>Charts (bar/line) can be added with Chart.js/Recharts.</div>
        <div style={{ marginTop:10, display:'flex', gap:8 }}>
          <button onClick={saveMonthlyReport} style={{ ...btn.base, ...btn.primary }}>Save Monthly Report</button>
        </div>
      </div>

      {/* Settings: Lock */}
      <div style={{ marginTop:16, background:'#fff', padding:16, borderRadius:8, boxShadow:'0 2px 8px #0001' }}>
        <h3>Lock Settings</h3>
        <div style={{ display:'flex', gap:10, alignItems:'center' }}>
          <label>Lock attendance before: <input type="date" value={lockSettings.lockBefore||""} onChange={(e)=>setLockSettings(s=>({ ...s, lockBefore:e.target.value }))} /></label>
          <span style={{ color:'#6b7280' }}>Editing blocked for dates before this day.</span>
        </div>
      </div>

      {/* Student-wise modal */}
      {studentModalId && (
        <div onClick={()=>setStudentModalId(null)} style={{ position:'fixed', inset:0, background:'#0005', display:'flex', alignItems:'center', justifyContent:'center', zIndex:99 }}>
          <div onClick={(e)=>e.stopPropagation()} style={{ background:'#fff', borderRadius:8, padding:20, minWidth:360, maxWidth:560, boxShadow:'0 6px 24px #0003' }}>
            <h3>Student Attendance</h3>
            <div style={{ marginBottom:8 }}><b>Student:</b> {studentModalId} &nbsp; <b>Overall:</b> {pctBadge(studentOverallPercent(studentModalId))}</div>
            <table style={{ width:'100%' }}>
              <thead>
                <tr><th>Date</th><th>Course</th><th>Status</th></tr>
              </thead>
              <tbody>
                {studentsForModal.map((r,i)=>(
                  <tr key={i}>
                    <td>{r.date}</td>
                    <td>{r.courseId || '-'}</td>
                    <td>{r.status}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div style={{ marginTop:10, textAlign:'right' }}>
              <button onClick={()=>setStudentModalId(null)} style={{ ...btn.base, ...btn.primary }}>Close</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AttendanceManagement;


