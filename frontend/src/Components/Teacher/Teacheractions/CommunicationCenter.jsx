import React, { useEffect, useMemo, useState } from "react";
import { BsBell } from "react-icons/bs";
import { HiUsers } from "react-icons/hi";
import "../TeacherDashboard.css";

const KEYS = {
  messages: "teacher.messages",
  announcements: "teacher.announcements",
  drafts: "teacher.drafts",
};

function nowIso(){ return new Date().toISOString(); }
function timeStr(ts){ try{ return new Date(ts).toLocaleString(); }catch{ return ts; } }

const fallbackContacts = [
  { id:"S-JD", name:"Jane Doe", type:"Student" },
  { id:"S-MS", name:"Michael Scott", type:"Student" },
  { id:"ADMIN", name:"Admin Portal", type:"Admin" },
];

const CommunicationCenter = () => {
  const [contacts, setContacts] = useState(fallbackContacts);
  const [filter, setFilter] = useState("All"); // All | Students | Parents | Faculty | Admin
  const [messages, setMessages] = useState([]); // {id,sender,receiver,receiverType,message,attachment,timestamp,read}
  const [announcements, setAnnouncements] = useState([]); // {id,subject,body,to,timestamp}
  const [drafts, setDrafts] = useState([]);
  const [selectedContact, setSelectedContact] = useState(null);
  const [compose, setCompose] = useState({ receiver:"", receiverType:"Student", message:"", attachment:"" });
  const [annForm, setAnnForm] = useState({ to:"All Students", subject:"", body:"" });
  const [search, setSearch] = useState("");

  // Load contacts from students store if available
  useEffect(()=>{
    try{
      const st = JSON.parse(localStorage.getItem("students")||"[]");
      if(Array.isArray(st) && st.length>0){
        const mapped = st.slice(0,50).map(s=>({ id: s.regNo || s.email || s.name, name: s.name || s.regNo || "Student", type:"Student" }));
        setContacts([ ...mapped, { id:"ADMIN", name:"Admin Portal", type:"Admin" } ]);
      }
    }catch{}
  },[]);

  // Load persisted
  useEffect(()=>{
    try{ const m=JSON.parse(localStorage.getItem(KEYS.messages)||"[]"); setMessages(Array.isArray(m)?m:[]);}catch{}
    try{ const a=JSON.parse(localStorage.getItem(KEYS.announcements)||"[]"); setAnnouncements(Array.isArray(a)?a:[]);}catch{}
    try{ const d=JSON.parse(localStorage.getItem(KEYS.drafts)||"[]"); setDrafts(Array.isArray(d)?d:[]);}catch{}
  },[]);

  useEffect(()=>{ localStorage.setItem(KEYS.messages, JSON.stringify(messages)); },[messages]);
  useEffect(()=>{ localStorage.setItem(KEYS.announcements, JSON.stringify(announcements)); },[announcements]);
  useEffect(()=>{ localStorage.setItem(KEYS.drafts, JSON.stringify(drafts)); },[drafts]);

  const filteredContacts = useMemo(()=>{
    return contacts.filter(c => (
      (filter==="All" || c.type===filter.slice(0,-1) || (filter==="Admin" && c.type==="Admin")) &&
      (search.trim()==="" || c.name.toLowerCase().includes(search.toLowerCase()))
    ));
  },[contacts, filter, search]);

  const thread = useMemo(()=>{
    if(!selectedContact) return [];
    const partner = selectedContact.id;
    const list = messages.filter(m => (m.sender==="Teacher" && m.receiver===partner) || (m.sender!=="Teacher" && m.sender===partner));
    return list.sort((a,b)=> new Date(a.timestamp)-new Date(b.timestamp));
  },[messages, selectedContact]);

  const unreadCount = useMemo(()=> messages.filter(m => m.receiver==="Teacher" && !m.read).length, [messages]);

  const selectContact = (c) => {
    setSelectedContact(c);
    // mark their incoming messages as read
    setMessages(prev => prev.map(m => (m.sender===c.id && m.receiver==="Teacher") ? { ...m, read:true } : m));
  };

  const sendMessage = () => {
    const target = selectedContact?.id || compose.receiver.trim();
    const targetType = selectedContact?.type || compose.receiverType;
    if(!target || !compose.message.trim()) return;
    const rec = { id: `M${Date.now()}`, sender: "Teacher", receiver: target, receiverType: targetType, message: compose.message.trim(), attachment: compose.attachment?.trim()||"", timestamp: nowIso(), read: false };
    setMessages(prev => [...prev, rec]);
    setCompose(c => ({ ...c, message:"", attachment:"" }));
  };

  const sendAnnouncement = () => {
    if(!annForm.subject.trim() || !annForm.body.trim()) return;
    const rec = { id:`A${Date.now()}`, subject:annForm.subject.trim(), body:annForm.body.trim(), to:annForm.to, timestamp: nowIso() };
    setAnnouncements(prev => [rec, ...prev]);
    setAnnForm({ to: annForm.to, subject:"", body:"" });
    try{ if(Notification && Notification.permission==='granted') new Notification('Announcement posted', { body: annForm.subject }); }catch{}
  };

  const saveDraft = () => {
    if(!annForm.subject && !annForm.body) return;
    setDrafts(prev => [{ id:`D${Date.now()}`, ...annForm, timestamp: nowIso() }, ...prev]);
  };

  return (
    <>
    <div className="communication-container">
      <h2>Communication <span className="badge danger" style={{ marginLeft:8 }}>{unreadCount} Unread</span></h2>
      
      <div className="communication-content">
        <div className="contacts-sidebar">
          <div className="contacts-header">
            <h3>Contacts</h3>
            <button className="btn-small" onClick={()=>{ setSelectedContact(null); setCompose({ receiver:"", receiverType:"Student", message:"", attachment:"" }); }}>New Message</button>
          </div>
          <div style={{ padding:"0 12px 8px" }}>
            <input className="contact-search" placeholder="Search contacts" value={search} onChange={e=>setSearch(e.target.value)} />
          </div>
          <div className="contact-filters">
            <button className={`filter-btn ${filter==='All'?'active':''}`} onClick={()=>setFilter('All')}>All</button>
            <button className={`filter-btn ${filter==='Students'?'active':''}`} onClick={()=>setFilter('Students')}>Students</button>
            <button className={`filter-btn ${filter==='Parents'?'active':''}`} onClick={()=>setFilter('Parents')}>Parents</button>
            <button className={`filter-btn ${filter==='Faculty'?'active':''}`} onClick={()=>setFilter('Faculty')}>Faculty</button>
            <button className={`filter-btn ${filter==='Admin'?'active':''}`} onClick={()=>setFilter('Admin')}>Admin</button>
          </div>
          <div className="contact-list">
            {filteredContacts.length===0 && (
              <div className="contact-empty">No contacts</div>
            )}
            {filteredContacts.map(c => {
              const initials = c.name.split(' ').map(x=>x[0]).slice(0,2).join('').toUpperCase();
              const lastMsg = messages.filter(m=> (m.sender===c.id && m.receiver==="Teacher") || (m.sender==="Teacher" && m.receiver===c.id)).sort((a,b)=> new Date(b.timestamp)-new Date(a.timestamp))[0];
              const hasUnread = messages.some(m => m.sender===c.id && m.receiver==="Teacher" && !m.read);
              return (
                <div key={c.id} className={`contact-item ${hasUnread?'unread':''}`} onClick={()=>selectContact(c)}>
                  <div className="contact-avatar">{initials}</div>
                  <div className="contact-info">
                    <h4>{c.name}</h4>
                    <p>{lastMsg? lastMsg.message.slice(0,34) : '—'}</p>
                  </div>
                  <span className="message-time">{lastMsg? timeStr(lastMsg.timestamp) : ''}</span>
                </div>
              );
            })}
          </div>
        </div>
        
        <div className="message-area">
          <div className="message-header">
            <div className="recipient-info">
              <div className="recipient-avatar">{selectedContact? selectedContact.name.split(' ').map(x=>x[0]).slice(0,2).join('').toUpperCase(): '✉️'}</div>
              <h3>{selectedContact? selectedContact.name : 'New Message'}</h3>
            </div>
            <div className="message-actions">
              <button className="icon-btn"><BsBell className="icon" /></button>
              <button className="icon-btn"><HiUsers className="icon" /></button>
            </div>
          </div>
          
          <div className="message-content">
            {!selectedContact && (
              <div className="compose-inline">
                <div className="compose-row">
                  <select value={compose.receiverType} onChange={e=>setCompose(c=>({ ...c, receiverType:e.target.value }))}>
                    <option>Student</option>
                    <option>Parent</option>
                    <option>Faculty</option>
                    <option>Admin</option>
                  </select>
                  <input type="text" placeholder="Receiver ID/Name" value={compose.receiver} onChange={e=>setCompose(c=>({ ...c, receiver:e.target.value }))} />
                </div>
                <input type="text" placeholder="Attachment (optional)" value={compose.attachment} onChange={e=>setCompose(c=>({ ...c, attachment:e.target.value }))} />
              </div>
            )}

            {selectedContact && thread.map(m => (
              <div key={m.id} className={`message-bubble ${m.sender==='Teacher'?'sent':'received'}`}>
                <p>{m.message}{m.attachment? <><br/><span className="msg-attachment">📎 {m.attachment}</span></> : null}</p>
                <span className="message-time">{timeStr(m.timestamp)} • {m.read? 'Read':'Unread'}</span>
              </div>
            ))}
          </div>
          
          <div className="message-input">
            <input type="text" placeholder="Type your message..." value={compose.message} onChange={e=>setCompose(c=>({ ...c, message:e.target.value }))} />
            <button className="send-btn" onClick={sendMessage}>Send</button>
          </div>
        </div>
      </div>
      
      <div className="announcements-section">
        <h3>Create Announcement</h3>
        <div className="announcement-form">
          <div className="form-group">
            <label>Select Recipients:</label>
            <select value={annForm.to} onChange={e=>setAnnForm(f=>({ ...f, to:e.target.value }))}>
              <option>All Students</option>
              <option>CS101 - Intro to Computer Science</option>
              <option>CS201 - Data Structures</option>
              <option>CS305 - Web Development</option>
            </select>
          </div>
          <div className="form-group">
            <label>Subject:</label>
            <input type="text" placeholder="Announcement subject" value={annForm.subject} onChange={e=>setAnnForm(f=>({ ...f, subject:e.target.value }))} />
          </div>
          <div className="form-group">
            <label>Message:</label>
            <textarea placeholder="Enter your announcement" value={annForm.body} onChange={e=>setAnnForm(f=>({ ...f, body:e.target.value }))}></textarea>
          </div>
          <div className="form-actions">
            <button className="btn-primary" onClick={sendAnnouncement}>Send Announcement</button>
            <button className="btn-secondary" onClick={saveDraft}>Save Draft</button>
          </div>
        </div>

        {announcements.length>0 && (
          <div className="announcement-list">
            <h4>Recent Announcements</h4>
            <ul>
              {announcements.slice(0,5).map(a => (
                <li key={a.id}><b>{a.subject}</b> • <span>{a.to}</span> • <span>{timeStr(a.timestamp)}</span></li>
              ))}
            </ul>
          </div>
        )}

        {drafts.length>0 && (
          <div className="announcement-drafts">
            <h4>Drafts</h4>
            <ul>
              {drafts.slice(0,5).map(d => (
                <li key={d.id} onClick={()=>setAnnForm({ to:d.to, subject:d.subject, body:d.body })} style={{ cursor:'pointer' }}>
                  <b>{d.subject || '(No subject)'}</b> • <span>{timeStr(d.timestamp)}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
    </>
  );
};
export default CommunicationCenter;
