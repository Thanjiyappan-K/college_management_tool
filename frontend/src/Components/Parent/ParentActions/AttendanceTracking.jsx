import React, { useEffect, useMemo, useRef, useState } from 'react';
import "../ParentDashboard.css";

// Storage keys
const ATTN_KEY = "attendanceData";
const ATTN_FILTERS_KEY = "attendance_filters";
const ATTN_THEME_KEY = "attendance_theme";
const ATTN_LAST_STUDENT_KEY = "attendance_last_student";

const safeParse = (value, fallback) => {
  try {
    const parsed = JSON.parse(value);
    return parsed ?? fallback;
  } catch (e) {
    return fallback;
  }
};

const loadAttn = () => safeParse(localStorage.getItem(ATTN_KEY), []);
const saveAttn = (data) => localStorage.setItem(ATTN_KEY, JSON.stringify(data));

const monthOf = (isoDate) => {
  if (!isoDate) return "";
  const d = new Date(isoDate);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
};

const percent = (present, total) => total > 0 ? (present / total) * 100 : 0;

const ProgressCircle = ({ value, size = 64, stroke = 8, color = '#22c55e' }) => {
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference * (1 - Math.min(100, Math.max(0, value)) / 100);
  return (
    <svg width={size} height={size}>
      <circle cx={size/2} cy={size/2} r={radius} stroke="#e5e7eb" strokeWidth={stroke} fill="none"/>
      <circle cx={size/2} cy={size/2} r={radius} stroke={color} strokeWidth={stroke} fill="none" strokeDasharray={circumference} strokeDashoffset={offset} strokeLinecap="round" transform={`rotate(-90 ${size/2} ${size/2})`}/>
      <text x="50%" y="50%" textAnchor="middle" dominantBaseline="central" fontSize={12}>{Math.round(value)}%</text>
    </svg>
  );
};

const BarChart = ({ data, labels, title }) => {
  const max = Math.max(1, ...data);
  return (
    <div style={{ padding: 8, border: '1px solid var(--border-color,#ddd)', borderRadius: 8 }}>
      <div style={{ marginBottom: 8, fontWeight: 600 }}>{title}</div>
      <div style={{ display: 'flex', gap: 8, alignItems: 'flex-end', height: 120 }}>
        {data.map((v, i) => (
          <div key={i} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
            <div style={{ width: 24, height: `${(v / max) * 100}%`, background: 'var(--accent,#4f46e5)', borderRadius: 4 }} />
            <div style={{ fontSize: 12 }}>{labels[i]}</div>
          </div>
        ))}
      </div>
    </div>
  );
};

const LineChart = ({ data, labels, title }) => {
  const width = 300;
  const height = 140;
  const padding = 24;
  const max = Math.max(1, ...data);
  const min = Math.min(0, ...data);
  const points = data.map((v, i) => {
    const x = padding + (i * (width - 2 * padding)) / Math.max(1, data.length - 1);
    const y = height - padding - ((v - min) / Math.max(1, max - min)) * (height - 2 * padding);
    return `${x},${y}`;
  }).join(' ');
  return (
    <div style={{ padding: 8, border: '1px solid var(--border-color,#ddd)', borderRadius: 8 }}>
      <div style={{ marginBottom: 8, fontWeight: 600 }}>{title}</div>
      <svg width={width} height={height}>
        <polyline fill="none" stroke="var(--accent,#4f46e5)" strokeWidth="2" points={points} />
      </svg>
      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, marginTop: 4 }}>
        {labels.map((l, i) => (<div key={i}>{l}</div>))}
      </div>
    </div>
  );
};

const ExportButtons = ({ data }) => {
  const handleExportCSV = () => {
    const rows = [[
      'studentId','name','course','teacher','presentDays','absentDays','attendance','date','status','reason'
    ]];
    data.forEach(s => {
      (s.classes || []).forEach(c => {
        if (c.history && c.history.length) {
          c.history.forEach(h => {
            rows.push([s.studentId, s.name, c.courseName, c.teacher, c.presentDays, c.absentDays, c.attendance, h.date, h.status, h.reason || '']);
          });
        } else {
          rows.push([s.studentId, s.name, c.courseName, c.teacher, c.presentDays, c.absentDays, c.attendance, '', '', '']);
        }
      });
    });
    const csv = rows.map(r => r.map(v => {
      const s = v == null ? '' : String(v);
      if (s.includes(',') || s.includes('\n') || s.includes('"')) return '"' + s.replace(/"/g, '""') + '"';
      return s;
    }).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'attendance_summary.csv';
    a.click();
    URL.revokeObjectURL(url);
  };
  return (
    <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
      <button onClick={handleExportCSV}>Download CSV</button>
    </div>
  );
};

const AttendanceTracking = ({ childData }) => {
  const initialStudentId = childData?.id || childData?.studentId || childData?.name || 'UNKNOWN';
  const [theme, setTheme] = useState(() => localStorage.getItem(ATTN_THEME_KEY) || 'light');
  const [allData, setAllData] = useState(() => loadAttn());
  const [selectedStudentId, setSelectedStudentId] = useState(() => localStorage.getItem(ATTN_LAST_STUDENT_KEY) || initialStudentId);
  const [view, setView] = useState('overall'); // overall | monthly
  const [filters, setFilters] = useState(() => safeParse(localStorage.getItem(ATTN_FILTERS_KEY), {
    course: '',
    month: '',
    status: '', // Present | Absent
    search: ''
  }));
  const [form, setForm] = useState({ courseName: '', teacher: '', presentDays: '', absentDays: '' });
  const [historyForm, setHistoryForm] = useState({ courseName: '', date: '', status: 'Present', reason: '' });
  const [notes, setNotes] = useState({});
  const lastSnapshotRef = useRef(null);

  // Ensure student exists with seed data if absent
  useEffect(() => {
    setAllData(prev => {
      if (prev.some(s => s.studentId === initialStudentId)) return prev;
      const seeded = {
        studentId: initialStudentId,
        name: childData?.name || initialStudentId,
        overall: '0%',
        totalPresent: 0,
        totalDays: 0,
        classes: (childData?.classes || []).map(c => ({
          courseName: c.name,
          teacher: c.teacher || '',
          attendance: '0%',
          presentDays: 0,
          absentDays: 0,
          history: []
        }))
      };
      const next = [...prev, seeded];
      saveAttn(next);
      return next;
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Persist
  useEffect(() => { saveAttn(allData); }, [allData]);
  useEffect(() => { localStorage.setItem(ATTN_FILTERS_KEY, JSON.stringify(filters)); }, [filters]);
  useEffect(() => { localStorage.setItem(ATTN_THEME_KEY, theme); }, [theme]);
  useEffect(() => { localStorage.setItem(ATTN_LAST_STUDENT_KEY, selectedStudentId); }, [selectedStudentId]);

  // Theme CSS vars
  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'dark') {
      root.style.setProperty('--border-color', '#444');
      root.style.setProperty('--accent', '#22d3ee');
      root.style.setProperty('color-scheme', 'dark');
    } else {
      root.style.setProperty('--border-color', '#ddd');
      root.style.setProperty('--accent', '#4f46e5');
      root.style.setProperty('color-scheme', 'light');
    }
  }, [theme]);

  // Auto-sync polling (simulated teacher updates)
  useEffect(() => {
    const t = setInterval(() => {
      const snap = localStorage.getItem(ATTN_KEY);
      if (lastSnapshotRef.current !== snap) {
        lastSnapshotRef.current = snap;
        setAllData(loadAttn());
      }
    }, 3000);
    return () => clearInterval(t);
  }, []);

  const students = useMemo(() => Array.from(new Set([initialStudentId, ...allData.map(s => s.studentId)])), [allData, initialStudentId]);
  const current = useMemo(() => allData.find(s => s.studentId === selectedStudentId) || { studentId: selectedStudentId, name: selectedStudentId, overall: '0%', totalPresent: 0, totalDays: 0, classes: [] }, [allData, selectedStudentId]);

  // Notes load/save per subject
  useEffect(() => {
    const obj = {};
    (current.classes || []).forEach(c => {
      const key = `attendanceNotes_${selectedStudentId}_${c.courseName}`;
      obj[c.courseName] = localStorage.getItem(key) || '';
    });
    setNotes(obj);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedStudentId, current.classes?.length]);

  const saveNote = (courseName, text) => {
    const key = `attendanceNotes_${selectedStudentId}_${courseName}`;
    localStorage.setItem(key, text);
    setNotes(n => ({ ...n, [courseName]: text }));
  };

  const recompute = (stu) => {
    let totalPresent = 0;
    let totalDays = 0;
    const classes = (stu.classes || []).map(c => {
      const present = Number(c.presentDays) || 0;
      const absent = Number(c.absentDays) || 0;
      const days = present + absent;
      const pct = percent(present, days);
      totalPresent += present;
      totalDays += days;
      return { ...c, attendance: `${Math.round(pct)}%` };
    });
    const overallPct = percent(totalPresent, totalDays);
    return { ...stu, classes, totalPresent, totalDays, overall: `${Math.round(overallPct)}%` };
  };

  const upsertCourse = (courseName, teacher, presentDays, absentDays) => {
    setAllData(prev => prev.map(s => {
      if (s.studentId !== selectedStudentId) return s;
      const idx = (s.classes || []).findIndex(c => c.courseName === courseName);
      let classes = s.classes || [];
      if (idx >= 0) {
        const updated = { ...classes[idx], teacher, presentDays: Number(presentDays) || 0, absentDays: Number(absentDays) || 0 };
        classes = [ ...classes.slice(0, idx), updated, ...classes.slice(idx + 1) ];
      } else {
        classes = [ ...classes, { courseName, teacher, presentDays: Number(presentDays) || 0, absentDays: Number(absentDays) || 0, attendance: '0%', history: [] } ];
      }
      return recompute({ ...s, classes });
    }));
  };

  const addHistory = (courseName, date, status, reason) => {
    setAllData(prev => prev.map(s => {
      if (s.studentId !== selectedStudentId) return s;
      const classes = (s.classes || []).map(c => {
        if (c.courseName !== courseName) return c;
        const history = [ { date, status, reason }, ...(c.history || []) ];
        let present = c.presentDays || 0;
        let absent = c.absentDays || 0;
        if (status === 'Present') present += 1; else if (status === 'Absent') absent += 1;
        return { ...c, history, presentDays: present, absentDays: absent };
      });
      return recompute({ ...s, classes });
    }));
  };

  const lowThreshold = 75;
  const courseList = useMemo(() => (current.classes || []).map(c => c.courseName), [current.classes]);

  const filteredHistory = useMemo(() => {
    let items = [];
    (current.classes || []).forEach(c => {
      (c.history || []).forEach(h => items.push({ courseName: c.courseName, teacher: c.teacher, ...h }));
    });
    if (filters.course) items = items.filter(h => h.courseName === filters.course);
    if (filters.status) items = items.filter(h => h.status === filters.status);
    if (filters.month) items = items.filter(h => monthOf(h.date) === filters.month);
    if (filters.search) {
      const t = filters.search.toLowerCase();
      items = items.filter(h => (h.reason || '').toLowerCase().includes(t) || h.courseName.toLowerCase().includes(t));
    }
    items.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    return items;
  }, [current.classes, filters]);

  // Insights & prediction
  const subjectStats = useMemo(() => (current.classes || []).map(c => {
    const p = Number(c.presentDays) || 0;
    const a = Number(c.absentDays) || 0;
    const pct = percent(p, p + a);
    return { courseName: c.courseName, pct, present: p, absent: a };
  }), [current.classes]);

  const best = useMemo(() => subjectStats.slice().sort((x, y) => y.pct - x.pct)[0] || null, [subjectStats]);
  const worst = useMemo(() => subjectStats.slice().sort((x, y) => x.pct - y.pct)[0] || null, [subjectStats]);

  const trendMonthly = useMemo(() => {
    const map = {}; // month -> present/total
    (current.classes || []).forEach(c => {
      (c.history || []).forEach(h => {
        const m = monthOf(h.date);
        if (!m) return;
        if (!map[m]) map[m] = { present: 0, total: 0 };
        map[m].total += 1;
        if (h.status === 'Present') map[m].present += 1;
      });
    });
    const months = Object.keys(map).sort();
    return { labels: months, data: months.map(m => percent(map[m].present, map[m].total)) };
  }, [current.classes]);

  const prediction = useMemo(() => {
    const { data } = trendMonthly;
    if (!data.length) return null;
    const recent = data.slice(-3);
    const avg = recent.reduce((s, v) => s + v, 0) / recent.length;
    const curr = Number((current.overall || '0%').replace('%', '')) || 0;
    const blend = 0.5 * curr + 0.5 * avg;
    return Math.round(blend);
  }, [trendMonthly, current.overall]);

  return (
    <div className={`attendance-container ${theme === 'dark' ? 'dark' : ''}`}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
        <h2>Attendance for {current.name}</h2>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
          {students.length > 1 && (
            <select value={selectedStudentId} onChange={(e) => setSelectedStudentId(e.target.value)}>
              {students.map(id => (<option key={id} value={id}>{id}</option>))}
            </select>
          )}
          <button onClick={() => setTheme(t => t === 'light' ? 'dark' : 'light')}>Toggle {theme === 'light' ? 'Dark' : 'Light'} Mode</button>
          <button onClick={() => setView(v => v === 'overall' ? 'monthly' : 'overall')}>View: {view === 'overall' ? 'Overall' : 'Monthly'}</button>
          <ExportButtons data={allData} />
        </div>
      </div>

      <div className="attendance-summary" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, minmax(200px, 1fr))', gap: 12, marginTop: 12 }}>
        <div className="attendance-card" style={{ padding: 12, border: '1px solid var(--border-color,#ddd)', borderRadius: 8, display: 'flex', gap: 12, alignItems: 'center' }}>
          <ProgressCircle value={Number((current.overall || '0%').replace('%',''))} />
          <div>
            <h3 style={{ margin: 0 }}>Overall Attendance</h3>
            <p className="attendance-percentage" style={{ margin: 0 }}>{current.overall}</p>
            <p style={{ margin: 0 }}>Total Present Days: {current.totalPresent}/{current.totalDays}</p>
          </div>
        </div>
        <div className="attendance-card" style={{ padding: 12, border: '1px solid var(--border-color,#ddd)', borderRadius: 8 }}>
          <h3 style={{ marginTop: 0 }}>Best Subject</h3>
          <p style={{ margin: 0 }}>{best ? `${best.courseName} (${Math.round(best.pct)}%)` : '—'}</p>
        </div>
        <div className="attendance-card" style={{ padding: 12, border: '1px solid var(--border-color,#ddd)', borderRadius: 8 }}>
          <h3 style={{ marginTop: 0 }}>Lowest Subject</h3>
          <p style={{ margin: 0, color: (worst && worst.pct < lowThreshold) ? '#dc2626' : 'inherit' }}>{worst ? `${worst.courseName} (${Math.round(worst.pct)}%)` : '—'}</p>
        </div>
      </div>

      <div style={{ marginTop: 16, display: 'grid', gridTemplateColumns: 'repeat(6, minmax(140px, 1fr))', gap: 8 }}>
        <input placeholder="Course Name" list="attnCourseList" value={form.courseName} onChange={(e) => setForm({ ...form, courseName: e.target.value })} />
        <datalist id="attnCourseList">
          {courseList.map(c => (<option key={c} value={c} />))}
        </datalist>
        <input placeholder="Teacher" value={form.teacher} onChange={(e) => setForm({ ...form, teacher: e.target.value })} />
        <input type="number" min="0" placeholder="Present Days" value={form.presentDays} onChange={(e) => setForm({ ...form, presentDays: e.target.value })} />
        <input type="number" min="0" placeholder="Absent Days" value={form.absentDays} onChange={(e) => setForm({ ...form, absentDays: e.target.value })} />
        <button onClick={() => { if (form.courseName) { upsertCourse(form.courseName, form.teacher, form.presentDays, form.absentDays); setForm({ courseName: '', teacher: '', presentDays: '', absentDays: '' }); } }}>Save Course</button>
      </div>

      <div style={{ marginTop: 12, display: 'grid', gridTemplateColumns: 'repeat(6, minmax(140px, 1fr))', gap: 8 }}>
        <select value={historyForm.courseName} onChange={(e) => setHistoryForm({ ...historyForm, courseName: e.target.value })}>
          <option value="">Select Course</option>
          {courseList.map(c => (<option key={c} value={c}>{c}</option>))}
        </select>
        <input type="date" value={historyForm.date} onChange={(e) => setHistoryForm({ ...historyForm, date: e.target.value })} />
        <select value={historyForm.status} onChange={(e) => setHistoryForm({ ...historyForm, status: e.target.value })}>
          <option>Present</option>
          <option>Absent</option>
        </select>
        <input placeholder="Reason (if Absent)" value={historyForm.reason} onChange={(e) => setHistoryForm({ ...historyForm, reason: e.target.value })} />
        <button onClick={() => { if (historyForm.courseName && historyForm.date) { addHistory(historyForm.courseName, historyForm.date, historyForm.status, historyForm.reason); setHistoryForm({ courseName: '', date: '', status: 'Present', reason: '' }); } }}>Add Attendance Record</button>
      </div>

      <div className="attendance-details" style={{ marginTop: 16 }}>
        <h3>Course-wise Attendance</h3>
        <table className="attendance-table">
          <thead>
            <tr>
              <th>Course</th>
              <th>Teacher</th>
              <th>Attendance %</th>
              <th>Present</th>
              <th>Absent</th>
              <th>Notes</th>
            </tr>
          </thead>
          <tbody>
            {(current.classes || []).map((c) => {
              const pct = Number((c.attendance || '0%').replace('%','')) || 0;
              const bg = pct < lowThreshold ? '#fef2f2' : pct < 85 ? '#fffbeb' : 'inherit';
              return (
                <tr key={c.courseName} style={{ background: bg }}>
                  <td>{c.courseName}</td>
                  <td>{c.teacher}</td>
                  <td style={{ color: pct < lowThreshold ? '#dc2626' : 'inherit' }}>{c.attendance}</td>
                  <td>{c.presentDays}</td>
                  <td>{c.absentDays}</td>
                  <td>
                    <input style={{ width: '100%' }} value={notes[c.courseName] || ''} onChange={(e) => saveNote(c.courseName, e.target.value)} placeholder="Parent note" />
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <div style={{ marginTop: 16, display: 'grid', gridTemplateColumns: 'repeat(2, minmax(240px, 1fr))', gap: 12 }}>
        <BarChart title="Attendance by Subject" labels={(current.classes || []).map(c => c.courseName)} data={(current.classes || []).map(c => Number((c.attendance||'0%').replace('%','')) || 0)} />
        {view === 'monthly' ? (
          <LineChart title="Monthly Attendance Trend" labels={trendMonthly.labels} data={trendMonthly.data} />
        ) : (
          <LineChart title="Overall vs Prediction" labels={["Past","Now","Pred"]} data={[Math.max(0, (trendMonthly.data.slice(-2)[0] || 0)), Number((current.overall||'0%').replace('%','')) || 0, prediction || 0]} />
        )}
      </div>

      <div style={{ marginTop: 16 }}>
        <h3>Attendance History</h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, minmax(140px, 1fr))', gap: 8, marginBottom: 8 }}>
          <select value={filters.course} onChange={(e) => setFilters({ ...filters, course: e.target.value })}>
            <option value="">All Courses</option>
            {courseList.map(c => (<option key={c} value={c}>{c}</option>))}
          </select>
          <input type="month" value={filters.month} onChange={(e) => setFilters({ ...filters, month: e.target.value })} />
          <select value={filters.status} onChange={(e) => setFilters({ ...filters, status: e.target.value })}>
            <option value="">All Status</option>
            <option>Present</option>
            <option>Absent</option>
          </select>
          <input placeholder="Search (course/reason)" value={filters.search} onChange={(e) => setFilters({ ...filters, search: e.target.value })} />
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 12 }}>
          {filteredHistory.map((h, i) => (
            <div key={`${h.courseName}-${h.date}-${i}`} style={{ border: '1px solid var(--border-color,#ddd)', borderRadius: 8, padding: 12, background: h.status === 'Absent' ? '#fff1f2' : 'inherit' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <strong>{h.courseName}</strong>
                <span style={{ padding: '2px 8px', borderRadius: 999, background: h.status === 'Present' ? '#dcfce7' : '#fee2e2' }}>{h.status}</span>
              </div>
              <div>{h.date}</div>
              {h.reason && <div><em>Reason:</em> {h.reason}</div>}
            </div>
          ))}
          {filteredHistory.length === 0 && (<div style={{ opacity: 0.7 }}>No history matches the current filters.</div>)}
        </div>
        {worst && worst.pct < lowThreshold && (
          <div style={{ marginTop: 12, color: '#dc2626' }}>⚠️ Attendance in "{worst.courseName}" is below {lowThreshold}%. Risk of shortage!</div>
        )}
        {prediction != null && (
          <div style={{ marginTop: 8 }}>If current trend continues, expected final attendance: <strong>{prediction}%</strong>.</div>
        )}
      </div>
    </div>
  );
};

export default AttendanceTracking;
