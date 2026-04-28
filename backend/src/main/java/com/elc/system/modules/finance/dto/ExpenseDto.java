package com.elc.system.modules.finance.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.UUID;

public class ExpenseDto {

    @Data
    @Builder
    @AllArgsConstructor
    @NoArgsConstructor
    public static class ExpenseRequest {
        @NotBlank(message = "Category is required")
        private String category;

        @NotNull(message = "Amount is required")
        private BigDecimal amount;

        private LocalDate expenseDate;
        private String vendor;
        private String receiptUrl;
        private String notes;
    }

    @Data
    @Builder
    @AllArgsConstructor
    @NoArgsConstructor
    public static class ExpenseResponse {
        private UUID id;
        private String category;
        private BigDecimal amount;
        private LocalDate expenseDate;
        private String vendor;
        private String receiptUrl;
        private UUID approvedById;
        private String approvedByName;
        private String notes;
    }
}
