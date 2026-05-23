package com.elc.system.modules.lms.service;

import com.elc.system.modules.auth.entity.User;
import com.elc.system.modules.auth.entity.UserRole;
import com.elc.system.modules.lms.dto.CourseResultDto.CourseResultRequest;
import com.elc.system.modules.lms.dto.CourseResultDto.CourseResultResponse;
import com.elc.system.modules.lms.entity.CourseResult;
import com.elc.system.modules.lms.entity.Enrollment;
import com.elc.system.modules.lms.repository.CourseResultRepository;
import com.elc.system.modules.lms.repository.EnrollmentRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;

@Service
@RequiredArgsConstructor
public class CourseResultService {

    private final CourseResultRepository courseResultRepository;
    private final EnrollmentRepository enrollmentRepository;

    // ✅ SECURE: Added User parameter for access control check
    public CourseResultResponse getResultByEnrollment(UUID enrollmentId, User currentUser) {
        Enrollment enrollment = enrollmentRepository.findById(enrollmentId)
                .orElseThrow(() -> new RuntimeException("Enrollment not found"));

        // ✅ FIXED: Check if user has permission to view results for this enrollment
        if (currentUser.getRole() == UserRole.STUDENT) {
            if (!enrollment.getStudent().getId().equals(currentUser.getId())) {
                throw new AccessDeniedException("You can only view your own course results");
            }
        } else if (currentUser.getRole() == UserRole.TEACHER) {
            // Teachers can only view results for their own classes
            if (enrollment.getClazz().getTeacher() == null ||
                !enrollment.getClazz().getTeacher().getId().equals(currentUser.getId())) {
                throw new AccessDeniedException("You can only view course results for your own classes");
            }
        }
        // Managers can view all course results

        return courseResultRepository.findByEnrollmentId(enrollmentId)
                .map(this::mapToResponse)
                .orElseThrow(() -> new RuntimeException("Result not found"));
    }

    @Transactional
    public CourseResultResponse saveResult(CourseResultRequest request) {
        CourseResult result = courseResultRepository.findByEnrollmentId(request.getEnrollmentId())
                .orElse(null);

        if (result != null) {
            result.setMidtermScore(request.getMidtermScore());
            result.setFinalScore(request.getFinalScore());
            result.setOtherScores(request.getOtherScores());
            result.setFinalGrade(request.getFinalGrade());
            result.setComments(request.getComments());
        } else {
            Enrollment enrollment = enrollmentRepository.findById(request.getEnrollmentId())
                    .orElseThrow(() -> new RuntimeException("Enrollment not found"));

            result = CourseResult.builder()
                    .enrollment(enrollment)
                    .midtermScore(request.getMidtermScore())
                    .finalScore(request.getFinalScore())
                    .otherScores(request.getOtherScores())
                    .finalGrade(request.getFinalGrade())
                    .comments(request.getComments())
                    .build();
        }

        return mapToResponse(courseResultRepository.save(result));
    }

    private CourseResultResponse mapToResponse(CourseResult result) {
        return CourseResultResponse.builder()
                .id(result.getId())
                .enrollmentId(result.getEnrollment().getId())
                .studentName(result.getEnrollment().getStudent().getFullName())
                .className(result.getEnrollment().getClazz().getName())
                .midtermScore(result.getMidtermScore())
                .finalScore(result.getFinalScore())
                .otherScores(result.getOtherScores())
                .finalGrade(result.getFinalGrade())
                .comments(result.getComments())
                .build();
    }
}
