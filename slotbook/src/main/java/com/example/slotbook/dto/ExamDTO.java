package com.example.slotbook.dto;


import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import javax.validation.constraints.Max;
import javax.validation.constraints.Min;
import javax.validation.constraints.NotBlank;
import javax.validation.constraints.NotNull;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ExamDTO {
    private Long id;
    
    @NotBlank(message = "Exam type is required")
    private String examType;
    
    @NotNull(message = "Duration is required")
    @Min(value = 1, message = "Duration must be at least 1 hour")
    @Max(value = 2, message = "Duration must be at most 2 hours")
    private Integer durationHours;
    
    @NotBlank(message = "Exam hall is required")
    private String examHall;
}