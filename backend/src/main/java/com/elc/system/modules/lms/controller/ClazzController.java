package com.elc.system.modules.lms.controller;

import com.elc.system.modules.lms.dto.ClassDto.ClassRequest;
import com.elc.system.modules.lms.dto.ClassDto.ClassResponse;
import com.elc.system.modules.lms.service.ClazzService;
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
}
