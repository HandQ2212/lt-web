package com.elc.system.modules.payroll.dto;

import com.elc.system.modules.payroll.entity.AdjustmentType;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.ZonedDateTime;
import java.util.List;
import java.util.UUID;

public class PayrollDto {

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class PayrollResponse {
        private UUID teacherId;
        private String teacherName;
        private String teacherEmail;
        private int totalSessions;
        private BigDecimal ratePerSession;
        private BigDecimal baseSalary;
        private BigDecimal totalBonuses;
        private BigDecimal totalPenalties;
        private BigDecimal netSalary;
        private int month;
        private int year;
        private List<AdjustmentResponse> adjustments;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class PayrollSummary {
        private int month;
        private int year;
        private int totalTeachers;
        private BigDecimal totalSalaryCost;
        private List<PayrollResponse> payrollDetails;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class AdjustmentResponse {
        private UUID id;
        private String type;
        private BigDecimal amount;
        private String reason;
        private LocalDate effectiveDate;
        private String approvedByName;
        private ZonedDateTime createdAt;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class CreateAdjustmentRequest {
        @NotNull(message = "User ID is required")
        private UUID userId;

        @NotNull(message = "Adjustment type is required")
        private AdjustmentType type;

        @NotNull(message = "Amount is required")
        @DecimalMin(value = "0.01", message = "Amount must be positive")
        private BigDecimal amount;

        @NotBlank(message = "Reason is required")
        private String reason;

        private LocalDate effectiveDate;
    }
}
