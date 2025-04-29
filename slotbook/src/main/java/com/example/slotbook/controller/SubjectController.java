package com.example.slotbook.controller;


import com.example.slotbook.dto.SubjectDTO;
import com.example.slotbook.service.SubjectService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import javax.validation.Valid;
import java.util.List;

@RestController
@RequestMapping("/api/subjects")
@CrossOrigin(origins = "*")
public class SubjectController {

    @Autowired
    private SubjectService subjectService;

    @GetMapping
    public ResponseEntity<List<SubjectDTO>> getAllSubjects() {
        return ResponseEntity.ok(subjectService.getAllSubjects());
    }

    @GetMapping("/group/{group}")
    public ResponseEntity<List<SubjectDTO>> getSubjectsByGroup(@PathVariable String group) {
        return ResponseEntity.ok(subjectService.getSubjectsByGroup(group));
    }

    @GetMapping("/{id}")
    public ResponseEntity<SubjectDTO> getSubjectById(@PathVariable Long id) {
        return ResponseEntity.ok(subjectService.getSubjectById(id));
    }

    @PostMapping
    public ResponseEntity<SubjectDTO> createSubject(@Valid @RequestBody SubjectDTO subjectDTO) {
        return new ResponseEntity<>(subjectService.createSubject(subjectDTO), HttpStatus.CREATED);
    }
}
