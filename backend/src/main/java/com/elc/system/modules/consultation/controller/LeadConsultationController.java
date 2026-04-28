package com.elc.system.modules.consultation.controller;

import com.elc.system.modules.consultation.dto.ConsultationDto.ConsultationResponse;
import com.elc.system.modules.consultation.dto.ConsultationDto.CreateConsultationRequest;
import com.elc.system.modules.consultation.service.ConsultationService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.time.ZonedDateTime;
import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/consultations")
@RequiredArgsConstructor
public class LeadConsultationController {

    private final ConsultationService consultationService;

    @PostMapping
    @PreAuthorize("hasAnyRole('MANAGER', 'TEACHER')")
    public ResponseEntity<ConsultationResponse> logConsultation(@Valid @RequestBody CreateConsultationRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(consultationService.createConsultationForLead(null, request));
    }

    @PostMapping("/leads/{leadId}")
    @PreAuthorize("hasAnyRole('MANAGER', 'TEACHER')")
    public ResponseEntity<ConsultationResponse> logConsultationForLead(
            @PathVariable UUID leadId,
            @Valid @RequestBody CreateConsultationRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(consultationService.createConsultationForLead(leadId, request));
    }

    @GetMapping
    @PreAuthorize("hasAnyRole('MANAGER', 'TEACHER')")
    public ResponseEntity<Page<ConsultationResponse>> listConsultations(
            @RequestParam(required = false) UUID leadId,
            @RequestParam(required = false) UUID consultantId,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) ZonedDateTime fromDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) ZonedDateTime toDate,
            Pageable pageable) {
        return ResponseEntity.ok(consultationService.getConsultations(leadId, consultantId, fromDate, toDate, pageable));
    }

    @GetMapping("/reminders")
    @PreAuthorize("hasAnyRole('MANAGER', 'TEACHER')")
    public ResponseEntity<List<ConsultationResponse>> getReminders(
            @RequestParam(defaultValue = "7") int daysAhead) {
        return ResponseEntity.ok(consultationService.getUpcomingReminders(daysAhead));
    }
}
