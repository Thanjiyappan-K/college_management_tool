package com.example.slotbook.repository;

import com.example.slotbook.entity.Exam;
import com.example.slotbook.entity.TimeSlot;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;

@Repository
public interface TimeSlotRepository extends JpaRepository<TimeSlot, Long> {
    List<TimeSlot> findByExam(Exam exam);
    List<TimeSlot> findByDateBetweenAndExam_ExamType(LocalDate startDate, LocalDate endDate, String examType);
    List<TimeSlot> findByDate(LocalDate date);
}