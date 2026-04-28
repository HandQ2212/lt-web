package com.elc.system.modules.lms.service;

import com.elc.system.modules.auth.entity.User;
import com.elc.system.modules.lms.dto.SubmissionDto.*;
import com.elc.system.modules.lms.entity.Assignment;
import com.elc.system.modules.lms.entity.Submission;
import com.elc.system.modules.lms.entity.SubmissionStatus;
import com.elc.system.modules.lms.repository.AssignmentRepository;
import com.elc.system.modules.lms.repository.SubmissionRepository;
import com.elc.system.modules.notification.entity.NotificationType;
import com.elc.system.modules.notification.service.NotificationService;
import lombok.RequiredArgsConstructor;
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
    private final NotificationService notificationService;

    public List<SubmissionResponse> getSubmissionsByAssignment(UUID assignmentId) {
        return submissionRepository.findByAssignmentId(assignmentId).stream()
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

    @Transactional
    public SubmissionResponse gradeSubmission(UUID submissionId, GradeRequest request) {
        Submission submission = submissionRepository.findById(submissionId)
                .orElseThrow(() -> new RuntimeException("Submission not found"));

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
