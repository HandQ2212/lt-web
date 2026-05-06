package com.elc.system.modules.auth.dto;

import com.elc.system.modules.auth.entity.UserRole;
import com.elc.system.modules.auth.entity.UserStatus;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.util.UUID;

public class AuthDto {

    @Data
    @Builder
    @AllArgsConstructor
    @NoArgsConstructor
    public static class RegisterRequest {
        @NotBlank(message = "Email is required")
        @Email(message = "Invalid email format")
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
        // Role is always LEAD for self-registration (security). Manager can change via /api/users/{id}
        private UUID branchId;
    }

    @Data
    @Builder
    @AllArgsConstructor
    @NoArgsConstructor
    public static class LoginRequest {
        @NotBlank(message = "Email is required")
        @Email(message = "Invalid email format")
        private String email;

        @NotBlank(message = "Password is required")
        private String password;
    }

    @Data
    @Builder
    @AllArgsConstructor
    @NoArgsConstructor
    public static class LogoutRequest {
        @NotBlank(message = "Refresh token is required")
        private String refreshToken;
    }

    @Data
    @Builder
    @AllArgsConstructor
    @NoArgsConstructor
    public static class RefreshRequest {
        @NotBlank(message = "Refresh token is required")
        private String refreshToken;
    }

    @Data
    @Builder
    @AllArgsConstructor
    @NoArgsConstructor
    public static class AuthResponse {
        private String accessToken;
        private String refreshToken;
        private String tokenType = "Bearer";
        private UserResponse user;
    }

    @Data
    @Builder
    @AllArgsConstructor
    @NoArgsConstructor
    public static class UserResponse {
        private UUID id;
        private String email;
        private String fullName;
        private String phone;
        private LocalDate dateOfBirth;
        private String gender;
        private String address;
        private String avatarUrl;
        private UserRole role;
        private UserStatus status;
        private UUID branchId;
    }
}
