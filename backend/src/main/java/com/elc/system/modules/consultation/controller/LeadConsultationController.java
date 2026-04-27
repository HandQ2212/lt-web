package com.elc.system.modules.consultation.controller;

import com.elc.system.modules.consultation.dto.ConsultationDto.ConsultationResponse;
import com.elc.system.modules.consultation.dto.ConsultationDto.CreateConsultationRequest;
import com.elc.system.modules.consultation.service.ConsultationService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.UUID;

@RestController
@RequestMapping("/api/leads/{leadId}/consultations")
@RequiredArgsConstructor
public class LeadConsultationController {

    private final ConsultationService consultationService;

    @PostMapping
    @PreAuthorize("hasRole('MANAGER')")
    public ResponseEntity<ConsultationResponse> createConsultationForLead(
            @PathVariable UUID leadId,
            @Valid @RequestBody CreateConsultationRequest request
    ) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(consultationService.createConsultationForLead(leadId, request));
    }
}
