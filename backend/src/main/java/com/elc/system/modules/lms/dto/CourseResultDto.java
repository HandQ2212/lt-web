package com.elc.system.modules.lms.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.util.UUID;

public class CourseResultDto {

    @Data
    @Builder
    @AllArgsConstructor
    @NoArgsConstructor
    public static class CourseResultRequest {
        private UUID enrollmentId;
        private BigDecimal midtermScore;
        private BigDecimal finalScore;
        private String otherScores;
        private String finalGrade;
        private String comments;
    }

    @Data
    @Builder
    @AllArgsConstructor
    @NoArgsConstructor
    public static class CourseResultResponse {
        private UUID id;
        private UUID enrollmentId;
        private String studentName;
        private String className;
        private BigDecimal midtermScore;
        private BigDecimal finalScore;
        private String otherScores;
        private String finalGrade;
        private String comments;
    }
}
