package com.elc.system.modules.crm.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.time.ZonedDateTime;
import java.util.UUID;

public class ConsultationDto {

    @Data
    @Builder
    @AllArgsConstructor
    @NoArgsConstructor
    public static class ConsultationRequest {
        @NotNull(message = "Lead ID is required")
        private UUID leadId;

        private UUID consultantId;
        
        private ZonedDateTime consultationDate;

        @NotBlank(message = "Notes are required")
        private String notes;

        private java.time.LocalDate followUpDate;
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
        private java.time.LocalDate followUpDate;
        private ZonedDateTime createdAt;
        private ZonedDateTime updatedAt;
    }
}
