import React, { useState } from "react";
import "../studentactions/StudentCss/profile.css";

const StudentProfile = () => {
  // State for personal information
  const [profileData, setProfileData] = useState({
    fullName: "John Smith",
    studentId: "CS2025-1234",
    email: "john.smith@college.edu",
    phoneNumber: "(555) 987-6543",
    major: "Computer Science",
    graduationYear: 2025
  });

  // State for password changes
  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmNewPassword: ""
  });

  // State for notification preferences
  const [notificationPreferences, setNotificationPreferences] = useState({
    emailNotifications: true,
    smsNotifications: false,
    pushNotifications: false
  });

  // State for edit mode
  const [isEditing, setIsEditing] = useState(false);

  // Handle input changes for profile data
  const handleProfileChange = (e) => {
    const { name, value } = e.target;
    setProfileData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Handle password input changes
  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Handle notification toggle
  const handleNotificationToggle = (e) => {
    const { name, checked } = e.target;
    setNotificationPreferences(prev => ({
      ...prev,
      [name]: checked
    }));
  };

  // Save changes handler
  const handleSaveChanges = () => {
    // Validate inputs
    if (passwordData.newPassword !== passwordData.confirmNewPassword) {
      alert("Passwords do not match!");
      return;
    }

    // Perform save logic
    try {
      // In a real app, you'd make an API call here
      console.log("Saving profile data:", profileData);
      console.log("Notification preferences:", notificationPreferences);
      
      // Reset edit mode
      setIsEditing(false);
      
      // Optional: Show success message
      alert("Profile updated successfully!");
    } catch (error) {
      console.error("Error saving profile:", error);
      alert("Failed to save profile. Please try again.");
    }
  };

  // Cancel editing
  const handleCancel = () => {
    // Reset to original data
    setIsEditing(false);
  };

  return (
    <div className="profile-container">
      <div className="profile-header">
        <div className="profile-avatar large">
          {profileData.fullName.split(' ').map(name => name[0]).join('').toUpperCase()}
        </div>
        <div className="profile-title">
          <h2>{profileData.fullName}</h2>
          <p>{profileData.major} | Graduation: {profileData.graduationYear}</p>
        </div>
        <button 
          className="edit-profile-btn" 
          onClick={() => setIsEditing(!isEditing)}
        >
          {isEditing ? "Cancel" : "Edit Profile"}
        </button>
      </div>
      
      <div className="profile-content">
        <div className="profile-sections">
          <div className="profile-section personal-info">
            <h3>Personal Information</h3>
            <div className="form-grid">
              {Object.entries(profileData).map(([key, value]) => (
                <div key={key} className="form-group">
                  <label>{key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}:</label>
                  <input
                    type="text"
                    name={key}
                    value={value}
                    onChange={handleProfileChange}
                    disabled={!isEditing}
                  />
                </div>
              ))}
            </div>
          </div>
          
          <div className="profile-section account-settings">
            <h3>Account Settings</h3>
            <div className="password-change">
              <h4>Change Password</h4>
              <div className="form-group">
                <input
                  type="password"
                  name="currentPassword"
                  placeholder="Current password"
                  value={passwordData.currentPassword}
                  onChange={handlePasswordChange}
                  disabled={!isEditing}
                />
                <input
                  type="password"
                  name="newPassword"
                  placeholder="New password"
                  value={passwordData.newPassword}
                  onChange={handlePasswordChange}
                  disabled={!isEditing}
                />
                <input
                  type="password"
                  name="confirmNewPassword"
                  placeholder="Confirm new password"
                  value={passwordData.confirmNewPassword}
                  onChange={handlePasswordChange}
                  disabled={!isEditing}
                />
              </div>
            </div>
            
            <h4>Notification Preferences</h4>
            <div className="notification-preferences">
              {Object.entries(notificationPreferences).map(([key, value]) => (
                <div key={key} className="checkbox-item">
                  <input
                    type="checkbox"
                    id={key}
                    name={key}
                    checked={value}
                    onChange={handleNotificationToggle}
                    disabled={!isEditing}
                  />
                  <label htmlFor={key}>
                    {key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                  </label>
                </div>
              ))}
            </div>
          </div>
        </div>
        
        {isEditing && (
          <div className="profile-actions">
            <button 
              className="btn-primary" 
              onClick={handleSaveChanges}
            >
              Save Changes
            </button>
            <button 
              className="btn-secondary" 
              onClick={handleCancel}
            >
              Cancel
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default StudentProfile;