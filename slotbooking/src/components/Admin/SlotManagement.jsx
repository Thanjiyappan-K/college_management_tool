import { useState } from "react";

export default function SlotManagement() {
  const [activeTab, setActiveTab] = useState("exams");
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  // Form states
  const [examForm, setExamForm] = useState({
    examType: "",
    durationHours: 1,
    examHall: ""
  });

  const [timeslotForm, setTimeslotForm] = useState({
    date: "",
    startTime: "",
    endTime: "",
    examId: "",
    capacity: 30
  });

  const [studentForm, setStudentForm] = useState({
    name: "",
    registrationNumber: "",
    department: ""
  });

  const [subjectForm, setSubjectForm] = useState({
    code: "",
    name: "",
    group: ""
  });

  // Form handlers
  const handleExamSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch("http://localhost:8080/api/exams", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(examForm),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to create exam");
      }
      
      const data = await response.json();
      setSuccessMessage("Exam created successfully");
      setErrorMessage("");
      setExamForm({
        examType: "",
        durationHours: 1,
        examHall: ""
      });
    } catch (error) {
      setErrorMessage(error.message || "Failed to create exam");
      setSuccessMessage("");
    }
  };

  const handleTimeslotSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch("http://localhost:8080/api/timeslots", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(timeslotForm),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to create timeslot");
      }
      
      const data = await response.json();
      setSuccessMessage("Timeslot created successfully");
      setErrorMessage("");
      setTimeslotForm({
        date: "",
        startTime: "",
        endTime: "",
        examId: "",
        capacity: 30
      });
    } catch (error) {
      setErrorMessage(error.message || "Failed to create timeslot");
      setSuccessMessage("");
    }
  };

  const handleStudentSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch("http://localhost:8080/api/students", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(studentForm),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to create student");
      }
      
      const data = await response.json();
      setSuccessMessage("Student created successfully");
      setErrorMessage("");
      setStudentForm({
        name: "",
        registrationNumber: "",
        department: ""
      });
    } catch (error) {
      setErrorMessage(error.message || "Failed to create student");
      setSuccessMessage("");
    }
  };

  const handleSubjectSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch("http://localhost:8080/api/subjects", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(subjectForm),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to create subject");
      }
      
      const data = await response.json();
      setSuccessMessage("Subject created successfully");
      setErrorMessage("");
      setSubjectForm({
        code: "",
        name: "",
        group: ""
      });
    } catch (error) {
      setErrorMessage(error.message || "Failed to create subject");
      setSuccessMessage("");
    }
  };

  // Input change handlers
  const handleExamChange = (e) => {
    const { name, value } = e.target;
    setExamForm(prevState => ({
      ...prevState,
      [name]: name === "durationHours" ? Number(value) : value
    }));
  };

  const handleTimeslotChange = (e) => {
    const { name, value } = e.target;
    setTimeslotForm(prevState => ({
      ...prevState,
      [name]: name === "capacity" || name === "examId" ? Number(value) : value
    }));
  };

  const handleStudentChange = (e) => {
    const { name, value } = e.target;
    setStudentForm(prevState => ({
      ...prevState,
      [name]: value
    }));
  };

  const handleSubjectChange = (e) => {
    const { name, value } = e.target;
    setSubjectForm(prevState => ({
      ...prevState,
      [name]: value
    }));
  };

  return (
    <div className="p-6 max-w-4xl mx-auto bg-white rounded-lg shadow-md">
      <h1 className="text-2xl font-bold text-center mb-6 text-blue-800">Exam Slot Management System</h1>
      
      {/* Alerts */}
      {successMessage && (
        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
          <p>{successMessage}</p>
        </div>
      )}
      
      {errorMessage && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          <p>{errorMessage}</p>
        </div>
      )}
      
      {/* Tabs */}
      <div className="border-b border-gray-200 mb-6">
        <nav className="flex -mb-px">
          <button 
            onClick={() => setActiveTab("exams")}
            className={`mr-1 py-2 px-4 font-medium text-sm leading-5 rounded-t-lg ${
              activeTab === "exams"
                ? "border-b-2 border-blue-500 text-blue-600"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            Exams
          </button>
          <button 
            onClick={() => setActiveTab("timeslots")}
            className={`mr-1 py-2 px-4 font-medium text-sm leading-5 rounded-t-lg ${
              activeTab === "timeslots"
                ? "border-b-2 border-blue-500 text-blue-600"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            Timeslots
          </button>
          <button 
            onClick={() => setActiveTab("students")}
            className={`mr-1 py-2 px-4 font-medium text-sm leading-5 rounded-t-lg ${
              activeTab === "students"
                ? "border-b-2 border-blue-500 text-blue-600"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            Students
          </button>
          <button 
            onClick={() => setActiveTab("subjects")}
            className={`mr-1 py-2 px-4 font-medium text-sm leading-5 rounded-t-lg ${
              activeTab === "subjects"
                ? "border-b-2 border-blue-500 text-blue-600"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            Subjects
          </button>
        </nav>
      </div>
      
      {/* Exams Form */}
      {activeTab === "exams" && (
        <div>
          <h2 className="text-xl font-semibold mb-4 text-gray-800">Create New Exam</h2>
          <form onSubmit={handleExamSubmit} className="space-y-4">
            <div>
              <label className="block text-gray-700 mb-1">Exam Type</label>
              <input
                type="text"
                name="examType"
                value={examForm.examType}
                onChange={handleExamChange}
                placeholder="e.g. Mid-Term, Final, Quiz"
                className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
            
            <div>
              <label className="block text-gray-700 mb-1">Duration (Hours)</label>
              <input
                type="number"
                name="durationHours"
                min="1"
                max="2"
                value={examForm.durationHours}
                onChange={handleExamChange}
                placeholder="Duration between 1-2 hours"
                className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
            
            <div>
              <label className="block text-gray-700 mb-1">Exam Hall</label>
              <input
                type="text"
                name="examHall"
                value={examForm.examHall}
                onChange={handleExamChange}
                placeholder="e.g. Main Hall, Room 101"
                className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
            
            <button
              type="submit"
              className="w-full bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded focus:outline-none focus:ring-2 focus:ring-blue-400"
            >
              Create Exam
            </button>
          </form>
        </div>
      )}
      
      {/* Timeslots Form */}
      {activeTab === "timeslots" && (
        <div>
          <h2 className="text-xl font-semibold mb-4 text-gray-800">Create New Timeslot</h2>
          <form onSubmit={handleTimeslotSubmit} className="space-y-4">
            <div>
              <label className="block text-gray-700 mb-1">Date</label>
              <input
                type="date"
                name="date"
                value={timeslotForm.date}
                onChange={handleTimeslotChange}
                className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
            
            <div>
              <label className="block text-gray-700 mb-1">Start Time</label>
              <input
                type="time"
                name="startTime"
                value={timeslotForm.startTime}
                onChange={handleTimeslotChange}
                className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
            
            <div>
              <label className="block text-gray-700 mb-1">End Time</label>
              <input
                type="time"
                name="endTime"
                value={timeslotForm.endTime}
                onChange={handleTimeslotChange}
                className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
            
            <div>
              <label className="block text-gray-700 mb-1">Exam ID</label>
              <input
                type="number"
                name="examId"
                value={timeslotForm.examId}
                onChange={handleTimeslotChange}
                placeholder="e.g. 1"
                className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
            
            <div>
              <label className="block text-gray-700 mb-1">Capacity</label>
              <input
                type="number"
                name="capacity"
                min="1"
                value={timeslotForm.capacity}
                onChange={handleTimeslotChange}
                placeholder="e.g. 50"
                className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
            
            <button
              type="submit"
              className="w-full bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded focus:outline-none focus:ring-2 focus:ring-blue-400"
            >
              Create Timeslot
            </button>
          </form>
        </div>
      )}
      
      {/* Students Form */}
      {activeTab === "students" && (
        <div>
          <h2 className="text-xl font-semibold mb-4 text-gray-800">Register New Student</h2>
          <form onSubmit={handleStudentSubmit} className="space-y-4">
            <div>
              <label className="block text-gray-700 mb-1">Student Name</label>
              <input
                type="text"
                name="name"
                value={studentForm.name}
                onChange={handleStudentChange}
                placeholder="e.g. Thanji"
                className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
            
            <div>
              <label className="block text-gray-700 mb-1">Registration Number</label>
              <input
                type="text"
                name="registrationNumber"
                value={studentForm.registrationNumber}
                onChange={handleStudentChange}
                placeholder="e.g. 212222240107"
                className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
            
            <div>
              <label className="block text-gray-700 mb-1">Department</label>
              <input
                type="text"
                name="department"
                value={studentForm.department}
                onChange={handleStudentChange}
                placeholder="e.g. CSE"
                className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
            
            <button
              type="submit"
              className="w-full bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded focus:outline-none focus:ring-2 focus:ring-blue-400"
            >
              Register Student
            </button>
          </form>
        </div>
      )}
      
      {/* Subjects Form */}
      {activeTab === "subjects" && (
        <div>
          <h2 className="text-xl font-semibold mb-4 text-gray-800">Create New Subject</h2>
          <form onSubmit={handleSubjectSubmit} className="space-y-4">
            <div>
              <label className="block text-gray-700 mb-1">Subject Code</label>
              <input
                type="text"
                name="code"
                value={subjectForm.code}
                onChange={handleSubjectChange}
                placeholder="e.g. 19CS123"
                className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
            
            <div>
              <label className="block text-gray-700 mb-1">Subject Name</label>
              <input
                type="text"
                name="name"
                value={subjectForm.name}
                onChange={handleSubjectChange}
                placeholder="e.g. Computer Science"
                className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
            
            <div>
              <label className="block text-gray-700 mb-1">Group</label>
              <input
                type="text"
                name="group"
                value={subjectForm.group}
                onChange={handleSubjectChange}
                placeholder="e.g. A"
                className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
            
            <button
              type="submit"
              className="w-full bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded focus:outline-none focus:ring-2 focus:ring-blue-400"
            >
              Create Subject
            </button>
          </form>
        </div>
      )}
    </div>
  );
}