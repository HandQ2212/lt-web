package com.elc.system.modules.analytics.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.util.UUID;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class BranchAnalyticsDto {
    private UUID branchId;
    private String branchName;
    private long totalStudents;
    private long totalLeads;
    private long activeClasses;
    private BigDecimal totalRevenue;
    private double conversionRate; // Leads to Enrollments
}
