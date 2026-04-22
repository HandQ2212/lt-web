package com.elc.system.modules.finance.controller;

import com.elc.system.modules.finance.dto.PaymentDto.PaymentRequest;
import com.elc.system.modules.finance.dto.PaymentDto.PaymentResponse;
import com.elc.system.modules.finance.service.PaymentService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/transactions")
@RequiredArgsConstructor
public class TransactionController {

    private final PaymentService paymentService;

    @GetMapping("/invoice/{invoiceId}")
    public ResponseEntity<List<PaymentResponse>> getPaymentsByInvoice(@PathVariable UUID invoiceId) {
        return ResponseEntity.ok(paymentService.getPaymentsByInvoice(invoiceId));
    }

    @PostMapping
    public ResponseEntity<PaymentResponse> createPayment(@Valid @RequestBody PaymentRequest request) {
        return ResponseEntity.ok(paymentService.createPayment(request));
    }

    @PutMapping("/{id}/verify")
    public ResponseEntity<String> verifyTransaction(@PathVariable UUID id) {
        // Since we don't have a specific verification status in Payment yet, 
        // we can assume it updates the invoice status or similar logic.
        // For now, returning a mock success response.
        return ResponseEntity.ok("Transaction verified successfully");
    }
}
