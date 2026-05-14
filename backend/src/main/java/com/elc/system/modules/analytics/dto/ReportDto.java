package com.elc.system.modules.analytics.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;

public class ReportDto {

    @Data
    @Builder
    @AllArgsConstructor
    @NoArgsConstructor
    public static class ExpenseReportDTO {
        private BigDecimal totalExpenses;
        private Map<String, BigDecimal> expensesByCategory;
        private Map<String, BigDecimal> expensesByMonth;
    }

    @Data
    @Builder
    @AllArgsConstructor
    @NoArgsConstructor
    public static class PLReportDTO {
        private BigDecimal totalRevenue;
        private BigDecimal totalExpenses;
        private BigDecimal netProfit;
        private double profitMargin;
    }

    @Data
    @Builder
    @AllArgsConstructor
    @NoArgsConstructor
    public static class ConversionReportDTO {
        private long totalLeads;
        private long totalStudents;
        private double conversionRate;
        private Map<String, Double> conversionBySource;
    }

    @Data
    @Builder
    @AllArgsConstructor
    @NoArgsConstructor
    public static class CourseReportDTO {
        private java.util.UUID courseId;
        private String courseName;
        private long totalEnrollments;
        private BigDecimal revenueGenerated;
        private double averageRating; // Optional based on data
    }

    @Data
    @Builder
    @AllArgsConstructor
    @NoArgsConstructor
    public static class ChurnReportDTO {
        private long totalActiveStudents;
        private long totalDroppedOutStudents;
        private double churnRate;
    }
}
