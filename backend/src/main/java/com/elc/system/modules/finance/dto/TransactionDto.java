package com.elc.system.modules.finance.dto;

import com.elc.system.modules.finance.entity.TransactionMethod;
import com.elc.system.modules.finance.entity.TransactionType;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotNull;
import lombok.*;

import java.math.BigDecimal;
import java.time.ZonedDateTime;
import java.util.UUID;

public class TransactionDto {

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class TransactionResponse {
        private UUID id;
        private UUID invoiceId;
        private UUID studentId;
        private String studentName;
        private UUID staffId;
        private String staffName;
        private BigDecimal amount;
        private String type;
        private String method;
        private String description;
        private String status;
        private String externalRef;
        private ZonedDateTime createdAt;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class CreateTransactionRequest {
        @NotNull(message = "Invoice ID is required")
        private UUID invoiceId;

        @NotNull(message = "Amount is required")
        @DecimalMin(value = "0.01", message = "Amount must be greater than 0")
        private BigDecimal amount;

        @NotNull(message = "Payment method is required")
        private TransactionMethod method;

        private String description;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class PaymentUrlResponse {
        private String paymentUrl;
        private String orderId;
        private String provider;
    }
}
