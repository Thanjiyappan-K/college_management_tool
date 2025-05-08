// import axios from 'axios';
// const API_BASE_URL = 'http://localhost:8080/api';

// // Student API calls
// export const getStudents = () => {
//   return axios.get(`${API_BASE_URL}/students`);
// };
// export const getStudentById = (id) => {
//   return axios.get(`${API_BASE_URL}/students/${id}`);
// };
// export const getStudentByRegistrationNumber = (regNumber) => {
//   return axios.get(`${API_BASE_URL}/students/reg/${regNumber}`);
// };
// export const createStudent = (student) => {
//   return axios.post(`${API_BASE_URL}/students`, student);
// };
// export const updateStudent = (id, student) => {
//   return axios.put(`${API_BASE_URL}/students/${id}`, student);
// };
// export const deleteStudent = (id) => {
//   return axios.delete(`${API_BASE_URL}/students/${id}`);
// };

// // Subject API calls
// export const getAllSubjects = () => {
//   return axios.get(`${API_BASE_URL}/subjects`);
// };
// export const getSubjectsByGroup = (group) => {
//   return axios.get(`${API_BASE_URL}/subjects/group/${group}`);
// };
// export const getSubjectById = (id) => {
//   return axios.get(`${API_BASE_URL}/subjects/${id}`);
// };
// export const createSubject = (subject) => {
//   return axios.post(`${API_BASE_URL}/subjects`, subject);
// };
// export const updateSubject = (id, subject) => {
//   return axios.put(`${API_BASE_URL}/subjects/${id}`, subject);
// };
// export const deleteSubject = (id) => {
//   return axios.delete(`${API_BASE_URL}/subjects/${id}`);
// };

// // Exam API calls
// export const getAllExams = () => {
//   return axios.get(`${API_BASE_URL}/exams`);
// };
// export const getExamsByType = (examType) => {
//   return axios.get(`${API_BASE_URL}/exams/type/${examType}`);
// };
// export const getExamById = (id) => {
//   return axios.get(`${API_BASE_URL}/exams/${id}`);
// };
// export const createExam = (exam) => {
//   return axios.post(`${API_BASE_URL}/exams`, exam);
// };
// export const updateExam = (id, exam) => {
//   return axios.put(`${API_BASE_URL}/exams/${id}`, exam);
// };
// export const deleteExam = (id) => {
//   return axios.delete(`${API_BASE_URL}/exams/${id}`);
// };

// // TimeSlot API calls
// export const getAllTimeSlots = () => {
//   return axios.get(`${API_BASE_URL}/timeslots`);
// };
// export const getTimeSlotsByExamType = (examType) => {
//   return axios.get(`${API_BASE_URL}/timeslots/exam-type/${examType}`);
// };
// export const getTimeSlotsByDateRange = (startDate, endDate, examType) => {
//   return axios.get(`${API_BASE_URL}/timeslots/date-range?startDate=${startDate}&endDate=${endDate}&examType=${examType}`);
// };
// export const getTimeSlotById = (id) => {
//   return axios.get(`${API_BASE_URL}/timeslots/${id}`);
// };
// export const createTimeSlot = (timeSlot) => {
//   return axios.post(`${API_BASE_URL}/timeslots`, timeSlot);
// };
// export const updateTimeSlot = (id, timeSlot) => {
//   return axios.put(`${API_BASE_URL}/timeslots/${id}`, timeSlot);
// };
// export const deleteTimeSlot = (id) => {
//   return axios.delete(`${API_BASE_URL}/timeslots/${id}`);
// };
// export const getAvailableTimeSlots = (subjectId, examType, startDate, endDate) => {
//   return axios.get(`${API_BASE_URL}/timeslots/available?subjectId=${subjectId}&examType=${examType}&startDate=${startDate}&endDate=${endDate}`);
// };

// // Booking API calls
// export const getAllBookings = () => {
//   return axios.get(`${API_BASE_URL}/bookings`);
// };
// export const getBookingsByStudent = (studentId) => {
//   return axios.get(`${API_BASE_URL}/bookings/student/${studentId}`);
// };
// export const getBookingsByTimeSlot = (timeSlotId) => {
//   return axios.get(`${API_BASE_URL}/bookings/timeslot/${timeSlotId}`);
// };
// export const getBookingsByExamType = (examType) => {
//   return axios.get(`${API_BASE_URL}/bookings/exam-type/${examType}`);
// };
// export const getBookingsByDateRange = (startDate, endDate) => {
//   return axios.get(`${API_BASE_URL}/bookings/date-range?startDate=${startDate}&endDate=${endDate}`);
// };
// export const getBookingById = (id) => {
//   return axios.get(`${API_BASE_URL}/bookings/${id}`);
// };
// export const createBooking = (booking) => {
//   return axios.post(`${API_BASE_URL}/bookings`, booking);
// };
// export const updateBooking = (id, booking) => {
//   return axios.put(`${API_BASE_URL}/bookings/${id}`, booking);
// };
// export const deleteBooking = (id) => {
//   return axios.delete(`${API_BASE_URL}/bookings/${id}`);
// };
// export const confirmBooking = (id) => {
//   return axios.patch(`${API_BASE_URL}/bookings/${id}/confirm`);
// };
// export const cancelBooking = (id, reason) => {
//   return axios.patch(`${API_BASE_URL}/bookings/${id}/cancel`, { reason });
// };

// // Dashboard and Stats API calls
// export const getDashboardStats = () => {
//   return axios.get(`${API_BASE_URL}/stats/dashboard`);
// };
// export const getBookingStats = (startDate, endDate) => {
//   return axios.get(`${API_BASE_URL}/stats/bookings?startDate=${startDate}&endDate=${endDate}`);
// };
// export const getExamStats = (examType) => {
//   return axios.get(`${API_BASE_URL}/stats/exams?examType=${examType}`);
// };







import axios from 'axios';
const API_BASE_URL = 'http://localhost:8080/api';

// Student API calls - Aligned with StudentController
export const getStudents = () => {
  return axios.get(`${API_BASE_URL}/students`);
};
export const getStudentById = (id) => {
  return axios.get(`${API_BASE_URL}/students/${id}`);
};
export const getStudentByRegistrationNumber = (regNumber) => {
  return axios.get(`${API_BASE_URL}/students/reg/${regNumber}`);
};
export const createStudent = (student) => {
  return axios.post(`${API_BASE_URL}/students`, student);
};
export const updateStudent = (id, student) => {
  return axios.put(`${API_BASE_URL}/students/${id}`, student);
};
export const deleteStudent = (id) => {
  return axios.delete(`${API_BASE_URL}/students/${id}`);
};

// Subject API calls - Aligned with SubjectController
export const getAllSubjects = () => {
  return axios.get(`${API_BASE_URL}/subjects`);
};
export const getSubjectsByGroup = (group) => {
  return axios.get(`${API_BASE_URL}/subjects/group/${group}`);
};
export const getSubjectById = (id) => {
  return axios.get(`${API_BASE_URL}/subjects/${id}`);
};
export const createSubject = (subject) => {
  return axios.post(`${API_BASE_URL}/subjects`, subject);
};
// Note: updateSubject and deleteSubject endpoints are not present in SubjectController

// Exam API calls - Aligned with ExamController
export const getAllExams = () => {
  return axios.get(`${API_BASE_URL}/exams`);
};
export const getExamsByType = (examType) => {
  return axios.get(`${API_BASE_URL}/exams/type/${examType}`);
};
export const getExamById = (id) => {
  return axios.get(`${API_BASE_URL}/exams/${id}`);
};
export const createExam = (exam) => {
  return axios.post(`${API_BASE_URL}/exams`, exam);
};
export const updateExam = (id, exam) => {
  return axios.put(`${API_BASE_URL}/exams/${id}`, exam);
};
// Note: deleteExam endpoint is not present in ExamController

// TimeSlot API calls - Aligned with TimeSlotController
export const getAllTimeSlots = () => {
  return axios.get(`${API_BASE_URL}/timeslots`);
};
export const getTimeSlotsByExamType = (examType) => {
  return axios.get(`${API_BASE_URL}/timeslots/exam-type/${examType}`);
};
export const getTimeSlotsByDateRange = (startDate, endDate, examType) => {
  return axios.get(`${API_BASE_URL}/timeslots/date-range?startDate=${startDate}&endDate=${endDate}&examType=${examType}`);
};
export const getTimeSlotById = (id) => {
  return axios.get(`${API_BASE_URL}/timeslots/${id}`);
};
export const createTimeSlot = (timeSlot) => {
  return axios.post(`${API_BASE_URL}/timeslots`, timeSlot);
};
// Note: updateTimeSlot, deleteTimeSlot, and getAvailableTimeSlots endpoints are not present in TimeSlotController

// Booking API calls - Aligned with BookingController
export const getAllBookings = () => {
  return axios.get(`${API_BASE_URL}/bookings`);
};
export const getBookingsByStudent = (studentId) => {
  return axios.get(`${API_BASE_URL}/bookings/student/${studentId}`);
};
export const getBookingById = (id) => {
  return axios.get(`${API_BASE_URL}/bookings/${id}`);
};
export const createBooking = (bookingRequest) => {
  return axios.post(`${API_BASE_URL}/bookings`, bookingRequest);
};
export const cancelBooking = (id) => {
  return axios.delete(`${API_BASE_URL}/bookings/${id}`);
};