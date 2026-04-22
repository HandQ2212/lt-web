package com.elc.system.modules.analytics.service;

import com.elc.system.modules.analytics.dto.BranchAnalyticsDto;
import com.elc.system.modules.crm.repository.LeadRepository;
import com.elc.system.modules.finance.entity.Payment;
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

    public List<BranchAnalyticsDto> getBranchPerformance() {
        return branchRepository.findAll().stream()
                .map(this::calculateBranchMetrics)
                .collect(Collectors.toList());
    }

    private BranchAnalyticsDto calculateBranchMetrics(Branch branch) {
        UUID branchId = branch.getId();

        long totalLeads = leadRepository.count(); // Simplified: assuming all leads are branch-agnostic for now or adding filter if needed
        long totalStudents = enrollmentRepository.findAll().stream()
                .filter(e -> e.getClazz().getBranch().getId().equals(branchId))
                .count();

        long activeClasses = clazzRepository.findByBranchId(branchId).stream()
                .filter(c -> c.getStatus() == ClassStatus.ONGOING)
                .count();

        BigDecimal totalRevenue = paymentRepository.findAll().stream()
                .filter(p -> p.getInvoice().getEnrollment().getClazz().getBranch().getId().equals(branchId))
                .map(Payment::getAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

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
