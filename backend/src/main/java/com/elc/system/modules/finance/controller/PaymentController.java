package com.elc.system.modules.finance.controller;

import com.elc.system.modules.auth.entity.User;
import com.elc.system.modules.finance.dto.PaymentDto.PaymentRequest;
import com.elc.system.modules.finance.dto.PaymentDto.PaymentResponse;
import com.elc.system.modules.finance.service.PaymentService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/payments")
@RequiredArgsConstructor
public class PaymentController {

    private final PaymentService paymentService;

    @GetMapping("/invoice/{invoiceId}")
    @PreAuthorize("hasAnyRole('ACCOUNTANT', 'MANAGER', 'STUDENT')")
    public ResponseEntity<List<PaymentResponse>> getPaymentsByInvoice(
            @PathVariable UUID invoiceId,
            @AuthenticationPrincipal User user) {
        return ResponseEntity.ok(paymentService.getPaymentsByInvoice(invoiceId, user));
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('ACCOUNTANT', 'MANAGER', 'STUDENT')")
    public ResponseEntity<PaymentResponse> createPayment(
            @Valid @RequestBody PaymentRequest request,
            @AuthenticationPrincipal User user) {
        return ResponseEntity.ok(paymentService.createPayment(request, user));
    }
}
