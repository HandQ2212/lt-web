package com.elc.system.modules.auth.dto;

import com.elc.system.modules.auth.entity.UserRole;
import com.elc.system.modules.auth.entity.UserStatus;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

/**
 * Admin User Management DTOs
 * Used by UserController (admin operations) for managing user accounts
 */
public class UserDto {

    @Data
    @Builder
    @AllArgsConstructor
    @NoArgsConstructor
    public static class CreateUserRequest {
        @NotBlank(message = "Email is required")
        private String email;

        @NotBlank(message = "Password is required")
        @Size(min = 6, message = "Password must be at least 6 characters")
        private String password;

        @NotBlank(message = "Full name is required")
        private String fullName;

        private String phone;
        private LocalDate dateOfBirth;
        private String gender;
        private String address;

        private UserRole role;
        private UUID branchId;
    }

    @Data
    @Builder
    @AllArgsConstructor
    @NoArgsConstructor
    public static class UpdateUserRequest {
        private UserRole role;
        private UserStatus status;
        private String fullName;
        private String phone;
        private String address;
    }

    @Data
    @Builder
    @AllArgsConstructor
    @NoArgsConstructor
    public static class PublicTeacherResponse {
        private UUID id;
        private String fullName;
        private String avatarUrl;
        private List<String> specialties;
        private long activeClassCount;
    }
}
