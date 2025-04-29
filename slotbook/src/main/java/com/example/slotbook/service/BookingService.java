package com.example.slotbook.service;


import com.example.slotbook.dto.BookingDTO;
import com.example.slotbook.dto.BookingRequestDTO;
import com.example.slotbook.entity.Booking;
import com.example.slotbook.entity.Student;
import com.example.slotbook.entity.Subject;
import com.example.slotbook.entity.TimeSlot;
import com.example.slotbook.exception.ResourceNotFoundException;
import com.example.slotbook.repository.BookingRepository;
import com.example.slotbook.repository.StudentRepository;
import com.example.slotbook.repository.SubjectRepository;
import com.example.slotbook.repository.TimeSlotRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class BookingService {

    @Autowired
    private BookingRepository bookingRepository;

    @Autowired
    private StudentRepository studentRepository;

    @Autowired
    private SubjectRepository subjectRepository;

    @Autowired
    private TimeSlotRepository timeSlotRepository;

    @Autowired
    private TimeSlotService timeSlotService;

    public List<BookingDTO> getAllBookings() {
        return bookingRepository.findAll().stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    public List<BookingDTO> getBookingsByStudent(Long studentId) {
        Student student = studentRepository.findById(studentId)
                .orElseThrow(() -> new ResourceNotFoundException("Student not found with id: " + studentId));
        
        return bookingRepository.findByStudent(student).stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    public BookingDTO getBookingById(Long id) {
        Booking booking = bookingRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Booking not found with id: " + id));
        return convertToDTO(booking);
    }

    @Transactional
    public BookingDTO createBooking(BookingRequestDTO requestDTO) {
        // Get student
        Student student = studentRepository.findById(requestDTO.getStudentId())
                .orElseThrow(() -> new ResourceNotFoundException("Student not found with id: " + requestDTO.getStudentId()));
        
        // Get subject
        Subject subject = subjectRepository.findById(requestDTO.getSubjectId())
                .orElseThrow(() -> new ResourceNotFoundException("Subject not found with id: " + requestDTO.getSubjectId()));
        
        // Get time slot
        TimeSlot timeSlot = timeSlotRepository.findById(requestDTO.getTimeSlotId())
                .orElseThrow(() -> new ResourceNotFoundException("Time slot not found with id: " + requestDTO.getTimeSlotId()));
        
        String examType = timeSlot.getExam().getExamType();
        
        // Check if booking already exists for the same subject and exam type
        if (bookingRepository.existsByStudentAndSubjectAndTimeSlot_Exam_ExamType(student, subject, examType)) {
            throw new IllegalStateException("Student already has a booking for this subject in the " + examType + " exam");
        }
        
        // Check if the time slot is available
        if (timeSlot.getBookedSeats() >= timeSlot.getCapacity()) {
            throw new IllegalStateException("Time slot is fully booked");
        }
        
        // Create booking
        Booking booking = new Booking();
        booking.setStudent(student);
        booking.setSubject(subject);
        booking.setTimeSlot(timeSlot);
        booking.setBookingTime(LocalDateTime.now());
        booking.setStatus("CONFIRMED");
        
        // Increment booked seats in time slot
        timeSlotService.incrementBookedSeats(timeSlot.getId());
        
        Booking savedBooking = bookingRepository.save(booking);
        return convertToDTO(savedBooking);
    }

    @Transactional
    public void cancelBooking(Long id) {
        Booking booking = bookingRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Booking not found with id: " + id));
        
        // Decrement booked seats in time slot
        timeSlotService.decrementBookedSeats(booking.getTimeSlot().getId());
        
        // Delete booking
        bookingRepository.delete(booking);
    }

    private BookingDTO convertToDTO(Booking booking) {
        BookingDTO dto = new BookingDTO();
        dto.setId(booking.getId());
        
        // Student info
        dto.setStudentId(booking.getStudent().getId());
        dto.setStudentName(booking.getStudent().getName());
        dto.setRegistrationNumber(booking.getStudent().getRegistrationNumber());
        
        // Subject info
        dto.setSubjectId(booking.getSubject().getId());
        dto.setSubjectCode(booking.getSubject().getCode());
        dto.setSubjectName(booking.getSubject().getName());
        dto.setSubjectGroup(booking.getSubject().getGroup());
        
        // Time slot info
        dto.setTimeSlotId(booking.getTimeSlot().getId());
        dto.setExamDate(booking.getTimeSlot().getDate());
        dto.setStartTime(booking.getTimeSlot().getStartTime());
        dto.setEndTime(booking.getTimeSlot().getEndTime());
        dto.setExamType(booking.getTimeSlot().getExam().getExamType());
        dto.setExamHall(booking.getTimeSlot().getExam().getExamHall());
        
        // Booking info
        dto.setBookingTime(booking.getBookingTime());
        dto.setStatus(booking.getStatus());
        
        return dto;
    }
}
