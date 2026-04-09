package com.elc.system.modules.notification.dto;

import lombok.Data;
import java.time.ZonedDateTime;
import java.util.UUID;

@Data
public class NotificationResponse {
    private UUID id;
    private String title;
    private String message;
    private Boolean isRead;
    private ZonedDateTime createdAt;
}
