package com.elc.system.modules.lms.controller;

import com.elc.system.modules.auth.entity.User;
import com.elc.system.modules.lms.dto.CourseResultDto.*;
import com.elc.system.modules.lms.service.CourseResultService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/api/results")
@RequiredArgsConstructor
public class CourseResultController {

    private final CourseResultService courseResultService;

    // ✅ SECURE: Added @PreAuthorize and @AuthenticationPrincipal for access control
    @GetMapping("/enrollment/{enrollmentId}")
    @PreAuthorize("hasAnyRole('MANAGER', 'TEACHER', 'STUDENT')")
    public ResponseEntity<CourseResultResponse> getResultByEnrollment(
            @PathVariable UUID enrollmentId,
            @AuthenticationPrincipal User currentUser
    ) {
        return ResponseEntity.ok(courseResultService.getResultByEnrollment(enrollmentId, currentUser));
        // ✅ FIXED: Service layer now checks if user has permission to view results for this enrollment
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('MANAGER', 'TEACHER')")
    public ResponseEntity<CourseResultResponse> saveResult(@Valid @RequestBody CourseResultRequest request) {
        return ResponseEntity.ok(courseResultService.saveResult(request));
    }
}
