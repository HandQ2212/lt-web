package com.elc.system.modules.lms.controller;

import com.elc.system.modules.lms.dto.ClassDto.ClassRequest;
import com.elc.system.modules.lms.dto.ClassDto.ClassResponse;
import com.elc.system.modules.lms.service.ClazzService;
import com.elc.system.modules.sms.dto.ClassScheduleDto.*;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/classes")
@RequiredArgsConstructor
public class ClazzController {

    private final ClazzService clazzService;

    @GetMapping
    public ResponseEntity<List<ClassResponse>> getAllClasses() {
        return ResponseEntity.ok(clazzService.getAllClasses());
    }

    @GetMapping("/{id}")
    public ResponseEntity<ClassResponse> getClassById(@PathVariable UUID id) {
        return ResponseEntity.ok(clazzService.getClassById(id));
    }

    @PostMapping
    public ResponseEntity<ClassResponse> createClass(@Valid @RequestBody ClassRequest request) {
        return ResponseEntity.ok(clazzService.createClass(request));
    }

    @GetMapping("/{id}/schedule")
    public ResponseEntity<List<ScheduleResponse>> getClassSchedules(@PathVariable UUID id) {
        return ResponseEntity.ok(clazzService.getClassSchedules(id));
    }

    @PostMapping("/{id}/schedule")
    public ResponseEntity<ScheduleResponse> addSchedule(
            @PathVariable UUID id, 
            @Valid @RequestBody ScheduleRequest request) {
        return ResponseEntity.ok(clazzService.addSchedule(id, request));
    }

    @PostMapping("/check-conflict")
    public ResponseEntity<ConflictCheckResponse> checkConflict(
            @Valid @RequestBody ConflictCheckRequest request) {
        return ResponseEntity.ok(clazzService.checkConflict(request));
    }
}
