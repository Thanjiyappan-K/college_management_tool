package com.example.slotbook.controller;


import com.example.slotbook.dto.TimeSlotDTO;
import com.example.slotbook.service.TimeSlotService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import javax.validation.Valid;
import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/timeslots")
@CrossOrigin(origins = "*")
public class TimeSlotController {

    @Autowired
    private TimeSlotService timeSlotService;

    @GetMapping
    public ResponseEntity<List<TimeSlotDTO>> getAllTimeSlots() {
        return ResponseEntity.ok(timeSlotService.getAllTimeSlots());
    }

    @GetMapping("/exam-type/{examType}")
    public ResponseEntity<List<TimeSlotDTO>> getTimeSlotsByExamType(@PathVariable String examType) {
        return ResponseEntity.ok(timeSlotService.getTimeSlotsByExamType(examType));
    }

    @GetMapping("/date-range")
    public ResponseEntity<List<TimeSlotDTO>> getTimeSlotsByDateRange(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate,
            @RequestParam String examType) {
        return ResponseEntity.ok(timeSlotService.getTimeSlotsByDateRange(startDate, endDate, examType));
    }

    @GetMapping("/{id}")
    public ResponseEntity<TimeSlotDTO> getTimeSlotById(@PathVariable Long id) {
        return ResponseEntity.ok(timeSlotService.getTimeSlotById(id));
    }

    @PostMapping
    public ResponseEntity<TimeSlotDTO> createTimeSlot(@Valid @RequestBody TimeSlotDTO timeSlotDTO) {
        return new ResponseEntity<>(timeSlotService.createTimeSlot(timeSlotDTO), HttpStatus.CREATED);
    }
}
