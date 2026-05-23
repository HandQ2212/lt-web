package com.elc.system.modules.analytics.dto;

import com.elc.system.modules.finance.entity.PaymentMethod;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.util.Map;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class RevenueAnalyticsDto {
    private BigDecimal totalRevenue;
    private BigDecimal pendingRevenue; // Unpaid invoices total
    private Map<String, BigDecimal> revenueByMonth; // e.g., "2024-04" -> 5000.00
    private Map<PaymentMethod, BigDecimal> revenueByMethod;
}
