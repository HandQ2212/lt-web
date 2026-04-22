package com.elc.system.modules.crm.controller;

import com.elc.system.modules.crm.dto.ConsultationDto.ConsultationRequest;
import com.elc.system.modules.crm.dto.ConsultationDto.ConsultationResponse;
import com.elc.system.modules.crm.dto.LeadDto.LeadRequest;
import com.elc.system.modules.crm.dto.LeadDto.LeadResponse;
import com.elc.system.modules.crm.service.ConsultationService;
import com.elc.system.modules.crm.service.LeadService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/api/leads")
@RequiredArgsConstructor
public class LeadController {

    private final LeadService leadService;
    private final ConsultationService consultationService;

    @GetMapping
    public ResponseEntity<Page<LeadResponse>> getAllLeads(@PageableDefault(size = 20) Pageable pageable) {
        return ResponseEntity.ok(leadService.getAllLeads(pageable));
    }

    @GetMapping("/{id}")
    public ResponseEntity<LeadResponse> getLeadById(@PathVariable UUID id) {
        return ResponseEntity.ok(leadService.getLeadById(id));
    }

    @PostMapping
    public ResponseEntity<LeadResponse> createLead(@Valid @RequestBody LeadRequest request) {
        return ResponseEntity.ok(leadService.createLead(request));
    }

    @PutMapping("/{id}")
    public ResponseEntity<LeadResponse> updateLead(@PathVariable UUID id, @Valid @RequestBody LeadRequest request) {
        return ResponseEntity.ok(leadService.updateLead(id, request));
    }

    @PutMapping("/{id}/status")
    public ResponseEntity<LeadResponse> updateLeadStatus(
            @PathVariable UUID id,
            @RequestParam com.elc.system.modules.crm.entity.LeadStatus status) {
        // Since updateLeadStatus logic might not exist separately, we can reuse updateLead or add it to service
        // For now, I'll call updateLead with the current request modified, or just add the method to the service.
        return ResponseEntity.ok(leadService.updateLeadStatus(id, status));
    }

    @PostMapping("/{id}/convert")
    public ResponseEntity<String> convertLeadToStudent(@PathVariable UUID id) {
        leadService.convertLeadToStudent(id);
        return ResponseEntity.ok("Lead successfully converted to Student account");
    }

    @PostMapping("/{id}/consultations")
    public ResponseEntity<ConsultationResponse> logConsultation(
            @PathVariable UUID id,
            @Valid @RequestBody ConsultationRequest request) {
        request.setLeadId(id);
        return ResponseEntity.ok(consultationService.createConsultation(request));
    }
    
    @GetMapping("/{id}/consultations")
    public ResponseEntity<Page<ConsultationResponse>> getConsultationsByLead(
            @PathVariable UUID id,
            @PageableDefault(size = 20) Pageable pageable) {
        return ResponseEntity.ok(consultationService.getConsultationsByLead(id, pageable));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteLead(@PathVariable UUID id) {
        leadService.deleteLead(id);
        return ResponseEntity.noContent().build();
    }
}
