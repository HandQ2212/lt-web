package com.elc.system.modules.lms.service;

import com.elc.system.modules.auth.entity.User;
import com.elc.system.modules.lms.dto.SubmissionDto.GradeRequest;
import com.elc.system.modules.lms.dto.SubmissionDto.SubmissionRequest;
import com.elc.system.modules.lms.dto.SubmissionDto.SubmissionResponse;
import com.elc.system.modules.lms.entity.Assignment;
import com.elc.system.modules.lms.entity.Submission;
import com.elc.system.modules.lms.repository.AssignmentRepository;
import com.elc.system.modules.lms.repository.SubmissionRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.ZonedDateTime;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class SubmissionService {

    private final SubmissionRepository submissionRepository;
    private final AssignmentRepository assignmentRepository;

    public List<SubmissionResponse> getSubmissionsByAssignment(UUID assignmentId) {
        return submissionRepository.findByAssignmentId(assignmentId).stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Transactional
    public SubmissionResponse submitWork(SubmissionRequest request, User student) {
        Assignment assignment = assignmentRepository.findById(request.getAssignmentId())
                .orElseThrow(() -> new RuntimeException("Assignment not found"));

        Submission submission = Submission.builder()
                .assignment(assignment)
                .student(student)
                .submissionDate(ZonedDateTime.now())
                .fileUrl(request.getFileUrl())
                .content(request.getContent())
                .status("SUBMITTED")
                .build();

        return mapToResponse(submissionRepository.save(submission));
    }

    @Transactional
    public SubmissionResponse gradeSubmission(UUID submissionId, GradeRequest request) {
        Submission submission = submissionRepository.findById(submissionId)
                .orElseThrow(() -> new RuntimeException("Submission not found"));

        submission.setGrade(request.getGrade());
        submission.setFeedback(request.getFeedback());
        submission.setStatus("GRADED");

        return mapToResponse(submissionRepository.save(submission));
    }

    private SubmissionResponse mapToResponse(Submission submission) {
        return SubmissionResponse.builder()
                .id(submission.getId())
                .assignmentId(submission.getAssignment().getId())
                .assignmentTitle(submission.getAssignment().getTitle())
                .studentId(submission.getStudent().getId())
                .studentName(submission.getStudent().getFullName())
                .submissionDate(submission.getSubmissionDate())
                .fileUrl(submission.getFileUrl())
                .content(submission.getContent())
                .grade(submission.getGrade())
                .feedback(submission.getFeedback())
                .status(submission.getStatus())
                .build();
    }
}
