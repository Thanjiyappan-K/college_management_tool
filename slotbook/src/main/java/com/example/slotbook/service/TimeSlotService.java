package com.example.slotbook.service;


import com.example.slotbook.dto.TimeSlotDTO;
import com.example.slotbook.entity.Exam;
import com.example.slotbook.entity.TimeSlot;
import com.example.slotbook.exception.ResourceNotFoundException;
import com.example.slotbook.repository.ExamRepository;
import com.example.slotbook.repository.TimeSlotRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import org.springframework.transaction.annotation.Transactional;
import java.time.LocalDate;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class TimeSlotService {

    @Autowired
    private TimeSlotRepository timeSlotRepository;

    @Autowired
    private ExamRepository examRepository;

    public List<TimeSlotDTO> getAllTimeSlots() {
        return timeSlotRepository.findAll().stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    public List<TimeSlotDTO> getTimeSlotsByExamType(String examType) {
        List<Exam> exams = examRepository.findByExamType(examType);
        
        return exams.stream()
        .flatMap(exam -> timeSlotRepository.findByExam(exam).stream())
        .map(this::convertToDTO)
        .collect(Collectors.toList());
}

public List<TimeSlotDTO> getTimeSlotsByDateRange(LocalDate startDate, LocalDate endDate, String examType) {
return timeSlotRepository.findByDateBetweenAndExam_ExamType(startDate, endDate, examType).stream()
        .map(this::convertToDTO)
        .collect(Collectors.toList());
}

public TimeSlotDTO getTimeSlotById(Long id) {
TimeSlot timeSlot = timeSlotRepository.findById(id)
        .orElseThrow(() -> new ResourceNotFoundException("Time slot not found with id: " + id));
return convertToDTO(timeSlot);
}

@Transactional
public TimeSlotDTO createTimeSlot(TimeSlotDTO timeSlotDTO) {
Exam exam = examRepository.findById(timeSlotDTO.getExamId())
        .orElseThrow(() -> new ResourceNotFoundException("Exam not found with id: " + timeSlotDTO.getExamId()));

// Validation for time slot based on exam duration
if (timeSlotDTO.getStartTime().plusHours(exam.getDurationHours()).isBefore(timeSlotDTO.getEndTime()) ||
    timeSlotDTO.getStartTime().plusHours(exam.getDurationHours()).isAfter(timeSlotDTO.getEndTime())) {
    throw new IllegalArgumentException("End time must match the exam duration of " + exam.getDurationHours() + " hours");
}

TimeSlot timeSlot = new TimeSlot();
timeSlot.setDate(timeSlotDTO.getDate());
timeSlot.setStartTime(timeSlotDTO.getStartTime());
timeSlot.setEndTime(timeSlotDTO.getEndTime());
timeSlot.setExam(exam);
timeSlot.setCapacity(timeSlotDTO.getCapacity());
timeSlot.setBookedSeats(0);

TimeSlot savedTimeSlot = timeSlotRepository.save(timeSlot);
return convertToDTO(savedTimeSlot);
}

@Transactional
public void incrementBookedSeats(Long timeSlotId) {
TimeSlot timeSlot = timeSlotRepository.findById(timeSlotId)
        .orElseThrow(() -> new ResourceNotFoundException("Time slot not found with id: " + timeSlotId));

if (timeSlot.getBookedSeats() >= timeSlot.getCapacity()) {
    throw new IllegalStateException("Time slot is already fully booked");
}

timeSlot.setBookedSeats(timeSlot.getBookedSeats() + 1);
timeSlotRepository.save(timeSlot);
}

@Transactional
public void decrementBookedSeats(Long timeSlotId) {
TimeSlot timeSlot = timeSlotRepository.findById(timeSlotId)
        .orElseThrow(() -> new ResourceNotFoundException("Time slot not found with id: " + timeSlotId));

if (timeSlot.getBookedSeats() > 0) {
    timeSlot.setBookedSeats(timeSlot.getBookedSeats() - 1);
    timeSlotRepository.save(timeSlot);
}
}

private TimeSlotDTO convertToDTO(TimeSlot timeSlot) {
TimeSlotDTO dto = new TimeSlotDTO();
dto.setId(timeSlot.getId());
dto.setDate(timeSlot.getDate());
dto.setStartTime(timeSlot.getStartTime());
dto.setEndTime(timeSlot.getEndTime());
dto.setExamId(timeSlot.getExam().getId());
dto.setExamType(timeSlot.getExam().getExamType());
dto.setExamHall(timeSlot.getExam().getExamHall());
dto.setCapacity(timeSlot.getCapacity());
dto.setBookedSeats(timeSlot.getBookedSeats());
dto.setAvailableSeats(timeSlot.getCapacity() - timeSlot.getBookedSeats());
return dto;
}
}
