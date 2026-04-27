package com.elc.system.modules.consultation.service;

import com.elc.system.modules.auth.entity.User;
import com.elc.system.modules.auth.repository.UserRepository;
import com.elc.system.modules.auth.service.UserService;
import com.elc.system.modules.consultation.dto.ConsultationDto.ConsultationResponse;
import com.elc.system.modules.consultation.dto.ConsultationDto.CreateConsultationRequest;
import com.elc.system.modules.consultation.dto.ConsultationDto.MarkReminderSentRequest;
import com.elc.system.modules.consultation.dto.ConsultationDto.ReminderDispatchResponse;
import com.elc.system.modules.consultation.entity.Consultation;
import com.elc.system.modules.consultation.repository.ConsultationRepository;
import com.elc.system.modules.lead.entity.Lead;
import com.elc.system.modules.lead.repository.LeadRepository;
import com.elc.system.modules.notification.entity.NotificationType;
import com.elc.system.modules.notification.service.NotificationService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.ZonedDateTime;
import java.util.UUID;

@Service
@Slf4j
@RequiredArgsConstructor
public class ConsultationService {

    private final ConsultationRepository consultationRepository;
    private final LeadRepository leadRepository;
    private final UserRepository userRepository;
    private final UserService userService;
    private final NotificationService notificationService;

    @Transactional
    public ConsultationResponse createConsultation(CreateConsultationRequest request) {
        return createConsultationInternal(request, request.getLeadId());
    }

    @Transactional
    public ConsultationResponse createConsultationForLead(UUID leadId, CreateConsultationRequest request) {
        return createConsultationInternal(request, leadId);
    }

    public Page<ConsultationResponse> getConsultations(UUID leadId,
                                                       UUID consultantId,
                                                       ZonedDateTime fromDate,
                                                       ZonedDateTime toDate,
                                                       Pageable pageable) {
        return consultationRepository.searchConsultations(leadId, consultantId, fromDate, toDate, pageable)
                .map(this::mapToResponse);
    }

    public Page<ConsultationResponse> getDueReminders(ZonedDateTime dueBefore, Pageable pageable) {
        ZonedDateTime threshold = dueBefore != null ? dueBefore : ZonedDateTime.now();
        return consultationRepository.findDueReminders(threshold, pageable)
                .map(this::mapToResponse);
    }

    @Transactional
    public ConsultationResponse markReminderSent(UUID consultationId, MarkReminderSentRequest request) {
        Consultation consultation = consultationRepository.findById(consultationId)
                .orElseThrow(() -> new IllegalArgumentException("Consultation not found with id: " + consultationId));

        consultation.setReminderSentAt(request.getSentAt() != null ? request.getSentAt() : ZonedDateTime.now());
        consultation.setReminderNote(request.getReminderNote());

        consultationRepository.save(consultation);
        log.info("Reminder marked as sent for consultation: {}", consultationId);
        return mapToResponse(consultation);
    }

    @Transactional
    public ReminderDispatchResponse dispatchDueReminders(ZonedDateTime dueBefore) {
        ZonedDateTime threshold = dueBefore != null ? dueBefore : ZonedDateTime.now();
        ZonedDateTime now = ZonedDateTime.now();

        var dueConsultations = consultationRepository.findDueRemindersForDispatch(threshold);
        int dispatchedCount = 0;

        for (Consultation consultation : dueConsultations) {
            User consultant = userRepository.findById(consultation.getConsultantId()).orElse(null);
            if (consultant == null) {
                continue;
            }

            Lead lead = leadRepository.findById(consultation.getLeadId()).orElse(null);
            String leadName = lead != null ? lead.getFullName() : consultation.getLeadId().toString();
            String title = "Consultation reminder";
            String message = "Follow-up consultation due for lead: " + leadName;

            notificationService.createNotification(consultant, title, message, NotificationType.SYSTEM);

            consultation.setReminderSentAt(now);
            consultation.setReminderNote("Auto reminder dispatched");
            consultationRepository.save(consultation);
            dispatchedCount++;
        }

        log.info("Dispatched {} consultation reminders ({} due)", dispatchedCount, dueConsultations.size());

        return ReminderDispatchResponse.builder()
                .dueCount(dueConsultations.size())
                .dispatchedCount(dispatchedCount)
                .dispatchedAt(now)
                .build();
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

    private ConsultationResponse mapToResponse(Consultation consultation) {
        Lead lead = leadRepository.findById(consultation.getLeadId()).orElse(null);
        User consultant = userRepository.findById(consultation.getConsultantId()).orElse(null);
        return mapToResponse(consultation, lead, consultant);
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
