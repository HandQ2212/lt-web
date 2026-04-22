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
@RequestMapping("/api/payments")
@RequiredArgsConstructor
public class PaymentController {

    private final PaymentService paymentService;

    @GetMapping("/invoice/{invoiceId}")
    public ResponseEntity<List<PaymentResponse>> getPaymentsByInvoice(@PathVariable UUID invoiceId) {
        return ResponseEntity.ok(paymentService.getPaymentsByInvoice(invoiceId));
    }

    @PostMapping
    public ResponseEntity<PaymentResponse> createPayment(@Valid @RequestBody PaymentRequest request) {
        return ResponseEntity.ok(paymentService.createPayment(request));
    }
}
