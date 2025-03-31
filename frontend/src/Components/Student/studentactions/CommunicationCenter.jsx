import React, { useState } from "react";
import "../studentactions/StudentCss/communication.css";

const CommunicationCenter = () => {
  const [contacts, setContacts] = useState([
    { id: 1, name: "Jane Doe", lastMessage: "Question about the assignment...", time: "10:30 AM", unread: true },
    { id: 2, name: "Michael Scott", lastMessage: "Will the exam cover chapter 7?", time: "Yesterday", unread: true },
    { id: 3, name: "Admin Portal", lastMessage: "Reminder: Submit grades by...", time: "Mar 15", unread: false }
  ]);

  const [selectedContact, setSelectedContact] = useState(contacts[0]);
  
  const [messages, setMessages] = useState([
    { sender: "Jane Doe", text: "Hello Professor, should we include foreign key constraints?", time: "10:25 AM", type: "received" },
    { sender: "You", text: "Yes, include foreign key constraints for referential integrity.", time: "10:28 AM", type: "sent" },
    { sender: "Jane Doe", text: "Thanks! Should we also include indexes?", time: "10:30 AM", type: "received" }
  ]);

  const [newMessage, setNewMessage] = useState("");

  const sendMessage = () => {
    if (newMessage.trim() !== "") {
      setMessages([...messages, { sender: "You", text: newMessage, time: "Now", type: "sent" }]);
      setNewMessage("");
    }
  };

  return (
    <div className="communication-container">
      <h2>Communication</h2>
      
      <div className="communication-content">
        <div className="contacts-sidebar">
          <h3>Contacts</h3>
          {contacts.map((contact) => (
            <div
              key={contact.id}
              className={`contact-item ${contact.unread ? "unread" : ""}`}
              onClick={() => setSelectedContact(contact)}
            >
              <div className="contact-avatar">{contact.name.charAt(0)}</div>
              <div className="contact-info">
                <h4>{contact.name}</h4>
                <p>{contact.lastMessage}</p>
              </div>
              <span className="message-time">{contact.time}</span>
            </div>
          ))}
        </div>
        
        <div className="message-area">
          <h3>Chat with {selectedContact.name}</h3>
          <div className="message-content">
            {messages.map((msg, index) => (
              <div key={index} className={`message-bubble ${msg.type}`}>
                <p>{msg.text}</p>
                <span className="message-time">{msg.time}</span>
              </div>
            ))}
          </div>

          <div className="message-input">
            <input
              type="text"
              placeholder="Type your message..."
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
            />
            <button className="send-btn" onClick={sendMessage}>Send</button>
          </div>
        </div>
      </div>

      <div className="announcements-section">
        <h3>Create Announcement</h3>
        <div className="announcement-form">
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
          </div>
        </div>
      </div>
    </div>
  );
};

export default CommunicationCenter;
