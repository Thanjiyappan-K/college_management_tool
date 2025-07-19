package com.example.slotbook.entity;

// FileEntity.java
import jakarta.persistence.*;
import lombok.Data;
@Data
@Entity
@Table(name = "files")
public class FileEntity {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String fileName;
    private String fileType;

    
    @Lob
    @Column(columnDefinition = "LONGBLOB")
    private byte[] data;

    // Getters and setters
}
