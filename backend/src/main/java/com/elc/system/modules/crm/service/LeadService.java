package com.elc.system.modules.crm.service;

import com.elc.system.modules.crm.dto.LeadDto.LeadRequest;
import com.elc.system.modules.crm.dto.LeadDto.LeadResponse;
import com.elc.system.modules.crm.entity.Lead;
import com.elc.system.modules.crm.repository.LeadRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;

@Service
@RequiredArgsConstructor
public class LeadService {

    private final LeadRepository leadRepository;

    public Page<LeadResponse> getAllLeads(Pageable pageable) {
        return leadRepository.findAll(pageable).map(this::mapToResponse);
    }

    public LeadResponse getLeadById(UUID id) {
        return leadRepository.findById(id)
                .map(this::mapToResponse)
                .orElseThrow(() -> new RuntimeException("Lead not found"));
    }

    @Transactional
    public LeadResponse createLead(LeadRequest request) {
        Lead lead = Lead.builder()
                .fullName(request.getFullName())
                .email(request.getEmail())
                .phone(request.getPhone())
                .preferredLevel(request.getPreferredLevel())
                .assessmentScore(request.getAssessmentScore())
                .status(request.getStatus() != null ? request.getStatus() : com.elc.system.modules.crm.entity.LeadStatus.NEW)
                .source(request.getSource() != null ? request.getSource() : com.elc.system.modules.crm.entity.LeadSource.WEBSITE_FORM)
                .branchId(request.getBranchId())
                .notes(request.getNotes())
                .build();

        return mapToResponse(leadRepository.save(lead));
    }

    @Transactional
    public LeadResponse updateLead(UUID id, LeadRequest request) {
        Lead lead = leadRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Lead not found"));

        lead.setFullName(request.getFullName());
        lead.setEmail(request.getEmail());
        lead.setPhone(request.getPhone());
        lead.setPreferredLevel(request.getPreferredLevel());
        lead.setAssessmentScore(request.getAssessmentScore());
        lead.setStatus(request.getStatus());
        lead.setSource(request.getSource());
        lead.setBranchId(request.getBranchId());
        lead.setNotes(request.getNotes());

        return mapToResponse(leadRepository.save(lead));
    }

    @Transactional
    public void deleteLead(UUID id) {
        leadRepository.deleteById(id);
    }

    private LeadResponse mapToResponse(Lead lead) {
        return LeadResponse.builder()
                .id(lead.getId())
                .fullName(lead.getFullName())
                .email(lead.getEmail())
                .phone(lead.getPhone())
                .preferredLevel(lead.getPreferredLevel())
                .assessmentScore(lead.getAssessmentScore())
                .status(lead.getStatus())
                .source(lead.getSource())
                .branchId(lead.getBranchId())
                .notes(lead.getNotes())
                .createdAt(lead.getCreatedAt())
                .updatedAt(lead.getUpdatedAt())
                .build();
    }
}
