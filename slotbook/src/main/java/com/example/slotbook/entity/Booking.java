package com.example.slotbook.entity;

//import com.example.slotbook.entity.Subject;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Data
@NoArgsConstructor
@AllArgsConstructor
@Table(name = "bookings")
public class Booking {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @ManyToOne
    @JoinColumn(name = "student_id", nullable = false)
    private Student student;
    
    @ManyToOne
    @JoinColumn(name = "subject_id", nullable = false)
    private Subject subject;
    
    @ManyToOne
    @JoinColumn(name = "time_slot_id", nullable = false)
    private TimeSlot timeSlot;
    
    @Column(nullable = false)
    private LocalDateTime bookingTime = LocalDateTime.now();
    
    @Column(nullable = false)
    private String status = "CONFIRMED";
}