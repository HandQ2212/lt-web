package com.elc.system.modules.notification.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.ZonedDateTime;
import java.util.UUID;

public class NotificationDto {

    @Data
    @Builder
    @AllArgsConstructor
    @NoArgsConstructor
    public static class NotificationResponse {
        private UUID id;
        private String title;
        private String message;
        private boolean isRead;
        private String type; // PERSONAL, ANNOUNCEMENT, SYSTEM
        private ZonedDateTime createdAt;
    }

    @Data
    @Builder
    @AllArgsConstructor
    @NoArgsConstructor
    public static class UnreadCountResponse {
        private long count;
    }
}
