package com.elc.system.modules.finance.controller;

import com.elc.system.modules.finance.dto.InvoiceDto.InvoiceRequest;
import com.elc.system.modules.finance.dto.InvoiceDto.InvoiceResponse;
import com.elc.system.modules.finance.entity.InvoiceStatus;
import com.elc.system.modules.finance.service.InvoiceService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/invoices")
@RequiredArgsConstructor
public class InvoiceController {

    private final InvoiceService invoiceService;

    @GetMapping
    public ResponseEntity<List<InvoiceResponse>> getAllInvoices() {
        return ResponseEntity.ok(invoiceService.getAllInvoices());
    }

    @PostMapping
    public ResponseEntity<InvoiceResponse> createInvoice(@Valid @RequestBody InvoiceRequest request) {
        return ResponseEntity.ok(invoiceService.createInvoice(request));
    }

    @PatchMapping("/{id}/status")
    public ResponseEntity<Void> updateStatus(@PathVariable UUID id, @RequestParam InvoiceStatus status) {
        invoiceService.updateStatus(id, status);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/debt")
    public ResponseEntity<List<InvoiceResponse>> getDebtInvoices() {
        return ResponseEntity.ok(invoiceService.getDebtInvoices());
    }

    @PostMapping("/{id}/refund")
    public ResponseEntity<InvoiceResponse> processRefund(
            @PathVariable UUID id,
            @Valid @RequestBody com.elc.system.modules.finance.dto.InvoiceDto.RefundRequest request) {
        return ResponseEntity.ok(invoiceService.processRefund(id, request));
    }
}
