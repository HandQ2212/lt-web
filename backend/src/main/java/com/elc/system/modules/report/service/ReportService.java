package com.elc.system.modules.report.service;

import com.elc.system.modules.expense.repository.ExpenseRepository;
import com.elc.system.modules.finance.entity.InvoiceStatus;
import com.elc.system.modules.finance.entity.TransactionType;
import com.elc.system.modules.finance.repository.InvoiceRepository;
import com.elc.system.modules.finance.repository.TransactionRepository;
import com.elc.system.modules.payroll.service.PayrollService;
import com.elc.system.modules.report.dto.ReportDto.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.*;
import java.util.*;

@Service
@Slf4j
@RequiredArgsConstructor
public class ReportService {

    private final TransactionRepository transactionRepository;
    private final InvoiceRepository invoiceRepository;
    private final ExpenseRepository expenseRepository;
    private final PayrollService payrollService;

    /** Revenue report with monthly breakdown */
    public RevenueReport getRevenueReport(int year, Integer month) {
        ZonedDateTime start;
        ZonedDateTime end;
        String period;

        if (month != null) {
            start = ZonedDateTime.of(year, month, 1, 0, 0, 0, 0, ZoneId.systemDefault());
            end = start.plusMonths(1).minusNanos(1);
            period = String.format("%d-%02d", year, month);
        } else {
            start = ZonedDateTime.of(year, 1, 1, 0, 0, 0, 0, ZoneId.systemDefault());
            end = start.plusYears(1).minusNanos(1);
            period = String.valueOf(year);
        }

        BigDecimal totalCourseFees = transactionRepository.sumByTypeAndDateRange(
                TransactionType.COURSE_FEE, start, end);

        // Monthly breakdown
        Map<String, BigDecimal> revenueByMonth = new LinkedHashMap<>();
        ZonedDateTime monthStart = start;
        while (monthStart.isBefore(end)) {
            ZonedDateTime monthEnd = monthStart.plusMonths(1).minusNanos(1);
            if (monthEnd.isAfter(end)) monthEnd = end;
            BigDecimal monthRevenue = transactionRepository.sumByTypeAndDateRange(
                    TransactionType.COURSE_FEE, monthStart, monthEnd);
            revenueByMonth.put(monthStart.getMonth().name(), monthRevenue);
            monthStart = monthStart.plusMonths(1);
        }

        return RevenueReport.builder()
                .totalRevenue(totalCourseFees)
                .totalCourseFees(totalCourseFees)
                .period(period)
                .revenueByMonth(revenueByMonth)
                .build();
    }

    /** Expense report with category breakdown */
    public ExpenseReport getExpenseReport(int year, Integer month) {
        ZonedDateTime start;
        ZonedDateTime end;
        String period;

        if (month != null) {
            start = ZonedDateTime.of(year, month, 1, 0, 0, 0, 0, ZoneId.systemDefault());
            end = start.plusMonths(1).minusNanos(1);
            period = String.format("%d-%02d", year, month);
        } else {
            start = ZonedDateTime.of(year, 1, 1, 0, 0, 0, 0, ZoneId.systemDefault());
            end = start.plusYears(1).minusNanos(1);
            period = String.valueOf(year);
        }

        BigDecimal totalExpenses = expenseRepository.sumApprovedExpenses(start, end);
        List<Object[]> categoryBreakdown = expenseRepository.sumByCategory(start, end);

        Map<String, BigDecimal> byCategory = new LinkedHashMap<>();
        for (Object[] row : categoryBreakdown) {
            byCategory.put((String) row[0], (BigDecimal) row[1]);
        }

        return ExpenseReport.builder()
                .totalExpenses(totalExpenses)
                .expensesByCategory(byCategory)
                .period(period)
                .build();
    }

    /** Net profit = Revenue - Expenses - Salary */
    public ProfitReport getProfitReport(int year, int month) {
        RevenueReport revenue = getRevenueReport(year, month);
        ExpenseReport expenses = getExpenseReport(year, month);

        var payrollSummary = payrollService.calculateMonthlyPayroll(month, year);
        BigDecimal totalSalary = payrollSummary.getTotalSalaryCost();

        BigDecimal netProfit = revenue.getTotalRevenue()
                .subtract(expenses.getTotalExpenses())
                .subtract(totalSalary);

        return ProfitReport.builder()
                .totalRevenue(revenue.getTotalRevenue())
                .totalExpenses(expenses.getTotalExpenses())
                .totalSalary(totalSalary)
                .netProfit(netProfit)
                .period(String.format("%d-%02d", year, month))
                .build();
    }

    /** Manager dashboard with KPIs */
    public DashboardSummary getDashboard() {
        ZonedDateTime now = ZonedDateTime.now();
        ZonedDateTime thisMonthStart = now.withDayOfMonth(1).withHour(0).withMinute(0).withSecond(0).withNano(0);
        ZonedDateTime lastMonthStart = thisMonthStart.minusMonths(1);

        BigDecimal revenueThisMonth = transactionRepository.sumByTypeAndDateRange(
                TransactionType.COURSE_FEE, thisMonthStart, now);
        BigDecimal revenuePreviousMonth = transactionRepository.sumByTypeAndDateRange(
                TransactionType.COURSE_FEE, lastMonthStart, thisMonthStart.minusNanos(1));

        double growthPercent = 0;
        if (revenuePreviousMonth.compareTo(BigDecimal.ZERO) > 0) {
            growthPercent = revenueThisMonth.subtract(revenuePreviousMonth)
                    .divide(revenuePreviousMonth, 4, RoundingMode.HALF_UP)
                    .multiply(BigDecimal.valueOf(100)).doubleValue();
        }

        long pendingInvoices = invoiceRepository.findAll().stream()
                .filter(i -> i.getStatus() == InvoiceStatus.PENDING).count();

        BigDecimal totalDebt = invoiceRepository.findAll().stream()
                .filter(i -> i.getStatus() == InvoiceStatus.PENDING)
                .map(i -> i.getRemainingBalance())
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        // Alerts
        List<AlertItem> alerts = new ArrayList<>();
        if (pendingInvoices > 10) {
            alerts.add(AlertItem.builder()
                    .type("DEBT").message(pendingInvoices + " hóa đơn chưa thanh toán").severity("WARNING")
                    .build());
        }

        return DashboardSummary.builder()
                .revenueThisMonth(revenueThisMonth)
                .revenuePreviousMonth(revenuePreviousMonth)
                .revenueGrowthPercent(growthPercent)
                .totalDebt(totalDebt)
                .pendingInvoices(pendingInvoices)
                .alerts(alerts)
                .build();
    }
}
