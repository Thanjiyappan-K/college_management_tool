import React from "react";
import "../TeacherDashboard.css";


const TeacherProfile = () => (
    <div className="profile-container">
      <h2>My Profile</h2>
      
      <div className="profile-content">
        <div className="profile-header">
          <div className="profile-avatar large">TJ</div>
          <div className="profile-title">
            <h3>Ms. Taylor Johnson</h3>
            <p>Computer Science Department</p>
          </div>
        </div>
        
        <div className="profile-sections">
          <div className="profile-section">
            <h3>Personal Information</h3>
            <div className="form-group">
              <label>Full Name:</label>
              <input type="text" defaultValue="Taylor Johnson" />
            </div>
            <div className="form-group">
              <label>Email:</label>
              <input type="email" defaultValue="tjohnson@college.edu" />
            </div>
            <div className="form-group">
              <label>Phone Number:</label>
              <input type="tel" defaultValue="(555) 123-4567" />
            </div>
            <div className="form-group">
              <label>Department:</label>
              <input type="text" defaultValue="Computer Science" />
            </div>
            <div className="form-group">
              <label>Office Location:</label>
              <input type="text" defaultValue="Science Building, Room 305" />
            </div>
            <div className="form-group">
              <label>Office Hours:</label>
              <input type="text" defaultValue="Mon/Wed 1-3PM, Fri 10-11AM" />
            </div>
          </div>
          
          <div className="profile-section">
            <h3>Account Settings</h3>
            <div className="form-group">
              <label>Change Password:</label>
              <input type="password" placeholder="Current password" />
              <input type="password" placeholder="New password" />
              <input type="password" placeholder="Confirm new password" />
            </div>
            
            <h3>Notification Preferences</h3>
            <div className="checkbox-group">
              <div className="checkbox-item">
                <input type="checkbox" id="email-notifications" defaultChecked />
                <label htmlFor="email-notifications">Email Notifications</label>
              </div>
              <div className="checkbox-item">
                <input type="checkbox" id="sms-notifications" />
                <label htmlFor="sms-notifications">SMS Notifications</label>
              </div>
              <div className="checkbox-item">
                <input type="checkbox" id="new-message-notifications" defaultChecked />
                <label htmlFor="new-message-notifications">New Message Alerts</label>
              </div>
              <div className="checkbox-item">
                <input type="checkbox" id="assignment-notifications" defaultChecked />
                <label htmlFor="assignment-notifications">Assignment Submission Alerts</label>
              </div>
            </div>
          </div>
        </div>
        
        <div className="profile-actions">
          <button className="btn-primary">Save Changes</button>
          <button className="btn-secondary">Cancel</button>
        </div>
      </div>
    </div>
  );
  export default TeacherProfile;