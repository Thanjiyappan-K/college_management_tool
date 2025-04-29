package com.example.slotbook.repository;


import com.example.slotbook.entity.Subject;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface SubjectRepository extends JpaRepository<Subject, Long> {
    List<Subject> findByGroup(String group);
    Optional<Subject> findByCode(String code);
} 

