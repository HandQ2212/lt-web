package com.elc.system.modules.crm.dto;

import com.elc.system.modules.crm.entity.LeadSource;
import com.elc.system.modules.crm.entity.LeadStatus;
import com.elc.system.modules.sms.entity.CourseLevel;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.ZonedDateTime;
import java.util.UUID;

public class LeadDto {

    @Data
    @Builder
    @AllArgsConstructor
    @NoArgsConstructor
    public static class LeadRequest {
        @NotBlank(message = "Full name is required")
        private String fullName;

        @Email(message = "Invalid email format")
        private String email;

        @NotBlank(message = "Phone number is required")
        private String phone;

        private CourseLevel preferredLevel;
        private Integer assessmentScore;
        private LeadStatus status;
        private LeadSource source;
        private UUID branchId;
        private String notes;
    }

    @Data
    @Builder
    @AllArgsConstructor
    @NoArgsConstructor
    public static class LeadResponse {
        private UUID id;
        private String fullName;
        private String email;
        private String phone;
        private CourseLevel preferredLevel;
        private Integer assessmentScore;
        private LeadStatus status;
        private LeadSource source;
        private UUID branchId;
        private String notes;
        private ZonedDateTime createdAt;
        private ZonedDateTime updatedAt;
    }
}
