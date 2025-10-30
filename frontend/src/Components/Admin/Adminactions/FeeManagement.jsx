import React, { useEffect, useMemo, useState } from "react";

const LOCAL_KEY = "fees";
const departments = ["AIML","CSE","ECE","EEE","MECH","CIVIL","BME"];
const semesters = [1,2,3,4,5,6,7,8];
const modes = ["Cash","UPI","Card"];

const btn = {
  base: { padding: '8px 14px', border: 'none', borderRadius: 8, cursor: 'pointer' },
  primary: { background: 'linear-gradient(135deg,#2563eb,#1d4ed8)', color: '#fff' },
  secondary: { background: '#eef2ff', color: '#1d4ed8' },
  danger: { background: '#ef4444', color: '#fff' },
  success: { background: '#10b981', color: '#fff' },
  warning: { background: '#f59e0b', color: '#fff' },
  ghost: { background: 'transparent', color: '#1f2937' },
};

const emptyForm = {
  studentId: "",
  name: "",
  department: "",
  semester: "",
  totalFee: 0,
  payments: [], // {date, amount, mode}
};

function formatCurrency(n){
  const v = Number(n)||0; return v.toLocaleString(undefined,{ style:'currency', currency:'INR' });
}

function todayStr(){
  const d = new Date();
  const p = (n)=>String(n).padStart(2,'0');
  return `${d.getFullYear()}-${p(d.getMonth()+1)}-${p(d.getDate())}`;
}

const FeeManagement = () => {
  const [items, setItems] = useState([]); // fee records
  const [form, setForm] = useState(emptyForm);
  const [editingIndex, setEditingIndex] = useState(null);
  const [search, setSearch] = useState("");
  const [filters, setFilters] = useState({ department: "", semester: "", status: "", dueMin: "", dueMax: "", dateFrom: "", dateTo: "" });
  const [sortKey, setSortKey] = useState("latest");
  const [page, setPage] = useState(1);
  const [showHistoryFor, setShowHistoryFor] = useState(null);
  const [quickPay, setQuickPay] = useState({ open: false, id: "", amount: "", date: todayStr(), mode: "UPI" });

  // sync with localStorage
  useEffect(()=>{
    try{ const d=JSON.parse(localStorage.getItem(LOCAL_KEY)||'[]'); setItems(Array.isArray(d)?d:[]);}catch{ setItems([]);}  
  },[]);
  useEffect(()=>{ localStorage.setItem(LOCAL_KEY, JSON.stringify(items)); },[items]);

  // derived
  const withComputed = useMemo(()=>{
    return items.map(r=>{
      const paid = (r.payments||[]).reduce((s,p)=>s+(Number(p.amount)||0),0);
      const total = Number(r.totalFee)||0;
      const due = Math.max(0, total - paid);
      const status = paid>=total? 'Paid' : paid>0? 'Partial' : 'Pending';
      const lastDate = (r.payments||[]).reduce((m,p)=> m && m>p.date? m : p.date, null);
      return { ...r, paid, due, status, lastDate };
    });
  },[items]);

  const validateForm = ()=> form.studentId && form.name && form.department && form.semester && (Number(form.totalFee)>0);

  const onSubmit = (e)=>{
    e.preventDefault();
    if(!validateForm()) return;
    const rec = {
      ...form,
      semester: Number(form.semester)||0,
      totalFee: Number(form.totalFee)||0,
      payments: Array.isArray(form.payments)? form.payments: [],
      updatedAt: new Date().toISOString(),
    };
    setItems(prev=>{
      const next=[...prev];
      if(editingIndex!==null){ next[editingIndex]=rec; } else { next.push(rec); }
      return next;
    });
    setForm(emptyForm); setEditingIndex(null);
  };

  const onEdit = (idx)=>{ setForm({ ...emptyForm, ...items[idx] }); setEditingIndex(idx); };
  const onDelete = (idx)=>{ if(window.confirm('Delete this fee record?')) setItems(prev=>prev.filter((_,i)=>i!==idx)); };

  // add payment to a record
  const addPayment = (idx, payment)=>{
    setItems(prev=>{
      const next=[...prev];
      const r = { ...next[idx] };
      const newPayments = [ ...(r.payments||[]), payment ];
      const paid = newPayments.reduce((s,p)=>s+(Number(p.amount)||0),0);
      if(paid > Number(r.totalFee||0)){
        alert('Paid cannot exceed Total Fee.');
        return prev;
      }
      r.payments = newPayments;
      r.updatedAt = new Date().toISOString();
      next[idx]=r; return next;
    });
  };

  // search/filter
  const filtered = useMemo(()=>{
    const term = search.trim().toLowerCase();
    const { department, semester, status, dueMin, dueMax, dateFrom, dateTo } = filters;
    return withComputed.filter(r=>{
      const matchesSearch = !term || r.studentId.toLowerCase().includes(term) || r.name.toLowerCase().includes(term) || (r.department||'').toLowerCase().includes(term);
      const matchesDept = !department || r.department===department;
      const matchesSem = !semester || Number(r.semester)===Number(semester);
      const matchesStatus = !status || r.status===status;
      const matchesDueMin = !dueMin || r.due >= Number(dueMin);
      const matchesDueMax = !dueMax || r.due <= Number(dueMax);
      const last = r.lastDate ? new Date(r.lastDate) : null;
      const fromOk = !dateFrom || (last && last >= new Date(dateFrom));
      const toOk = !dateTo || (last && last <= new Date(dateTo));
      return matchesSearch && matchesDept && matchesSem && matchesStatus && matchesDueMin && matchesDueMax && fromOk && toOk;
    });
  },[withComputed, search, filters]);

  // sorting
  const sorted = useMemo(()=>{
    const list = [...filtered];
    switch(sortKey){
      case 'dueDesc': list.sort((a,b)=>b.due-a.due); break;
      case 'alpha': list.sort((a,b)=>a.name.localeCompare(b.name)); break;
      case 'dept': list.sort((a,b)=>a.department.localeCompare(b.department)); break;
      case 'latest': default: list.sort((a,b)=> new Date(b.lastDate||b.updatedAt||0) - new Date(a.lastDate||a.updatedAt||0));
    }
    return list;
  },[filtered, sortKey]);

  // pagination
  const PAGE_SIZE = 8;
  const pageCount = Math.max(1, Math.ceil(sorted.length / PAGE_SIZE));
  const pageItems = sorted.slice((page-1)*PAGE_SIZE, page*PAGE_SIZE);
  useEffect(()=>{ if(page>pageCount) setPage(1); },[pageCount, page]);

  // analytics
  const analytics = useMemo(()=>{
    const totalStudents = withComputed.length;
    const totalFees = withComputed.reduce((s,r)=>s+(Number(r.totalFee)||0),0);
    const collected = withComputed.reduce((s,r)=>s+(Number(r.paid)||0),0);
    const outstanding = Math.max(0, totalFees-collected);
    const paidCount = withComputed.filter(r=>r.status==='Paid').length;
    const paidPct = totalStudents? Math.round((paidCount/totalStudents)*100):0;
    const deptCollect = {};
    withComputed.forEach(r=>{ deptCollect[r.department]= (deptCollect[r.department]||0) + (Number(r.paid)||0); });
    return { totalStudents, totalFees, collected, outstanding, paidPct, deptCollect };
  },[withComputed]);

  // import/export
  const exportJSON = ()=>{
    const blob = new Blob([JSON.stringify(items,null,2)],{type:'application/json'});
    const url=URL.createObjectURL(blob); const a=document.createElement('a'); a.href=url; a.download='fees_backup.json'; a.click(); URL.revokeObjectURL(url);
  };
  const importJSON = (e)=>{
    const f=e.target.files?.[0]; if(!f) return; const reader=new FileReader();
    reader.onload=()=>{ try{ const d=JSON.parse(reader.result); if(!Array.isArray(d)) throw new Error(); setItems(d);}catch{ alert('Invalid JSON'); } };
    reader.readAsText(f);
  };

  // reminders (highlight overdue/partial)
  const isOverdue = (r)=> r.status!=='Paid' && r.due>0;

  // quick add FAB
  const openQuickAdd = (rec)=> setQuickPay({ open:true, id:rec.studentId, amount:"", date: todayStr(), mode:"UPI" });
  const submitQuickAdd = ()=>{
    const idx = withComputed.findIndex(r=>r.studentId===quickPay.id);
    if(idx<0) { setQuickPay(q=>({ ...q, open:false })); return; }
    if(!quickPay.amount || Number(quickPay.amount)<=0) return;
    const payment = { date: quickPay.date, amount: Number(quickPay.amount)||0, mode: quickPay.mode };
    addPayment(idx, payment);
    setQuickPay(q=>({ ...q, open:false }));
  };

  const card = (title, value, accent)=> (
    <div style={{ flex:'1 1 180px', background:'#ffffff', borderRadius:16, padding:16, boxShadow:'0 6px 24px rgba(0,0,0,0.06)', border:`1px solid ${accent}22` }}>
      <div style={{ fontSize:13, color:'#6b7280', marginBottom:6 }}>{title}</div>
      <div style={{ fontSize:22, fontWeight:700, color:'#111827' }}>{value}</div>
    </div>
  );

  return (
    <div style={{ minHeight:'100vh', background:'linear-gradient(180deg,#f8fafc,#eef2ff)', padding:20, position:'relative' }}>
      <h2 style={{ marginBottom:12 }}>Fee Management</h2>

      {/* Analytics Cards */}
      <div style={{ display:'flex', gap:16, flexWrap:'wrap', marginBottom:16 }}>
        {card('Total Students', analytics.totalStudents, '#2563eb')}
        {card('Total Fees', formatCurrency(analytics.totalFees), '#10b981')}
        {card('Collected', formatCurrency(analytics.collected), '#1d4ed8')}
        {card('Outstanding', formatCurrency(analytics.outstanding), '#ef4444')}
        {card('Paid %', `${analytics.paidPct}%`, '#f59e0b')}
      </div>

      {/* Add/Edit Fee Record */}
      <form onSubmit={onSubmit} style={{ background:'#fff', padding:16, borderRadius:12, boxShadow:'0 6px 24px rgba(0,0,0,0.06)', marginBottom:16 }}>
        <h3>{editingIndex!==null? 'Edit' : 'Add'} Fee Record</h3>
        <div style={{ display:'flex', flexWrap:'wrap', gap:10, marginTop:6 }}>
          <input placeholder="Student ID" name="studentId" value={form.studentId} onChange={(e)=>setForm(f=>({ ...f, studentId:e.target.value }))} style={{ flex:'1 1 140px' }} />
          <input placeholder="Name" name="name" value={form.name} onChange={(e)=>setForm(f=>({ ...f, name:e.target.value }))} style={{ flex:'1 1 200px' }} />
          <select name="department" value={form.department} onChange={(e)=>setForm(f=>({ ...f, department:e.target.value }))} style={{ flex:'1 1 160px' }}>
            <option value="">Department</option>
            {departments.map(d=>(<option key={d} value={d}>{d}</option>))}
          </select>
          <select name="semester" value={form.semester} onChange={(e)=>setForm(f=>({ ...f, semester:e.target.value }))} style={{ flex:'1 1 120px' }}>
            <option value="">Semester</option>
            {semesters.map(s=>(<option key={s} value={s}>{s}</option>))}
          </select>
          <input placeholder="Total Fee" type="number" min={0} name="totalFee" value={form.totalFee} onChange={(e)=>setForm(f=>({ ...f, totalFee:e.target.value }))} style={{ flex:'1 1 140px' }} />
        </div>
        <div style={{ marginTop:10, display:'flex', gap:8 }}>
          <button type="submit" style={{ ...btn.base, ...btn.primary }}>{editingIndex!==null? 'Update' : 'Add'}</button>
          {editingIndex!==null && (
            <button type="button" onClick={()=>{ setForm(emptyForm); setEditingIndex(null); }} style={{ ...btn.base, ...btn.secondary }}>Cancel</button>
          )}
          <button type="button" onClick={exportJSON} style={{ ...btn.base, ...btn.secondary, marginLeft:'auto' }}>Export JSON</button>
          <label style={{ ...btn.base, ...btn.secondary }}>
            Import JSON
            <input type="file" accept="application/json" onChange={importJSON} style={{ display:'none' }} />
          </label>
        </div>
      </form>

      {/* Filters and Sorting */}
      <div style={{ background:'#fff', padding:12, borderRadius:12, boxShadow:'0 6px 24px rgba(0,0,0,0.06)', marginBottom:12 }}>
        <div style={{ display:'flex', flexWrap:'wrap', gap:10, alignItems:'center' }}>
          <input placeholder="Search by name/ID/department" value={search} onChange={(e)=>setSearch(e.target.value)} style={{ flex:'2 1 280px' }} />
          <select value={filters.department} onChange={(e)=>setFilters(f=>({ ...f, department:e.target.value }))} style={{ flex:'1 1 160px' }}>
            <option value="">All Departments</option>
            {departments.map(d=>(<option key={d} value={d}>{d}</option>))}
          </select>
          <select value={filters.semester} onChange={(e)=>setFilters(f=>({ ...f, semester:e.target.value }))} style={{ flex:'1 1 120px' }}>
            <option value="">All Semesters</option>
            {semesters.map(s=>(<option key={s} value={s}>{s}</option>))}
          </select>
          <select value={filters.status} onChange={(e)=>setFilters(f=>({ ...f, status:e.target.value }))} style={{ flex:'1 1 150px' }}>
            <option value="">All Status</option>
            <option value="Paid">Paid</option>
            <option value="Partial">Partial</option>
            <option value="Pending">Pending</option>
          </select>
          <input placeholder="Due Min" type="number" value={filters.dueMin} onChange={(e)=>setFilters(f=>({ ...f, dueMin:e.target.value }))} style={{ flex:'1 1 110px' }} />
          <input placeholder="Due Max" type="number" value={filters.dueMax} onChange={(e)=>setFilters(f=>({ ...f, dueMax:e.target.value }))} style={{ flex:'1 1 110px' }} />
          <input type="date" value={filters.dateFrom} onChange={(e)=>setFilters(f=>({ ...f, dateFrom:e.target.value }))} style={{ flex:'1 1 150px' }} />
          <input type="date" value={filters.dateTo} onChange={(e)=>setFilters(f=>({ ...f, dateTo:e.target.value }))} style={{ flex:'1 1 150px' }} />
          <select value={sortKey} onChange={(e)=>setSortKey(e.target.value)} style={{ flex:'1 1 160px', marginLeft:'auto' }}>
            <option value="latest">Latest Payment</option>
            <option value="dueDesc">Highest Due</option>
            <option value="dept">Department</option>
            <option value="alpha">Alphabetical</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <div style={{ overflowX:'auto' }}>
        <table style={{ width:'100%', background:'#fff', borderRadius:12, overflow:'hidden', boxShadow:'0 6px 24px rgba(0,0,0,0.06)' }}>
          <thead>
            <tr style={{ background:'#eef2ff' }}>
              <th>#</th>
              <th>Student ID</th>
              <th>Name</th>
              <th>Department</th>
              <th>Sem</th>
              <th>Total</th>
              <th>Paid</th>
              <th>Due</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {pageItems.length===0 && (<tr><td colSpan="10" style={{ textAlign:'center', color:'#6b7280' }}>No records</td></tr>)}
            {pageItems.map((r,i)=>{
              const idx = (page-1)*PAGE_SIZE+i;
              const prog = Math.min(100, Math.round(((Number(r.paid)||0)/(Number(r.totalFee)||1))*100));
              return (
                <tr key={idx} style={{ borderTop:'1px solid #e5e7eb' }}>
                  <td>{idx+1}</td>
                  <td>{r.studentId}</td>
                  <td>
                    <button onClick={()=>setShowHistoryFor(idx)} style={{ ...btn.ghost, color:'#2563eb' }}>{r.name}</button>
                  </td>
                  <td>{r.department}</td>
                  <td>{r.semester}</td>
                  <td>{formatCurrency(r.totalFee)}</td>
                  <td>{formatCurrency(r.paid)}</td>
                  <td style={{ color: r.due>0? '#ef4444':'#10b981' }}>{formatCurrency(r.due)}</td>
                  <td>
                    <span style={{ ...btn.base, ...(r.status==='Paid'? btn.success : r.status==='Partial'? btn.warning : btn.danger), padding:'2px 10px' }}>{r.status}</span>
                  </td>
                  <td>
                    <div style={{ width:120 }}>
                      <div style={{ height:8, borderRadius:6, background:'#e5e7eb', overflow:'hidden', marginBottom:6 }}>
                        <div style={{ width:`${prog}%`, background:'linear-gradient(90deg,#22c55e,#16a34a)', height:'100%' }} />
                      </div>
                      <div style={{ display:'flex', gap:6 }}>
                        <button onClick={()=>openQuickAdd(r)} title="Quick Add Payment" style={{ ...btn.base, ...btn.primary }}>+Pay</button>
                        <button onClick={()=>onEdit(idx)} style={{ ...btn.base, ...btn.secondary }}>Edit</button>
                        <button onClick={()=>onDelete(idx)} style={{ ...btn.base, ...btn.danger }}>Del</button>
                      </div>
                    </div>
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

      {/* Payment History Modal */}
      {showHistoryFor!==null && withComputed[showHistoryFor] && (
        <div onClick={()=>setShowHistoryFor(null)} style={{ position:'fixed', inset:0, background:'#0005', display:'flex', alignItems:'center', justifyContent:'center', zIndex:99 }}>
          <div onClick={(e)=>e.stopPropagation()} style={{ background:'#fff', borderRadius:12, padding:20, minWidth:400, maxWidth:640, boxShadow:'0 12px 40px rgba(0,0,0,0.3)' }}>
            <h3>Payment History - {withComputed[showHistoryFor].name}</h3>
            <div style={{ margin:'6px 0 10px', color:'#6b7280' }}>ID: {withComputed[showHistoryFor].studentId}</div>
            <table style={{ width:'100%' }}>
              <thead><tr><th>Date</th><th>Amount</th><th>Mode</th></tr></thead>
              <tbody>
                {(withComputed[showHistoryFor].payments||[]).map((p, i)=>(
                  <tr key={i}><td>{p.date}</td><td>{formatCurrency(p.amount)}</td><td>{p.mode}</td></tr>
                ))}
              </tbody>
            </table>
            <div style={{ marginTop:10, display:'flex', gap:8, justifyContent:'flex-end' }}>
              <button onClick={()=>setShowHistoryFor(null)} style={{ ...btn.base, ...btn.primary }}>Close</button>
            </div>
          </div>
        </div>
      )}

      {/* FAB Quick Add Payment */}
      <button onClick={()=>setQuickPay(q=>({ ...q, open:true }))} title="Quick Add Payment" style={{ position:'fixed', right:24, bottom:24, ...btn.base, ...btn.primary, borderRadius:9999, padding:'14px 18px', boxShadow:'0 10px 25px rgba(37,99,235,0.4)' }}>＋</button>
      {quickPay.open && (
        <div onClick={()=>setQuickPay(q=>({ ...q, open:false }))} style={{ position:'fixed', inset:0, background:'#0005', display:'flex', alignItems:'center', justifyContent:'center', zIndex:99 }}>
          <div onClick={(e)=>e.stopPropagation()} style={{ background:'#fff', borderRadius:12, padding:16, minWidth:320, boxShadow:'0 12px 40px rgba(0,0,0,0.3)' }}>
            <h3>Quick Payment</h3>
            <div style={{ display:'flex', flexDirection:'column', gap:8, marginTop:8 }}>
              <input placeholder="Student ID" value={quickPay.id} onChange={(e)=>setQuickPay(q=>({ ...q, id:e.target.value }))} />
              <input placeholder="Amount" type="number" value={quickPay.amount} onChange={(e)=>setQuickPay(q=>({ ...q, amount:e.target.value }))} />
              <input type="date" value={quickPay.date} onChange={(e)=>setQuickPay(q=>({ ...q, date:e.target.value }))} />
              <select value={quickPay.mode} onChange={(e)=>setQuickPay(q=>({ ...q, mode:e.target.value }))}>
                {modes.map(m=>(<option key={m} value={m}>{m}</option>))}
              </select>
            </div>
            <div style={{ display:'flex', gap:8, justifyContent:'flex-end', marginTop:10 }}>
              <button onClick={()=>setQuickPay(q=>({ ...q, open:false }))} style={{ ...btn.base, ...btn.secondary }}>Cancel</button>
              <button onClick={submitQuickAdd} style={{ ...btn.base, ...btn.success }}>Add</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FeeManagement;


