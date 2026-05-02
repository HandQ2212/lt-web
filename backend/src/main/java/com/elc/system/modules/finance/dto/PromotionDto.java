package com.elc.system.modules.finance.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.UUID;

public class PromotionDto {

    @Data
    @Builder
    @AllArgsConstructor
    @NoArgsConstructor
    public static class PromotionResponse {
        private UUID id;
        private String code;
        private String type;
        private BigDecimal amount;
        private BigDecimal minPurchase;
        private LocalDate expiryDate;
        private Integer usageLimit;
        private Integer usageCount;
        private Boolean isActive;
    }
}
