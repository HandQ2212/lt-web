package com.elc.system.modules.crm.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.time.ZonedDateTime;
import java.util.UUID;

public class ConsultationDto {

    @Data
    @Builder
    @AllArgsConstructor
    @NoArgsConstructor
    public static class ConsultationRequest {
        private UUID leadId;
        private UUID consultantId;
        private ZonedDateTime consultationDate;
        private String notes;
        private LocalDate followUpDate;
    }

    @Data
    @Builder
    @AllArgsConstructor
    @NoArgsConstructor
    public static class ConsultationResponse {
        private UUID id;
        private UUID leadId;
        private String leadName;
        private UUID consultantId;
        private String consultantName;
        private ZonedDateTime consultationDate;
        private String notes;
        private LocalDate followUpDate;
        private ZonedDateTime createdAt;
        private ZonedDateTime updatedAt;
    }
}
