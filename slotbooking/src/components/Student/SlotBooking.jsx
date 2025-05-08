import React, { useEffect, useState } from 'react';
import './SlotBooking.css';
export default function SlotBooking() {
  const [allStudents, setAllStudents] = useState([]);
  const [displayedStudents, setDisplayedStudents] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [timeSlots, setTimeSlots] = useState([]);
  const [showSubjects, setShowSubjects] = useState(false);
  const [showSlots, setShowSlots] = useState(false);
  const [loading, setLoading] = useState(true);
  const [bookingResponse, setBookingResponse] = useState(null);
  const [formData, setFormData] = useState({
    studentId: '',
    subjectId: '',
    timeSlotId: ''
  });
  const [formError, setFormError] = useState('');

  useEffect(() => {
    fetch('http://localhost:8080/api/students')
      .then(response => response.json())
      .then(data => {
        setAllStudents(data);
        setLoading(false);
      })
      .catch(error => {
        console.error('Error fetching student data:', error);
        setLoading(false);
      });
  }, []);

  const handleShowAllStudents = () => {
    setDisplayedStudents(allStudents);
    setShowSubjects(false);
    setShowSlots(false);
    setBookingResponse(null);
  };

  const handleShowAllSubjects = () => {
    fetch('http://localhost:8080/api/subjects')
      .then(response => response.json())
      .then(data => {
        setSubjects(data);
        setShowSubjects(true);
        setShowSlots(false);
        setBookingResponse(null);
      })
      .catch(error => {
        console.error('Error fetching subject data:', error);
      });
  };

  const handleShowAllSlots = () => {
    fetch('http://localhost:8080/api/timeslots')
      .then(response => response.json())
      .then(data => {
        setTimeSlots(Array.isArray(data) ? data : [data]);
        setShowSlots(true);
        setShowSubjects(false);
        setBookingResponse(null);
      })
      .catch(error => {
        console.error('Error fetching timeslot data:', error);
      });
  };

  const handleClose = () => {
    const student = allStudents.find(s => s.id === 5);
    setDisplayedStudents(student ? [student] : []);
    setShowSubjects(false);
    setShowSlots(false);
    setBookingResponse(null);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setFormError('');
    setBookingResponse(null);

    if (!formData.studentId || !formData.subjectId || !formData.timeSlotId) {
      setFormError('All fields are required.');
      return;
    }

    fetch('http://localhost:8080/api/bookings', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        studentId: parseInt(formData.studentId),
        subjectId: parseInt(formData.subjectId),
        timeSlotId: parseInt(formData.timeSlotId),
      }),
    })
      .then(response => {
        if (!response.ok) {
          throw new Error('Booking failed.');
        }
        return response.json();
      })
      .then(data => {
        setBookingResponse(data);
        setFormData({ studentId: '', subjectId: '', timeSlotId: '' });
      })
      .catch(error => {
        console.error('Error creating booking:', error);
        setFormError('Failed to create booking. Please try again.');
      });
  };

  return (
    <div className="slotbooking-fullscreen min-h-screen min-w-screen flex flex-col justify-start items-center bg-gray-100 p-0 m-0">
      <div className="flex justify-between mb-6">
        <button
          onClick={handleShowAllStudents}
          className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded"
        >
          All Students
        </button>
        <div className="flex space-x-2">
          <button
            onClick={handleShowAllSubjects}
            className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded"
          >
            All Subjects
          </button>
          <button
            onClick={handleShowAllSlots}
            className="bg-purple-500 hover:bg-purple-600 text-white px-4 py-2 rounded"
          >
            All Slots
          </button>
        </div>
      </div>
      <div className="flex justify-center mb-6">
        <button
          onClick={handleClose}
          className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded"
        >
          Close
        </button>
      </div>

      <div className="mb-6">
        <h2 className="text-xl font-bold text-gray-700 mb-4">Create Booking</h2>
        <form onSubmit={handleSubmit} className="bg-white shadow-md rounded-xl p-4">
          <div className="grid gap-4 md:grid-cols-3">
            <div>
              <label className="block text-gray-700">Student ID</label>
              <input
                type="number"
                name="studentId"
                value={formData.studentId}
                onChange={handleInputChange}
                className="w-full p-2 border rounded"
                placeholder="Enter Student ID"
              />
            </div>
            <div>
              <label className="block text-gray-700">Subject ID</label>
              <input
                type="number"
                name="subjectId"
                value={formData.subjectId}
                onChange={handleInputChange}
                className="w-full p-2 border rounded"
                placeholder="Enter Subject ID"
              />
            </div>
            <div>
              <label className="block text-gray-700">Slot ID</label>
              <input
                type="number"
                name="timeSlotId"
                value={formData.timeSlotId}
                onChange={handleInputChange}
                className="w-full p-2 border rounded"
                placeholder="Enter Slot ID"
              />
            </div>
          </div>
          {formError && <p className="text-red-500 mt-2">{formError}</p>}
          <button
            type="submit"
            className="mt-4 bg-indigo-500 hover:bg-indigo-600 W-6 text-white px-4 py-2 rounded"
          >
            Submit Booking
          </button>
        </form>
      </div>

      {bookingResponse && (
        <div className="mb-6">
          <h2 className="text-xl font-bold text-indigo-700 mb-4">Booking Confirmation</h2>
          <div className="bg-white shadow-md rounded-xl p-4">
            <p><strong>Booking ID:</strong> {bookingResponse.id}</p>
            <p><strong>Student ID:</strong> {bookingResponse.studentId}</p>
            <p><strong>Student Name:</strong> {bookingResponse.studentName}</p>
            <p><strong>Registration Number:</strong> {bookingResponse.registrationNumber}</p>
            <p><strong>Subject ID:</strong> {bookingResponse.subjectId}</p>
            <p><strong>Subject Code:</strong> {bookingResponse.subjectCode}</p>
            <p><strong>Subject Name:</strong> {bookingResponse.subjectName}</p>
            <p><strong>Subject Group:</strong> {bookingResponse.subjectGroup}</p>
            <p><strong>Time Slot ID:</strong> {bookingResponse.timeSlotId}</p>
            <p><strong>Exam Date:</strong> {bookingResponse.examDate}</p>
            <p><strong>Start Time:</strong> {bookingResponse.startTime}</p>
            <p><strong>End Time:</strong> {bookingResponse.endTime}</p>
            <p><strong>Exam Type:</strong> {bookingResponse.examType}</p>
            <p><strong>Exam Hall:</strong> {bookingResponse.examHall}</p>
            <p><strong>Booking Time:</strong> {bookingResponse.bookingTime}</p>
            <p><strong>Status:</strong> {bookingResponse.status}</p>
          </div>
        </div>
      )}

      {loading ? (
        <p className="text-gray-600 text-lg">Loading student data...</p>
      ) : showSlots ? (
        <div className="grid gap-4 md:grid-cols-2">
          {timeSlots.map(slot => (
            <div key={slot.id} className="bg-white shadow-md rounded-xl p-4">
              <h2 className="text-xl font-bold text-purple-700">Time Slot Details</h2>
              <p><strong>ID:</strong> {slot.id}</p>
              <p><strong>Date:</strong> {slot.date}</p>
              <p><strong>Start Time:</strong> {slot.startTime}</p>
              <p><strong>End Time:</strong> {slot.endTime}</p>
              <p><strong>Exam ID:</strong> {slot.examId}</p>
              <p><strong>Exam Type:</strong> {slot.examType}</p>
              <p><strong>Exam Hall:</strong> {slot.examHall}</p>
              <p><strong>Capacity:</strong> {slot.capacity}</p>
              <p><strong>Booked Seats:</strong> {slot.bookedSeats}</p>
              <p><strong>Available Seats:</strong> {slot.availableSeats}</p>
            </div>
          ))}
        </div>
      ) : showSubjects ? (
        <div className="grid gap-4 md:grid-cols-2">
          {subjects.map(subject => (
            <div key={subject.id} className="bg-white shadow-md rounded-xl p-4">
              <h2 className="text-xl font-bold text-green-700">Subject Info</h2>
              <p><strong>ID:</strong> {subject.id}</p>
              <p><strong>Code:</strong> {subject.code}</p>
              <p><strong>Name:</strong> {subject.name}</p>
              <p><strong>Group:</strong> {subject.group}</p>
            </div>
          ))}
        </div>
      ) : (
        displayedStudents.length > 0 ? (
          <div className="grid gap-4 md:grid-cols-2">
            {displayedStudents.map(student => (
              <div key={student.id} className="bg-white shadow-md rounded-xl p-4">
                <h2 className="text-xl font-bold text-blue-700">Student Slot Details</h2>
                <p><strong>ID:</strong> {student.id}</p>
                <p><strong>Name:</strong> {student.name}</p>
                <p><strong>Reg. No:</strong> {student.registrationNumber}</p>
                <p><strong>Department:</strong> {student.department}</p>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-red-500">No student found.</p>
        )
      )}
    </div>
  );
}