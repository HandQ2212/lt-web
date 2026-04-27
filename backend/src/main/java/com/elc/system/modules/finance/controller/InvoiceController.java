package com.elc.system.modules.finance.controller;

import com.elc.system.modules.finance.dto.InvoiceDto.*;
import com.elc.system.modules.finance.entity.InvoiceStatus;
import com.elc.system.modules.finance.service.InvoiceService;
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
@RequestMapping("/api/invoices")
@RequiredArgsConstructor
public class InvoiceController {

    private final InvoiceService invoiceService;

    /** List all invoices (Accountant/Manager) */
    @GetMapping
    @PreAuthorize("hasAnyRole('ACCOUNTANT', 'MANAGER')")
    public ResponseEntity<Page<InvoiceResponse>> getAllInvoices(
            @RequestParam(required = false) InvoiceStatus status,
            Pageable pageable) {
        Page<InvoiceResponse> invoices = status != null
                ? invoiceService.getInvoicesByStatus(status, pageable)
                : invoiceService.getAllInvoices(pageable);
        return ResponseEntity.ok(invoices);
    }

    /** Get invoice by ID */
    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('ACCOUNTANT', 'MANAGER')")
    public ResponseEntity<InvoiceResponse> getInvoiceById(@PathVariable UUID id) {
        return ResponseEntity.ok(invoiceService.getInvoiceById(id));
    }

    /** Student views their own invoices */
    @GetMapping("/student/me")
    @PreAuthorize("hasRole('STUDENT')")
    public ResponseEntity<Page<InvoiceResponse>> getMyInvoices(Pageable pageable) {
        return ResponseEntity.ok(invoiceService.getMyInvoices(pageable));
    }

    /** Get overdue invoices (debt list) */
    @GetMapping("/debts")
    @PreAuthorize("hasAnyRole('ACCOUNTANT', 'MANAGER')")
    public ResponseEntity<Page<InvoiceResponse>> getOverdueInvoices(Pageable pageable) {
        return ResponseEntity.ok(invoiceService.getOverdueInvoices(pageable));
    }

    /** Create invoice manually (Accountant) */
    @PostMapping
    @PreAuthorize("hasAnyRole('ACCOUNTANT', 'MANAGER')")
    public ResponseEntity<InvoiceResponse> createInvoice(@Valid @RequestBody CreateInvoiceRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(invoiceService.createInvoice(request));
    }

    /** Refund an invoice */
    @PostMapping("/{id}/refund")
    @PreAuthorize("hasAnyRole('ACCOUNTANT', 'MANAGER')")
    public ResponseEntity<InvoiceResponse> refundInvoice(
            @PathVariable UUID id,
            @RequestParam String reason) {
        return ResponseEntity.ok(invoiceService.refundInvoice(id, reason));
    }
}
