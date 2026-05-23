package com.elc.system.modules.announcement.dto;

import com.elc.system.modules.announcement.entity.AnnouncementScope;
import com.elc.system.modules.announcement.entity.AnnouncementType;
import com.elc.system.modules.auth.entity.UserRole;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.*;

import java.time.ZonedDateTime;
import java.util.UUID;

public class AnnouncementDto {
    @Data
    @Builder
    @AllArgsConstructor
    @NoArgsConstructor
    public static class CreateAnnouncementRequest {
        @NotBlank(message = "Title is required")
        @Size(max = 255, message = "Title must not exceed 255 characters")
        private String title;

        @NotBlank(message = "Message is required")
        private String message;

        @NotNull(message = "Type is required")
        private AnnouncementType type;

        @NotNull(message = "Scope is required")
        private AnnouncementScope scope;

        private UserRole targetRole;

        private UUID targetClassId;

        private ZonedDateTime expiresAt;
    }

    @Data
    @Builder
    @AllArgsConstructor
    @NoArgsConstructor
    public static class AnnouncementResponse {
        private UUID id;
        private String title;
        private String message;
        private String type;
        private String scope;
        private String targetRole;
        private UUID targetClassId;
        private String createdByEmail;
        private String createdByFullName;
        private ZonedDateTime createdAt;
        private ZonedDateTime expiresAt;
        private boolean isActive;
        private boolean isDelivered;
    }
}
