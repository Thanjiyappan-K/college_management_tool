import React, { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, Users, Upload, X, Save, BookOpen, Download, FileText } from 'lucide-react';
import "../TeacherDashboard.css"; // Assuming this file has .class-card, .btn-primary, etc.

// --- Helper Functions for localStorage ---

/**
 * Gets an item from localStorage, parsing it as JSON.
 * @param {string} key - The key of the item to retrieve.
 * @param {*} defaultValue - The value to return if the key doesn't exist.
 * @returns {*} The parsed data or the default value.
 */
const getFromLS = (key, defaultValue = []) => {
  const storedData = localStorage.getItem(key);
  if (storedData) {
    try {
      return JSON.parse(storedData);
    } catch (e) {
      console.error(`Error parsing localStorage key "${key}":`, e);
      return defaultValue;
    }
  }
  return defaultValue;
};

/**
 * Saves an item to localStorage, serializing it as JSON.
 * @param {string} key - The key to save the data under.
 * @param {*} data - The data to save.
 */
const saveToLS = (key, data) => {
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch (e) {
    console.error(`Error saving to localStorage key "${key}":`, e);
  }
};

// --- Sample Data for First Load ---

const DEFAULT_CLASSES = [
  {
    id: 1,
    name: "Introduction to Computer Science",
    code: "CS101",
    schedule: "Mon, Wed, Fri 10:00 AM - 11:30 AM",
    room: "B-204",
    syllabus: "This course covers the fundamentals of programming and computer science."
  },
  {
    id: 2,
    name: "Data Structures",
    code: "CS201",
    schedule: "Tue, Thu 1:00 PM - 3:00 PM",
    room: "A-105",
    syllabus: "An in-depth look at common data structures and algorithms."
  },
  {
    id: 3,
    name: "Web Development",
    code: "CS305",
    schedule: "Mon, Wed 2:00 PM - 4:00 PM",
    room: "Lab C",
    syllabus: "Learn to build modern web applications with React and Node.js."
  }
];

const DEFAULT_STUDENTS = [
  // Class 1: CS101
  { id: 101, classId: 1, name: "Alice Smith", rollNo: "CS101-001" },
  { id: 102, classId: 1, name: "Bob Johnson", rollNo: "CS101-002" },
  // Class 2: CS201
  { id: 201, classId: 2, name: "Charlie Brown", rollNo: "CS201-001" },
  { id: 202, classId: 2, name: "David Lee", rollNo: "CS201-002" },
  // Class 3: CS305
  { id: 301, classId: 3, name: "Eve Davis", rollNo: "CS305-001" },
];

const DEFAULT_MATERIALS = [
  { id: 1, classId: 1, title: "Week 1 - Intro Slides", fileName: "week1.ppt" },
  { id: 2, classId: 2, title: "Array vs Linked List", fileName: "ds_notes_1.pdf" },
];


// --- Main Component ---

const MyClasses = () => {
  // --- State ---
  const [classes, setClasses] = useState([]);
  const [students, setStudents] = useState([]);
  const [materials, setMaterials] = useState([]);

  const [isClassModalOpen, setIsClassModalOpen] = useState(false);
  const [isStudentModalOpen, setIsStudentModalOpen] = useState(false);
  const [isMaterialModalOpen, setIsMaterialModalOpen] = useState(false);
  
  const [selectedClass, setSelectedClass] = useState(null);

  // --- Effects ---
  // Load all data from localStorage on initial render
  useEffect(() => {
    setClasses(getFromLS('teacherClasses', DEFAULT_CLASSES));
    setStudents(getFromLS('teacherStudents', DEFAULT_STUDENTS));
    setMaterials(getFromLS('teacherMaterials', DEFAULT_MATERIALS));
  }, []);

  // --- Data Save Functions ---
  const saveClasses = (newClasses) => {
    setClasses(newClasses);
    saveToLS('teacherClasses', newClasses);
  };

  const saveStudents = (newStudents) => {
    setStudents(newStudents);
    saveToLS('teacherStudents', newStudents);
  };

  const saveMaterials = (newMaterials) => {
    setMaterials(newMaterials);
    saveToLS('teacherMaterials', newMaterials);
  };

  // --- Event Handlers ---

  // Class CRUD
  const handleOpenClassModal = (cls = null) => {
    setSelectedClass(cls);
    setIsClassModalOpen(true);
  };

  const handleSaveClass = (classData) => {
    let newClasses;
    if (classData.id) {
      // Update existing class
      newClasses = classes.map(c => c.id === classData.id ? classData : c);
    } else {
      // Add new class
      const newClass = { ...classData, id: Date.now() };
      newClasses = [...classes, newClass];
    }
    saveClasses(newClasses);
    setIsClassModalOpen(false);
    setSelectedClass(null);
  };

  const handleDeleteClass = (id) => {
    if (window.confirm("Are you sure you want to delete this class? This will not delete students or materials but will orphan them if not reassigned.")) {
      const newClasses = classes.filter(c => c.id !== id);
      saveClasses(newClasses);
    }
  };

  // Student Modal
  const handleOpenStudentModal = (cls) => {
    setSelectedClass(cls);
    setIsStudentModalOpen(true);
  };

  // Material Modal
  const handleOpenMaterialModal = (cls) => {
    setSelectedClass(cls);
    setIsMaterialModalOpen(true);
  };

  // --- Render ---
  return (
    <div className="classes-container">
      <div className="content-header">
        <h2>My Classes</h2>
        <button className="btn btn-primary" onClick={() => handleOpenClassModal()}>
          <Plus size={18} /> Add New Class
        </button>
      </div>
      
      <div className="class-cards">
        {classes.length === 0 && <p>No classes found. Click "Add New Class" to get started.</p>}
        
        {classes.map(cls => {
          const classStudents = students.filter(s => s.classId === cls.id);
          return (
            <div className="class-card" key={cls.id}>
              <h3>{cls.name}</h3>
              <p><strong>Course Code:</strong> {cls.code}</p>
              <p><strong>Schedule:</strong> {cls.schedule}</p>
              <p><strong>Room:</strong> {cls.room}</p>
              <p><strong>Students:</strong> {classStudents.length}</p>
              <div className="class-actions">
                <button className="btn-primary" onClick={() => handleOpenStudentModal(cls)}>
                  <Users size={16} /> View Students
                </button>
                <button className="btn-secondary" onClick={() => handleOpenMaterialModal(cls)}>
                  <Upload size={16} /> Materials
                </button>
                <button className="btn-secondary" onClick={() => handleOpenClassModal(cls)}>
                  <Edit size={16} /> Edit / Syllabus
                </button>
                <button className="btn-danger" onClick={() => handleDeleteClass(cls.id)}>
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* --- Modals --- */}
      <ClassModal
        isOpen={isClassModalOpen}
        onClose={() => setIsClassModalOpen(false)}
        onSave={handleSaveClass}
        classData={selectedClass}
      />

      <StudentListModal
        isOpen={isStudentModalOpen}
        onClose={() => setIsStudentModalOpen(false)}
        classData={selectedClass}
        allStudents={students}
        onSaveStudents={saveStudents}
      />

      <MaterialsModal
        isOpen={isMaterialModalOpen}
        onClose={() => setIsMaterialModalOpen(false)}
        classData={selectedClass}
        allMaterials={materials}
        onSaveMaterials={saveMaterials}
      />
    </div>
  );
};

// --- Modal Components ---

/**
 * Generic Modal Wrapper
 */
const Modal = ({ isOpen, onClose, title, children }) => {
  if (!isOpen) return null;
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>{title}</h2>
          <button onClick={onClose} className="modal-close-btn">
            <X className="icon" />
          </button>
        </div>
        <div className="modal-body">
          {children}
        </div>
      </div>
    </div>
  );
};

/**
 * Add/Edit Class Modal
 */
const ClassModal = ({ isOpen, onClose, onSave, classData }) => {
  const [formData, setFormData] = useState({
    name: '', code: '', schedule: '', room: '', syllabus: ''
  });

  useEffect(() => {
    // Populate form when classData is provided (for editing)
    if (classData) {
      setFormData(classData);
    } else {
      // Reset form when opening for "Add New"
      setFormData({ name: '', code: '', schedule: '', room: '', syllabus: '' });
    }
  }, [classData, isOpen]); // Re-run effect when modal opens or classData changes

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave({ ...formData });
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={classData ? "Edit Class" : "Add New Class"}>
      <form onSubmit={handleSubmit} className="modal-form">
        <div className="form-group">
          <label>Class Name</label>
          <input name="name" value={formData.name} onChange={handleChange} required />
        </div>
        <div className="form-group">
          <label>Course Code</label>
          <input name="code" value={formData.code} onChange={handleChange} required />
        </div>
        <div className="form-group">
          <label>Schedule</label>
          <input name="schedule" value={formData.schedule} onChange={handleChange} />
        </div>
        <div className="form-group">
          <label>Room</label>
          <input name="room" value={formData.room} onChange={handleChange} />
        </div>
        <div className="form-group">
          <label>Syllabus / Description</label>
          <textarea name="syllabus" value={formData.syllabus} onChange={handleChange} rows="5" />
        </div>
        <div className="form-actions">
          <button type="button" className="btn btn-secondary" onClick={onClose}>Cancel</button>
          <button type="submit" className="btn btn-primary"><Save size={18} /> Save</button>
        </div>
      </form>
    </Modal>
  );
};

/**
 * View Students Modal (with Add/Remove)
 */
const StudentListModal = ({ isOpen, onClose, classData, allStudents, onSaveStudents }) => {
  const [studentName, setStudentName] = useState('');
  const [rollNo, setRollNo] = useState('');
  
  const classStudents = allStudents.filter(s => s.classId === classData?.id);

  const handleAddStudent = (e) => {
    e.preventDefault();
    if (!studentName || !rollNo) return;

    const newStudent = {
      id: Date.now(),
      classId: classData.id,
      name: studentName,
      rollNo: rollNo
    };
    onSaveStudents([...allStudents, newStudent]);
    setStudentName('');
    setRollNo('');
  };

  const handleRemoveStudent = (id) => {
    if (window.confirm("Are you sure you want to remove this student from the class?")) {
      // This just removes the student entirely. A better system might just nullify the classId.
      onSaveStudents(allStudents.filter(s => s.id !== id));
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={`Students in ${classData?.name}`}>
      <div className="student-list">
        {classStudents.length === 0 && <p>No students enrolled in this class.</p>}
        <table className="data-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Roll No.</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {classStudents.map(s => (
              <tr key={s.id}>
                <td>{s.name}</td>
                <td>{s.rollNo}</td>
                <td>
                  <button className="btn btn-danger btn-sm" onClick={() => handleRemoveStudent(s.id)}>
                    <Trash2 size={16} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <hr className="modal-divider" />
      
      <form onSubmit={handleAddStudent} className="modal-form">
        <h4>Add New Student</h4>
        <div className="form-row">
          <div className="form-group">
            <label>Student Name</label>
            <input value={studentName} onChange={(e) => setStudentName(e.target.value)} required />
          </div>
          <div className="form-group">
            <label>Roll No.</label>
            <input value={rollNo} onChange={(e) => setRollNo(e.target.value)} required />
          </div>
        </div>
        <div className="form-actions">
          <button type="submit" className="btn btn-primary"><Plus size={18} /> Add Student</button>
        </div>
      </form>
    </Modal>
  );
};

/**
 * Upload/View Materials Modal
 */
const MaterialsModal = ({ isOpen, onClose, classData, allMaterials, onSaveMaterials }) => {
  const [title, setTitle] = useState('');
  const [file, setFile] = useState(null);

  const classMaterials = allMaterials.filter(m => m.classId === classData?.id);

  const handleFileChange = (e) => {
    if (e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleAddMaterial = (e) => {
    e.preventDefault();
    if (!title || !file) {
      alert("Please provide a title and select a file.");
      return;
    }

    const newMaterial = {
      id: Date.now(),
      classId: classData.id,
      title: title,
      fileName: file.name, // In a real app, you'd upload the file and store a URL
    };
    onSaveMaterials([...allMaterials, newMaterial]);
    setTitle('');
    setFile(null);
    e.target.reset(); // Reset the form
  };

  const handleRemoveMaterial = (id) => {
    if (window.confirm("Are you sure you want to delete this material?")) {
      onSaveMaterials(allMaterials.filter(m => m.id !== id));
    }
  };
  
  return (
    <Modal isOpen={isOpen} onClose={onClose} title={`Materials for ${classData?.name}`}>
      <div className="material-list">
        <h4>Uploaded Materials</h4>
        {classMaterials.length === 0 && <p>No materials uploaded for this class.</p>}
        <table className="data-table">
          <thead>
            <tr>
              <th>Title</th>
              <th>File Name</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {classMaterials.map(m => (
              <tr key={m.id}>
                <td>{m.title}</td>
                <td><FileText size={16} style={{marginRight: '8px', verticalAlign: 'middle'}}/>{m.fileName}</td>
                <td>
                  <div className="btn-group">
                    <button className="btn btn-secondary btn-sm" title="Simulate Download">
                      <Download size={16} />
                    </button>
                    <button className="btn btn-danger btn-sm" onClick={() => handleRemoveMaterial(m.id)}>
                      <Trash2 size={16} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <hr className="modal-divider" />

      <form onSubmit={handleAddMaterial} className="modal-form">
        <h4>Upload New Material</h4>
        <div className="form-group">
          <label>Material Title</label>
          <input value={title} onChange={(e) => setTitle(e.target.value)} required />
        </div>
        <div className="form-group">
          <label>File</label>
          {/* This is a controlled file input */}
          <input type="file" onChange={handleFileChange} key={file ? file.name : 'file-input'} required />
        </div>
        <div className="form-actions">
          <button type="submit" className="btn btn-primary"><Upload size={18} /> Upload</button>
        </div>
      </form>
    </Modal>
  );
};

export default MyClasses;