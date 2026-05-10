package com.elc.system.modules.finance.service;

import com.elc.system.modules.auth.entity.User;
import com.elc.system.modules.auth.entity.UserRole;
import com.elc.system.modules.finance.dto.InvoiceDto.InvoiceRequest;
import com.elc.system.modules.finance.dto.InvoiceDto.InvoiceResponse;
import com.elc.system.modules.finance.entity.Invoice;
import com.elc.system.modules.finance.entity.InvoiceStatus;
import com.elc.system.modules.finance.repository.InvoiceRepository;
import com.elc.system.modules.finance.repository.PaymentRepository;
import com.elc.system.modules.lms.entity.Enrollment;
import com.elc.system.modules.lms.repository.EnrollmentRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class InvoiceService {

    private final InvoiceRepository invoiceRepository;
    private final PaymentRepository paymentRepository;
    private final EnrollmentRepository enrollmentRepository;
    private final com.elc.system.modules.finance.repository.ExpenseRepository expenseRepository;

    @Transactional(readOnly = true)
    public List<InvoiceResponse> getAllInvoices() {
        return invoiceRepository.findAll().stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public InvoiceResponse getInvoiceById(UUID id) {
        Invoice invoice = invoiceRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Invoice not found"));
        return mapToResponse(invoice);
    }

    @Transactional(readOnly = true)
    public List<InvoiceResponse> getInvoicesForUser(User user) {
        if (user.getRole() == UserRole.STUDENT || user.getRole() == UserRole.LEAD) {
            return invoiceRepository.findByStudentId(user.getId()).stream()
                    .map(this::mapToResponse)
                    .collect(Collectors.toList());
        }

        return getAllInvoices();
    }

    @Transactional
    public InvoiceResponse createInvoice(InvoiceRequest request) {
        Enrollment enrollment = enrollmentRepository.findById(request.getEnrollmentId())
                .orElseThrow(() -> new RuntimeException("Enrollment not found"));

        Invoice invoice = Invoice.builder()
                .enrollment(enrollment)
                .amount(request.getTotalAmount())
                .totalAmount(request.getTotalAmount())
                .discountAmount(request.getDiscountAmount())
                .finalAmount(request.getFinalAmount())
                .dueDate(request.getDueDate())
                .status(request.getStatus() != null ? request.getStatus() : InvoiceStatus.UNPAID)
                .build();

        return mapToResponse(invoiceRepository.save(invoice));
    }

    @Transactional
    public void updateStatus(UUID id, InvoiceStatus status) {
        Invoice invoice = invoiceRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Invoice not found"));
        invoice.setStatus(status);
        invoiceRepository.save(invoice);
    }

    @Transactional(readOnly = true)
    public List<InvoiceResponse> getDebtInvoices() {
        return invoiceRepository.findDebtInvoices().stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Transactional
    public InvoiceResponse processRefund(UUID id, com.elc.system.modules.finance.dto.InvoiceDto.RefundRequest request) {
        Invoice invoice = invoiceRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Invoice not found"));

        if (invoice.getStatus() == InvoiceStatus.REFUNDED) {
            throw new RuntimeException("Invoice is already refunded");
        }

        invoice.setStatus(InvoiceStatus.REFUNDED);
        invoiceRepository.save(invoice);

        com.elc.system.modules.finance.entity.Expense expense = com.elc.system.modules.finance.entity.Expense.builder()
                .category("Refund")
                .amount(request.getAmount())
                .expenseDate(java.time.LocalDate.now())
                .notes("Refund for Invoice ID: " + id + ". Reason: " + request.getReason())
                .build();
        expenseRepository.save(expense);

        return mapToResponse(invoice);
    }

    private InvoiceResponse mapToResponse(Invoice invoice) {
        java.math.BigDecimal paidAmount = paymentRepository.getTotalPaidByInvoiceId(invoice.getId());
        java.math.BigDecimal outstandingAmount = invoice.getFinalAmount().subtract(paidAmount);
        if (outstandingAmount.compareTo(java.math.BigDecimal.ZERO) < 0) {
            outstandingAmount = java.math.BigDecimal.ZERO;
        }

        return InvoiceResponse.builder()
                .id(invoice.getId())
                .enrollmentId(invoice.getEnrollment().getId())
                .studentName(invoice.getEnrollment().getStudent().getFullName())
                .className(invoice.getEnrollment().getClazz().getName())
                .totalAmount(invoice.getTotalAmount())
                .discountAmount(invoice.getDiscountAmount())
                .finalAmount(invoice.getFinalAmount())
                .paidAmount(paidAmount)
                .outstandingAmount(outstandingAmount)
                .dueDate(invoice.getDueDate())
                .status(invoice.getStatus())
                .createdAt(invoice.getCreatedAt())
                .build();
    }
}
