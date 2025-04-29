package com.example.slotbook.dto;


import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import javax.validation.constraints.NotNull;
import java.time.LocalDate;
import java.time.LocalTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class TimeSlotDTO {
    private Long id;
    
    @NotNull(message = "Date is required")
    private LocalDate date;
    
    @NotNull(message = "Start time is required")
    private LocalTime startTime;
    
    @NotNull(message = "End time is required")
    private LocalTime endTime;
    
    @NotNull(message = "Exam is required")
    private Long examId;
    
    private String examType;
    private String examHall;
    
    @NotNull(message = "Capacity is required")
    private Integer capacity;
    
    private Integer bookedSeats;
    private Integer availableSeats;
}
