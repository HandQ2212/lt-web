package com.elc.system.modules.finance.service;

import com.elc.system.modules.auth.entity.User;
import com.elc.system.modules.auth.entity.UserRole;
import com.elc.system.modules.finance.dto.PaymentDto.PaymentRequest;
import com.elc.system.modules.finance.dto.PaymentDto.PaymentResponse;
import com.elc.system.modules.finance.entity.Invoice;
import com.elc.system.modules.finance.entity.InvoiceStatus;
import com.elc.system.modules.finance.entity.Payment;
import com.elc.system.modules.finance.repository.InvoiceRepository;
import com.elc.system.modules.finance.repository.PaymentRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.ZonedDateTime;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class PaymentService {

    private final PaymentRepository paymentRepository;
    private final InvoiceRepository invoiceRepository;

    @Transactional(readOnly = true)
    public List<PaymentResponse> getAllPayments() {
        return paymentRepository.findAll().stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<PaymentResponse> getPaymentsByInvoice(UUID invoiceId) {
        return paymentRepository.findByInvoiceId(invoiceId).stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<PaymentResponse> getPaymentsByInvoice(UUID invoiceId, User user) {
        Invoice invoice = invoiceRepository.findById(invoiceId)
                .orElseThrow(() -> new RuntimeException("Invoice not found"));
        assertCanAccessInvoice(invoice, user);

        return paymentRepository.findByInvoiceId(invoiceId).stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Transactional
    public PaymentResponse createPayment(PaymentRequest request) {
        Invoice invoice = invoiceRepository.findById(request.getInvoiceId())
                .orElseThrow(() -> new RuntimeException("Invoice not found"));

        Payment payment = Payment.builder()
                .invoice(invoice)
                .amount(request.getAmount())
                .paymentDate(request.getPaymentDate() != null ? request.getPaymentDate() : ZonedDateTime.now())
                .paymentMethod(request.getPaymentMethod())
                .transactionId(request.getTransactionId())
                .notes(request.getNotes())
                .build();

        Payment savedPayment = paymentRepository.save(payment);

        // Update Invoice status based on total payments
        updateInvoiceStatus(invoice);

        return mapToResponse(savedPayment);
    }

    @Transactional
    public PaymentResponse createPayment(PaymentRequest request, User user) {
        Invoice invoice = invoiceRepository.findById(request.getInvoiceId())
                .orElseThrow(() -> new RuntimeException("Invoice not found"));
        assertCanAccessInvoice(invoice, user);

        Payment payment = Payment.builder()
                .invoice(invoice)
                .amount(request.getAmount())
                .paymentDate(request.getPaymentDate() != null ? request.getPaymentDate() : ZonedDateTime.now())
                .paymentMethod(request.getPaymentMethod())
                .transactionId(request.getTransactionId())
                .notes(request.getNotes())
                .build();

        Payment savedPayment = paymentRepository.save(payment);
        updateInvoiceStatus(invoice);

        return mapToResponse(savedPayment);
    }

    private void assertCanAccessInvoice(Invoice invoice, User user) {
        if (user.getRole() == UserRole.MANAGER || user.getRole() == UserRole.ACCOUNTANT) {
            return;
        }

        if (user.getRole() == UserRole.STUDENT
                && invoice.getEnrollment().getStudent().getId().equals(user.getId())) {
            return;
        }

        throw new AccessDeniedException("You do not have permission to access this invoice");
    }

    private void updateInvoiceStatus(Invoice invoice) {
        BigDecimal totalPaid = paymentRepository.findByInvoiceId(invoice.getId()).stream()
                .map(Payment::getAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        if (totalPaid.compareTo(invoice.getFinalAmount()) >= 0) {
            invoice.setStatus(InvoiceStatus.PAID);
        } else if (totalPaid.compareTo(BigDecimal.ZERO) > 0) {
            invoice.setStatus(InvoiceStatus.PARTIAL);
        } else {
            invoice.setStatus(InvoiceStatus.UNPAID);
        }
        invoiceRepository.save(invoice);
    }

    private PaymentResponse mapToResponse(Payment payment) {
        return PaymentResponse.builder()
                .id(payment.getId())
                .invoiceId(payment.getInvoice().getId())
                .amount(payment.getAmount())
                .paymentDate(payment.getPaymentDate())
                .paymentMethod(payment.getPaymentMethod())
                .transactionId(payment.getTransactionId())
                .notes(payment.getNotes())
                .build();
    }
}
