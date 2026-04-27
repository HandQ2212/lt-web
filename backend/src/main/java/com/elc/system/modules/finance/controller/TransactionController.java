package com.elc.system.modules.finance.controller;

import com.elc.system.modules.finance.dto.TransactionDto.*;
import com.elc.system.modules.finance.service.TransactionService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/api/transactions")
@RequiredArgsConstructor
public class TransactionController {

    private final TransactionService transactionService;

    /** Record a new payment (Accountant) */
    @PostMapping
    @PreAuthorize("hasAnyRole('ACCOUNTANT', 'MANAGER')")
    public ResponseEntity<TransactionResponse> recordPayment(
            @Valid @RequestBody CreateTransactionRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(transactionService.recordPayment(request));
    }

    /** Verify/confirm a pending transaction (Accountant) */
    @PutMapping("/{id}/verify")
    @PreAuthorize("hasAnyRole('ACCOUNTANT', 'MANAGER')")
    public ResponseEntity<TransactionResponse> verifyTransaction(@PathVariable UUID id) {
        return ResponseEntity.ok(transactionService.verifyTransaction(id));
    }

    /** List all transactions (Accountant/Manager) */
    @GetMapping
    @PreAuthorize("hasAnyRole('ACCOUNTANT', 'MANAGER')")
    public ResponseEntity<Page<TransactionResponse>> getAllTransactions(Pageable pageable) {
        return ResponseEntity.ok(transactionService.getAllTransactions(pageable));
    }

    /** Get transactions by student */
    @GetMapping("/student/{studentId}")
    @PreAuthorize("hasAnyRole('ACCOUNTANT', 'MANAGER')")
    public ResponseEntity<Page<TransactionResponse>> getTransactionsByStudent(
            @PathVariable UUID studentId, Pageable pageable) {
        return ResponseEntity.ok(transactionService.getTransactionsByStudent(studentId, pageable));
    }
}
