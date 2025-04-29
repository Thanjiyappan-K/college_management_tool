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
@Table(name = "subjects")
public class Subject {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(name = "subject_code", nullable = false, unique = true)
    private String code;
    
    @Column(name = "`name`", nullable = false)
    private String name;
    
    @Column(name = "subject_group", nullable = false)
    private String group;
    
    @OneToMany(mappedBy = "subject")
    private List<Booking> bookings;
}
