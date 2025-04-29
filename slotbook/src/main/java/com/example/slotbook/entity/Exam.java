package com.example.slotbook.entity;


import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import jakarta.persistence.*;
@Entity
@Data
@NoArgsConstructor
@AllArgsConstructor
@Table(name = "exams")
public class Exam {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(nullable = false)
    private String examType; // CIA, REEP, or Module
    
    @Column(nullable = false)
    private Integer durationHours; // 1 or 2 hours
    
    @Column(nullable = false)
    private String examHall;
}
