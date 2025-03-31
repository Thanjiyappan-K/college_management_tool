import React from "react";
import "../ParentDashboard.css";

const CommunicationCenter = ({ childData }) => (
    <div className="communication-container">
      <h2>Communication for {childData.name}</h2>
      
      <div className="communication-filters">
        <button className="filter-btn active">Teacher Messages</button>
        <button className="filter-btn">School Announcements</button>
        <button className="filter-btn">Important Notices</button>
      </div>
      
      <div className="message-list">
        <div className="message-card">
          <div className="message-header">
            <h3>Parent-Teacher Conference</h3>
            <span className="message-date">March 22, 2025</span>
          </div>
          <p>Reminder: Upcoming parent-teacher conference on April 5th. Please confirm your attendance.</p>
          <div className="message-actions">
            <button className="btn-primary">Confirm Attendance</button>
            <button className="btn-secondary">Reschedule</button>
          </div>
        </div>
        
        <div className="message-card">
          <div className="message-header">
            <h3>Mathematics Progress</h3>
            <span className="message-date">March 20, 2025</span>
          </div>
          <p>Message from Mr. Anderson: Emily is performing exceptionally well in Advanced Mathematics. Consistent top performance!</p>
        </div>
      </div>
      
      <div className="message-compose">
        <h3>Compose Message</h3>
        <div className="form-group">
          <label>Select Recipient:</label>
          <select>
            <option>Class Teacher</option>
            <option>Principal</option>
            <option>Specific Subject Teacher</option>
          </select>
        </div>
        <div className="form-group">
          <label>Message:</label>
          <textarea placeholder="Type your message here..."></textarea>
        </div>
        <button className="btn-primary">Send Message</button>
      </div>
    </div>
  );
  export default CommunicationCenter;