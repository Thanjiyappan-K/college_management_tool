package com.example.slotbook.entity;


import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import jakarta.persistence.*;
import java.util.List;

@Entity
@Data
@NoArgsConstructor
@AllArgsConstructor
@Table(name = "students")
public class Student {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(nullable = false)
    private String name;
    
    @Column(nullable = false, unique = true)
    private String registrationNumber;
    
    @Column(nullable = false)
    private String department;
    
    @OneToMany(mappedBy = "student", cascade = CascadeType.ALL)
    private List<Booking> bookings;
}