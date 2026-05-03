package com.elc.system.modules.lms.controller;

import com.elc.system.modules.lms.dto.CourseResultDto.*;
import com.elc.system.modules.lms.service.CourseResultService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/api/results")
@RequiredArgsConstructor
public class CourseResultController {

    private final CourseResultService courseResultService;

    @GetMapping("/enrollment/{enrollmentId}")
    public ResponseEntity<CourseResultResponse> getResultByEnrollment(@PathVariable UUID enrollmentId) {
        return ResponseEntity.ok(courseResultService.getResultByEnrollment(enrollmentId));
    }

    @PostMapping
    public ResponseEntity<CourseResultResponse> saveResult(@Valid @RequestBody CourseResultRequest request) {
        return ResponseEntity.ok(courseResultService.saveResult(request));
    }
}
