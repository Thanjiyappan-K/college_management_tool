package com.example.slotbook.service;


import com.example.slotbook.dto.ExamDTO;
import com.example.slotbook.entity.Exam;
import com.example.slotbook.exception.ResourceNotFoundException;
import com.example.slotbook.repository.ExamRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import jakarta.annotation.PostConstruct;
import jakarta.transaction.Transactional;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class ExamService {

    @Autowired
    private ExamRepository examRepository;

    @PostConstruct
    public void initializeData() {
        if (examRepository.count() == 0) {
            // Initialize default exam types if no data exists
            Exam cia = new Exam();
            cia.setExamType("CIA");
            cia.setDurationHours(2);
            cia.setExamHall("Main Hall");
            examRepository.save(cia);
            
            Exam reep = new Exam();
            reep.setExamType("REEP");
            reep.setDurationHours(2);
            reep.setExamHall("Block B Hall");
            examRepository.save(reep);
            
            Exam module = new Exam();
            module.setExamType("Module");
            module.setDurationHours(1);
            module.setExamHall("Mini Hall");
            examRepository.save(module);
        }
    }

    public List<ExamDTO> getAllExams() {
        return examRepository.findAll().stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    public List<ExamDTO> getExamsByType(String examType) {
        return examRepository.findByExamType(examType).stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    public ExamDTO getExamById(Long id) {
        Exam exam = examRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Exam not found with id: " + id));
        return convertToDTO(exam);
    }

    @Transactional
    public ExamDTO createExam(ExamDTO examDTO) {
        Exam exam = new Exam();
        exam.setExamType(examDTO.getExamType());
        exam.setDurationHours(examDTO.getDurationHours());
        exam.setExamHall(examDTO.getExamHall());
        
        Exam savedExam = examRepository.save(exam);
        return convertToDTO(savedExam);
    }

    @Transactional
    public ExamDTO updateExam(Long id, ExamDTO examDTO) {
        Exam exam = examRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Exam not found with id: " + id));
        
        exam.setExamType(examDTO.getExamType());
        exam.setDurationHours(examDTO.getDurationHours());
        exam.setExamHall(examDTO.getExamHall());
        
        Exam updatedExam = examRepository.save(exam);
        return convertToDTO(updatedExam);
    }

    private ExamDTO convertToDTO(Exam exam) {
        ExamDTO dto = new ExamDTO();
        dto.setId(exam.getId());
        dto.setExamType(exam.getExamType());
        dto.setDurationHours(exam.getDurationHours());
        dto.setExamHall(exam.getExamHall());
        return dto;
    }
}