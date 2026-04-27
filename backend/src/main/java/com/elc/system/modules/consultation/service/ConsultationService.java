package com.elc.system.modules.consultation.service;

import com.elc.system.modules.auth.entity.User;
import com.elc.system.modules.auth.repository.UserRepository;
import com.elc.system.modules.auth.service.UserService;
import com.elc.system.modules.consultation.dto.ConsultationDto.ConsultationResponse;
import com.elc.system.modules.consultation.dto.ConsultationDto.CreateConsultationRequest;
import com.elc.system.modules.consultation.entity.Consultation;
import com.elc.system.modules.consultation.repository.ConsultationRepository;
import com.elc.system.modules.lead.entity.Lead;
import com.elc.system.modules.lead.repository.LeadRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;

@Service
@Slf4j
@RequiredArgsConstructor
public class ConsultationService {

    private final ConsultationRepository consultationRepository;
    private final LeadRepository leadRepository;
    private final UserRepository userRepository;
    private final UserService userService;

    @Transactional
    public ConsultationResponse createConsultationForLead(UUID leadId, CreateConsultationRequest request) {
        return createConsultationInternal(request, leadId);
    }

    private ConsultationResponse createConsultationInternal(CreateConsultationRequest request, UUID leadIdFromPath) {
        UUID leadId = leadIdFromPath != null ? leadIdFromPath : request.getLeadId();
        if (leadId == null) {
            throw new IllegalArgumentException("Lead id is required");
        }

        Lead lead = leadRepository.findById(leadId)
                .orElseThrow(() -> new IllegalArgumentException("Lead not found with id: " + leadId));

        UUID consultantId = resolveConsultantId(request.getConsultantId());
        User consultant = userRepository.findById(consultantId)
                .orElseThrow(() -> new IllegalArgumentException("Consultant not found with id: " + consultantId));

        Consultation consultation = Consultation.builder()
                .leadId(leadId)
                .consultantId(consultantId)
                .consultationDate(request.getConsultationDate())
                .notes(request.getNotes())
                .nextStep(request.getNextStep())
                .nextReminderAt(request.getNextReminderAt())
                .build();

        consultationRepository.save(consultation);
        log.info("Consultation logged for lead {} by consultant {}", leadId, consultantId);

        return mapToResponse(consultation, lead, consultant);
    }

    private UUID resolveConsultantId(UUID consultantIdFromRequest) {
        if (consultantIdFromRequest != null) {
            return consultantIdFromRequest;
        }
        return userService.getCurrentUser().getId();
    }

    private ConsultationResponse mapToResponse(Consultation consultation, Lead lead, User consultant) {
        return ConsultationResponse.builder()
                .id(consultation.getId())
                .leadId(consultation.getLeadId())
                .leadFullName(lead != null ? lead.getFullName() : null)
                .consultantId(consultation.getConsultantId())
                .consultantName(consultant != null ? consultant.getFullName() : null)
                .consultationDate(consultation.getConsultationDate())
                .notes(consultation.getNotes())
                .nextStep(consultation.getNextStep())
                .nextReminderAt(consultation.getNextReminderAt())
                .reminderSentAt(consultation.getReminderSentAt())
                .reminderNote(consultation.getReminderNote())
                .createdAt(consultation.getCreatedAt())
                .updatedAt(consultation.getUpdatedAt())
                .build();
    }
}
