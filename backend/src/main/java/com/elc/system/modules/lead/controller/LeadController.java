package com.elc.system.modules.lead.controller;

import com.elc.system.modules.lead.dto.LeadDto.ConvertLeadRequest;
import com.elc.system.modules.lead.dto.LeadDto.CreateLeadRequest;
import com.elc.system.modules.lead.dto.LeadDto.LeadConversionResponse;
import com.elc.system.modules.lead.dto.LeadDto.LeadResponse;
import com.elc.system.modules.lead.dto.LeadDto.UpdateLeadStatusRequest;
import com.elc.system.modules.lead.entity.LeadSource;
import com.elc.system.modules.lead.entity.LeadStatus;
import com.elc.system.modules.lead.service.LeadService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.time.LocalDate;
import java.util.UUID;

@RestController
@RequestMapping("/api/leads")
@RequiredArgsConstructor
public class LeadController {

    private final LeadService leadService;

    @PostMapping
    public ResponseEntity<LeadResponse> createLead(@Valid @RequestBody CreateLeadRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(leadService.createLead(request));
    }

    @GetMapping
    @PreAuthorize("hasRole('MANAGER')")
    public ResponseEntity<Page<LeadResponse>> getLeads(
            @RequestParam(required = false) LeadStatus status,
            @RequestParam(required = false) LeadSource source,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate fromDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate toDate,
            @PageableDefault(size = 20) Pageable pageable
    ) {
        return ResponseEntity.ok(leadService.getLeads(status, source, fromDate, toDate, pageable));
    }

    @PutMapping("/{id}/status")
    @PreAuthorize("hasRole('MANAGER')")
    public ResponseEntity<LeadResponse> updateLeadStatus(
            @PathVariable UUID id,
            @Valid @RequestBody UpdateLeadStatusRequest request
    ) {
        return ResponseEntity.ok(leadService.updateLeadStatus(id, request));
    }

    @PostMapping("/{id}/convert")
    @PreAuthorize("hasRole('MANAGER')")
    public ResponseEntity<LeadConversionResponse> convertLeadToStudent(
            @PathVariable("id") UUID leadId,
            @Valid @RequestBody ConvertLeadRequest request
    ) {
        return ResponseEntity.ok(leadService.convertLeadToStudent(leadId, request));
    }
}
