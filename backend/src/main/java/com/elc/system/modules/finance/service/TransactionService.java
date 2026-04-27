package com.elc.system.modules.finance.service;

import com.elc.system.modules.auth.entity.User;
import com.elc.system.modules.auth.service.UserService;
import com.elc.system.modules.finance.dto.TransactionDto.*;
import com.elc.system.modules.finance.entity.*;
import com.elc.system.modules.finance.repository.InvoiceRepository;
import com.elc.system.modules.finance.repository.TransactionRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.UUID;

@Service
@Slf4j
@RequiredArgsConstructor
public class TransactionService {

    private final TransactionRepository transactionRepository;
    private final InvoiceRepository invoiceRepository;
    private final InvoiceService invoiceService;
    private final UserService userService;

    /**
     * Record a new payment transaction (by Accountant or via webhook).
     */
    @Transactional
    public TransactionResponse recordPayment(CreateTransactionRequest request) {
        User staff = userService.getCurrentUser();
        Invoice invoice = invoiceRepository.findById(request.getInvoiceId())
                .orElseThrow(() -> new RuntimeException("Invoice not found: " + request.getInvoiceId()));

        // Validate: cannot pay more than remaining balance
        BigDecimal remaining = invoice.getRemainingBalance();
        if (request.getAmount().compareTo(remaining) > 0) {
            throw new IllegalArgumentException(
                    String.format("Payment amount %s exceeds remaining balance %s",
                            request.getAmount(), remaining));
        }

        Transaction transaction = Transaction.builder()
                .invoice(invoice)
                .student(invoice.getStudent())
                .staff(staff)
                .amount(request.getAmount())
                .type(TransactionType.COURSE_FEE)
                .method(request.getMethod())
                .description(request.getDescription())
                .status(TransactionStatus.PENDING)
                .build();

        transactionRepository.save(transaction);
        log.info("Transaction {} recorded for invoice {} - amount: {}",
                transaction.getId(), invoice.getId(), request.getAmount());

        return mapToResponse(transaction);
    }

    /**
     * Verify/confirm a pending transaction (by Accountant).
     * Auto-updates invoice paid amount.
     */
    @Transactional
    public TransactionResponse verifyTransaction(UUID transactionId) {
        Transaction transaction = transactionRepository.findById(transactionId)
                .orElseThrow(() -> new RuntimeException("Transaction not found: " + transactionId));

        if (transaction.getStatus() != TransactionStatus.PENDING) {
            throw new IllegalStateException("Can only verify PENDING transactions");
        }

        transaction.setStatus(TransactionStatus.CONFIRMED);
        transactionRepository.save(transaction);

        // Auto-update invoice paid amount
        invoiceService.updatePaidAmount(transaction.getInvoice().getId(), transaction.getAmount());

        log.info("Transaction {} verified and confirmed", transactionId);
        return mapToResponse(transaction);
    }

    /**
     * Handle payment gateway callback (VNPay IPN / MoMo webhook).
     * Looks up transaction by external reference and confirms it.
     */
    @Transactional
    public void handlePaymentCallback(String externalRef, boolean success) {
        Transaction transaction = transactionRepository.findByExternalRef(externalRef);
        if (transaction == null) {
            log.warn("No transaction found for external ref: {}", externalRef);
            return;
        }

        if (success) {
            transaction.setStatus(TransactionStatus.CONFIRMED);
            transactionRepository.save(transaction);
            invoiceService.updatePaidAmount(transaction.getInvoice().getId(), transaction.getAmount());
            log.info("Payment callback SUCCESS for ref: {}", externalRef);
        } else {
            transaction.setStatus(TransactionStatus.FAILED);
            transactionRepository.save(transaction);
            log.warn("Payment callback FAILED for ref: {}", externalRef);
        }
    }

    /**
     * Create a transaction from payment gateway (with external ref).
     */
    @Transactional
    public Transaction createGatewayTransaction(UUID invoiceId, BigDecimal amount,
            TransactionMethod method, String externalRef) {
        Invoice invoice = invoiceRepository.findById(invoiceId)
                .orElseThrow(() -> new RuntimeException("Invoice not found: " + invoiceId));

        Transaction transaction = Transaction.builder()
                .invoice(invoice)
                .student(invoice.getStudent())
                .amount(amount)
                .type(TransactionType.COURSE_FEE)
                .method(method)
                .status(TransactionStatus.PENDING)
                .externalRef(externalRef)
                .build();

        transactionRepository.save(transaction);
        log.info("Gateway transaction created for invoice {} with ref: {}", invoiceId, externalRef);
        return transaction;
    }

    public Page<TransactionResponse> getAllTransactions(Pageable pageable) {
        return transactionRepository.findAll(pageable).map(this::mapToResponse);
    }

    public Page<TransactionResponse> getTransactionsByStudent(UUID studentId, Pageable pageable) {
        return transactionRepository.findByStudentId(studentId, pageable).map(this::mapToResponse);
    }

    private TransactionResponse mapToResponse(Transaction transaction) {
        User student = transaction.getStudent();
        User staff = transaction.getStaff();
        return TransactionResponse.builder()
                .id(transaction.getId())
                .invoiceId(transaction.getInvoice() != null ? transaction.getInvoice().getId() : null)
                .studentId(student != null ? student.getId() : null)
                .studentName(student != null ? student.getFullName() : null)
                .staffId(staff != null ? staff.getId() : null)
                .staffName(staff != null ? staff.getFullName() : null)
                .amount(transaction.getAmount())
                .type(transaction.getType().name())
                .method(transaction.getMethod().name())
                .description(transaction.getDescription())
                .status(transaction.getStatus().name())
                .externalRef(transaction.getExternalRef())
                .createdAt(transaction.getCreatedAt())
                .build();
    }
}
