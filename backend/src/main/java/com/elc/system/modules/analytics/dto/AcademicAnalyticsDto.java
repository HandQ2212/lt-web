package com.elc.system.modules.analytics.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.Map;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class AcademicAnalyticsDto {
    private double averageMidtermScore;
    private double averageFinalScore;
    private long totalCompletedEnrollments;
    private Map<String, Long> gradeDistribution; // e.g., "A" -> 10, "B" -> 20
    private double passRate;
}
