package com.elc.system.modules.school.branch.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.ZonedDateTime;
import java.util.UUID;

public class BranchDto {

    @Data
    @Builder
    @AllArgsConstructor
    @NoArgsConstructor
    public static class CreateBranchRequest {
        @NotBlank(message = "Branch name is required")
        @Size(max = 255, message = "Branch name must not exceed 255 characters")
        private String name;

        private String address;

        @Size(max = 50, message = "Phone number must not exceed 50 characters")
        private String phone;
    }

    @Data
    @Builder
    @AllArgsConstructor
    @NoArgsConstructor
    public static class UpdateBranchRequest {
        @NotBlank(message = "Branch name is required")
        @Size(max = 255, message = "Branch name must not exceed 255 characters")
        private String name;

        private String address;

        @Size(max = 50, message = "Phone number must not exceed 50 characters")
        private String phone;
    }

    @Data
    @Builder
    @AllArgsConstructor
    @NoArgsConstructor
    public static class BranchResponse {
        private UUID id;
        private String name;
        private String address;
        private String phone;
        private ZonedDateTime createdAt;
        private ZonedDateTime updatedAt;
    }
}
