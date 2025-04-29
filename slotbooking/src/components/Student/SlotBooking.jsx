import React, { useState, useEffect } from 'react';
import { 
  getAllTimeSlots, 
  getTimeSlotsByExamType, 
  getTimeSlotsByDateRange,
  createBooking,
  getStudentByRegistrationNumber,
  getAllSubjects,
  getExamsByType
} from './api';
import './SlotBooking.css';

const SlotBooking = () => {
  // State variables
  const [timeSlots, setTimeSlots] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [exams, setExams] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [student, setStudent] = useState(null);
  
  // Form state
  const [formData, setFormData] = useState({
    registrationNumber: '',
    examType: 'THEORY', // Default to THEORY
    subjectId: '',
    timeSlotId: '',
    startDate: '',
    endDate: ''
  });

  // Filter options
  const examTypes = ['THEORY', 'PRACTICAL', 'VIVA'];

  // Handle input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    
    // Clear success/error messages when form changes
    setSuccess('');
    setError('');

    // If exam type changes, fetch relevant subjects and slots
    if (name === 'examType') {
      fetchExamsByType(value);
      if (formData.startDate && formData.endDate) {
        fetchTimeSlotsByDateRange(formData.startDate, formData.endDate, value);
      } else {
        fetchTimeSlotsByExamType(value);
      }
    }
    
    // If date range changes, fetch timeslots for that range
    if ((name === 'startDate' || name === 'endDate') && formData.examType) {
      const startDate = name === 'startDate' ? value : formData.startDate;
      const endDate = name === 'endDate' ? value : formData.endDate;
      
      if (startDate && endDate) {
        fetchTimeSlotsByDateRange(startDate, endDate, formData.examType);
      }
    }
  };

  // Fetch all available subjects on component mount
  useEffect(() => {
    fetchAllSubjects();
    fetchExamsByType('THEORY'); // Default exam type
    fetchAllTimeSlots();
  }, []);

  // Fetch all subjects
  const fetchAllSubjects = async () => {
    try {
      setLoading(true);
      const response = await getAllSubjects();
      setSubjects(response.data);
      setLoading(false);
    } catch (err) {
      setError('Failed to fetch subjects');
      setLoading(false);
    }
  };

  // Fetch exams by type
  const fetchExamsByType = async (examType) => {
    try {
      setLoading(true);
      const response = await getExamsByType(examType);
      setExams(response.data);
      setLoading(false);
    } catch (err) {
      setError('Failed to fetch exams');
      setLoading(false);
    }
  };

  // Fetch all time slots
  const fetchAllTimeSlots = async () => {
    try {
      setLoading(true);
      const response = await getAllTimeSlots();
      setTimeSlots(response.data);
      setLoading(false);
    } catch (err) {
      setError('Failed to fetch time slots');
      setLoading(false);
    }
  };

  // Fetch time slots by exam type
  const fetchTimeSlotsByExamType = async (examType) => {
    try {
      setLoading(true);
      const response = await getTimeSlotsByExamType(examType);
      setTimeSlots(response.data);
      setLoading(false);
    } catch (err) {
      setError('Failed to fetch time slots for the selected exam type');
      setLoading(false);
    }
  };

  // Fetch time slots by date range
  const fetchTimeSlotsByDateRange = async (startDate, endDate, examType) => {
    try {
      setLoading(true);
      const response = await getTimeSlotsByDateRange(startDate, endDate, examType);
      setTimeSlots(response.data);
      setLoading(false);
    } catch (err) {
      setError('Failed to fetch time slots for the selected date range');
      setLoading(false);
    }
  };

  // Fetch student by registration number
  const fetchStudentByRegistrationNumber = async () => {
    if (!formData.registrationNumber) {
      setError('Please enter a registration number');
      return;
    }
    
    try {
      setLoading(true);
      const response = await getStudentByRegistrationNumber(formData.registrationNumber);
      setStudent(response.data);
      setLoading(false);
      setError('');
    } catch (err) {
      setStudent(null);
      setError('Student not found. Please check the registration number.');
      setLoading(false);
    }
  };

  // Handle booking submission
  const handleBookSlot = async (e) => {
    e.preventDefault();
    
    // Validation
    if (!student) {
      setError('Please verify student registration number first');
      return;
    }
    
    if (!formData.subjectId) {
      setError('Please select a subject');
      return;
    }
    
    if (!formData.timeSlotId) {
      setError('Please select a time slot');
      return;
    }
    
    // Create booking object
    const bookingData = {
      studentId: student.id,
      subjectId: formData.subjectId,
      timeSlotId: formData.timeSlotId,
      bookingStatus: 'CONFIRMED'
    };
    
    try {
      setLoading(true);
      await createBooking(bookingData);
      setSuccess('Slot booked successfully!');
      
      // Reset form after successful booking
      setFormData({
        ...formData,
        subjectId: '',
        timeSlotId: ''
      });
      
      // Refresh timeslots to show updated availability
      if (formData.startDate && formData.endDate) {
        fetchTimeSlotsByDateRange(formData.startDate, formData.endDate, formData.examType);
      } else {
        fetchTimeSlotsByExamType(formData.examType);
      }
      
      setLoading(false);
    } catch (err) {
      setError('Failed to book slot. Please try again.');
      setLoading(false);
    }
  };

  // Format date for display
  const formatDate = (dateString) => {
    const options = { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  return (
    <div className="slot-booking-container">
      <h2>Exam Slot Booking</h2>
      
      {/* Student verification section */}
      <div className="verification-section">
        <h3>Student Verification</h3>
        <div className="input-group">
          <label>Registration Number:</label>
          <div className="verification-input">
            <input
              type="text"
              name="registrationNumber"
              value={formData.registrationNumber}
              onChange={handleInputChange}
              placeholder="Enter registration number"
              required
            />
            <button 
              onClick={fetchStudentByRegistrationNumber}
              disabled={loading}
              className="verify-btn"
            >
              Verify
            </button>
          </div>
        </div>
        
        {student && (
          <div className="student-info">
            <h4>Student Information:</h4>
            <p><strong>Name:</strong> {student.firstName} {student.lastName}</p>
            <p><strong>Email:</strong> {student.email}</p>
            <p><strong>Group:</strong> {student.group}</p>
          </div>
        )}
      </div>
      
      {/* Booking form */}
      <form onSubmit={handleBookSlot} className="booking-form">
        <h3>Booking Details</h3>
        
        <div className="input-group">
          <label>Exam Type:</label>
          <select
            name="examType"
            value={formData.examType}
            onChange={handleInputChange}
            required
          >
            {examTypes.map((type) => (
              <option key={type} value={type}>{type}</option>
            ))}
          </select>
        </div>
        
        <div className="input-group">
          <label>Subject:</label>
          <select
            name="subjectId"
            value={formData.subjectId}
            onChange={handleInputChange}
            required
            disabled={!student}
          >
            <option value="">Select Subject</option>
            {subjects
              .filter(subject => student ? subject.group === student.group : true)
              .map((subject) => (
                <option key={subject.id} value={subject.id}>
                  {subject.name} ({subject.code})
                </option>
              ))}
          </select>
        </div>
        
        <div className="date-filter">
          <h4>Filter by Date Range (Optional)</h4>
          <div className="date-inputs">
            <div className="input-group">
              <label>From:</label>
              <input
                type="date"
                name="startDate"
                value={formData.startDate}
                onChange={handleInputChange}
              />
            </div>
            
            <div className="input-group">
              <label>To:</label>
              <input
                type="date"
                name="endDate"
                value={formData.endDate}
                onChange={handleInputChange}
              />
            </div>
          </div>
        </div>
        
        <div className="time-slots-section">
          <h3>Available Time Slots</h3>
          {loading ? (
            <p className="loading">Loading available slots...</p>
          ) : timeSlots.length > 0 ? (
            <div className="time-slots-grid">
              {timeSlots.map((slot) => (
                <div 
                  key={slot.id} 
                  className={`time-slot ${formData.timeSlotId === slot.id ? 'selected' : ''} ${slot.availableSeats === 0 ? 'booked' : ''}`}
                  onClick={() => {
                    if (slot.availableSeats > 0) {
                      setFormData({ ...formData, timeSlotId: slot.id });
                    }
                  }}
                >
                  <p className="slot-date">{formatDate(slot.startTime)}</p>
                  <p className="slot-duration">Duration: {slot.durationMinutes} minutes</p>
                  <p className="slot-availability">
                    Available Seats: {slot.availableSeats}/{slot.totalSeats}
                  </p>
                  <p className="slot-room">Room: {slot.room}</p>
                  {slot.availableSeats === 0 && <span className="fully-booked">Fully Booked</span>}
                </div>
              ))}
            </div>
          ) : (
            <p className="no-slots">No available time slots found for selected criteria.</p>
          )}
        </div>
        
        {error && <div className="error-message">{error}</div>}
        {success && <div className="success-message">{success}</div>}
        
        <button 
          type="submit" 
          className="book-btn"
          disabled={loading || !student || !formData.subjectId || !formData.timeSlotId}
        >
          {loading ? 'Booking...' : 'Book Slot'}
        </button>
      </form>
    </div>
  );
};

export default SlotBooking;