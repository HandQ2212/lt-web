package com.elc.system.modules.school.course.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.ZonedDateTime;
import java.util.UUID;

public class LevelDto {

    @Data
    @Builder
    @AllArgsConstructor
    @NoArgsConstructor
    public static class CreateLevelRequest {
        @NotBlank(message = "Level code is required")
        @Size(max = 50, message = "Level code must not exceed 50 characters")
        private String code;

        @NotBlank(message = "Level name is required")
        @Size(max = 255, message = "Level name must not exceed 255 characters")
        private String name;

        private String description;

        private Integer displayOrder;

        private Boolean active;
    }

    @Data
    @Builder
    @AllArgsConstructor
    @NoArgsConstructor
    public static class UpdateLevelRequest {
        @NotBlank(message = "Level code is required")
        @Size(max = 50, message = "Level code must not exceed 50 characters")
        private String code;

        @NotBlank(message = "Level name is required")
        @Size(max = 255, message = "Level name must not exceed 255 characters")
        private String name;

        private String description;

        private Integer displayOrder;

        private Boolean active;
    }

    @Data
    @Builder
    @AllArgsConstructor
    @NoArgsConstructor
    public static class LevelResponse {
        private UUID id;
        private String code;
        private String name;
        private String description;
        private Integer displayOrder;
        private boolean active;
        private ZonedDateTime createdAt;
        private ZonedDateTime updatedAt;
    }
}
