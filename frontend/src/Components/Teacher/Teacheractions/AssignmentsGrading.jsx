import React, { useState, useEffect } from "react";
import "../TeacherDashboard.css";

const AssignmentsGrading = () => {
  const [assignments, setAssignments] = useState([]);
  const [activeTab, setActiveTab] = useState("Assignments");
  const [newAssignment, setNewAssignment] = useState({
    title: "",
    course: "",
    dueDate: "",
    description: "",
    submissions: 0,
    totalStudents: 0,
    status: "Active",
  });
  const [editingIndex, setEditingIndex] = useState(null);

  // Load data from localStorage
  useEffect(() => {
    const storedAssignments = JSON.parse(localStorage.getItem("assignments")) || [];
    setAssignments(storedAssignments);
  }, []);

  // Sync data to localStorage whenever updated
  useEffect(() => {
    localStorage.setItem("assignments", JSON.stringify(assignments));
  }, [assignments]);

  // Handle input change
  const handleChange = (e) => {
    const { name, value } = e.target;
    setNewAssignment((prev) => ({ ...prev, [name]: value }));
  };

  // Add or Update Assignment
  const handleAddAssignment = () => {
    if (!newAssignment.title || !newAssignment.course || !newAssignment.dueDate) {
      alert("Please fill all required fields!");
      return;
    }

    if (editingIndex !== null) {
      const updated = [...assignments];
      updated[editingIndex] = newAssignment;
      setAssignments(updated);
      setEditingIndex(null);
    } else {
      setAssignments([...assignments, newAssignment]);
    }

    setNewAssignment({
      title: "",
      course: "",
      dueDate: "",
      description: "",
      submissions: 0,
      totalStudents: 0,
      status: "Active",
    });
  };

  // Edit Assignment
  const handleEdit = (index) => {
    setNewAssignment(assignments[index]);
    setEditingIndex(index);
  };

  // Delete Assignment
  const handleDelete = (index) => {
    if (window.confirm("Are you sure you want to delete this assignment?")) {
      const updated = assignments.filter((_, i) => i !== index);
      setAssignments(updated);
    }
  };

  // Toggle Status
  const toggleStatus = (index) => {
    const updated = [...assignments];
    updated[index].status =
      updated[index].status === "Active"
        ? "Due Soon"
        : updated[index].status === "Due Soon"
        ? "Closed"
        : "Active";
    setAssignments(updated);
  };

  // Analytics (computed from localStorage)
  const totalAssignments = assignments.length;
  const activeCount = assignments.filter((a) => a.status === "Active").length;
  const dueSoonCount = assignments.filter((a) => a.status === "Due Soon").length;
  const closedCount = assignments.filter((a) => a.status === "Closed").length;

  return (
    <div className="assignments-container">
      <h2>Assignments & Grading</h2>

      {/* Tabs */}
      <div className="tabs">
        <button
          className={`tab ${activeTab === "Assignments" ? "active" : ""}`}
          onClick={() => setActiveTab("Assignments")}
        >
          Assignments
        </button>
        <button
          className={`tab ${activeTab === "Gradebook" ? "active" : ""}`}
          onClick={() => setActiveTab("Gradebook")}
        >
          Gradebook
        </button>
      </div>

      {/* ======== Assignments Tab ======== */}
      {activeTab === "Assignments" && (
        <div className="assignments-section">
          {/* Analytics Dashboard */}
          <div className="analytics-cards">
            <div className="card">📚 Total Assignments: {totalAssignments}</div>
            <div className="card">✅ Active: {activeCount}</div>
            <div className="card">⏳ Due Soon: {dueSoonCount}</div>
            <div className="card">📕 Closed: {closedCount}</div>
          </div>

          {/* Create / Edit Form */}
          <div className="section-header">
            <h3>{editingIndex !== null ? "Edit Assignment" : "Create New Assignment"}</h3>
          </div>

          <div className="form-section">
            <input
              type="text"
              name="title"
              placeholder="Assignment Title"
              value={newAssignment.title}
              onChange={handleChange}
            />
            <input
              type="text"
              name="course"
              placeholder="Course Name (e.g., CS305)"
              value={newAssignment.course}
              onChange={handleChange}
            />
            <input
              type="date"
              name="dueDate"
              value={newAssignment.dueDate}
              onChange={handleChange}
            />
            <input
              type="number"
              name="totalStudents"
              placeholder="Total Students"
              value={newAssignment.totalStudents}
              onChange={handleChange}
            />
            <textarea
              name="description"
              placeholder="Assignment Description..."
              value={newAssignment.description}
              onChange={handleChange}
            ></textarea>
            <button className="btn-primary" onClick={handleAddAssignment}>
              {editingIndex !== null ? "Update Assignment" : "Add Assignment"}
            </button>
          </div>

          {/* Assignment List */}
          <div className="assignment-cards">
            {assignments.length === 0 ? (
              <p>No assignments found.</p>
            ) : (
              assignments.map((a, index) => (
                <div key={index} className="assignment-card">
                  <div className="assignment-header">
                    <h4>{a.title}</h4>
                    <span
                      className={`assignment-status ${
                        a.status === "Active"
                          ? "status-active"
                          : a.status === "Due Soon"
                          ? "status-due"
                          : "status-closed"
                      }`}
                    >
                      {a.status}
                    </span>
                  </div>
                  <p>
                    <strong>Course:</strong> {a.course}
                  </p>
                  <p>
                    <strong>Due Date:</strong> {a.dueDate}
                  </p>
                  <p>
                    <strong>Submissions:</strong> {a.submissions}/{a.totalStudents}
                  </p>
                  <p>
                    <strong>Description:</strong> {a.description}
                  </p>

                  <div className="assignment-actions">
                    <button className="btn-primary" onClick={() => toggleStatus(index)}>
                      Change Status
                    </button>
                    <button className="btn-secondary" onClick={() => handleEdit(index)}>
                      Edit
                    </button>
                    <button className="btn-secondary" onClick={() => handleDelete(index)}>
                      Delete
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* ======== Gradebook Tab ======== */}
      {activeTab === "Gradebook" && (
        <div className="gradebook-section">
          <h3>📊 Gradebook Overview</h3>
          <p>
            This section can store local grading data. You can extend it to track student marks
            for each assignment using `localStorage.setItem('grades', data)` structure.
          </p>
        </div>
      )}
    </div>
  );
};

export default AssignmentsGrading;
