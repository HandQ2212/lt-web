package com.elc.system.modules.lms.service;

import com.elc.system.modules.auth.entity.User;
import com.elc.system.modules.auth.entity.UserRole;
import com.elc.system.modules.lms.dto.SubmissionDto.*;
import com.elc.system.modules.lms.entity.Assignment;
import com.elc.system.modules.lms.entity.Submission;
import com.elc.system.modules.lms.entity.SubmissionStatus;
import com.elc.system.modules.lms.repository.AssignmentRepository;
import com.elc.system.modules.lms.repository.SubmissionRepository;
import com.elc.system.modules.lms.repository.EnrollmentRepository;
import com.elc.system.modules.notification.entity.NotificationType;
import com.elc.system.modules.notification.service.NotificationService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.ZonedDateTime;
import java.time.temporal.ChronoUnit;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class SubmissionService {

    private final SubmissionRepository submissionRepository;
    private final AssignmentRepository assignmentRepository;
    private final EnrollmentRepository enrollmentRepository; // ✅ FIXED: Added for student enrollment check
    private final NotificationService notificationService;

    // ✅ SECURE: Added User parameter for access control check
    @Transactional(readOnly = true)
    public List<SubmissionResponse> getSubmissionsByAssignment(UUID assignmentId, User currentUser) {
        Assignment assignment = assignmentRepository.findById(assignmentId)
                .orElseThrow(() -> new RuntimeException("Assignment not found"));

        // ✅ FIXED: Check if user has permission to view submissions for this assignment
        if (currentUser.getRole() == UserRole.TEACHER) {
            if (assignment.getClazz().getTeacher() == null ||
                !assignment.getClazz().getTeacher().getId().equals(currentUser.getId())) {
                throw new AccessDeniedException("You can only view submissions for assignments in your own classes");
            }
        } else if (currentUser.getRole() == UserRole.STUDENT) {
            // Students can only view submissions for assignments in their enrolled classes
            if (!enrollmentRepository.existsByStudentIdAndClazzId(currentUser.getId(), assignment.getClazz().getId())) {
                throw new AccessDeniedException("You can only view submissions for your enrolled classes");
            }
        }
        // Managers can view all submissions

        return submissionRepository.findByAssignmentId(assignmentId).stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<SubmissionResponse> getSubmissionsByStudent(UUID studentId) {
        return submissionRepository.findByStudentId(studentId).stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Transactional
    public SubmissionResponse submitWork(SubmissionRequest request, User student) {
        Assignment assignment = assignmentRepository.findById(request.getAssignmentId())
                .orElseThrow(() -> new RuntimeException("Assignment not found"));

        ZonedDateTime submissionDate = ZonedDateTime.now();

        // Calculate if submission is late
        boolean isLate = submissionDate.isAfter(assignment.getDueDate());
        long lateMinutes = 0L;
        if (isLate) {
            lateMinutes = ChronoUnit.MINUTES.between(assignment.getDueDate(), submissionDate);
        }

        Submission submission = Submission.builder()
                .assignment(assignment)
                .student(student)
                .submissionDate(submissionDate)
                .fileUrl(request.getFileUrl())
                .content(request.getContent())
                .status(SubmissionStatus.SUBMITTED)
                .isLate(isLate)
                .lateMinutes(lateMinutes)
                .build();

        return mapToResponse(submissionRepository.save(submission));
    }

    // ✅ SECURE: Added teacher parameter for authorization check
    @Transactional
    public SubmissionResponse gradeSubmission(UUID submissionId, GradeRequest request, User teacher) {
        Submission submission = submissionRepository.findById(submissionId)
                .orElseThrow(() -> new RuntimeException("Submission not found"));

        // ✅ FIXED: Check if teacher has permission to grade this submission
        if (teacher.getRole() == UserRole.TEACHER) {
            Assignment assignment = submission.getAssignment();
            if (assignment.getClazz().getTeacher() == null ||
                !assignment.getClazz().getTeacher().getId().equals(teacher.getId())) {
                throw new AccessDeniedException("You can only grade submissions for assignments in your own classes");
            }
        }
        // Managers can grade any submission

        submission.setGrade(request.getGrade());
        submission.setFeedback(request.getFeedback());
        submission.setStatus(SubmissionStatus.GRADED);

        Submission savedSubmission = submissionRepository.save(submission);

        // Create notification for student
        User student = submission.getStudent();
        String title = "Grade Published: " + submission.getAssignment().getTitle();
        String message = String.format(
                "Your submission for '%s' has been graded. Grade: %.2f/10.0%s",
                submission.getAssignment().getTitle(),
                request.getGrade(),
                request.getFeedback() != null && !request.getFeedback().isBlank()
                        ? "\nFeedback: " + request.getFeedback()
                        : ""
        );

        notificationService.createNotification(student, title, message, NotificationType.GRADE_PUBLISHED);

        return mapToResponse(savedSubmission);
    }

    private SubmissionResponse mapToResponse(Submission submission) {
        return SubmissionResponse.builder()
                .id(submission.getId())
                .assignmentId(submission.getAssignment().getId())
                .assignmentTitle(submission.getAssignment().getTitle())
                .studentId(submission.getStudent().getId())
                .studentName(submission.getStudent().getFullName())
                .submissionDate(submission.getSubmissionDate())
                .dueDate(submission.getAssignment().getDueDate())
                .fileUrl(submission.getFileUrl())
                .content(submission.getContent())
                .grade(submission.getGrade())
                .feedback(submission.getFeedback())
                .status(submission.getStatus())
                .isLate(submission.getIsLate())
                .lateMinutes(submission.getLateMinutes())
                .build();
    }
}
