package com.elc.system.modules.finance.service;

import com.elc.system.modules.finance.dto.InvoiceDto.InvoiceRequest;
import com.elc.system.modules.finance.dto.InvoiceDto.InvoiceResponse;
import com.elc.system.modules.finance.entity.Invoice;
import com.elc.system.modules.finance.entity.InvoiceStatus;
import com.elc.system.modules.finance.repository.InvoiceRepository;
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
    private final EnrollmentRepository enrollmentRepository;

    public List<InvoiceResponse> getAllInvoices() {
        return invoiceRepository.findAll().stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    public List<InvoiceResponse> getInvoicesByStudent(UUID studentId) {
        return invoiceRepository.findAll().stream()
                .filter(invoice -> invoice.getEnrollment().getStudent().getId().equals(studentId))
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Transactional
    public InvoiceResponse createInvoice(InvoiceRequest request) {
        Enrollment enrollment = enrollmentRepository.findById(request.getEnrollmentId())
                .orElseThrow(() -> new RuntimeException("Enrollment not found"));

        Invoice invoice = Invoice.builder()
                .enrollment(enrollment)
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

    private InvoiceResponse mapToResponse(Invoice invoice) {
        return InvoiceResponse.builder()
                .id(invoice.getId())
                .enrollmentId(invoice.getEnrollment().getId())
                .studentName(invoice.getEnrollment().getStudent().getFullName())
                .className(invoice.getEnrollment().getClazz().getName())
                .totalAmount(invoice.getTotalAmount())
                .discountAmount(invoice.getDiscountAmount())
                .finalAmount(invoice.getFinalAmount())
                .dueDate(invoice.getDueDate())
                .status(invoice.getStatus())
                .createdAt(invoice.getCreatedAt())
                .build();
    }
}
