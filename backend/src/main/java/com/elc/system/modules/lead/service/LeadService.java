package com.elc.system.modules.lead.service;

import com.elc.system.modules.auth.entity.User;
import com.elc.system.modules.auth.entity.UserRole;
import com.elc.system.modules.auth.entity.UserStatus;
import com.elc.system.modules.auth.repository.UserRepository;
import com.elc.system.modules.lead.dto.LeadDto.ConvertLeadRequest;
import com.elc.system.modules.lead.dto.LeadDto.CreateLeadRequest;
import com.elc.system.modules.lead.dto.LeadDto.LeadConversionResponse;
import com.elc.system.modules.lead.dto.LeadDto.LeadResponse;
import com.elc.system.modules.lead.dto.LeadDto.UpdateLeadRequest;
import com.elc.system.modules.lead.dto.LeadDto.UpdateLeadStatusRequest;
import com.elc.system.modules.lead.entity.Lead;
import com.elc.system.modules.lead.entity.LeadSource;
import com.elc.system.modules.lead.entity.LeadStatus;
import com.elc.system.modules.lead.repository.LeadRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.ZoneId;
import java.time.ZonedDateTime;
import java.util.UUID;

@Service
@Slf4j
@RequiredArgsConstructor
public class LeadService {

    private final LeadRepository leadRepository;
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    @Transactional
    public LeadResponse createLead(CreateLeadRequest request) {
        Lead lead = Lead.builder()
                .fullName(request.getFullName())
                .email(normalizeBlankToNull(request.getEmail()))
                .phone(request.getPhone())
                .dateOfBirth(request.getDateOfBirth())
                .gender(request.getGender())
                .address(request.getAddress())
                .preferredLevel(request.getPreferredLevel())
                .assessmentScore(request.getAssessmentScore())
                .status(request.getStatus() != null ? request.getStatus() : LeadStatus.NEW)
                .source(request.getSource() != null ? request.getSource() : LeadSource.WEBSITE_FORM)
                .branchId(request.getBranchId())
                .notes(request.getNotes())
                .build();

        leadRepository.save(lead);
        log.info("Lead created: {}", lead.getId());
        return mapToResponse(lead);
    }
 
    public Page<LeadResponse> getLeads(LeadStatus status,
                                       LeadSource source,
                                       LocalDate fromDate,
                                       LocalDate toDate,
                                       Pageable pageable) {
        ZonedDateTime from = fromDate != null
                ? fromDate.atStartOfDay(ZoneId.systemDefault())
                : null;
        ZonedDateTime to = toDate != null
                ? toDate.plusDays(1).atStartOfDay(ZoneId.systemDefault()).minusNanos(1)
                : null;

        return leadRepository.searchLeads(status, source, from, to, pageable)
                .map(this::mapToResponse);
    }

    public LeadResponse getLeadById(UUID id) {
        return mapToResponse(findLeadOrThrow(id));
    }

    @Transactional
    public LeadResponse updateLead(UUID id, UpdateLeadRequest request) {
        Lead lead = findLeadOrThrow(id);

        lead.setFullName(request.getFullName());
        lead.setEmail(normalizeBlankToNull(request.getEmail()));
        lead.setPhone(request.getPhone());
        lead.setDateOfBirth(request.getDateOfBirth());
        lead.setGender(request.getGender());
        lead.setAddress(request.getAddress());
        lead.setPreferredLevel(request.getPreferredLevel());
        lead.setAssessmentScore(request.getAssessmentScore());
        lead.setStatus(request.getStatus() != null ? request.getStatus() : lead.getStatus());
        lead.setSource(request.getSource() != null ? request.getSource() : lead.getSource());
        lead.setBranchId(request.getBranchId());
        lead.setNotes(request.getNotes());

        leadRepository.save(lead);
        log.info("Lead updated: {}", lead.getId());
        return mapToResponse(lead);
    }
 
    @Transactional
    public LeadResponse updateLeadStatus(UUID id, UpdateLeadStatusRequest request) {
        if (request.getStatus() == null) {
            throw new IllegalArgumentException("Lead status is required");
        }

        Lead lead = findLeadOrThrow(id);
        lead.setStatus(request.getStatus());

        leadRepository.save(lead);
        log.info("Lead status updated: {} -> {}", lead.getId(), lead.getStatus());
        return mapToResponse(lead);
    }

    @Transactional
    public void deleteLead(UUID id) {
        Lead lead = findLeadOrThrow(id);
        leadRepository.delete(lead);
        log.info("Lead deleted: {}", id);
    }

    @Transactional
    public LeadConversionResponse convertLeadToStudent(UUID leadId, ConvertLeadRequest request) {
        Lead lead = findLeadOrThrow(leadId);

        if (lead.getStatus() == LeadStatus.ENROLLED) {
            throw new IllegalArgumentException("Lead is already converted to student");
        }

        String email = request.getEmail().trim().toLowerCase();
        if (userRepository.existsByEmail(email)) {
            throw new IllegalArgumentException("Email already exists in user system");
        }

        User student = User.builder()
                .email(email)
                .password(passwordEncoder.encode(request.getPassword()))
                .fullName(lead.getFullName())
                .phone(lead.getPhone())
                .dateOfBirth(lead.getDateOfBirth())
                .gender(lead.getGender())
                .address(lead.getAddress())
                .role(UserRole.STUDENT)
                .status(UserStatus.ACTIVE)
                .branchId(lead.getBranchId())
                .build();

        userRepository.save(student);

        lead.setStatus(LeadStatus.ENROLLED);
        if (lead.getEmail() == null || lead.getEmail().isBlank()) {
            lead.setEmail(email);
        }
        leadRepository.save(lead);

        log.info("Lead {} converted to student {}", leadId, student.getId());

        return LeadConversionResponse.builder()
                .leadId(lead.getId())
                .leadStatus(lead.getStatus())
                .studentId(student.getId())
                .studentEmail(student.getEmail())
                .message("Lead converted to student successfully")
                .build();
    }

    private Lead findLeadOrThrow(UUID id) {
        return leadRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Lead not found with id: " + id));
    }

    private LeadResponse mapToResponse(Lead lead) {
        return LeadResponse.builder()
                .id(lead.getId())
                .fullName(lead.getFullName())
                .email(lead.getEmail())
                .phone(lead.getPhone())
                .dateOfBirth(lead.getDateOfBirth())
                .gender(lead.getGender())
                .address(lead.getAddress())
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

    private String normalizeBlankToNull(String value) {
        if (value == null) {
            return null;
        }
        String normalized = value.trim();
        return normalized.isEmpty() ? null : normalized;
    }
}
