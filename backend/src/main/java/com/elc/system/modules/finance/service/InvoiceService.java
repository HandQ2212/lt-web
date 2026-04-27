package com.elc.system.modules.finance.service;

import com.elc.system.modules.auth.entity.User;
import com.elc.system.modules.auth.service.UserService;
import com.elc.system.modules.finance.dto.InvoiceDto.*;
import com.elc.system.modules.finance.entity.Invoice;
import com.elc.system.modules.finance.entity.InvoiceStatus;
import com.elc.system.modules.finance.repository.InvoiceRepository;
import com.elc.system.modules.notification.entity.NotificationType;
import com.elc.system.modules.notification.service.NotificationService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.UUID;

@Service
@Slf4j
@RequiredArgsConstructor
public class InvoiceService {

        private final InvoiceRepository invoiceRepository;
        private final UserService userService;
        private final NotificationService notificationService;

        /**
         * Auto-generate invoice when enrollment is approved.
         * Called by Enrollment module (DEV 3) via event or direct call.
         */
        @Transactional
        public InvoiceResponse generateInvoiceForEnrollment(UUID studentId, UUID enrollmentId,
                        BigDecimal coursePrice, BigDecimal discount) {
                BigDecimal discountAmount = discount != null ? discount : BigDecimal.ZERO;
                BigDecimal totalAmount = coursePrice.subtract(discountAmount);

                Invoice invoice = Invoice.builder()
                                .student(User.builder().build())
                                .enrollmentId(enrollmentId)
                                .amount(coursePrice)
                                .discountAmount(discountAmount)
                                .totalAmount(totalAmount)
                                .paidAmount(BigDecimal.ZERO)
                                .dueDate(LocalDate.now().plusDays(30))
                                .status(InvoiceStatus.PENDING)
                                .build();

                // Set student via reference to avoid loading full entity
                invoice.getStudent().setId(studentId);

                invoiceRepository.save(invoice);
                log.info("Invoice generated for enrollment {} - total: {}", enrollmentId, totalAmount);

                // Reload with student data
                invoice = invoiceRepository.findById(invoice.getId()).orElseThrow();
                return mapToResponse(invoice);
        }

        /**
         * Create invoice manually (by Accountant).
         */
        @Transactional
        public InvoiceResponse createInvoice(CreateInvoiceRequest request) {
                User student = userService.getUserById(request.getStudentId());

                BigDecimal discountAmount = request.getDiscountAmount() != null
                                ? request.getDiscountAmount()
                                : BigDecimal.ZERO;
                BigDecimal totalAmount = request.getAmount().subtract(discountAmount);

                Invoice invoice = Invoice.builder()
                                .student(student)
                                .enrollmentId(request.getEnrollmentId())
                                .amount(request.getAmount())
                                .discountAmount(discountAmount)
                                .totalAmount(totalAmount)
                                .paidAmount(BigDecimal.ZERO)
                                .dueDate(request.getDueDate())
                                .status(InvoiceStatus.PENDING)
                                .notes(request.getNotes())
                                .build();

                invoiceRepository.save(invoice);
                log.info("Invoice created manually for student {} - total: {}", student.getEmail(), totalAmount);

                notificationService.createNotification(
                                student,
                                "Hóa đơn mới",
                                String.format("Bạn có hóa đơn mới: %s VNĐ. Hạn thanh toán: %s",
                                                totalAmount.toPlainString(), request.getDueDate()),
                                NotificationType.PERSONAL);

                return mapToResponse(invoice);
        }

        @Transactional(readOnly = true)
        public Page<InvoiceResponse> getAllInvoices(Pageable pageable) {
                return invoiceRepository.findAll(pageable).map(this::mapToResponse);
        }

        @Transactional(readOnly = true)
        public Page<InvoiceResponse> getInvoicesByStatus(InvoiceStatus status, Pageable pageable) {
                return invoiceRepository.findByStatus(status, pageable).map(this::mapToResponse);
        }

        @Transactional(readOnly = true)
        public Page<InvoiceResponse> getMyInvoices(Pageable pageable) {
                User currentUser = userService.getCurrentUser();
                return invoiceRepository.findByStudentId(currentUser.getId(), pageable).map(this::mapToResponse);
        }

        @Transactional(readOnly = true)
        public InvoiceResponse getInvoiceById(UUID id) {
                Invoice invoice = invoiceRepository.findById(id)
                                .orElseThrow(() -> new RuntimeException("Invoice not found: " + id));
                return mapToResponse(invoice);
        }

        /**
         * Get overdue invoices (debt list).
         */
        @Transactional(readOnly = true)
        public Page<InvoiceResponse> getOverdueInvoices(Pageable pageable) {
                return invoiceRepository.findOverdueInvoices(LocalDate.now(), pageable).map(this::mapToResponse);
        }

        /**
         * Process refund for an invoice.
         */
        @Transactional
        public InvoiceResponse refundInvoice(UUID invoiceId, String reason) {
                Invoice invoice = invoiceRepository.findById(invoiceId)
                                .orElseThrow(() -> new RuntimeException("Invoice not found: " + invoiceId));

                if (invoice.getStatus() != InvoiceStatus.CONFIRMED) {
                        throw new IllegalStateException("Can only refund CONFIRMED invoices");
                }

                invoice.setStatus(InvoiceStatus.REFUNDED);
                invoice.setNotes("REFUND: " + reason);
                invoiceRepository.save(invoice);

                log.info("Invoice {} refunded. Reason: {}", invoiceId, reason);

                notificationService.createNotification(
                                invoice.getStudent(),
                                "Hoàn tiền thành công",
                                String.format("Hóa đơn %s đã được hoàn tiền. Lý do: %s",
                                                invoiceId, reason),
                                NotificationType.PERSONAL);

                return mapToResponse(invoice);
        }

        /**
         * Update paid amount and auto-confirm if fully paid.
         * Called by TransactionService after payment verification.
         */
        @Transactional
        public void updatePaidAmount(UUID invoiceId, BigDecimal additionalAmount) {
                Invoice invoice = invoiceRepository.findById(invoiceId)
                                .orElseThrow(() -> new RuntimeException("Invoice not found: " + invoiceId));

                BigDecimal newPaidAmount = invoice.getPaidAmount().add(additionalAmount);
                invoice.setPaidAmount(newPaidAmount);

                if (invoice.isFullyPaid()) {
                        invoice.setStatus(InvoiceStatus.CONFIRMED);
                        log.info("Invoice {} fully paid and confirmed", invoiceId);

                        notificationService.createNotification(
                                        invoice.getStudent(),
                                        "Thanh toán thành công",
                                        String.format("Hóa đơn %s đã được thanh toán đầy đủ. Cảm ơn bạn!",
                                                        invoiceId),
                                        NotificationType.PERSONAL);
                }

                invoiceRepository.save(invoice);
        }

        private InvoiceResponse mapToResponse(Invoice invoice) {
                User student = invoice.getStudent();
                return InvoiceResponse.builder()
                                .id(invoice.getId())
                                .studentId(student != null ? student.getId() : null)
                                .studentName(student != null ? student.getFullName() : null)
                                .studentEmail(student != null ? student.getEmail() : null)
                                .enrollmentId(invoice.getEnrollmentId())
                                .amount(invoice.getAmount())
                                .discountAmount(invoice.getDiscountAmount())
                                .totalAmount(invoice.getTotalAmount())
                                .paidAmount(invoice.getPaidAmount())
                                .remainingBalance(invoice.getRemainingBalance())
                                .dueDate(invoice.getDueDate())
                                .status(invoice.getStatus() != null ? invoice.getStatus().name() : "PENDING")
                                .paymentMethod(invoice.getPaymentMethod())
                                .notes(invoice.getNotes())
                                .createdAt(invoice.getCreatedAt())
                                .updatedAt(invoice.getUpdatedAt())
                                .build();
        }
}
