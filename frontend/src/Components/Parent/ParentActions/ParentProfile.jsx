import React from "react";
import "../ParentDashboard.css";
const ParentProfile = () => (
    <div className="profile-container">
      <h2>My Profile</h2>
      
      <div className="profile-content">
        <div className="profile-header">
          <div className="profile-avatar large">PJ</div>
          <div className="profile-title">
            <h3>Mrs. Sarah Johnson</h3>
            <p>Parent of Emily and Michael Johnson</p>
          </div>
        </div>
        
        <div className="profile-sections">
          <div className="profile-section">
            <h3>Personal Information</h3>
            <div className="form-group">
              <label>Full Name:</label>
              <input type="text" defaultValue="Sarah Johnson" />
            </div>
            <div className="form-group">
              <label>Email:</label>
              <input type="email" defaultValue="sjohnson@email.com" />
            </div>
            <div className="form-group">
              <label>Phone Number:</label>
              <input type="tel" defaultValue="(555) 987-6543" />
            </div>
            <div className="form-group">
              <label>Address:</label>
              <input type="text" defaultValue="123 Maple Street, Cityville, State 54321" />
            </div>
          </div>
          
          <div className="profile-section">
            <h3>Communication Preferences</h3>
            <div className="checkbox-group">
              <div className="checkbox-item">
                <input type="checkbox" id="email-notifications" defaultChecked />
                <label htmlFor="email-notifications">Email Notifications</label>
              </div>
              <div className="checkbox-item">
                <input type="checkbox" id="sms-notifications" defaultChecked />
                <label htmlFor="sms-notifications">SMS Notifications</label>
              </div>
              <div className="checkbox-item">
                <input type="checkbox" id="emergency-contact" defaultChecked />
                <label htmlFor="emergency-contact">Emergency Contact Alerts</label>
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
  export default ParentProfile;