import React, { useEffect, useMemo, useRef, useState } from "react";
import "../ParentDashboard.css";

// Storage keys
const STORAGE_KEY = "parentAssignments";
const FILTERS_KEY = "parentAssignments_filters";
const THEME_KEY = "parentAssignments_theme";
const TREND_KEY = "parentAssignments_trend";

// Helpers
const safeParse = (value, fallback) => {
  try {
    const parsed = JSON.parse(value);
    return parsed ?? fallback;
  } catch (e) {
    return fallback;
  }
};

const loadStorage = () => safeParse(localStorage.getItem(STORAGE_KEY), []);
const saveStorage = (data) => localStorage.setItem(STORAGE_KEY, JSON.stringify(data));

const gradeToPoints = (grade) => {
  if (!grade) return null;
  const g = String(grade).trim().toUpperCase();
  const map = { "A+": 4.0, "A": 4.0, "A-": 3.7, "B+": 3.3, "B": 3.0, "B-": 2.7, "C+": 2.3, "C": 2.0, "C-": 1.7, "D": 1.0, "F": 0 };
  return map[g] ?? null;
};

const scoreToGrade = (score) => {
  if (score == null || isNaN(score)) return null;
  const s = Number(score);
  if (s >= 97) return "A+";
  if (s >= 93) return "A";
  if (s >= 90) return "A-";
  if (s >= 87) return "B+";
  if (s >= 83) return "B";
  if (s >= 80) return "B-";
  if (s >= 77) return "C+";
  if (s >= 73) return "C";
  if (s >= 70) return "C-";
  if (s >= 60) return "D";
  return "F";
};

const emptyAssignment = (studentId) => ({
  id: `A_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
  title: "",
  course: "",
  dueDate: "",
  status: "Pending", // Pending | Submitted | Graded | Archived
  grade: "",
  score: "",
  notes: "",
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  studentId
});

const withinDays = (dateIso, days) => {
  if (!dateIso) return false;
  const due = new Date(dateIso).getTime();
  const now = Date.now();
  const delta = due - now;
  return delta <= days * 24 * 60 * 60 * 1000 && delta >= 0;
};

const isOverdue = (dateIso) => {
  if (!dateIso) return false;
  return new Date(dateIso).getTime() < Date.now();
};

const ExportButtons = ({ data }) => {
  const handleExportJSON = () => {
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "assignments.json";
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleExportCSV = () => {
    const rows = [[
      "studentId","id","title","course","dueDate","status","grade","score","notes","createdAt","updatedAt"
    ], ...data.flatMap(s => (s.assignments || []).map(a => [
      s.studentId, a.id, a.title, a.course, a.dueDate, a.status, a.grade, a.score, (a.notes || "").replace(/\n/g, " "), a.createdAt, a.updatedAt
    ]))];
    const csv = rows.map(r => r.map(v => {
      const s = v == null ? "" : String(v);
      if (s.includes(",") || s.includes("\n") || s.includes('"')) {
        return '"' + s.replace(/"/g, '""') + '"';
      }
      return s;
    }).join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "assignments.csv";
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="export-buttons" style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
      <button onClick={handleExportJSON}>Export JSON</button>
      <button onClick={handleExportCSV}>Export CSV</button>
    </div>
  );
};

// Lightweight inline charts using div bars and simple lines (no deps)
const BarChart = ({ data, labels, title }) => {
  const max = Math.max(1, ...data);
  return (
    <div className="mini-chart" style={{ padding: 8, border: "1px solid var(--border-color, #ddd)", borderRadius: 8 }}>
      <div style={{ marginBottom: 8, fontWeight: 600 }}>{title}</div>
      <div style={{ display: "flex", alignItems: "flex-end", gap: 8, height: 120 }}>
        {data.map((v, i) => (
          <div key={i} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
            <div style={{ width: 24, height: `${(v / max) * 100}%`, background: "var(--accent, #4f46e5)", borderRadius: 4 }} />
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
  }).join(" ");
  return (
    <div className="mini-chart" style={{ padding: 8, border: "1px solid var(--border-color, #ddd)", borderRadius: 8 }}>
      <div style={{ marginBottom: 8, fontWeight: 600 }}>{title}</div>
      <svg width={width} height={height}>
        <polyline fill="none" stroke="var(--accent, #4f46e5)" strokeWidth="2" points={points} />
      </svg>
      <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, marginTop: 4 }}>
        {labels.map((l, i) => (<div key={i}>{l}</div>))}
      </div>
    </div>
  );
};

const AssignmentsAndGrades = ({ childData }) => {
  const initialStudentId = childData?.id || childData?.studentId || childData?.name || "UNKNOWN";
  const [theme, setTheme] = useState(() => localStorage.getItem(THEME_KEY) || "light");
  const [allData, setAllData] = useState(() => loadStorage());
  const [selectedStudentId, setSelectedStudentId] = useState(initialStudentId);
  const [form, setForm] = useState(() => emptyAssignment(initialStudentId));
  const [isEditingId, setIsEditingId] = useState(null);
  const [filters, setFilters] = useState(() => safeParse(localStorage.getItem(FILTERS_KEY), {
    course: "",
    status: "",
    search: "",
    from: "",
    to: "",
    sort: "dueAsc"
  }));
  const [showInsights, setShowInsights] = useState(false);
  const [nowTick, setNowTick] = useState(Date.now()); // for reminders refresh
  const lastSnapshotRef = useRef(null);

  // Ensure student exists in storage
  useEffect(() => {
    setAllData((prev) => {
      const exists = prev.some((s) => s.studentId === initialStudentId);
      if (exists) return prev;
      const seedAssignments = (childData?.classes || []).slice(0, 3).map((c, idx) => ({
        ...emptyAssignment(initialStudentId),
        id: `SEED_${idx}_${Date.now()}`,
        title: `${c.name} Assignment` ,
        course: c.name,
        dueDate: new Date(Date.now() + (idx + 1) * 86400000 * 3).toISOString().slice(0, 10),
        status: idx === 0 ? "Graded" : idx === 1 ? "Submitted" : "Pending",
        score: c.score ?? 90 - idx * 3,
        grade: c.grade || scoreToGrade(90 - idx * 3)
      }));
      const next = [...prev, { studentId: initialStudentId, assignments: seedAssignments }];
      saveStorage(next);
      return next;
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Persist changes
  useEffect(() => {
    saveStorage(allData);
  }, [allData]);

  // Persist filters and theme
  useEffect(() => {
    localStorage.setItem(FILTERS_KEY, JSON.stringify(filters));
  }, [filters]);
  useEffect(() => {
    localStorage.setItem(THEME_KEY, theme);
    const root = document.documentElement;
    if (theme === "dark") {
      root.style.setProperty("--border-color", "#444");
      root.style.setProperty("--accent", "#22d3ee");
      root.style.setProperty("color-scheme", "dark");
    } else {
      root.style.setProperty("--border-color", "#ddd");
      root.style.setProperty("--accent", "#4f46e5");
      root.style.setProperty("color-scheme", "light");
    }
  }, [theme]);

  // Auto-sync: poll localStorage for external updates
  useEffect(() => {
    const interval = setInterval(() => {
      const snap = localStorage.getItem(STORAGE_KEY);
      if (lastSnapshotRef.current !== snap) {
        lastSnapshotRef.current = snap;
        setAllData(loadStorage());
      }
      setNowTick(Date.now());
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  const students = useMemo(() => {
    const ids = new Set([initialStudentId, ...allData.map((s) => s.studentId)]);
    return Array.from(ids);
  }, [allData, initialStudentId]);

  const current = useMemo(() => allData.find((s) => s.studentId === selectedStudentId) || { studentId: selectedStudentId, assignments: [] }, [allData, selectedStudentId]);

  const courses = useMemo(() => {
    const set = new Set((current.assignments || []).map(a => a.course).filter(Boolean));
    // include childData.classes names
    (childData?.classes || []).forEach(c => set.add(c.name));
    return Array.from(set);
  }, [current.assignments, childData]);

  const filtered = useMemo(() => {
    const fromTs = filters.from ? new Date(filters.from).getTime() : null;
    const toTs = filters.to ? new Date(filters.to).getTime() : null;
    const term = filters.search?.toLowerCase?.() || "";
    let list = [...(current.assignments || []).filter(a => a.status !== "Archived")];
    if (filters.course) list = list.filter(a => a.course === filters.course);
    if (filters.status) list = list.filter(a => a.status === filters.status);
    if (fromTs) list = list.filter(a => a.dueDate && new Date(a.dueDate).getTime() >= fromTs);
    if (toTs) list = list.filter(a => a.dueDate && new Date(a.dueDate).getTime() <= toTs);
    if (term) list = list.filter(a =>
      (a.title || "").toLowerCase().includes(term) ||
      (a.course || "").toLowerCase().includes(term) ||
      (a.notes || "").toLowerCase().includes(term)
    );
    list.sort((a, b) => {
      const aDue = a.dueDate ? new Date(a.dueDate).getTime() : 0;
      const bDue = b.dueDate ? new Date(b.dueDate).getTime() : 0;
      if (filters.sort === "dueAsc") return aDue - bDue;
      if (filters.sort === "dueDesc") return bDue - aDue;
      if (filters.sort === "scoreDesc") return (Number(b.score) || -1) - (Number(a.score) || -1);
      return 0;
    });
    return list;
  }, [current.assignments, filters]);

  const { gpa, avgScore, perCourse } = useMemo(() => {
    const graded = (current.assignments || []).filter(a => a.status === "Graded");
    const points = graded.map(a => a.grade ? gradeToPoints(a.grade) : scoreToGrade(a.score)).map(g => gradeToPoints(g)).filter(v => v != null);
    const gpa = points.length ? (points.reduce((s, v) => s + v, 0) / points.length) : 0;
    const scores = graded.map(a => Number(a.score)).filter(v => !isNaN(v));
    const avgScore = scores.length ? (scores.reduce((s, v) => s + v, 0) / scores.length) : 0;
    const perCourseMap = {};
    (current.assignments || []).forEach(a => {
      if (!a.course) return;
      if (!perCourseMap[a.course]) perCourseMap[a.course] = { scores: [], grades: [] };
      if (a.score != null && a.score !== "") perCourseMap[a.course].scores.push(Number(a.score));
      if (a.grade) perCourseMap[a.course].grades.push(a.grade);
    });
    const perCourse = Object.entries(perCourseMap).map(([course, obj]) => {
      const avg = obj.scores.length ? (obj.scores.reduce((s, v) => s + v, 0) / obj.scores.length) : null;
      const gpts = obj.grades.map(gradeToPoints).filter(v => v != null);
      const cgpa = gpts.length ? (gpts.reduce((s, v) => s + v, 0) / gpts.length) : null;
      return { course, avgScore: avg, gpa: cgpa };
    });
    return { gpa, avgScore, perCourse };
  }, [current.assignments]);

  // Progress & trend
  const progress = useMemo(() => {
    const total = (current.assignments || []).length;
    const submitted = (current.assignments || []).filter(a => a.status === "Submitted" || a.status === "Graded").length;
    const graded = (current.assignments || []).filter(a => a.status === "Graded").length;
    const submittedPct = total ? Math.round((submitted / total) * 100) : 0;
    const gradedPct = total ? Math.round((graded / total) * 100) : 0;
    return { total, submittedPct, gradedPct };
  }, [current.assignments]);

  useEffect(() => {
    const trendKey = `${TREND_KEY}_${selectedStudentId}`;
    const past = safeParse(localStorage.getItem(trendKey), []);
    const newPoint = { ts: Date.now(), gpa: Number(gpa.toFixed(2)), avgScore: Number(avgScore.toFixed(1)) };
    const merged = [...past, newPoint].slice(-12); // keep last 12 points
    localStorage.setItem(trendKey, JSON.stringify(merged));
  }, [gpa, avgScore, selectedStudentId]);

  const trendSeries = useMemo(() => {
    const trendKey = `${TREND_KEY}_${selectedStudentId}`;
    const series = safeParse(localStorage.getItem(trendKey), []);
    return series;
  }, [selectedStudentId, nowTick]);

  const upsertAssignment = (assignment) => {
    setAllData(prev => prev.map(s => {
      if (s.studentId !== selectedStudentId) return s;
      const exists = (s.assignments || []).some(a => a.id === assignment.id);
      const list = exists
        ? s.assignments.map(a => a.id === assignment.id ? { ...assignment, updatedAt: new Date().toISOString() } : a)
        : [{ ...assignment, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() }, ...s.assignments];
      return { ...s, assignments: list };
    }));
  };

  const deleteAssignment = (id) => {
    setAllData(prev => prev.map(s => {
      if (s.studentId !== selectedStudentId) return s;
      return { ...s, assignments: s.assignments.filter(a => a.id !== id) };
    }));
  };

  const archiveAssignment = (id) => {
    setAllData(prev => prev.map(s => {
      if (s.studentId !== selectedStudentId) return s;
      return { ...s, assignments: s.assignments.map(a => a.id === id ? { ...a, status: "Archived", updatedAt: new Date().toISOString() } : a) };
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    let payload = { ...form };
    if (payload.score !== "" && payload.score != null) {
      payload.score = Number(payload.score);
      payload.grade = payload.grade || scoreToGrade(payload.score);
    }
    if (!payload.studentId) payload.studentId = selectedStudentId;
    upsertAssignment(payload);
    setForm(emptyAssignment(selectedStudentId));
    setIsEditingId(null);
  };

  const startEdit = (a) => {
    setForm({ ...a });
    setIsEditingId(a.id);
  };

  const cancelEdit = () => {
    setForm(emptyAssignment(selectedStudentId));
    setIsEditingId(null);
  };

  const soonCount = filtered.filter(a => withinDays(a.dueDate, 2) && a.status !== "Graded").length;
  useEffect(() => {
    if (soonCount > 0) {
      // lightweight notification
      // eslint-disable-next-line no-alert
      // Avoid spamming: only alert when count changes and >0 within this render tick
    }
  }, [soonCount]);

  const insights = useMemo(() => {
    if (!perCourse.length) return { best: null, worst: null };
    const sortable = perCourse.filter(c => c.avgScore != null);
    if (!sortable.length) return { best: null, worst: null };
    const best = sortable.slice().sort((a, b) => (b.avgScore || 0) - (a.avgScore || 0))[0];
    const worst = sortable.slice().sort((a, b) => (a.avgScore || 0) - (b.avgScore || 0))[0];
    return { best, worst };
  }, [perCourse]);

  // UI
  return (
    <div className={`assignments-container ${theme === "dark" ? "dark" : ""}`}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
        <h2>Assignments & Grades for {childData?.name || selectedStudentId}</h2>
        <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
          {students.length > 1 && (
            <select value={selectedStudentId} onChange={(e) => setSelectedStudentId(e.target.value)}>
              {students.map(id => (<option key={id} value={id}>{id}</option>))}
            </select>
          )}
          <button onClick={() => setTheme(t => t === "light" ? "dark" : "light")}>Toggle {theme === "light" ? "Dark" : "Light"} Mode</button>
          <button onClick={() => setShowInsights(true)}>Performance Insights</button>
        </div>
      </div>

      <div className="recent-assignments" style={{ marginTop: 12 }}>
        <h3>Add / Edit Assignment</h3>
        <form onSubmit={handleSubmit} style={{ display: "grid", gridTemplateColumns: "repeat(6, minmax(140px, 1fr))", gap: 8 }}>
          <input placeholder="Title" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required />
          <input list="courseList" placeholder="Course" value={form.course} onChange={(e) => setForm({ ...form, course: e.target.value })} required />
          <datalist id="courseList">
            {courses.map(c => (<option key={c} value={c} />))}
          </datalist>
          <input type="date" value={form.dueDate} onChange={(e) => setForm({ ...form, dueDate: e.target.value })} required />
          <select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}>
            <option>Pending</option>
            <option>Submitted</option>
            <option>Graded</option>
            <option>Archived</option>
          </select>
          <input type="number" min="0" max="100" placeholder="Score %" value={form.score} onChange={(e) => setForm({ ...form, score: e.target.value })} />
          <input placeholder="Grade (e.g., A-)" value={form.grade} onChange={(e) => setForm({ ...form, grade: e.target.value })} />
          <input placeholder="Notes" value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} />
          <div style={{ gridColumn: "1 / -1", display: "flex", gap: 8 }}>
            <button type="submit">{isEditingId ? "Save Changes" : "Add Assignment"}</button>
            {isEditingId && <button type="button" onClick={cancelEdit}>Cancel</button>}
          </div>
        </form>
      </div>

      <div className="filters" style={{ marginTop: 16, display: "grid", gridTemplateColumns: "repeat(6, minmax(140px, 1fr))", gap: 8 }}>
        <select value={filters.course} onChange={(e) => setFilters({ ...filters, course: e.target.value })}>
          <option value="">All Courses</option>
          {courses.map(c => (<option key={c} value={c}>{c}</option>))}
        </select>
        <select value={filters.status} onChange={(e) => setFilters({ ...filters, status: e.target.value })}>
          <option value="">All Status</option>
          <option>Pending</option>
          <option>Submitted</option>
          <option>Graded</option>
        </select>
        <input type="date" value={filters.from} onChange={(e) => setFilters({ ...filters, from: e.target.value })} />
        <input type="date" value={filters.to} onChange={(e) => setFilters({ ...filters, to: e.target.value })} />
        <input placeholder="Search (title/course/notes)" value={filters.search} onChange={(e) => setFilters({ ...filters, search: e.target.value })} />
        <select value={filters.sort} onChange={(e) => setFilters({ ...filters, sort: e.target.value })}>
          <option value="dueAsc">Sort: Due Date ↑</option>
          <option value="dueDesc">Sort: Due Date ↓</option>
          <option value="scoreDesc">Sort: Score ↓</option>
        </select>
      </div>

      <div className="progress-summary" style={{ marginTop: 16, display: "grid", gridTemplateColumns: "repeat(4, minmax(160px, 1fr))", gap: 12 }}>
        <div className="card" style={{ padding: 12, border: "1px solid var(--border-color, #ddd)", borderRadius: 8 }}>
          <div><strong>Assignments Submitted</strong></div>
          <div>{progress.submittedPct}%</div>
        </div>
        <div className="card" style={{ padding: 12, border: "1px solid var(--border-color, #ddd)", borderRadius: 8 }}>
          <div><strong>Average Grade</strong></div>
          <div>{Number.isFinite(avgScore) ? `${avgScore.toFixed(1)}%` : "N/A"}</div>
        </div>
        <div className="card" style={{ padding: 12, border: "1px solid var(--border-color, #ddd)", borderRadius: 8 }}>
          <div><strong>GPA</strong></div>
          <div>{gpa.toFixed(2)}</div>
        </div>
        <div className="card" style={{ padding: 12, border: "1px solid var(--border-color, #ddd)", borderRadius: 8 }}>
          <div><strong>Due Soon</strong></div>
          <div>{soonCount}</div>
        </div>
      </div>

      <div className="analytics" style={{ marginTop: 16, display: "grid", gridTemplateColumns: "repeat(2, minmax(240px, 1fr))", gap: 12 }}>
        <BarChart title="Avg Score by Course" labels={perCourse.map(c => c.course)} data={perCourse.map(c => Number.isFinite(c.avgScore) ? Number(c.avgScore.toFixed(1)) : 0)} />
        <LineChart title="GPA Trend" labels={trendSeries.map(p => new Date(p.ts).toLocaleDateString())} data={trendSeries.map(p => p.gpa)} />
      </div>

      <div className="recent-assignments" style={{ marginTop: 16 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <h3>Assignments</h3>
          <ExportButtons data={allData} />
        </div>
        <div className="assignment-list" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 12 }}>
          {filtered.map((a) => {
            const soon = withinDays(a.dueDate, 2) && a.status !== "Graded";
            const overdue = isOverdue(a.dueDate) && a.status !== "Graded";
            return (
              <div key={a.id} className="assignment-card" style={{ border: "1px solid var(--border-color, #ddd)", borderRadius: 8, padding: 12, background: overdue ? "#fff1f2" : soon ? "#fffbeb" : "inherit" }}>
                <div className="assignment-header" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 8 }}>
                  <h4 style={{ margin: 0 }}>{a.title || "Untitled"}</h4>
                  <span className="assignment-status" style={{ padding: "2px 8px", borderRadius: 999, background: a.status === "Graded" ? "#dcfce7" : a.status === "Submitted" ? "#dbeafe" : "#f1f5f9" }}>{a.status}</span>
                </div>
                <p><strong>Course:</strong> {a.course || "—"}</p>
                <p><strong>Due Date:</strong> {a.dueDate || "—"} {soon && <span style={{ marginLeft: 8, color: "#b45309" }}>Due soon</span>} {overdue && <span style={{ marginLeft: 8, color: "#b91c1c" }}>Overdue</span>}</p>
                <p><strong>Grade:</strong> {a.grade || (a.score !== "" && a.score != null ? scoreToGrade(a.score) : "—")} {a.score != null && a.score !== "" ? `(${a.score}%)` : ""}</p>
                <details>
                  <summary>Notes</summary>
                  <textarea style={{ width: "100%" }} rows={3} value={a.notes || ""} onChange={(e) => upsertAssignment({ ...a, notes: e.target.value })} placeholder="Add private notes"></textarea>
                </details>
                <div style={{ display: "flex", gap: 8, marginTop: 8, flexWrap: "wrap" }}>
                  <button onClick={() => startEdit(a)}>Edit</button>
                  <button onClick={() => upsertAssignment({ ...a, status: a.status === "Submitted" ? "Graded" : "Submitted" })}>{a.status === "Submitted" ? "Mark Graded" : "Mark Submitted"}</button>
                  <button onClick={() => archiveAssignment(a.id)}>Archive</button>
                  <button onClick={() => deleteAssignment(a.id)}>Delete</button>
                </div>
              </div>
            );
          })}
          {filtered.length === 0 && (
            <div style={{ opacity: 0.7 }}>No assignments match the current filters.</div>
          )}
        </div>
      </div>

      <div className="grade-summary" style={{ marginTop: 16 }}>
        <h3>Grade Summary</h3>
        <table className="grade-table">
          <thead>
            <tr>
              <th>Course</th>
              <th>Average Score</th>
              <th>Course GPA</th>
            </tr>
          </thead>
          <tbody>
            {perCourse.map((c) => (
              <tr key={c.course}>
                <td>{c.course}</td>
                <td>{c.avgScore == null ? "—" : `${c.avgScore.toFixed(1)}%`}</td>
                <td>{c.gpa == null ? "—" : c.gpa.toFixed(2)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showInsights && (
        <div role="dialog" aria-modal style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.4)", display: "flex", alignItems: "center", justifyContent: "center", padding: 16 }} onClick={() => setShowInsights(false)}>
          <div style={{ background: "white", color: "black", minWidth: 320, maxWidth: 520, borderRadius: 12, padding: 16 }} onClick={(e) => e.stopPropagation()}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <h3 style={{ margin: 0 }}>Performance Insights</h3>
              <button onClick={() => setShowInsights(false)}>Close</button>
            </div>
            <div style={{ marginTop: 12 }}>
              <p><strong>Overall GPA:</strong> {gpa.toFixed(2)}</p>
              <p><strong>Average Score:</strong> {Number.isFinite(avgScore) ? `${avgScore.toFixed(1)}%` : "N/A"}</p>
              <p><strong>Best Subject:</strong> {insights.best ? `${insights.best.course} (${insights.best.avgScore.toFixed(1)}%)` : "—"}</p>
              <p><strong>Needs Attention:</strong> {insights.worst ? `${insights.worst.course} (${insights.worst.avgScore.toFixed(1)}%)` : "—"}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AssignmentsAndGrades;