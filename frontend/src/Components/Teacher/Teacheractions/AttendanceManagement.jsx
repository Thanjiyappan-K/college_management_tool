import React, { useEffect, useMemo, useState } from "react";

import "../TeacherDashboard.css";

const STORAGE_KEY = "teacherAttendance";

const DEFAULT_CLASSES = [
  { id: "CS101", name: "Introduction to Computer Science" },
  { id: "CS201", name: "Data Structures" },
  { id: "CS305", name: "Web Development" },
];

const DEFAULT_ROSTERS = {
  CS101: [
    { rollNo: "CS101-01", name: "Alice Johnson" },
    { rollNo: "CS101-02", name: "Bob Smith" },
    { rollNo: "CS101-03", name: "Charlie Davis" },
  ],
  CS201: [
    { rollNo: "CS201-01", name: "David Green" },
    { rollNo: "CS201-02", name: "Emily Clark" },
  ],
  CS305: [
    { rollNo: "CS305-01", name: "Frank Lee" },
    { rollNo: "CS305-02", name: "Grace Kim" },
  ],
};

function todayStr(){
  const d = new Date(); const p=(n)=>String(n).padStart(2,'0');
  return `${d.getFullYear()}-${p(d.getMonth()+1)}-${p(d.getDate())}`;
}

const AttendanceManagement = () => {
  const [classes, setClasses] = useState(DEFAULT_CLASSES);
  const [selectedClass, setSelectedClass] = useState("CS101");
  const [date, setDate] = useState(todayStr());
  const [rows, setRows] = useState([]); // {rollNo,name,status,notes}
  const [allRecords, setAllRecords] = useState([]); // persisted list
  const [showHistory, setShowHistory] = useState(false);

  // load persisted attendance
  useEffect(()=>{
    try{ const d = JSON.parse(localStorage.getItem(STORAGE_KEY)||'[]'); setAllRecords(Array.isArray(d)?d:[]);}catch{ setAllRecords([]);}    
  },[]);
  useEffect(()=>{ localStorage.setItem(STORAGE_KEY, JSON.stringify(allRecords)); },[allRecords]);

  // load students for selected class either from students store or defaults
  const loadRoster = (classId) => {
    try {
      const students = JSON.parse(localStorage.getItem("students")||"[]");
      if (Array.isArray(students) && students.length>0) {
        // naive mapping: filter by department/year if classId embeds clues; fallback to defaults
        const def = DEFAULT_ROSTERS[classId] || [];
        if (def.length>0) return def;
        return students.slice(0, 25).map((s, i) => ({ rollNo: `${classId}-${String(i+1).padStart(2,'0')}`, name: s.name || s.regNo || `Student ${i+1}` }));
      }
    } catch {}
    return DEFAULT_ROSTERS[classId] || [];
  };

  // load existing record for class+date or initialize present by default
  const handleLoad = () => {
    const roster = loadRoster(selectedClass);
    const existing = allRecords.find(r => r.classId===selectedClass && r.date===date);
    if (existing) {
      setRows(existing.rows);
    } else {
      setRows(roster.map(r => ({ ...r, status: 'present', notes: '' })));
    }
  };

  useEffect(()=>{ handleLoad(); // initial load
    // eslint-disable-next-line react-hooks/exhaustive-deps
  },[]);

  const updateStatus = (idx, status) => {
    setRows(prev => prev.map((r,i)=> i===idx ? ({ ...r, status }): r));
  };
  const updateNotes = (idx, notes) => {
    setRows(prev => prev.map((r,i)=> i===idx ? ({ ...r, notes }): r));
  };

  const presentCount = useMemo(()=> rows.filter(r=>r.status==='present').length, [rows]);
  const absentCount = useMemo(()=> rows.filter(r=>r.status==='absent').length, [rows]);
  const lateCount = useMemo(()=> rows.filter(r=>r.status==='late').length, [rows]);
  const excusedCount = useMemo(()=> rows.filter(r=>r.status==='excused').length, [rows]);

  const saveAttendance = () => {
    const record = { id: `${selectedClass}-${date}`, classId: selectedClass, date, rows };
    setAllRecords(prev => {
      const idx = prev.findIndex(r => r.classId===selectedClass && r.date===date);
      if (idx>=0) { const copy=[...prev]; copy[idx]=record; return copy; }
      return [record, ...prev];
    });
    // optional notification
    try{ if(Notification && Notification.permission==='granted') new Notification('Attendance saved', { body: `${selectedClass} • ${date}`}); }catch{}
  };

  const exportCSV = () => {
    const header = ['Class','Date','RollNo','Name','Status','Notes'];
    const lines = [header.join(',')];
    rows.forEach(r => lines.push([selectedClass, date, r.rollNo, r.name.replace(/,/g,';'), r.status, (r.notes||'').replace(/,/g,';')].join(',')));
    const blob = new Blob([lines.join('\n')], { type: 'text/csv' });
    const url = URL.createObjectURL(blob); const a=document.createElement('a');
    a.href=url; a.download=`attendance_${selectedClass}_${date}.csv`; a.click(); URL.revokeObjectURL(url);
  };

  const previousForClass = useMemo(()=> allRecords.filter(r=>r.classId===selectedClass).sort((a,b)=> new Date(b.date)-new Date(a.date)), [allRecords, selectedClass]);

  return (
    <div className="attendance-container">
      <h2>Attendance Management</h2>

      <div className="class-selector">
        <label htmlFor="class-select">Select Class:</label>
        <select id="class-select" value={selectedClass} onChange={e=>setSelectedClass(e.target.value)}>
          {classes.map(c => (
            <option key={c.id} value={c.id}>{c.name} ({c.id})</option>
          ))}
        </select>
        <input type="date" value={date} onChange={e=>setDate(e.target.value)} />
        <button className="btn-primary" onClick={handleLoad}>Load</button>
      </div>

      <div className="attendance-stats" style={{ display:'flex', gap:12, margin:'10px 0' }}>
        <span className="badge success">Present: {presentCount}</span>
        <span className="badge warning">Late/Excused: {lateCount+excusedCount}</span>
        <span className="badge danger">Absent: {absentCount}</span>
      </div>

      <div className="attendance-table">
        <table>
          <thead>
            <tr>
              <th>Roll No.</th>
              <th>Student Name</th>
              <th>Status</th>
              <th>Notes</th>
            </tr>
          </thead>
          <tbody>
            {rows.length===0 && (
              <tr><td colSpan="4" style={{ textAlign:'center', color:'#6b7280' }}>No students loaded</td></tr>
            )}
            {rows.map((r, idx) => (
              <tr key={r.rollNo}>
                <td>{r.rollNo}</td>
                <td>{r.name}</td>
                <td>
                  <select value={r.status} onChange={e=>updateStatus(idx, e.target.value)}>
                    <option value="present">Present</option>
                    <option value="absent">Absent</option>
                    <option value="late">Late</option>
                    <option value="excused">Excused</option>
                  </select>
                </td>
                <td><input type="text" value={r.notes} onChange={e=>updateNotes(idx, e.target.value)} placeholder="Optional notes" /></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="attendance-actions">
        <button className="btn-primary" onClick={saveAttendance}>Save Attendance</button>
        <button className="btn-secondary" onClick={exportCSV}>Generate Report</button>
        <button className="btn-secondary" onClick={()=>setShowHistory(true)}>View Previous Records</button>
      </div>

      {showHistory && (
        <div className="modal-overlay" onClick={()=>setShowHistory(false)}>
          <div className="modal-card" onClick={e=>e.stopPropagation()}>
            <h3>Previous Records — {selectedClass}</h3>
            <table>
              <thead>
                <tr><th>Date</th><th>Present</th><th>Absent</th><th>Late</th><th>Excused</th></tr>
              </thead>
              <tbody>
                {previousForClass.length===0 && (<tr><td colSpan="5" style={{ textAlign:'center', color:'#6b7280' }}>No records</td></tr>)}
                {previousForClass.map(rec => {
                  const pc = rec.rows.filter(x=>x.status==='present').length;
                  const ac = rec.rows.filter(x=>x.status==='absent').length;
                  const lc = rec.rows.filter(x=>x.status==='late').length;
                  const ec = rec.rows.filter(x=>x.status==='excused').length;
                  return (
                    <tr key={rec.id}>
                      <td>{rec.date}</td><td>{pc}</td><td>{ac}</td><td>{lc}</td><td>{ec}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
            <div style={{ display:'flex', justifyContent:'flex-end', gap:8, marginTop:10 }}>
              <button className="btn-secondary" onClick={()=>setShowHistory(false)}>Close</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AttendanceManagement;