package com.example.slotbook.controller;


import com.example.slotbook.dto.ExamDTO;
import com.example.slotbook.service.ExamService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import javax.validation.Valid;
import java.util.List;

@RestController
@RequestMapping("/api/exams")
@CrossOrigin(origins = "*")
public class ExamController {

    @Autowired
    private ExamService examService;

    @GetMapping
    public ResponseEntity<List<ExamDTO>> getAllExams() {
        return ResponseEntity.ok(examService.getAllExams());
    }

    @GetMapping("/type/{examType}")
    public ResponseEntity<List<ExamDTO>> getExamsByType(@PathVariable String examType) {
        return ResponseEntity.ok(examService.getExamsByType(examType));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ExamDTO> getExamById(@PathVariable Long id) {
        return ResponseEntity.ok(examService.getExamById(id));
    }

    @PostMapping
    public ResponseEntity<ExamDTO> createExam(@Valid @RequestBody ExamDTO examDTO) {
        return new ResponseEntity<>(examService.createExam(examDTO), HttpStatus.CREATED);
    }

    @PutMapping("/{id}")
    public ResponseEntity<ExamDTO> updateExam(@PathVariable Long id, @Valid @RequestBody ExamDTO examDTO) {
        return ResponseEntity.ok(examService.updateExam(id, examDTO));
    }
}
