package com.elc.system.modules.lead.controller;

import com.elc.system.modules.auth.entity.User;
import com.elc.system.modules.lead.dto.LeadDto.ConvertLeadRequest;
import com.elc.system.modules.lead.dto.LeadDto.CreateLeadRequest;
import com.elc.system.modules.lead.dto.LeadDto.LeadConversionResponse;
import com.elc.system.modules.lead.dto.LeadDto.LeadInterestRequest;
import com.elc.system.modules.lead.dto.LeadDto.LeadResponse;
import com.elc.system.modules.lead.dto.LeadDto.UpdateLeadStatusRequest;
import com.elc.system.modules.lead.entity.LeadSource;
import com.elc.system.modules.lead.entity.LeadStatus;
import com.elc.system.modules.lead.service.LeadService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.UUID;

@RestController
@RequestMapping("/api/leads")
@RequiredArgsConstructor
@Slf4j
public class LeadController {

    private final LeadService leadService;

    @GetMapping("/test")
    public String test() {
        log.info("Test endpoint called");
        return "Lead API is working";
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('MANAGER', 'ACCOUNTANT')")
    public ResponseEntity<LeadResponse> createLead(@Valid @RequestBody CreateLeadRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(leadService.createLead(request));
    }

    @GetMapping
    @PreAuthorize("hasAnyRole('MANAGER', 'ACCOUNTANT')")
    public ResponseEntity<Page<LeadResponse>> getLeads(
            @RequestParam(required = false) LeadStatus status,
            @RequestParam(required = false) LeadSource source,
            @RequestParam(required = false) String fromDate,
            @RequestParam(required = false) String toDate,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "100") int size,
            @RequestParam(defaultValue = "createdAt,desc") String sort
    ) {
        log.info("Fetching leads - status: {}, source: {}, fromDate: {}, toDate: {}, page: {}, size: {}, sort: {}", 
                status, source, fromDate, toDate, page, size, sort);
        
        LocalDate from = (fromDate != null && !fromDate.isEmpty()) ? LocalDate.parse(fromDate) : null;
        LocalDate to = (toDate != null && !toDate.isEmpty()) ? LocalDate.parse(toDate) : null;
        
        // Parse sort string (format: field,dir)
        String[] sortParts = sort.split(",");
        Sort sortObj = Sort.by(sortParts.length > 1 && sortParts[1].equalsIgnoreCase("asc") ? Sort.Direction.ASC : Sort.Direction.DESC, sortParts[0]);
        Pageable pageable = PageRequest.of(page, size, sortObj);
        
        return ResponseEntity.ok(leadService.getLeads(status, source, from, to, pageable));
    }

    @GetMapping("/me")
    @PreAuthorize("hasRole('LEAD')")
    public ResponseEntity<LeadResponse> getCurrentLead(@AuthenticationPrincipal User currentUser) {
        return ResponseEntity.ok(leadService.getCurrentLead(currentUser));
    }

    @PostMapping("/me/interests")
    @PreAuthorize("hasRole('LEAD')")
    public ResponseEntity<LeadResponse> addMyInterests(
            @AuthenticationPrincipal User currentUser,
            @Valid @RequestBody LeadInterestRequest request
    ) {
        return ResponseEntity.ok(leadService.addMyInterests(currentUser, request));
    }

    @PostMapping("/me/interest-class")
    @PreAuthorize("hasRole('LEAD')")
    public ResponseEntity<LeadResponse> expressInterestInClass(
            @AuthenticationPrincipal User currentUser,
            @RequestParam("classId") UUID classId,
            @RequestParam(required = false) String notes
    ) {
        return ResponseEntity.ok(leadService.expressInterestInClass(currentUser, classId, notes));
    }

    @PutMapping("/{id}/status")
    @PreAuthorize("hasAnyRole('MANAGER', 'ACCOUNTANT')")
    public ResponseEntity<LeadResponse> updateLeadStatus(
            @PathVariable("id") UUID id,
            @Valid @RequestBody UpdateLeadStatusRequest request
    ) {
        return ResponseEntity.ok(leadService.updateLeadStatus(id, request));
    }

    @PostMapping("/{id}/consulting")
    @PreAuthorize("hasAnyRole('MANAGER', 'ACCOUNTANT')")
    public ResponseEntity<LeadResponse> moveToConsulting(@PathVariable("id") UUID id) {
        log.info("Request to move lead {} to consulting", id);
        return ResponseEntity.ok(leadService.moveToConsulting(id));
    }

    @PostMapping("/{id}/agree")
    @PreAuthorize("hasAnyRole('MANAGER', 'ACCOUNTANT')")
    public ResponseEntity<LeadResponse> agreeToEnroll(
            @PathVariable("id") UUID id,
            @RequestParam("classId") UUID classId
    ) {
        log.info("Request lead {} agreed to enroll in class {}", id, classId);
        return ResponseEntity.ok(leadService.agreeToEnroll(id, classId));
    }

    @PostMapping("/{id}/confirm-cash")
    @PreAuthorize("hasAnyRole('MANAGER', 'ACCOUNTANT')")
    public ResponseEntity<LeadResponse> confirmCashPayment(@PathVariable("id") UUID id) {
        log.info("Request to confirm cash payment for lead {}", id);
        return ResponseEntity.ok(leadService.confirmCashPayment(id));
    }

    @PostMapping("/{id}/reject")
    @PreAuthorize("hasAnyRole('MANAGER', 'ACCOUNTANT')")
    public ResponseEntity<LeadResponse> rejectLead(@PathVariable("id") UUID id) {
        log.info("Request to reject lead {}", id);
        return ResponseEntity.ok(leadService.rejectLead(id));
    }

    @PostMapping("/{id}/convert")
    @PreAuthorize("hasAnyRole('MANAGER', 'ACCOUNTANT')")
    public ResponseEntity<LeadConversionResponse> convertLeadToStudent(
            @PathVariable("id") UUID id
    ) {
        log.info("Request to convert lead {} to student", id);
        return ResponseEntity.ok(leadService.convertLeadToStudent(id));
    }
}
