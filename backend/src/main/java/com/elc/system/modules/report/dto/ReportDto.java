package com.elc.system.modules.report.dto;

import lombok.*;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;

public class ReportDto {

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class RevenueReport {
        private BigDecimal totalRevenue;
        private BigDecimal totalCourseFees;
        private String period;
        private Map<String, BigDecimal> revenueByMonth;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ExpenseReport {
        private BigDecimal totalExpenses;
        private Map<String, BigDecimal> expensesByCategory;
        private String period;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ProfitReport {
        private BigDecimal totalRevenue;
        private BigDecimal totalExpenses;
        private BigDecimal totalSalary;
        private BigDecimal netProfit;
        private String period;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ConversionReport {
        private long totalLeads;
        private long convertedLeads;
        private double conversionRate;
        private String period;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class CourseRevenueItem {
        private String courseName;
        private String level;
        private long enrollmentCount;
        private BigDecimal totalRevenue;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ChurnReport {
        private long totalActiveStudents;
        private long droppedStudents;
        private double churnRate;
        private String period;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class DashboardSummary {
        private BigDecimal revenueThisMonth;
        private BigDecimal revenuePreviousMonth;
        private double revenueGrowthPercent;
        private long newStudentsThisMonth;
        private BigDecimal totalDebt;
        private long pendingInvoices;
        private long activeClasses;
        private List<AlertItem> alerts;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class AlertItem {
        private String type;
        private String message;
        private String severity;
    }
}
