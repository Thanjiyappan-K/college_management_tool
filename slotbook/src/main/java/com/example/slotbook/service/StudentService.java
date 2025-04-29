package com.example.slotbook.service;


import com.example.slotbook.dto.StudentDTO;
import com.example.slotbook.entity.Student;
import com.example.slotbook.exception.ResourceNotFoundException;
import com.example.slotbook.repository.StudentRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import jakarta.transaction.Transactional;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class StudentService {

    @Autowired
    private StudentRepository studentRepository;

    public List<StudentDTO> getAllStudents() {
        return studentRepository.findAll().stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    public StudentDTO getStudentById(Long id) {
        Student student = studentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Student not found with id: " + id));
        return convertToDTO(student);
    }

    public StudentDTO getStudentByRegistrationNumber(String registrationNumber) {
        Student student = studentRepository.findByRegistrationNumber(registrationNumber)
                .orElseThrow(() -> new ResourceNotFoundException("Student not found with registration number: " + registrationNumber));
        return convertToDTO(student);
    }

    @Transactional
    public StudentDTO createStudent(StudentDTO studentDTO) {
        if (studentRepository.existsByRegistrationNumber(studentDTO.getRegistrationNumber())) {
            throw new IllegalArgumentException("Registration number already exists");
        }
        
        Student student = new Student();
        student.setName(studentDTO.getName());
        student.setRegistrationNumber(studentDTO.getRegistrationNumber());
        student.setDepartment(studentDTO.getDepartment());
        
        Student savedStudent = studentRepository.save(student);
        return convertToDTO(savedStudent);
    }

    @Transactional
    public StudentDTO updateStudent(Long id, StudentDTO studentDTO) {
        Student student = studentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Student not found with id: " + id));
        
        student.setName(studentDTO.getName());
        student.setDepartment(studentDTO.getDepartment());
        
        Student updatedStudent = studentRepository.save(student);
        return convertToDTO(updatedStudent);
    }

    @Transactional
    public void deleteStudent(Long id) {
        Student student = studentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Student not found with id: " + id));
        
        studentRepository.delete(student);
    }

    private StudentDTO convertToDTO(Student student) {
        StudentDTO dto = new StudentDTO();
        dto.setId(student.getId());
        dto.setName(student.getName());
        dto.setRegistrationNumber(student.getRegistrationNumber());
        dto.setDepartment(student.getDepartment());
        return dto;
    }
}
