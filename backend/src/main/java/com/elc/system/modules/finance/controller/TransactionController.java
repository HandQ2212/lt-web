package com.elc.system.modules.finance.controller;

import com.elc.system.modules.finance.dto.PaymentDto.PaymentRequest;
import com.elc.system.modules.finance.dto.PaymentDto.PaymentResponse;
import com.elc.system.modules.finance.service.PaymentService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/transactions")
@RequiredArgsConstructor
public class TransactionController {

    private final PaymentService paymentService;

    @GetMapping
    @PreAuthorize("hasAnyRole('ACCOUNTANT', 'MANAGER')")
    public ResponseEntity<List<PaymentResponse>> getAllTransactions() {
        return ResponseEntity.ok(paymentService.getAllPayments());
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('ACCOUNTANT', 'MANAGER')")
    public ResponseEntity<PaymentResponse> createTransaction(@Valid @RequestBody PaymentRequest request) {
        return ResponseEntity.ok(paymentService.createPayment(request));
    }
}
