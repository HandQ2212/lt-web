package com.elc.system.modules.finance.dto;

import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.ZonedDateTime;
import java.util.UUID;

public class InvoiceDto {

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class InvoiceResponse {
        private UUID id;
        private UUID studentId;
        private String studentName;
        private String studentEmail;
        private UUID enrollmentId;
        private BigDecimal amount;
        private BigDecimal discountAmount;
        private BigDecimal totalAmount;
        private BigDecimal finalAmount;
        private BigDecimal paidAmount;
        private BigDecimal remainingBalance;
        private LocalDate dueDate;
        private String status;
        private String paymentMethod;
        private String notes;
        private ZonedDateTime createdAt;
        private ZonedDateTime updatedAt;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class CreateInvoiceRequest {
        private UUID studentId;
        private UUID enrollmentId;
        private BigDecimal amount;
        private BigDecimal discountAmount;
        private LocalDate dueDate;
        private String notes;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class DebtSummary {
        private long totalOverdue;
        private BigDecimal totalDebtAmount;
    }
}
