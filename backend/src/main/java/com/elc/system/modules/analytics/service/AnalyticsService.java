package com.elc.system.modules.analytics.service;

import com.elc.system.modules.analytics.dto.AcademicAnalyticsDto;
import com.elc.system.modules.analytics.dto.BranchAnalyticsDto;
import com.elc.system.modules.analytics.dto.DashboardDto;
import com.elc.system.modules.analytics.dto.RevenueAnalyticsDto;
import com.elc.system.modules.lead.repository.LeadRepository;
import com.elc.system.modules.finance.entity.Invoice;
import com.elc.system.modules.finance.entity.Payment;
import com.elc.system.modules.finance.repository.InvoiceRepository;
import com.elc.system.modules.finance.repository.PaymentRepository;
import com.elc.system.modules.lms.entity.ClassStatus;
import com.elc.system.modules.lms.repository.ClazzRepository;
import com.elc.system.modules.lms.repository.EnrollmentRepository;
import com.elc.system.modules.sms.entity.Branch;
import com.elc.system.modules.sms.repository.BranchRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class AnalyticsService {

    private final BranchRepository branchRepository;
    private final LeadRepository leadRepository;
    private final EnrollmentRepository enrollmentRepository;
    private final ClazzRepository clazzRepository;
    private final PaymentRepository paymentRepository;

    private final InvoiceRepository invoiceRepository;
    private final com.elc.system.modules.lms.repository.CourseResultRepository courseResultRepository;

    private final com.elc.system.modules.auth.repository.UserRepository userRepository;
    private final com.elc.system.modules.lms.repository.AttendanceRepository attendanceRepository;

    public List<BranchAnalyticsDto> getBranchPerformance() {
        return branchRepository.findAll().stream()
                .map(this::calculateBranchMetrics)
                .collect(Collectors.toList());
    }

    @org.springframework.transaction.annotation.Transactional(readOnly = true)
    public DashboardDto getDashboardOverview() {
        long totalStudents = enrollmentRepository.count();
        long totalLeads = leadRepository.count();
        long totalClasses = clazzRepository.count();
        long totalTeachers = userRepository.findAll().stream()
                .filter(u -> u.getRole() == com.elc.system.modules.auth.entity.UserRole.TEACHER)
                .count();

        BigDecimal totalRevenue = paymentRepository.getTotalRevenue();
        BigDecimal totalInvoiced = invoiceRepository.getTotalInvoicedAmount();

        BigDecimal outstandingBalance = totalInvoiced.subtract(totalRevenue);

        long presentCount = attendanceRepository.countByStatus(com.elc.system.modules.lms.entity.AttendanceStatus.PRESENT);
        long totalAttendance = attendanceRepository.countTotal();
        double avgAttendance = totalAttendance == 0 ? 0.0 : (double) presentCount / totalAttendance;

        return DashboardDto.builder()
                .totalStudents(totalStudents)
                .totalLeads(totalLeads)
                .totalTeachers(totalTeachers)
                .totalClasses(totalClasses)
                .totalRevenue(totalRevenue)
                .outstandingBalance(outstandingBalance)
                .averageAttendanceRate(avgAttendance)
                .build();
    }

    @org.springframework.transaction.annotation.Transactional(readOnly = true)
    public AcademicAnalyticsDto getAcademicReport() {
        Double avgMidterm = courseResultRepository.getAverageMidtermScore();
        Double avgFinal = courseResultRepository.getAverageFinalScore();

        Map<String, Long> gradeDist = new java.util.HashMap<>();
        for (Object[] row : courseResultRepository.getGradeDistribution()) {
            gradeDist.put((String) row[0], ((Number) row[1]).longValue());
        }

        long totalPass = courseResultRepository.countPass();
        long totalCompleted = courseResultRepository.countTotalGraded();

        double passRate = totalCompleted == 0 ? 0.0 : (double) totalPass / totalCompleted;

        return AcademicAnalyticsDto.builder()
                .averageMidtermScore(avgMidterm != null ? avgMidterm : 0.0)
                .averageFinalScore(avgFinal != null ? avgFinal : 0.0)
                .totalCompletedEnrollments((int) totalCompleted)
                .gradeDistribution(gradeDist)
                .passRate(passRate)
                .build();
    }

    @org.springframework.transaction.annotation.Transactional(readOnly = true)
    public RevenueAnalyticsDto getRevenueReport() {
        BigDecimal totalRevenue = paymentRepository.getTotalRevenue();
        BigDecimal totalInvoiced = invoiceRepository.getTotalInvoicedAmount();
        BigDecimal pendingRevenue = totalInvoiced.subtract(totalRevenue);

        Map<String, BigDecimal> revenueByMonth = new java.util.HashMap<>();
        for (Object[] row : paymentRepository.getRevenueByMonth()) {
            revenueByMonth.put((String) row[0], (BigDecimal) row[1]);
        }

        Map<com.elc.system.modules.finance.entity.PaymentMethod, BigDecimal> revenueByMethod = new java.util.HashMap<>();
        for (Object[] row : paymentRepository.getRevenueByMethod()) {
            revenueByMethod.put((com.elc.system.modules.finance.entity.PaymentMethod) row[0], (BigDecimal) row[1]);
        }

        return RevenueAnalyticsDto.builder()
                .totalRevenue(totalRevenue)
                .pendingRevenue(pendingRevenue)
                .revenueByMonth(revenueByMonth)
                .revenueByMethod(revenueByMethod)
                .build();
    }

    private BranchAnalyticsDto calculateBranchMetrics(Branch branch) {
        UUID branchId = branch.getId();

        long totalLeads = leadRepository.count(); // Simplified: assuming all leads are branch-agnostic for now or adding filter if needed
        long totalStudents = enrollmentRepository.countByClazzBranchId(branchId);

        long activeClasses = clazzRepository.countByBranchIdAndStatus(branchId, ClassStatus.ONGOING);

        BigDecimal totalRevenue = paymentRepository.getTotalRevenueByBranchId(branchId);

        double conversionRate = totalLeads > 0 ? (double) totalStudents / totalLeads : 0;

        return BranchAnalyticsDto.builder()
                .branchId(branchId)
                .branchName(branch.getName())
                .totalStudents(totalStudents)
                .totalLeads(totalLeads)
                .activeClasses(activeClasses)
                .totalRevenue(totalRevenue)
                .conversionRate(conversionRate)
                .build();
    }
}
