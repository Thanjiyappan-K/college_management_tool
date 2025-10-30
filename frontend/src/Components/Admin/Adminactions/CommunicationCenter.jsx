import React, { useEffect, useMemo, useState } from "react";

const KEYS = {
  announcements: "announcements",
  messages: "messages",
  templates: "templates",
  logs: "communicationLogs",
};

const btn = {
  base: { padding: '8px 14px', border: 'none', borderRadius: 8, cursor: 'pointer' },
  primary: { background: 'linear-gradient(135deg,#2563eb,#1d4ed8)', color: '#fff' },
  secondary: { background: '#eef2ff', color: '#1d4ed8' },
  danger: { background: '#ef4444', color: '#fff' },
  success: { background: '#10b981', color: '#fff' },
  warning: { background: '#f59e0b', color: '#fff' },
  ghost: { background: 'transparent', color: '#1f2937' },
};

function todayStr(){
  const d = new Date();
  const p=(n)=>String(n).padStart(2,'0');
  return `${d.getFullYear()}-${p(d.getMonth()+1)}-${p(d.getDate())}`;
}

const defaultTemplates = [
  { id: 'T1', title: 'Meeting Reminder', content: 'This is a reminder for today\'s meeting at 4 PM.' },
  { id: 'T2', title: 'Fee Payment Notice', content: 'Please complete your fee payment by the due date.' },
  { id: 'T3', title: 'Exam Schedule Update', content: 'Mid-sem exams start from next Monday. Prepare accordingly.' },
];

const CommunicationCenter = () => {
  const [tab, setTab] = useState('announcements'); // announcements | messages | history | templates
  const [announcements, setAnnouncements] = useState([]);
  const [messages, setMessages] = useState([]);
  const [templates, setTemplates] = useState([]);
  const [logs, setLogs] = useState([]);

  // announcements
  const [annForm, setAnnForm] = useState({ id: '', title: '', message: '', audience: 'All', date: todayStr(), expiryDate: '', status: 'Active' });
  const [annEdit, setAnnEdit] = useState(null);
  const [annSearch, setAnnSearch] = useState('');

  // messages
  const [msgForm, setMsgForm] = useState({ id: '', sender: 'Admin', receiver: '', receiverType: 'Teacher', message: '', attachment: '', timestamp: new Date().toISOString(), read: false });
  const [msgView, setMsgView] = useState('inbox'); // inbox | sent
  const [msgSearch, setMsgSearch] = useState('');
  const [threadFor, setThreadFor] = useState('');

  // theming
  const [dark, setDark] = useState(false);

  // load
  useEffect(()=>{
    try{ setAnnouncements(JSON.parse(localStorage.getItem(KEYS.announcements)||'[]')||[]);}catch{ setAnnouncements([]);} 
    try{ setMessages(JSON.parse(localStorage.getItem(KEYS.messages)||'[]')||[]);}catch{ setMessages([]);} 
    try{ setTemplates(JSON.parse(localStorage.getItem(KEYS.templates)||'[]')||defaultTemplates);}catch{ setTemplates(defaultTemplates);} 
    try{ setLogs(JSON.parse(localStorage.getItem(KEYS.logs)||'[]')||[]);}catch{ setLogs([]);} 
  },[]);

  // persist
  useEffect(()=>{ localStorage.setItem(KEYS.announcements, JSON.stringify(announcements)); },[announcements]);
  useEffect(()=>{ localStorage.setItem(KEYS.messages, JSON.stringify(messages)); },[messages]);
  useEffect(()=>{ localStorage.setItem(KEYS.templates, JSON.stringify(templates)); },[templates]);
  useEffect(()=>{ localStorage.setItem(KEYS.logs, JSON.stringify(logs)); },[logs]);

  const log = (action) => setLogs(prev => [{ timestamp: new Date().toISOString(), action }, ...prev.slice(0,199)]);

  // Notifications
  const notify = (title, body) => {
    try {
      if (Notification && Notification.permission === 'granted') new Notification(title, { body });
      else if (Notification && Notification.permission !== 'denied') Notification.requestPermission();
    } catch {}
  };

  // Announcement expiry auto-status
  useEffect(()=>{
    setAnnouncements(prev => prev.map(a => {
      if (!a.expiryDate) return a;
      const expired = new Date(a.expiryDate) < new Date();
      return expired && a.status !== 'Expired' ? { ...a, status: 'Expired' } : a;
    }));
  },[]);

  // Analytics
  const analytics = useMemo(()=>{
    const totalAnnouncements = announcements.length;
    const activeAnnouncements = announcements.filter(a=>a.status==='Active').length;
    const totalMessages = messages.length;
    const unread = messages.filter(m=>!m.read).length;
    const msgByType = messages.reduce((acc,m)=>{ const k = m.receiverType || 'Unknown'; acc[k]=(acc[k]||0)+1; return acc; },{});
    const volumeByDate = {};
    [...announcements.map(a=>a.date), ...messages.map(m=>m.timestamp.substring(0,10))].forEach(d=>{ volumeByDate[d]=(volumeByDate[d]||0)+1; });
    return { totalAnnouncements, activeAnnouncements, totalMessages, unread, msgByType, volumeByDate };
  },[announcements, messages]);

  const containerStyle = dark
    ? { minHeight:'100vh', background:'linear-gradient(180deg,#0b1220,#0f172a)', color:'#e5e7eb', padding:20 }
    : { minHeight:'100vh', background:'linear-gradient(180deg,#f8fafc,#eef2ff)', color:'#111827', padding:20 };

  const card = (title, value, accent)=> (
    <div style={{ flex:'1 1 180px', background:'#ffffff', borderRadius:16, padding:16, boxShadow:'0 6px 24px rgba(0,0,0,0.06)', border:`1px solid ${accent}22` }}>
      <div style={{ fontSize:13, color:'#6b7280', marginBottom:6 }}>{title}</div>
      <div style={{ fontSize:22, fontWeight:700, color:'#111827' }}>{value}</div>
    </div>
  );

  // derived lists
  const filteredAnnouncements = useMemo(()=>{
    const t = annSearch.trim().toLowerCase();
    return announcements.filter(a => !t || a.title.toLowerCase().includes(t) || a.message.toLowerCase().includes(t) || (a.audience||'').toLowerCase().includes(t));
  },[announcements, annSearch]);

  const filteredMessages = useMemo(()=>{
    const t = msgSearch.trim().toLowerCase();
    const list = msgView==='sent' ? messages.filter(m=>m.sender==='Admin') : messages.filter(m=>m.receiver==='Admin');
    return list.filter(m => !t || (m.receiver||'').toLowerCase().includes(t) || (m.message||'').toLowerCase().includes(t));
  },[messages, msgView, msgSearch]);

  // threads grouped by receiver
  const threads = useMemo(()=>{
    const map = {};
    messages.forEach(m => {
      const key = m.receiverType + ':' + (m.sender==='Admin'? m.receiver : m.sender);
      if (!map[key]) map[key] = [];
      map[key].push(m);
    });
    Object.values(map).forEach(arr => arr.sort((a,b)=> new Date(a.timestamp) - new Date(b.timestamp)));
    return map;
  },[messages]);

  // announcement handlers
  const submitAnnouncement = (e) => {
    e.preventDefault();
    const rec = { ...annForm, id: annForm.id?.trim() || `A${Date.now()}`, status: annForm.expiryDate && new Date(annForm.expiryDate) < new Date() ? 'Expired' : 'Active' };
    setAnnouncements(prev => {
      const next = [...prev];
      if (annEdit!==null) next[annEdit] = rec; else next.push(rec);
      return next;
    });
    log(`Announcement ${annEdit!==null?'updated':'created'}: ${rec.title}`);
    notify('New Announcement', rec.title);
    setAnnForm({ id: '', title: '', message: '', audience: 'All', date: todayStr(), expiryDate: '', status: 'Active' });
    setAnnEdit(null);
  };
  const editAnnouncement = (idx) => { setAnnEdit(idx); setAnnForm(announcements[idx]); };
  const deleteAnnouncement = (idx) => { if(window.confirm('Delete announcement?')) { log(`Announcement deleted: ${announcements[idx].title}`); setAnnouncements(prev => prev.filter((_,i)=>i!==idx)); } };

  // message handlers
  const submitMessage = (e) => {
    e.preventDefault();
    if (!msgForm.receiver || !msgForm.message) return;
    const rec = { ...msgForm, id: msgForm.id?.trim() || `M${Date.now()}`, timestamp: new Date().toISOString(), read: false };
    setMessages(prev => [rec, ...prev]);
    log(`Message sent to ${rec.receiverType}:${rec.receiver}`);
    notify('New Message', `To ${rec.receiverType}: ${rec.receiver}`);
    setMsgForm({ id: '', sender: 'Admin', receiver: '', receiverType: msgForm.receiverType, message: '', attachment: '', timestamp: new Date().toISOString(), read: false });
  };

  const markRead = (id) => setMessages(prev => prev.map(m => m.id===id ? { ...m, read: true } : m));

  // template handlers
  const addTemplate = (tpl) => setTemplates(prev => [...prev, { id:`T${Date.now()}`, title: tpl.title || 'Template', content: tpl.content || '' }]);
  const applyTemplateToAnnouncement = (tpl) => setAnnForm(f => ({ ...f, title: tpl.title, message: tpl.content }));
  const applyTemplateToMessage = (tpl) => setMsgForm(f => ({ ...f, message: tpl.content }));

  return (
    <div style={containerStyle}>
      <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:12 }}>
        <h2>Communication Center</h2>
        <div style={{ display:'flex', gap:8, alignItems:'center' }}>
          <button onClick={()=>setDark(d=>!d)} style={{ ...btn.base, ...btn.secondary }}>{dark? 'Light Mode':'Dark Mode'}</button>
          <button onClick={()=>setTab('announcements')} style={{ ...btn.base, ...(tab==='announcements'? btn.primary: btn.secondary) }}>Announcements</button>
          <button onClick={()=>setTab('messages')} style={{ ...btn.base, ...(tab==='messages'? btn.primary: btn.secondary) }}>Messages</button>
          <button onClick={()=>setTab('history')} style={{ ...btn.base, ...(tab==='history'? btn.primary: btn.secondary) }}>History</button>
          <button onClick={()=>setTab('templates')} style={{ ...btn.base, ...(tab==='templates'? btn.primary: btn.secondary) }}>Templates</button>
        </div>
      </div>

      {/* Dashboard cards */}
      <div style={{ display:'flex', gap:16, flexWrap:'wrap', marginBottom:16 }}>
        {card('Total Announcements', analytics.totalAnnouncements, '#2563eb')}
        {card('Active Announcements', analytics.activeAnnouncements, '#10b981')}
        {card('Total Messages', analytics.totalMessages, '#1d4ed8')}
        {card('Unread Messages', analytics.unread, '#ef4444')}
      </div>

      {tab==='announcements' && (
        <div>
          <form onSubmit={submitAnnouncement} style={{ background:'#fff', color:'#111827', padding:16, borderRadius:12, boxShadow:'0 6px 24px rgba(0,0,0,0.06)', marginBottom:16 }}>
            <h3>{annEdit!==null? 'Edit' : 'Create'} Announcement</h3>
            <div style={{ display:'flex', flexWrap:'wrap', gap:10, marginTop:6 }}>
              <input placeholder="Title" value={annForm.title} onChange={(e)=>setAnnForm(f=>({ ...f, title:e.target.value }))} style={{ flex:'2 1 260px' }} />
              <select value={annForm.audience} onChange={(e)=>setAnnForm(f=>({ ...f, audience:e.target.value }))} style={{ flex:'1 1 180px' }}>
                <option>All</option>
                <option>Teachers</option>
                <option>Students</option>
                <option>Department:CSE</option>
                <option>Department:AIML</option>
                <option>Department:ECE</option>
              </select>
              <input type="date" value={annForm.date} onChange={(e)=>setAnnForm(f=>({ ...f, date:e.target.value }))} style={{ flex:'1 1 150px' }} />
              <input type="date" value={annForm.expiryDate} onChange={(e)=>setAnnForm(f=>({ ...f, expiryDate:e.target.value }))} style={{ flex:'1 1 150px' }} />
              <textarea placeholder="Message" rows={2} value={annForm.message} onChange={(e)=>setAnnForm(f=>({ ...f, message:e.target.value }))} style={{ flex:'1 1 100%' }} />
            </div>
            <div style={{ marginTop:10, display:'flex', gap:8 }}>
              <button type="submit" style={{ ...btn.base, ...btn.primary }}>{annEdit!==null? 'Update' : 'Publish'}</button>
              {annEdit!==null && (<button type="button" onClick={()=>{ setAnnForm({ id: '', title: '', message: '', audience: 'All', date: todayStr(), expiryDate:'', status:'Active' }); setAnnEdit(null); }} style={{ ...btn.base, ...btn.secondary }}>Cancel</button>)}
            </div>
          </form>

          <div style={{ background:'#fff', color:'#111827', padding:12, borderRadius:12, boxShadow:'0 6px 24px rgba(0,0,0,0.06)', marginBottom:12 }}>
            <div style={{ display:'flex', alignItems:'center', gap:10 }}>
              <input placeholder="Search announcements" value={annSearch} onChange={(e)=>setAnnSearch(e.target.value)} style={{ flex:'2 1 260px' }} />
            </div>
          </div>

          <div style={{ overflowX:'auto' }}>
            <table style={{ width:'100%', background:'#fff', color:'#111827', borderRadius:12, overflow:'hidden', boxShadow:'0 6px 24px rgba(0,0,0,0.06)' }}>
              <thead>
                <tr style={{ background:'#eef2ff' }}>
                  <th>#</th>
                  <th>Title</th>
                  <th>Date</th>
                  <th>Audience</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredAnnouncements.length===0 && (<tr><td colSpan="6" style={{ textAlign:'center', color:'#6b7280' }}>No announcements</td></tr>)}
                {filteredAnnouncements.sort((a,b)=> new Date(b.date)-new Date(a.date)).map((a,i)=>(
                  <tr key={a.id} style={{ borderTop:'1px solid #e5e7eb' }}>
                    <td>{i+1}</td>
                    <td>{a.title}</td>
                    <td>{a.date}</td>
                    <td>{a.audience}</td>
                    <td>
                      <span style={{ ...btn.base, ...(a.status==='Active'? btn.success : btn.warning), padding:'2px 10px' }}>{a.status}</span>
                    </td>
                    <td>
                      <button onClick={()=>editAnnouncement(announcements.findIndex(x=>x.id===a.id))} style={{ ...btn.base, ...btn.secondary }}>Edit</button>
                      <button onClick={()=>deleteAnnouncement(announcements.findIndex(x=>x.id===a.id))} style={{ ...btn.base, ...btn.danger, marginLeft:6 }}>Delete</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {tab==='messages' && (
        <div>
          <form onSubmit={submitMessage} style={{ background:'#fff', color:'#111827', padding:16, borderRadius:12, boxShadow:'0 6px 24px rgba(0,0,0,0.06)', marginBottom:16 }}>
            <h3>Send Message</h3>
            <div style={{ display:'flex', flexWrap:'wrap', gap:10, marginTop:6 }}>
              <select value={msgForm.receiverType} onChange={(e)=>setMsgForm(f=>({ ...f, receiverType:e.target.value }))} style={{ flex:'1 1 160px' }}>
                <option>Teacher</option>
                <option>Student</option>
              </select>
              <input placeholder="Receiver ID/Name" value={msgForm.receiver} onChange={(e)=>setMsgForm(f=>({ ...f, receiver:e.target.value }))} style={{ flex:'1 1 220px' }} />
              <input placeholder="Attachment (name/desc)" value={msgForm.attachment} onChange={(e)=>setMsgForm(f=>({ ...f, attachment:e.target.value }))} style={{ flex:'2 1 260px' }} />
              <textarea placeholder="Message" rows={2} value={msgForm.message} onChange={(e)=>setMsgForm(f=>({ ...f, message:e.target.value }))} style={{ flex:'1 1 100%' }} />
            </div>
            <div style={{ marginTop:10, display:'flex', gap:8 }}>
              <button type="submit" style={{ ...btn.base, ...btn.primary }}>Send</button>
              <div style={{ marginLeft:'auto', display:'flex', gap:8 }}>
                <button type="button" onClick={()=>setMsgView('inbox')} style={{ ...btn.base, ...(msgView==='inbox'? btn.primary: btn.secondary) }}>Inbox</button>
                <button type="button" onClick={()=>setMsgView('sent')} style={{ ...btn.base, ...(msgView==='sent'? btn.primary: btn.secondary) }}>Sent</button>
              </div>
            </div>
          </form>

          <div style={{ background:'#fff', color:'#111827', padding:12, borderRadius:12, boxShadow:'0 6px 24px rgba(0,0,0,0.06)', marginBottom:12 }}>
            <div style={{ display:'flex', alignItems:'center', gap:10 }}>
              <input placeholder="Search messages" value={msgSearch} onChange={(e)=>setMsgSearch(e.target.value)} style={{ flex:'2 1 260px' }} />
              <input placeholder="Open thread (Receiver/Partner)" value={threadFor} onChange={(e)=>setThreadFor(e.target.value)} style={{ flex:'1 1 220px' }} />
            </div>
          </div>

          {/* Threads */}
          {threadFor ? (
            <div style={{ background:'#fff', color:'#111827', padding:12, borderRadius:12, boxShadow:'0 6px 24px rgba(0,0,0,0.06)' }}>
              <h4>Conversation — {threadFor}</h4>
              <div style={{ display:'flex', flexDirection:'column', gap:8, marginTop:8 }}>
                {(threads[Object.keys(threads).find(k=>k.endsWith(':'+threadFor))]||[]).map(m => (
                  <div key={m.id} style={{ alignSelf: m.sender==='Admin'? 'flex-end':'flex-start', maxWidth: '70%' }}>
                    <div style={{ background: m.sender==='Admin'? '#1d4ed8':'#e5e7eb', color: m.sender==='Admin'? '#fff':'#111827', padding:'8px 12px', borderRadius:12 }}>
                      <div style={{ fontSize:12, opacity:.85 }}>{m.sender} → {m.receiverType}:{m.receiver}</div>
                      <div>{m.message}</div>
                      {m.attachment && (<div style={{ fontSize:12, opacity:.9, marginTop:4 }}>📎 {m.attachment}</div>)}
                      <div style={{ fontSize:11, opacity:.8, marginTop:4 }}>{new Date(m.timestamp).toLocaleString()}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div style={{ overflowX:'auto' }}>
              <table style={{ width:'100%', background:'#fff', color:'#111827', borderRadius:12, overflow:'hidden', boxShadow:'0 6px 24px rgba(0,0,0,0.06)' }}>
                <thead>
                  <tr style={{ background:'#eef2ff' }}>
                    <th>#</th>
                    <th>From</th>
                    <th>To</th>
                    <th>Message</th>
                    <th>Time</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredMessages.length===0 && (<tr><td colSpan="7" style={{ textAlign:'center', color:'#6b7280' }}>No messages</td></tr>)}
                  {filteredMessages.sort((a,b)=> new Date(b.timestamp)-new Date(a.timestamp)).map((m,i)=>(
                    <tr key={m.id} style={{ borderTop:'1px solid #e5e7eb' }}>
                      <td>{i+1}</td>
                      <td>{m.sender}</td>
                      <td>{m.receiverType}:{m.receiver}</td>
                      <td style={{ maxWidth:380, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{m.message}</td>
                      <td>{new Date(m.timestamp).toLocaleString()}</td>
                      <td>
                        <span style={{ ...btn.base, ...(m.read? btn.secondary: btn.warning), padding:'2px 10px' }}>{m.read? 'Read':'Unread'}</span>
                      </td>
                      <td>
                        {!m.read && (<button onClick={()=>markRead(m.id)} style={{ ...btn.base, ...btn.success }}>Mark Read</button>)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {tab==='history' && (
        <div style={{ background:'#fff', color:'#111827', padding:16, borderRadius:12, boxShadow:'0 6px 24px rgba(0,0,0,0.06)' }}>
          <h3>Communication History</h3>
          <ul style={{ listStyle:'none', padding:0, margin:0 }}>
            {logs.length===0 && (<li style={{ color:'#6b7280' }}>No history</li>)}
            {logs.slice(0,50).map((l,i)=>(
              <li key={i} style={{ padding:'6px 0', borderBottom:'1px dashed #e5e7eb' }}>
                <span style={{ color:'#6b7280' }}>{new Date(l.timestamp).toLocaleString()} — </span>
                <span>{l.action}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {tab==='templates' && (
        <div>
          <div style={{ background:'#fff', color:'#111827', padding:16, borderRadius:12, boxShadow:'0 6px 24px rgba(0,0,0,0.06)', marginBottom:12 }}>
            <h3>Quick Templates</h3>
            <div style={{ display:'flex', gap:10, flexWrap:'wrap', marginTop:8 }}>
              {templates.map(tpl => (
                <div key={tpl.id} style={{ background:'#f8fafc', padding:10, borderRadius:8, border:'1px solid #e5e7eb', minWidth:220 }}>
                  <div style={{ fontWeight:600 }}>{tpl.title}</div>
                  <div style={{ fontSize:13, color:'#6b7280', margin:'6px 0' }}>{tpl.content}</div>
                  <div style={{ display:'flex', gap:6, marginTop:6 }}>
                    <button onClick={()=>applyTemplateToAnnouncement(tpl)} style={{ ...btn.base, ...btn.secondary }}>Use in Announcement</button>
                    <button onClick={()=>applyTemplateToMessage(tpl)} style={{ ...btn.base, ...btn.primary }}>Use in Message</button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div style={{ background:'#fff', color:'#111827', padding:16, borderRadius:12, boxShadow:'0 6px 24px rgba(0,0,0,0.06)' }}>
            <h3>Add Template</h3>
            <TemplateForm onAdd={addTemplate} />
          </div>
        </div>
      )}
    </div>
  );
};

const TemplateForm = ({ onAdd }) => {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  return (
    <div style={{ display:'flex', gap:10, flexWrap:'wrap', alignItems:'center' }}>
      <input placeholder="Template Title" value={title} onChange={(e)=>setTitle(e.target.value)} style={{ flex:'1 1 200px' }} />
      <input placeholder="Template Content" value={content} onChange={(e)=>setContent(e.target.value)} style={{ flex:'3 1 320px' }} />
      <button onClick={()=>{ if(!title && !content) return; onAdd({ title, content }); setTitle(''); setContent(''); }} style={{ ...btn.base, ...btn.primary }}>Add</button>
    </div>
  );
};

export default CommunicationCenter;