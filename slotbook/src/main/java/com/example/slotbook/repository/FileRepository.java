package com.example.slotbook.repository;


// FileRepository.java
import org.springframework.data.jpa.repository.JpaRepository;

import com.example.slotbook.entity.FileEntity;

public interface FileRepository extends JpaRepository<FileEntity, Long> {
    
}

