package com.elc.system.modules.lms.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.time.ZonedDateTime;
import java.util.UUID;

public class AssignmentDto {

    @Data
    @Builder
    @AllArgsConstructor
    @NoArgsConstructor
    public static class AssignmentRequest {
        @NotNull(message = "Class ID is required")
        private UUID classId;

        @NotBlank(message = "Title is required")
        private String title;

        private String description;

        @NotNull(message = "Due date is required")
        private ZonedDateTime dueDate;

        private String fileUrl;

        private String externalLink;
    }

    @Data
    @Builder
    @AllArgsConstructor
    @NoArgsConstructor
    public static class AssignmentResponse {
        private UUID id;
        private UUID classId;
        private String className;
        private String title;
        private String description;
        private ZonedDateTime dueDate;
        private String fileUrl;
        private String externalLink;
        private UUID createdById;
        private String createdByName;
        private ZonedDateTime createdAt;
    }
}
