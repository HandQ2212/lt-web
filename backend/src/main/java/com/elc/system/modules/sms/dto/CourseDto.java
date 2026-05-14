package com.elc.system.modules.sms.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;

public class CourseDto {

    @Data
    @Builder
    @AllArgsConstructor
    @NoArgsConstructor
    public static class CourseRequest {
        private String name;
        private String description;
    }

    @Data
    @Builder
    @AllArgsConstructor
    @NoArgsConstructor
    public static class CourseResponse {
        private UUID id;
        private String name;
        private String description;
        private List<CourseLevelSummary> levels;
    }

    @Data
    @Builder
    @AllArgsConstructor
    @NoArgsConstructor
    public static class CourseLevelSummary {
        private UUID id;
        private String code;
        private String name;
        private BigDecimal basePrice;
        private Integer durationWeeks;
    }
}
