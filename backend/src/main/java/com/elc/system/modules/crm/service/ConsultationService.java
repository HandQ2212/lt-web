package com.elc.system.modules.crm.service;

import com.elc.system.modules.auth.entity.User;
import com.elc.system.modules.auth.repository.UserRepository;
import com.elc.system.modules.crm.dto.ConsultationDto.ConsultationRequest;
import com.elc.system.modules.crm.dto.ConsultationDto.ConsultationResponse;
import com.elc.system.modules.crm.entity.Consultation;
import com.elc.system.modules.crm.entity.Lead;
import com.elc.system.modules.crm.repository.ConsultationRepository;
import com.elc.system.modules.crm.repository.LeadRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;

@Service
@RequiredArgsConstructor
public class ConsultationService {

    private final ConsultationRepository consultationRepository;
    private final LeadRepository leadRepository;
    private final UserRepository userRepository;

    public Page<ConsultationResponse> getAllConsultations(Pageable pageable) {
        return consultationRepository.findAll(pageable).map(this::mapToResponse);
    }

    public Page<ConsultationResponse> getConsultationsByLead(UUID leadId, Pageable pageable) {
        return consultationRepository.findByLeadId(leadId, pageable).map(this::mapToResponse);
    }

    @Transactional
    public ConsultationResponse createConsultation(ConsultationRequest request) {
        Lead lead = leadRepository.findById(request.getLeadId())
                .orElseThrow(() -> new RuntimeException("Lead not found"));

        User consultant = null;
        if (request.getConsultantId() != null) {
            consultant = userRepository.findById(request.getConsultantId())
                    .orElseThrow(() -> new RuntimeException("Consultant not found"));
        }

        Consultation consultation = Consultation.builder()
                .lead(lead)
                .consultant(consultant)
                .consultationDate(request.getConsultationDate() != null ? request.getConsultationDate() : java.time.ZonedDateTime.now())
                .notes(request.getNotes())
                .followUpDate(request.getFollowUpDate())
                .build();

        return mapToResponse(consultationRepository.save(consultation));
    }

    private ConsultationResponse mapToResponse(Consultation consultation) {
        return ConsultationResponse.builder()
                .id(consultation.getId())
                .leadId(consultation.getLead().getId())
                .leadName(consultation.getLead().getFullName())
                .consultantId(consultation.getConsultant() != null ? consultation.getConsultant().getId() : null)
                .consultantName(consultation.getConsultant() != null ? consultation.getConsultant().getFullName() : null)
                .consultationDate(consultation.getConsultationDate())
                .notes(consultation.getNotes())
                .followUpDate(consultation.getFollowUpDate())
                .createdAt(consultation.getCreatedAt())
                .updatedAt(consultation.getUpdatedAt())
                .build();
    }
}
