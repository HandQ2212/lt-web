package com.elc.system.modules.school.course.dto;

import com.elc.system.modules.school.course.entity.CourseStatus;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.ZonedDateTime;
import java.util.UUID;

public class CourseDto {

    @Data
    @Builder
    @AllArgsConstructor
    @NoArgsConstructor
    public static class CreateCourseRequest {
        @NotBlank(message = "Course name is required")
        @Size(max = 255, message = "Course name must not exceed 255 characters")
        private String name;

        private String description;

        @NotNull(message = "Level id is required")
        private UUID levelId;

        @NotNull(message = "Duration weeks is required")
        @Positive(message = "Duration weeks must be greater than 0")
        private Integer durationWeeks;

        @NotNull(message = "Base price is required")
        @DecimalMin(value = "0.0", inclusive = true, message = "Base price must be greater than or equal to 0")
        private BigDecimal basePrice;

        @Positive(message = "Max students must be greater than 0")
        private Integer maxStudents;

        private String curriculumUrl;

        @NotNull(message = "Status is required")
        private CourseStatus status;
    }

    @Data
    @Builder
    @AllArgsConstructor
    @NoArgsConstructor
    public static class UpdateCourseRequest {
        @NotBlank(message = "Course name is required")
        @Size(max = 255, message = "Course name must not exceed 255 characters")
        private String name;

        private String description;

        @NotNull(message = "Level id is required")
        private UUID levelId;

        @NotNull(message = "Duration weeks is required")
        @Positive(message = "Duration weeks must be greater than 0")
        private Integer durationWeeks;

        @NotNull(message = "Base price is required")
        @DecimalMin(value = "0.0", inclusive = true, message = "Base price must be greater than or equal to 0")
        private BigDecimal basePrice;

        @Positive(message = "Max students must be greater than 0")
        private Integer maxStudents;

        private String curriculumUrl;

        @NotNull(message = "Status is required")
        private CourseStatus status;
    }

    @Data
    @Builder
    @AllArgsConstructor
    @NoArgsConstructor
    public static class CourseResponse {
        private UUID id;
        private String name;
        private String description;
        private UUID levelId;
        private String levelCode;
        private String levelName;
        private Integer durationWeeks;
        private BigDecimal basePrice;
        private Integer maxStudents;
        private String curriculumUrl;
        private CourseStatus status;
        private ZonedDateTime createdAt;
        private ZonedDateTime updatedAt;
    }
}
