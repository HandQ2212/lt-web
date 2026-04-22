package com.elc.system.modules.lms.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import jakarta.validation.constraints.NotNull;
import java.time.ZonedDateTime;
import java.util.UUID;

public class SubmissionDto {

    @Data
    @Builder
    @AllArgsConstructor
    @NoArgsConstructor
    public static class SubmissionRequest {
        @NotNull(message = "Assignment ID is required")
        private UUID assignmentId;

        private String fileUrl;
        private String content;
    }

    @Data
    @Builder
    @AllArgsConstructor
    @NoArgsConstructor
    public static class GradeRequest {
        @NotNull(message = "Grade is required")
        private Double grade;

        private String feedback;
    }

    @Data
    @Builder
    @AllArgsConstructor
    @NoArgsConstructor
    public static class SubmissionResponse {
        private UUID id;
        private UUID assignmentId;
        private String assignmentTitle;
        private UUID studentId;
        private String studentName;
        private ZonedDateTime submissionDate;
        private String fileUrl;
        private String content;
        private Double grade;
        private String feedback;
        private String status;
    }
}
