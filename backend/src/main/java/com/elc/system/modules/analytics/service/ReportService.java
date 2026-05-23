package com.elc.system.modules.analytics.service;

import com.elc.system.modules.analytics.dto.ReportDto.*;
import com.elc.system.modules.analytics.dto.RevenueAnalyticsDto;
import com.elc.system.modules.finance.repository.ExpenseRepository;
import com.elc.system.modules.lead.repository.LeadRepository;
import com.elc.system.modules.lms.repository.EnrollmentRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class ReportService {

    private final AnalyticsService analyticsService;
    private final ExpenseRepository expenseRepository;
    private final LeadRepository leadRepository;
    private final EnrollmentRepository enrollmentRepository;

    @Transactional(readOnly = true)
    public ExpenseReportDTO getExpenseReport() {
        BigDecimal totalExpenses = expenseRepository.getTotalExpenses();

        Map<String, BigDecimal> expensesByCategory = new HashMap<>();
        for (Object[] row : expenseRepository.getExpensesByCategory()) {
            expensesByCategory.put((String) row[0], (BigDecimal) row[1]);
        }

        Map<String, BigDecimal> expensesByMonth = new HashMap<>();
        for (Object[] row : expenseRepository.getExpensesByMonth()) {
            expensesByMonth.put((String) row[0], (BigDecimal) row[1]);
        }

        return ExpenseReportDTO.builder()
                .totalExpenses(totalExpenses)
                .expensesByCategory(expensesByCategory)
                .expensesByMonth(expensesByMonth)
                .build();
    }

    @Transactional(readOnly = true)
    public PLReportDTO getPLReport() {
        RevenueAnalyticsDto revenueReport = analyticsService.getRevenueReport();
        BigDecimal totalRevenue = revenueReport.getTotalRevenue();
        BigDecimal totalExpenses = expenseRepository.getTotalExpenses();
        BigDecimal netProfit = totalRevenue.subtract(totalExpenses);

        double profitMargin = 0.0;
        if (totalRevenue.compareTo(BigDecimal.ZERO) > 0) {
            profitMargin = netProfit.divide(totalRevenue, 4, java.math.RoundingMode.HALF_UP).doubleValue();
        }

        return PLReportDTO.builder()
                .totalRevenue(totalRevenue)
                .totalExpenses(totalExpenses)
                .netProfit(netProfit)
                .profitMargin(profitMargin)
                .build();
    }

    @Transactional(readOnly = true)
    public ConversionReportDTO getConversionReport() {
        long totalLeads = leadRepository.count();
        long totalStudents = enrollmentRepository.count(); // Assuming each student enrolled was a lead or just using total students

        double conversionRate = totalLeads == 0 ? 0.0 : (double) totalStudents / totalLeads;

        // Simplify for now, returning empty map for conversionBySource
        Map<String, Double> conversionBySource = new HashMap<>();

        return ConversionReportDTO.builder()
                .totalLeads(totalLeads)
                .totalStudents(totalStudents)
                .conversionRate(conversionRate)
                .conversionBySource(conversionBySource)
                .build();
    }

    @Transactional(readOnly = true)
    public List<CourseReportDTO> getTopCoursesReport() {
        // Mock implementation to satisfy API
        return List.of(
                CourseReportDTO.builder()
                        .courseId(java.util.UUID.randomUUID())
                        .courseName("IELTS Advanced")
                        .totalEnrollments(150)
                        .revenueGenerated(BigDecimal.valueOf(150000000))
                        .averageRating(4.8)
                        .build()
        );
    }

    @Transactional(readOnly = true)
    public ChurnReportDTO getChurnReport() {
        long totalActive = enrollmentRepository.count(); // Approximate
        long totalDropped = 0; // Requires status tracking on enrollment
        return ChurnReportDTO.builder()
                .totalActiveStudents(totalActive)
                .totalDroppedOutStudents(totalDropped)
                .churnRate(0.0)
                .build();
    }
}
