package com.elc.system.modules.finance.dto;

import com.elc.system.modules.finance.entity.PaymentMethod;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.ZonedDateTime;
import java.util.UUID;

public class PaymentDto {

    @Data
    @Builder
    @AllArgsConstructor
    @NoArgsConstructor
    public static class PaymentRequest {
        private UUID invoiceId;
        private BigDecimal amount;
        private ZonedDateTime paymentDate;
        private PaymentMethod paymentMethod;
        private String transactionId;
        private String notes;
    }

    @Data
    @Builder
    @AllArgsConstructor
    @NoArgsConstructor
    public static class PaymentResponse {
        private UUID id;
        private UUID invoiceId;
        private BigDecimal amount;
        private ZonedDateTime paymentDate;
        private PaymentMethod paymentMethod;
        private String transactionId;
        private String notes;
    }
}
