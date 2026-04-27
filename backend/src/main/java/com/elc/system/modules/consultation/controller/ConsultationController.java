package com.elc.system.modules.consultation.controller;

import com.elc.system.modules.consultation.dto.ConsultationDto.ConsultationResponse;
import com.elc.system.modules.consultation.dto.ConsultationDto.CreateConsultationRequest;
import com.elc.system.modules.consultation.dto.ConsultationDto.MarkReminderSentRequest;
import com.elc.system.modules.consultation.dto.ConsultationDto.ReminderDispatchResponse;
import com.elc.system.modules.consultation.service.ConsultationService;
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

import java.time.ZonedDateTime;
import java.util.UUID;

@RestController
@RequestMapping("/api/consultations")
@RequiredArgsConstructor
public class ConsultationController {

    private final ConsultationService consultationService;

    @PostMapping
    @PreAuthorize("hasRole('MANAGER')")
    public ResponseEntity<ConsultationResponse> createConsultation(
            @Valid @RequestBody CreateConsultationRequest request
    ) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(consultationService.createConsultation(request));
    }

    @GetMapping
    @PreAuthorize("hasRole('MANAGER')")
    public ResponseEntity<Page<ConsultationResponse>> getConsultations(
            @RequestParam(required = false) UUID leadId,
            @RequestParam(required = false) UUID consultantId,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) ZonedDateTime fromDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) ZonedDateTime toDate,
            @PageableDefault(size = 20) Pageable pageable
    ) {
        return ResponseEntity.ok(
                consultationService.getConsultations(leadId, consultantId, fromDate, toDate, pageable)
        );
    }

    @GetMapping("/reminders/due")
    @PreAuthorize("hasRole('MANAGER')")
    public ResponseEntity<Page<ConsultationResponse>> getDueReminders(
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) ZonedDateTime dueBefore,
            @PageableDefault(size = 20) Pageable pageable
    ) {
        return ResponseEntity.ok(consultationService.getDueReminders(dueBefore, pageable));
    }

    @PostMapping("/reminders/dispatch")
    @PreAuthorize("hasRole('MANAGER')")
    public ResponseEntity<ReminderDispatchResponse> dispatchDueReminders(
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) ZonedDateTime dueBefore
    ) {
        return ResponseEntity.ok(consultationService.dispatchDueReminders(dueBefore));
    }

    @PutMapping("/{id}/reminder/sent")
    @PreAuthorize("hasRole('MANAGER')")
    public ResponseEntity<ConsultationResponse> markReminderSent(
            @PathVariable UUID id,
            @Valid @RequestBody MarkReminderSentRequest request
    ) {
        return ResponseEntity.ok(consultationService.markReminderSent(id, request));
    }
}
