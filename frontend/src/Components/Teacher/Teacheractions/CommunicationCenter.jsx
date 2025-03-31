import React from "react";
import "../TeacherDashboard.css";


const CommunicationCenter = () => (
    <div className="communication-container">
      <h2>Communication</h2>
      
      <div className="communication-content">
        <div className="contacts-sidebar">
          <div className="contacts-header">
            <h3>Contacts</h3>
            <button className="btn-small">New Message</button>
          </div>
          <div className="contact-filters">
            <button className="filter-btn active">All</button>
            <button className="filter-btn">Students</button>
            <button className="filter-btn">Parents</button>
            <button className="filter-btn">Faculty</button>
            <button className="filter-btn">Admin</button>
          </div>
          <div className="contact-list">
            <div className="contact-item unread">
              <div className="contact-avatar">JD</div>
              <div className="contact-info">
                <h4>Jane Doe</h4>
                <p>Question about the assignment...</p>
              </div>
              <span className="message-time">10:30 AM</span>
            </div>
            <div className="contact-item unread">
              <div className="contact-avatar">MS</div>
              <div className="contact-info">
                <h4>Michael Scott</h4>
                <p>Will the exam cover chapter 7?</p>
              </div>
              <span className="message-time">Yesterday</span>
            </div>
            <div className="contact-item">
              <div className="contact-avatar">AP</div>
              <div className="contact-info">
                <h4>Admin Portal</h4>
                <p>Reminder: Submit grades by...</p>
              </div>
              <span className="message-time">Mar 15</span>
            </div>
          </div>
        </div>
        
        <div className="message-area">
          <div className="message-header">
            <div className="recipient-info">
              <div className="recipient-avatar">JD</div>
              <h3>Jane Doe</h3>
            </div>
            <div className="message-actions">
              <button className="icon-btn"><Bell className="icon" /></button>
              <button className="icon-btn"><Users className="icon" /></button>
            </div>
          </div>
          
          <div className="message-content">
            <div className="message-bubble received">
              <p>Hello Professor, I had a question about the database assignment. Are we supposed to include foreign key constraints in our schema design?</p>
              <span className="message-time">10:25 AM</span>
            </div>
            
            <div className="message-date-separator">
              <span>Today</span>
            </div>
            
            <div className="message-bubble sent">
              <p>Hi Jane, yes please include foreign key constraints as they're essential for maintaining referential integrity in relational databases.</p>
              <span className="message-time">10:28 AM</span>
            </div>
            
            <div className="message-bubble received">
              <p>Thank you! One more question - should we also include indexes in our design?</p>
              <span className="message-time">10:30 AM</span>
            </div>
          </div>
          
          <div className="message-input">
            <input type="text" placeholder="Type your message..." />
            <button className="send-btn">Send</button>
          </div>
        </div>
      </div>
      
      <div className="announcements-section">
        <h3>Create Announcement</h3>
        <div className="announcement-form">
          <div className="form-group">
            <label>Select Recipients:</label>
            <select>
              <option>All Students</option>
              <option>CS101 - Intro to Computer Science</option>
              <option>CS201 - Data Structures</option>
              <option>CS305 - Web Development</option>
            </select>
          </div>
          <div className="form-group">
            <label>Subject:</label>
            <input type="text" placeholder="Announcement subject" />
          </div>
          <div className="form-group">
            <label>Message:</label>
            <textarea placeholder="Enter your announcement"></textarea>
          </div>
          <div className="form-actions">
            <button className="btn-primary">Send Announcement</button>
            <button className="btn-secondary">Save Draft</button>
          </div>
        </div>
      </div>
    </div>
  );
  export default CommunicationCenter;
  