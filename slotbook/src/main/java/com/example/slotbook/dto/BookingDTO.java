package com.example.slotbook.dto;


import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import javax.validation.constraints.NotNull;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class BookingDTO {
    private Long id;
    
    @NotNull(message = "Student ID is required")
    private Long studentId;
    private String studentName;
    private String registrationNumber;
    
    @NotNull(message = "Subject ID is required")
    private Long subjectId;
    private String subjectCode;
    private String subjectName;
    private String subjectGroup;
    
    @NotNull(message = "Time slot ID is required")
    private Long timeSlotId;
    private LocalDate examDate;
    private LocalTime startTime;
    private LocalTime endTime;
    private String examType;
    private String examHall;
    
    private LocalDateTime bookingTime;
    private String status;
}
