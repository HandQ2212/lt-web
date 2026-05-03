package com.elc.system.modules.lead.dto;

import com.elc.system.modules.lead.entity.LeadSource;
import com.elc.system.modules.lead.entity.LeadStatus;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.ZonedDateTime;
import java.util.UUID;

public class LeadDto {

    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class CreateLeadRequest {
        @NotBlank(message = "Full name is required")
        @Size(max = 255, message = "Full name must be at most 255 characters")
        private String fullName;

        @Email(message = "Email format is invalid")
        @Size(max = 255, message = "Email must be at most 255 characters")
        private String email;

        @NotBlank(message = "Phone is required")
        @Pattern(regexp = "^(0|\\+84)[0-9]{9,10}$", message = "Phone format is invalid")
        private String phone;
 
        private java.time.LocalDate dateOfBirth;
 
        private String gender;
 
        private String address;
 
        @Size(max = 50, message = "Preferred level must be at most 50 characters")
        private String preferredLevel;

        private Integer assessmentScore;

        private LeadStatus status;

        private LeadSource source;

        private UUID branchId;

        @Size(max = 2000, message = "Notes must be at most 2000 characters")
        private String notes;
    }

    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class UpdateLeadRequest {
        @NotBlank(message = "Full name is required")
        @Size(max = 255, message = "Full name must be at most 255 characters")
        private String fullName;

        @Email(message = "Email format is invalid")
        @Size(max = 255, message = "Email must be at most 255 characters")
        private String email;

        @NotBlank(message = "Phone is required")
        @Pattern(regexp = "^(0|\\+84)[0-9]{9,10}$", message = "Phone format is invalid")
        private String phone;

        private java.time.LocalDate dateOfBirth;

        private String gender;

        private String address;

        @Size(max = 50, message = "Preferred level must be at most 50 characters")
        private String preferredLevel;

        private Integer assessmentScore;

        private LeadStatus status;

        private LeadSource source;

        private UUID branchId;

        @Size(max = 2000, message = "Notes must be at most 2000 characters")
        private String notes;
    }

    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class UpdateLeadStatusRequest {
        @NotNull(message = "Lead status is required")
        private LeadStatus status;
    }

    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class ConvertLeadRequest {
        @Email(message = "Email format is invalid")
        @NotBlank(message = "Email is required to convert lead")
        private String email;

        @NotBlank(message = "Password is required")
        @Size(min = 8, message = "Password must be at least 8 characters")
        private String password;
    }

    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class LeadResponse {
        private UUID id;
        private String fullName;
        private String email;
        private String phone;
        private java.time.LocalDate dateOfBirth;
        private String gender;
        private String address;
        private String preferredLevel;
        private Integer assessmentScore;
        private LeadStatus status;
        private LeadSource source;
        private UUID branchId;
        private String notes;
        private ZonedDateTime createdAt;
        private ZonedDateTime updatedAt;
    }

    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class LeadConversionResponse {
        private UUID leadId;
        private LeadStatus leadStatus;
        private UUID studentId;
        private String studentEmail;
        private String message;
    }
}
