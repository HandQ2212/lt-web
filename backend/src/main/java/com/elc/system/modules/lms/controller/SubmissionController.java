package com.elc.system.modules.lms.controller;

import com.elc.system.modules.lms.dto.SubmissionDto.GradeRequest;
import com.elc.system.modules.lms.dto.SubmissionDto.SubmissionResponse;
import com.elc.system.modules.lms.service.SubmissionService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/api/submissions")
@RequiredArgsConstructor
public class SubmissionController {

    private final SubmissionService submissionService;

    @PutMapping("/{id}/grade")
    public ResponseEntity<SubmissionResponse> gradeSubmission(
            @PathVariable UUID id,
            @Valid @RequestBody GradeRequest request) {
        return ResponseEntity.ok(submissionService.gradeSubmission(id, request));
    }
}
