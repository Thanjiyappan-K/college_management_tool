package com.example.slotbook.repository;


import com.example.slotbook.entity.Booking;
import com.example.slotbook.entity.Student;
import com.example.slotbook.entity.Subject;
import com.example.slotbook.entity.TimeSlot;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface BookingRepository extends JpaRepository<Booking, Long> {
    List<Booking> findByStudent(Student student);
    Optional<Booking> findByStudentAndSubjectAndTimeSlot_Exam_ExamType(Student student, Subject subject, String examType);
    List<Booking> findByTimeSlot(TimeSlot timeSlot);
    boolean existsByStudentAndSubjectAndTimeSlot_Exam_ExamType(Student student, Subject subject, String examType);
}
