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
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.ZonedDateTime;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.UUID;
import java.util.stream.Collectors;

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

    public Page<ConsultationResponse> getConsultations(UUID leadId,
                                                      UUID consultantId,
                                                      ZonedDateTime fromDate,
                                                      ZonedDateTime toDate,
                                                      Pageable pageable) {
        Page<Consultation> consultations = consultationRepository.searchConsultations(
                leadId, consultantId, fromDate, toDate, pageable);
        return mapPageToResponse(consultations);
    }

    public List<ConsultationResponse> getUpcomingReminders(int daysAhead) {
        UUID consultantId = userService.getCurrentUser().getId();
        ZonedDateTime now = ZonedDateTime.now();
        ZonedDateTime end = now.plusDays(daysAhead);

        List<Consultation> reminders = consultationRepository
                .findByConsultantIdAndNextReminderAtBetweenOrderByNextReminderAtAsc(consultantId, now, end);

        return enrichAndMapToList(reminders);
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

    private Page<ConsultationResponse> mapPageToResponse(Page<Consultation> page) {
        List<ConsultationResponse> content = enrichAndMapToList(page.getContent());
        return page.map(c -> content.stream()
                .filter(r -> r.getId().equals(c.getId()))
                .findFirst()
                .orElse(null));
    }

    private List<ConsultationResponse> enrichAndMapToList(List<Consultation> consultations) {
        Set<UUID> leadIds = consultations.stream().map(Consultation::getLeadId).collect(Collectors.toSet());
        Set<UUID> consultantIds = consultations.stream().map(Consultation::getConsultantId).collect(Collectors.toSet());

        Map<UUID, Lead> leadMap = leadRepository.findAllById(leadIds).stream()
                .collect(Collectors.toMap(Lead::getId, l -> l));
        Map<UUID, User> consultantMap = userRepository.findAllById(consultantIds).stream()
                .collect(Collectors.toMap(User::getId, u -> u));

        return consultations.stream()
                .map(c -> mapToResponse(c, leadMap.get(c.getLeadId()), consultantMap.get(c.getConsultantId())))
                .collect(Collectors.toList());
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
