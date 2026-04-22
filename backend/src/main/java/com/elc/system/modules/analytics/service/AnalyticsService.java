package com.elc.system.modules.analytics.service;

import com.elc.system.modules.analytics.dto.BranchAnalyticsDto;
import com.elc.system.modules.analytics.dto.RevenueAnalyticsDto;
import com.elc.system.modules.crm.repository.LeadRepository;
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

    public List<BranchAnalyticsDto> getBranchPerformance() {
        return branchRepository.findAll().stream()
                .map(this::calculateBranchMetrics)
                .collect(Collectors.toList());
    }

    public RevenueAnalyticsDto getRevenueReport() {
        List<Payment> allPayments = paymentRepository.findAll();
        List<Invoice> allInvoices = invoiceRepository.findAll();

        BigDecimal totalRevenue = allPayments.stream()
                .map(Payment::getAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        BigDecimal pendingRevenue = allInvoices.stream()
                .filter(i -> i.getStatus() != com.elc.system.modules.finance.entity.InvoiceStatus.PAID)
                .map(i -> i.getFinalAmount().subtract(getPaidAmount(i, allPayments)))
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        Map<String, BigDecimal> revenueByMonth = allPayments.stream()
                .collect(Collectors.groupingBy(
                        p -> p.getPaymentDate().getYear() + "-" + String.format("%02d", p.getPaymentDate().getMonthValue()),
                        Collectors.mapping(Payment::getAmount, Collectors.reducing(BigDecimal.ZERO, BigDecimal::add))
                ));

        Map<com.elc.system.modules.finance.entity.PaymentMethod, BigDecimal> revenueByMethod = allPayments.stream()
                .collect(Collectors.groupingBy(
                        Payment::getPaymentMethod,
                        Collectors.mapping(Payment::getAmount, Collectors.reducing(BigDecimal.ZERO, BigDecimal::add))
                ));

        return RevenueAnalyticsDto.builder()
                .totalRevenue(totalRevenue)
                .pendingRevenue(pendingRevenue)
                .revenueByMonth(revenueByMonth)
                .revenueByMethod(revenueByMethod)
                .build();
    }

    private BigDecimal getPaidAmount(Invoice invoice, List<Payment> payments) {
        return payments.stream()
                .filter(p -> p.getInvoice().getId().equals(invoice.getId()))
                .map(Payment::getAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
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
