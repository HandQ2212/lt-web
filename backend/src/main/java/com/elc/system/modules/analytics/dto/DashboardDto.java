package com.elc.system.modules.analytics.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class DashboardDto {
    private long totalStudents;
    private long totalLeads;
    private long totalTeachers;
    private long totalClasses;
    private BigDecimal totalRevenue;
    private BigDecimal outstandingBalance;
    private double averageAttendanceRate;
}
