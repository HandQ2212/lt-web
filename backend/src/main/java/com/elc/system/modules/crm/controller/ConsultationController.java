package com.elc.system.modules.crm.controller;

import com.elc.system.modules.crm.dto.ConsultationDto.ConsultationRequest;
import com.elc.system.modules.crm.dto.ConsultationDto.ConsultationResponse;
import com.elc.system.modules.crm.service.ConsultationService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/api/consultations")
@RequiredArgsConstructor
public class ConsultationController {

    private final ConsultationService consultationService;

    @GetMapping
    public ResponseEntity<Page<ConsultationResponse>> getAllConsultations(
            @PageableDefault(size = 20) Pageable pageable
    ) {
        return ResponseEntity.ok(consultationService.getAllConsultations(pageable));
    }

    @GetMapping("/lead/{leadId}")
    public ResponseEntity<Page<ConsultationResponse>> getConsultationsByLead(
            @PathVariable UUID leadId,
            @PageableDefault(size = 20) Pageable pageable
    ) {
        return ResponseEntity.ok(consultationService.getConsultationsByLead(leadId, pageable));
    }

    @PostMapping
    public ResponseEntity<ConsultationResponse> createConsultation(
            @Valid @RequestBody ConsultationRequest request
    ) {
        return ResponseEntity.ok(consultationService.createConsultation(request));
    }
}
