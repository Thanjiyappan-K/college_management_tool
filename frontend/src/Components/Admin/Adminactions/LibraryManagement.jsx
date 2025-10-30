import React, { useEffect, useMemo, useState } from "react";

const KEYS = {
  books: "books",
  issued: "issuedBooks",
  logs: "libraryLogs",
  fines: "libraryFines",
};

const categories = ["AI/ML","CS Theory","Databases","Networks","Electronics","Mechanical","Civil","General"];

const btn = {
  base: { padding: '8px 14px', border: 'none', borderRadius: 8, cursor: 'pointer' },
  primary: { background: 'linear-gradient(135deg,#2563eb,#1d4ed8)', color: '#fff' },
  secondary: { background: '#eef2ff', color: '#1d4ed8' },
  danger: { background: '#ef4444', color: '#fff' },
  success: { background: '#10b981', color: '#fff' },
  warning: { background: '#f59e0b', color: '#fff' },
  ghost: { background: 'transparent', color: '#1f2937' },
};

const emptyBook = {
  id: "",
  title: "",
  author: "",
  category: "",
  publisher: "",
  quantity: 1,
  available: 1,
  isbn: "",
  shelf: "",
};

function todayStr(){
  const d = new Date(); const p = (n)=>String(n).padStart(2,'0');
  return `${d.getFullYear()}-${p(d.getMonth()+1)}-${p(d.getDate())}`;
}

function dateAddDays(str, days){
  const d = new Date(str || Date.now()); d.setDate(d.getDate()+days); const p=(n)=>String(n).padStart(2,'0');
  return `${d.getFullYear()}-${p(d.getMonth()+1)}-${p(d.getDate())}`;
}

const LibraryManagement = () => {
  const [books, setBooks] = useState([]);
  const [issues, setIssues] = useState([]);
  const [logs, setLogs] = useState([]);
  const [fines, setFines] = useState([]);

  const [bookForm, setBookForm] = useState(emptyBook);
  const [editingIndex, setEditingIndex] = useState(null);

  const [search, setSearch] = useState("");
  const [filters, setFilters] = useState({ category: "", available: "" });
  const [sortKey, setSortKey] = useState("alpha");
  const [page, setPage] = useState(1);

  const [issueForm, setIssueForm] = useState({ studentId: "", bookId: "", issueDate: todayStr(), dueDate: dateAddDays(todayStr(), 10) });
  const [showHistoryStudent, setShowHistoryStudent] = useState("");
  const [dark, setDark] = useState(false);

  // load
  useEffect(()=>{
    try { setBooks(JSON.parse(localStorage.getItem(KEYS.books)||'[]')||[]);} catch { setBooks([]); }
    try { setIssues(JSON.parse(localStorage.getItem(KEYS.issued)||'[]')||[]);} catch { setIssues([]); }
    try { setLogs(JSON.parse(localStorage.getItem(KEYS.logs)||'[]')||[]);} catch { setLogs([]); }
    try { setFines(JSON.parse(localStorage.getItem(KEYS.fines)||'[]')||[]);} catch { setFines([]); }
  },[]);

  // persist
  useEffect(()=>{ localStorage.setItem(KEYS.books, JSON.stringify(books)); },[books]);
  useEffect(()=>{ localStorage.setItem(KEYS.issued, JSON.stringify(issues)); },[issues]);
  useEffect(()=>{ localStorage.setItem(KEYS.logs, JSON.stringify(logs)); },[logs]);
  useEffect(()=>{ localStorage.setItem(KEYS.fines, JSON.stringify(fines)); },[fines]);

  const log = (action) => {
    const entry = { timestamp: new Date().toISOString(), action };
    setLogs(prev => [entry, ...prev.slice(0,199)]);
  };

  // BOOKS CRUD
  const validateBook = () => bookForm.title && bookForm.author && (Number(bookForm.quantity)>0);
  const submitBook = (e) => {
    e.preventDefault(); if(!validateBook()) return;
    const rec = {
      ...bookForm,
      id: bookForm.id?.trim() || `B${Date.now()}`,
      quantity: Number(bookForm.quantity)||0,
      available: editingIndex!==null ? Math.min(Number(bookForm.available)||0, Number(bookForm.quantity)||0) : Number(bookForm.quantity)||0,
    };
    setBooks(prev=>{
      const next=[...prev];
      if(editingIndex!==null){ next[editingIndex]=rec; log(`Edited Book ${rec.id} (${rec.title})`);} else { next.push(rec); log(`Added Book ${rec.id} (${rec.title})`);} 
      return next;
    });
    setBookForm(emptyBook); setEditingIndex(null);
  };
  const editBook = (idx) => { setBookForm({ ...emptyBook, ...books[idx] }); setEditingIndex(idx); };
  const deleteBook = (idx) => { if(window.confirm('Delete this book?')) { log(`Deleted Book ${books[idx].id}`); setBooks(prev=>prev.filter((_,i)=>i!==idx)); } };

  // Search/Filter/Sort
  const filteredBooks = useMemo(()=>{
    const term = search.trim().toLowerCase();
    return books.filter(b=>{
      const matches = !term || b.title.toLowerCase().includes(term) || b.author.toLowerCase().includes(term) || (b.category||'').toLowerCase().includes(term) || (b.isbn||'').toLowerCase().includes(term);
      const catOk = !filters.category || b.category===filters.category;
      const availOk = !filters.available || (filters.available==='Available' ? (Number(b.available)>0) : (Number(b.available)===0));
      return matches && catOk && availOk;
    });
  },[books, search, filters]);

  const sortedBooks = useMemo(()=>{
    const list=[...filteredBooks];
    switch(sortKey){
      case 'alpha': list.sort((a,b)=>a.title.localeCompare(b.title)); break;
      case 'available': list.sort((a,b)=> (b.available||0)-(a.available||0)); break;
      case 'category': list.sort((a,b)=> (a.category||'').localeCompare(b.category||'')); break;
      default: break;
    }
    return list;
  },[filteredBooks, sortKey]);

  // Pagination
  const PAGE_SIZE = 8; const [bookPage, setBookPage] = useState(1);
  const bookPageCount = Math.max(1, Math.ceil(sortedBooks.length/PAGE_SIZE));
  useEffect(()=>{ if(bookPage>bookPageCount) setBookPage(1); },[bookPageCount, bookPage]);
  const bookItems = sortedBooks.slice((bookPage-1)*PAGE_SIZE, bookPage*PAGE_SIZE);

  // Issue / Return
  const bookById = (id)=> books.find(b=>b.id===id);
  const availabilityBadge = (b)=> Number(b?.available)>0 ? <span style={{ ...btn.base, ...btn.success, padding:'2px 8px' }}>Available</span> : <span style={{ ...btn.base, ...btn.danger, padding:'2px 8px' }}>Out of Stock</span>;
  const FINE_PER_DAY = 5;
  const calculateFine = (dueDate, returnDate) => {
    if(!dueDate || !returnDate) return 0;
    const d = new Date(dueDate), r = new Date(returnDate);
    const diff = Math.ceil((r - d)/(1000*60*60*24));
    return diff>0 ? diff*FINE_PER_DAY : 0;
  };

  const submitIssue = (e) => {
    e.preventDefault();
    const b = bookById(issueForm.bookId);
    if(!b){ alert('Invalid Book ID'); return; }
    if(Number(b.available)<=0){ alert('Book not available'); return; }
    const entry = {
      issueId: `I${Date.now()}`,
      studentId: issueForm.studentId.trim(),
      bookId: issueForm.bookId,
      title: b.title,
      issueDate: issueForm.issueDate,
      dueDate: issueForm.dueDate,
      returnDate: null,
      status: 'Issued',
      fine: 0,
    };
    setIssues(prev=> [entry, ...prev]);
    setBooks(prev=> prev.map(x=> x.id===b.id ? { ...x, available: Number(x.available)-1 } : x));
    log(`Issued Book ${b.id} to ${entry.studentId}`);
  };

  const returnBook = (issueId) => {
    const retDate = todayStr();
    setIssues(prev=> prev.map(e=>{
      if(e.issueId!==issueId || e.status==='Returned') return e;
      const fine = calculateFine(e.dueDate, retDate);
      // record fine
      if(fine>0){ setFines(f=> [{ studentId: e.studentId, issueId: e.issueId, amount: fine, date: retDate }, ...f]); }
      // increment availability
      setBooks(b=> b.map(x=> x.id===e.bookId ? { ...x, available: Number(x.available)+1 } : x));
      log(`Returned Book ${e.bookId} from ${e.studentId}${fine>0? ` (Fine ₹${fine})`:''}`);
      return { ...e, status:'Returned', returnDate: retDate, fine };
    }));
  };

  // Issue filters/sorting
  const [issueFilter, setIssueFilter] = useState({ status: "", studentId: "", bookId: "", overdueOnly: false });
  const filteredIssues = useMemo(()=>{
    const now = new Date();
    return issues.filter(e=>{
      const okStatus = !issueFilter.status || e.status===issueFilter.status;
      const okStudent = !issueFilter.studentId || e.studentId.includes(issueFilter.studentId);
      const okBook = !issueFilter.bookId || e.bookId.includes(issueFilter.bookId) || (e.title||'').toLowerCase().includes(issueFilter.bookId.toLowerCase());
      const isOverdue = e.status==='Issued' && new Date(e.dueDate) < now;
      const okOver = !issueFilter.overdueOnly || isOverdue;
      return okStatus && okStudent && okBook && okOver;
    });
  },[issues, issueFilter]);

  // Analytics
  const analytics = useMemo(()=>{
    const totalBooks = books.reduce((s,b)=>s+(Number(b.quantity)||0),0);
    const totalAvailable = books.reduce((s,b)=>s+(Number(b.available)||0),0);
    const issuedToday = issues.filter(e=> e.issueDate===todayStr()).length;
    const overdue = issues.filter(e=> e.status==='Issued' && new Date(e.dueDate) < new Date()).length;
    const totalFine = fines.reduce((s,f)=>s+(Number(f.amount)||0),0);
    const byCategory = {};
    books.forEach(b=> { byCategory[b.category] = (byCategory[b.category]||0) + (Number(b.quantity)||0); });
    const popular = {};
    issues.forEach(e=> { popular[e.title] = (popular[e.title]||0)+1; });
    const mostPopular = Object.entries(popular).sort((a,b)=>b[1]-a[1]).slice(0,5);
    return { totalBooks, totalAvailable, issuedToday, overdue, totalFine, byCategory, mostPopular };
  },[books, issues, fines]);

  // Import/Export
  const exportJSON = () => {
    const payload = { books, issues, logs, fines };
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob); const a=document.createElement('a'); a.href=url; a.download='library_backup.json'; a.click(); URL.revokeObjectURL(url);
  };
  const importJSON = (e) => {
    const f=e.target.files?.[0]; if(!f) return; const reader=new FileReader();
    reader.onload=()=>{ try{ const d=JSON.parse(reader.result); setBooks(d.books||[]); setIssues(d.issues||[]); setLogs(d.logs||[]); setFines(d.fines||[]);}catch{ alert('Invalid JSON'); } };
    reader.readAsText(f);
  };

  const statCard = (title, value, accent)=> (
    <div style={{ flex:'1 1 180px', background:'#ffffff', borderRadius:16, padding:16, boxShadow:'0 6px 24px rgba(0,0,0,0.06)', border:`1px solid ${accent}22` }}>
      <div style={{ fontSize:13, color:'#6b7280', marginBottom:6 }}>{title}</div>
      <div style={{ fontSize:22, fontWeight:700, color:'#111827' }}>{value}</div>
    </div>
  );

  const containerStyle = dark
    ? { minHeight:'100vh', background:'linear-gradient(180deg,#0b1220,#0f172a)', color:'#e5e7eb', padding:20 }
    : { minHeight:'100vh', background:'linear-gradient(180deg,#f8fafc,#eef2ff)', color:'#111827', padding:20 };

  return (
    <div style={containerStyle}>
      <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:12 }}>
        <h2>Library Management</h2>
        <button onClick={()=>setDark(d=>!d)} style={{ ...btn.base, ...btn.secondary }}>{dark? 'Light Mode':'Dark Mode'}</button>
      </div>

      {/* Analytics */}
      <div style={{ display:'flex', gap:16, flexWrap:'wrap', marginBottom:16 }}>
        {statCard('Total Books', analytics.totalBooks, '#2563eb')}
        {statCard('Available', analytics.totalAvailable, '#10b981')}
        {statCard('Issued Today', analytics.issuedToday, '#1d4ed8')}
        {statCard('Overdue', analytics.overdue, '#ef4444')}
        {statCard('Total Fine', `₹${analytics.totalFine}`, '#f59e0b')}
      </div>

      {/* Book Form */}
      <form onSubmit={submitBook} style={{ background:'#fff', color:'#111827', padding:16, borderRadius:12, boxShadow:'0 6px 24px rgba(0,0,0,0.06)', marginBottom:16 }}>
        <h3>{editingIndex!==null? 'Edit' : 'Add'} Book</h3>
        <div style={{ display:'flex', flexWrap:'wrap', gap:10, marginTop:6 }}>
          <input placeholder="Book ID (auto if blank)" value={bookForm.id} onChange={(e)=>setBookForm(b=>({ ...b, id:e.target.value }))} style={{ flex:'1 1 160px' }} />
          <input placeholder="Title" value={bookForm.title} onChange={(e)=>setBookForm(b=>({ ...b, title:e.target.value }))} style={{ flex:'2 1 240px' }} />
          <input placeholder="Author" value={bookForm.author} onChange={(e)=>setBookForm(b=>({ ...b, author:e.target.value }))} style={{ flex:'1 1 180px' }} />
          <select value={bookForm.category} onChange={(e)=>setBookForm(b=>({ ...b, category:e.target.value }))} style={{ flex:'1 1 160px' }}>
            <option value="">Category</option>
            {categories.map(c=> (<option key={c} value={c}>{c}</option>))}
          </select>
          <input placeholder="Publisher" value={bookForm.publisher} onChange={(e)=>setBookForm(b=>({ ...b, publisher:e.target.value }))} style={{ flex:'1 1 180px' }} />
          <input placeholder="Quantity" type="number" min={0} value={bookForm.quantity} onChange={(e)=>setBookForm(b=>({ ...b, quantity:e.target.value }))} style={{ flex:'1 1 120px' }} />
          <input placeholder="Available" type="number" min={0} value={bookForm.available} onChange={(e)=>setBookForm(b=>({ ...b, available:e.target.value }))} style={{ flex:'1 1 120px' }} />
          <input placeholder="ISBN" value={bookForm.isbn} onChange={(e)=>setBookForm(b=>({ ...b, isbn:e.target.value }))} style={{ flex:'1 1 180px' }} />
          <input placeholder="Shelf No." value={bookForm.shelf} onChange={(e)=>setBookForm(b=>({ ...b, shelf:e.target.value }))} style={{ flex:'1 1 140px' }} />
        </div>
        <div style={{ marginTop:10, display:'flex', gap:8 }}>
          <button type="submit" style={{ ...btn.base, ...btn.primary }}>{editingIndex!==null? 'Update' : 'Add'}</button>
          {editingIndex!==null && (<button type="button" onClick={()=>{ setBookForm(emptyBook); setEditingIndex(null); }} style={{ ...btn.base, ...btn.secondary }}>Cancel</button>)}
          <button type="button" onClick={exportJSON} style={{ ...btn.base, ...btn.secondary, marginLeft:'auto' }}>Export JSON</button>
          <label style={{ ...btn.base, ...btn.secondary }}>
            Import JSON
            <input type="file" accept="application/json" onChange={importJSON} style={{ display:'none' }} />
          </label>
        </div>
      </form>

      {/* Book List Controls */}
      <div style={{ background:'#fff', color:'#111827', padding:12, borderRadius:12, boxShadow:'0 6px 24px rgba(0,0,0,0.06)', marginBottom:12 }}>
        <div style={{ display:'flex', flexWrap:'wrap', gap:10, alignItems:'center' }}>
          <input placeholder="Search title/author/category/ISBN" value={search} onChange={(e)=>setSearch(e.target.value)} style={{ flex:'2 1 320px' }} />
          <select value={filters.category} onChange={(e)=>setFilters(f=>({ ...f, category:e.target.value }))} style={{ flex:'1 1 160px' }}>
            <option value="">All Categories</option>
            {categories.map(c=> (<option key={c} value={c}>{c}</option>))}
          </select>
          <select value={filters.available} onChange={(e)=>setFilters(f=>({ ...f, available:e.target.value }))} style={{ flex:'1 1 160px' }}>
            <option value="">All Availability</option>
            <option>Available</option>
            <option>Issued</option>
          </select>
          <select value={sortKey} onChange={(e)=>setSortKey(e.target.value)} style={{ flex:'1 1 160px', marginLeft:'auto' }}>
            <option value="alpha">Alphabetical</option>
            <option value="available">By Availability</option>
            <option value="category">By Category</option>
          </select>
        </div>
      </div>

      {/* Book Table */}
      <div style={{ overflowX:'auto' }}>
        <table style={{ width:'100%', background:'#fff', color:'#111827', borderRadius:12, overflow:'hidden', boxShadow:'0 6px 24px rgba(0,0,0,0.06)' }}>
          <thead>
            <tr style={{ background:'#eef2ff' }}>
              <th>#</th>
              <th>Book ID</th>
              <th>Title</th>
              <th>Author</th>
              <th>Category</th>
              <th>Available</th>
              <th>Total</th>
              <th>Shelf</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {bookItems.length===0 && (<tr><td colSpan="9" style={{ textAlign:'center', color:'#6b7280' }}>No books found</td></tr>)}
            {bookItems.map((b,i)=>{
              const idx=(bookPage-1)*PAGE_SIZE+i;
              return (
                <tr key={idx} style={{ borderTop:'1px solid #e5e7eb' }}>
                  <td>{idx+1}</td>
                  <td>{b.id}</td>
                  <td>{b.title}</td>
                  <td>{b.author}</td>
                  <td>{b.category || '-'}</td>
                  <td>{availabilityBadge(b)}</td>
                  <td>{b.quantity}</td>
                  <td>{b.shelf}</td>
                  <td>
                    <button onClick={()=>editBook(idx)} style={{ ...btn.base, ...btn.secondary }}>Edit</button>
                    <button onClick={()=>deleteBook(idx)} style={{ ...btn.base, ...btn.danger, marginLeft:6 }}>Delete</button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      <div style={{ display:'flex', justifyContent:'center', gap:12, margin:'12px 0 16px' }}>
        <button onClick={()=>setBookPage(p=>Math.max(1,p-1))} disabled={bookPage===1} style={{ ...btn.base, ...btn.secondary }}>Prev</button>
        <span>Page {bookPage}/{bookPageCount}</span>
        <button onClick={()=>setBookPage(p=>Math.min(bookPageCount,p+1))} disabled={bookPage===bookPageCount} style={{ ...btn.base, ...btn.secondary }}>Next</button>
      </div>

      {/* Issue/Return */}
      <div style={{ background:'#fff', color:'#111827', padding:16, borderRadius:12, boxShadow:'0 6px 24px rgba(0,0,0,0.06)', marginBottom:16 }}>
        <h3>Issue / Return</h3>
        <form onSubmit={submitIssue} style={{ display:'flex', flexWrap:'wrap', gap:10, alignItems:'center' }}>
          <input placeholder="Student ID" value={issueForm.studentId} onChange={(e)=>setIssueForm(f=>({ ...f, studentId:e.target.value }))} style={{ flex:'1 1 160px' }} />
          <input placeholder="Book ID" value={issueForm.bookId} onChange={(e)=>setIssueForm(f=>({ ...f, bookId:e.target.value }))} style={{ flex:'1 1 160px' }} />
          <input type="date" value={issueForm.issueDate} onChange={(e)=>setIssueForm(f=>({ ...f, issueDate:e.target.value }))} style={{ flex:'1 1 150px' }} />
          <input type="date" value={issueForm.dueDate} onChange={(e)=>setIssueForm(f=>({ ...f, dueDate:e.target.value }))} style={{ flex:'1 1 150px' }} />
          <div style={{ marginLeft:'auto', display:'flex', gap:8 }}>
            <button type="submit" style={{ ...btn.base, ...btn.primary }}>Issue Book</button>
            <button type="button" onClick={()=>{ const b=bookById(issueForm.bookId); if(!b){ alert('Invalid Book ID'); return;} const open = issues.find(e=>e.bookId===issueForm.bookId && e.studentId===issueForm.studentId && e.status==='Issued'); if(!open){ alert('No open issue for this student/book'); return;} returnBook(open.issueId); }} style={{ ...btn.base, ...btn.success }}>Return Book</button>
          </div>
        </form>
      </div>

      {/* Issue Table */}
      <div style={{ background:'#fff', color:'#111827', padding:12, borderRadius:12, boxShadow:'0 6px 24px rgba(0,0,0,0.06)', marginBottom:12 }}>
        <div style={{ display:'flex', gap:10, flexWrap:'wrap', alignItems:'center' }}>
          <input placeholder="Filter by Student ID" value={issueFilter.studentId} onChange={(e)=>setIssueFilter(f=>({ ...f, studentId:e.target.value }))} style={{ flex:'1 1 180px' }} />
          <input placeholder="Filter by Book/Title" value={issueFilter.bookId} onChange={(e)=>setIssueFilter(f=>({ ...f, bookId:e.target.value }))} style={{ flex:'2 1 240px' }} />
          <select value={issueFilter.status} onChange={(e)=>setIssueFilter(f=>({ ...f, status:e.target.value }))} style={{ flex:'1 1 160px' }}>
            <option value="">All Status</option>
            <option>Issued</option>
            <option>Returned</option>
          </select>
          <label style={{ display:'flex', alignItems:'center', gap:6 }}>
            <input type="checkbox" checked={issueFilter.overdueOnly} onChange={(e)=>setIssueFilter(f=>({ ...f, overdueOnly:e.target.checked }))} /> Overdue Only
          </label>
        </div>
        <div style={{ overflowX:'auto', marginTop:10 }}>
          <table style={{ width:'100%' }}>
            <thead>
              <tr style={{ background:'#eef2ff' }}>
                <th>#</th>
                <th>Issue ID</th>
                <th>Student</th>
                <th>Book</th>
                <th>Issue</th>
                <th>Due</th>
                <th>Return</th>
                <th>Status</th>
                <th>Fine</th>
              </tr>
            </thead>
            <tbody>
              {filteredIssues.length===0 && (<tr><td colSpan="9" style={{ textAlign:'center', color:'#6b7280' }}>No issues</td></tr>)}
              {filteredIssues.map((e,i)=>{
                const isOverdue = e.status==='Issued' && new Date(e.dueDate) < new Date();
                return (
                  <tr key={e.issueId} style={{ borderTop:'1px solid #e5e7eb', background: isOverdue ? '#fff1f2':'inherit' }}>
                    <td>{i+1}</td>
                    <td>{e.issueId}</td>
                    <td>
                      <button onClick={()=>setShowHistoryStudent(e.studentId)} style={{ ...btn.ghost, color:'#2563eb' }}>{e.studentId}</button>
                    </td>
                    <td>{e.bookId} - {e.title}</td>
                    <td>{e.issueDate}</td>
                    <td>{e.dueDate}</td>
                    <td>{e.returnDate || '-'}</td>
                    <td>
                      <span style={{ ...btn.base, ...(e.status==='Issued'? btn.warning: btn.success), padding:'2px 10px' }}>{e.status}</span>
                    </td>
                    <td>{e.fine? `₹${e.fine}`:'-'}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Popular books */}
      <div style={{ background:'#fff', color:'#111827', padding:16, borderRadius:12, boxShadow:'0 6px 24px rgba(0,0,0,0.06)', marginBottom:16 }}>
        <h3>📈 Most Popular Books</h3>
        <div style={{ display:'flex', gap:10, flexWrap:'wrap' }}>
          {analytics.mostPopular.length===0 && (<div style={{ color:'#6b7280' }}>No data</div>)}
          {analytics.mostPopular.map(([title,count])=> (
            <div key={title} style={{ background:'#f8fafc', padding:10, borderRadius:8, border:'1px solid #e5e7eb' }}>{title} — {count} issue(s)</div>
          ))}
        </div>
      </div>

      {/* Activity feed */}
      <div style={{ background:'#fff', color:'#111827', padding:16, borderRadius:12, boxShadow:'0 6px 24px rgba(0,0,0,0.06)' }}>
        <h3>Activity Feed</h3>
        <ul style={{ listStyle:'none', padding:0, margin:0 }}>
          {logs.length===0 && (<li style={{ color:'#6b7280' }}>No recent activity</li>)}
          {logs.slice(0,20).map((l,i)=>(
            <li key={i} style={{ padding:'6px 0', borderBottom:'1px dashed #e5e7eb' }}>
              <span style={{ color:'#6b7280' }}>{new Date(l.timestamp).toLocaleString()} — </span>
              <span>{l.action}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* Student history modal */}
      {showHistoryStudent && (
        <div onClick={()=>setShowHistoryStudent("")} style={{ position:'fixed', inset:0, background:'#0005', display:'flex', alignItems:'center', justifyContent:'center', zIndex:99 }}>
          <div onClick={(e)=>e.stopPropagation()} style={{ background:'#fff', color:'#111827', borderRadius:12, padding:16, minWidth:380, maxWidth:620, boxShadow:'0 12px 40px rgba(0,0,0,0.3)' }}>
            <h3>Issue History — {showHistoryStudent}</h3>
            <table style={{ width:'100%' }}>
              <thead><tr><th>Book</th><th>Issue</th><th>Due</th><th>Return</th><th>Status</th><th>Fine</th></tr></thead>
              <tbody>
                {issues.filter(e=>e.studentId===showHistoryStudent).map(e=> (
                  <tr key={e.issueId}><td>{e.bookId} - {e.title}</td><td>{e.issueDate}</td><td>{e.dueDate}</td><td>{e.returnDate||'-'}</td><td>{e.status}</td><td>{e.fine? `₹${e.fine}`:'-'}</td></tr>
                ))}
              </tbody>
            </table>
            <div style={{ textAlign:'right', marginTop:10 }}>
              <button onClick={()=>setShowHistoryStudent("")} style={{ ...btn.base, ...btn.primary }}>Close</button>
            </div>
          </div>
        </div>
      )}

      {/* FAB: Quick Add Book (prefill minimal) */}
      <button onClick={()=>setBookForm(b=>({ ...b, title:b.title||'New Book', quantity: b.quantity||1, available: b.available||1 }))} title="Quick Add Book" style={{ position:'fixed', right:24, bottom:24, ...btn.base, ...btn.primary, borderRadius:9999, padding:'14px 18px', boxShadow:'0 10px 25px rgba(37,99,235,0.4)' }}>＋</button>
    </div>
  );
};

export default LibraryManagement;