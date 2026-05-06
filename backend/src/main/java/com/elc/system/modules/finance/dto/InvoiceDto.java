package com.elc.system.modules.finance.dto;

import com.elc.system.modules.finance.entity.InvoiceStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.ZonedDateTime;
import java.util.UUID;

public class InvoiceDto {

    @Data
    @Builder
    @AllArgsConstructor
    @NoArgsConstructor
    public static class InvoiceRequest {
        private UUID enrollmentId;
        private BigDecimal totalAmount;
        private BigDecimal discountAmount;
        private BigDecimal finalAmount;
        private LocalDate dueDate;
        private InvoiceStatus status;
    }

    @Data
    @Builder
    @AllArgsConstructor
    @NoArgsConstructor
    public static class InvoiceResponse {
        private UUID id;
        private UUID enrollmentId;
        private String studentName;
        private String className;
        private BigDecimal totalAmount;
        private BigDecimal discountAmount;
        private BigDecimal finalAmount;
        private BigDecimal paidAmount;
        private BigDecimal outstandingAmount;
        private LocalDate dueDate;
        private InvoiceStatus status;
        private ZonedDateTime createdAt;
    }

    @Data
    @Builder
    @AllArgsConstructor
    @NoArgsConstructor
    public static class RefundRequest {
        @jakarta.validation.constraints.NotNull(message = "Refund amount is required")
        private BigDecimal amount;
        private String reason;
    }
}
