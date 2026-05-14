package com.elc.system.modules.finance.controller;

import com.elc.system.modules.auth.entity.User;
import com.elc.system.modules.finance.dto.InvoiceDto.InvoiceRequest;
import com.elc.system.modules.finance.dto.InvoiceDto.InvoiceResponse;
import com.elc.system.modules.finance.entity.InvoiceStatus;
import com.elc.system.modules.finance.service.InvoiceService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/invoices")
@RequiredArgsConstructor
public class InvoiceController {

    private final InvoiceService invoiceService;

    @GetMapping
    @PreAuthorize("hasAnyRole('ACCOUNTANT', 'MANAGER', 'STUDENT', 'LEAD')")
    public ResponseEntity<List<InvoiceResponse>> getAllInvoices(@AuthenticationPrincipal User user) {
        return ResponseEntity.ok(invoiceService.getInvoicesForUser(user));
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('ACCOUNTANT', 'MANAGER', 'STUDENT', 'LEAD')")
    public ResponseEntity<InvoiceResponse> getInvoiceById(@PathVariable UUID id) {
        return ResponseEntity.ok(invoiceService.getInvoiceById(id));
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('ACCOUNTANT', 'MANAGER')")
    public ResponseEntity<InvoiceResponse> createInvoice(@Valid @RequestBody InvoiceRequest request) {
        return ResponseEntity.ok(invoiceService.createInvoice(request));
    }

    @PatchMapping("/{id}/status")
    @PreAuthorize("hasAnyRole('ACCOUNTANT', 'MANAGER')")
    public ResponseEntity<Void> updateStatus(@PathVariable UUID id, @RequestParam InvoiceStatus status) {
        invoiceService.updateStatus(id, status);
        return ResponseEntity.noContent().build();
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyRole('ACCOUNTANT', 'MANAGER')")
    public ResponseEntity<Void> deleteInvoice(@PathVariable UUID id) {
        invoiceService.deleteInvoice(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/debt")
    @PreAuthorize("hasAnyRole('ACCOUNTANT', 'MANAGER')")
    public ResponseEntity<List<InvoiceResponse>> getDebtInvoices() {
        return ResponseEntity.ok(invoiceService.getDebtInvoices());
    }

    @PostMapping("/{id}/refund")
    @PreAuthorize("hasAnyRole('ACCOUNTANT', 'MANAGER')")
    public ResponseEntity<InvoiceResponse> processRefund(
            @PathVariable UUID id,
            @Valid @RequestBody com.elc.system.modules.finance.dto.InvoiceDto.RefundRequest request) {
        return ResponseEntity.ok(invoiceService.processRefund(id, request));
    }
}
