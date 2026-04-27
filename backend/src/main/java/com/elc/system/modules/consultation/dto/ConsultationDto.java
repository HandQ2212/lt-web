package com.elc.system.modules.consultation.dto;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.ZonedDateTime;
import java.util.UUID;

public class ConsultationDto {

    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class CreateConsultationRequest {
        private UUID leadId;

        private UUID consultantId;

        @NotNull(message = "Consultation date is required")
        private ZonedDateTime consultationDate;

        @Size(max = 2000, message = "Notes must be at most 2000 characters")
        private String notes;

        @Size(max = 1000, message = "Next step must be at most 1000 characters")
        private String nextStep;

        private ZonedDateTime nextReminderAt;
    }

    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class MarkReminderSentRequest {
        private ZonedDateTime sentAt;

        @Size(max = 1000, message = "Reminder note must be at most 1000 characters")
        private String reminderNote;
    }

    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class ConsultationResponse {
        private UUID id;
        private UUID leadId;
        private String leadFullName;
        private UUID consultantId;
        private String consultantName;
        private ZonedDateTime consultationDate;
        private String notes;
        private String nextStep;
        private ZonedDateTime nextReminderAt;
        private ZonedDateTime reminderSentAt;
        private String reminderNote;
        private ZonedDateTime createdAt;
        private ZonedDateTime updatedAt;
    }

    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class ReminderDispatchResponse {
        private int dueCount;
        private int dispatchedCount;
        private ZonedDateTime dispatchedAt;
    }
}
