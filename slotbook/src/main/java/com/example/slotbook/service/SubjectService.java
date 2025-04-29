package com.example.slotbook.service;


import com.example.slotbook.dto.SubjectDTO;
import com.example.slotbook.entity.Subject;
import com.example.slotbook.exception.ResourceNotFoundException;
import com.example.slotbook.repository.SubjectRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import jakarta.transaction.Transactional;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class SubjectService {

    @Autowired
    private SubjectRepository subjectRepository;

    public List<SubjectDTO> getAllSubjects() {
        return subjectRepository.findAll().stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    public List<SubjectDTO> getSubjectsByGroup(String group) {
        return subjectRepository.findByGroup(group).stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    public SubjectDTO getSubjectById(Long id) {
        Subject subject = subjectRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Subject not found with id: " + id));
        return convertToDTO(subject);
    }

    @Transactional
    public SubjectDTO createSubject(SubjectDTO subjectDTO) {
        Subject subject = new Subject();
        subject.setCode(subjectDTO.getCode());
        subject.setName(subjectDTO.getName());
        subject.setGroup(subjectDTO.getGroup());
        
        Subject savedSubject = subjectRepository.save(subject);
        return convertToDTO(savedSubject);
    }

    @Transactional
    public void initializeSubjects(List<String> groupACourses, List<String> groupBCourses) {
        // Process Group A courses
        for (String course : groupACourses) {
            String[] parts = course.trim().split(" ", 2);
            if (parts.length >= 2) {
                String code = parts[0];
                String name = parts[1];
                
                if (!subjectRepository.findByCode(code).isPresent()) {
                    Subject subject = new Subject();
                    subject.setCode(code);
                    subject.setName(name);
                    subject.setGroup("A");
                    subjectRepository.save(subject);
                }
            }
        }
        
        // Process Group B courses
        for (String course : groupBCourses) {
            String[] parts = course.trim().split(" ", 2);
            if (parts.length >= 2) {
                String code = parts[0];
                String name = parts[1];
                
                if (!subjectRepository.findByCode(code).isPresent()) {
                    Subject subject = new Subject();
                    subject.setCode(code);
                    subject.setName(name);
                    subject.setGroup("B");
                    subjectRepository.save(subject);
                }
            }
        }
    }

    private SubjectDTO convertToDTO(Subject subject) {
        SubjectDTO dto = new SubjectDTO();
        dto.setId(subject.getId());
        dto.setCode(subject.getCode());
        dto.setName(subject.getName());
        dto.setGroup(subject.getGroup());
        return dto;
    }
}