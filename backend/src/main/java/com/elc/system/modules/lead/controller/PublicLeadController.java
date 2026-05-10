package com.elc.system.modules.lead.controller;

import com.elc.system.modules.lead.dto.LeadDto.CreateLeadRequest;
import com.elc.system.modules.lead.dto.LeadDto.LeadResponse;
import com.elc.system.modules.lead.service.LeadService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/public/leads")
@RequiredArgsConstructor
@Slf4j
public class PublicLeadController {

    private final LeadService leadService;

    @PostMapping
    public ResponseEntity<LeadResponse> submitContactForm(@Valid @RequestBody CreateLeadRequest request) {
        log.info("Public contact form submitted for: {}", request.getFullName());
        // For public forms, we force the source to WEBSITE_FORM
        return ResponseEntity.status(HttpStatus.CREATED).body(leadService.createLead(request));
    }
}
