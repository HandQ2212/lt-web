package com.elc.system.modules.notification.dto;

import com.elc.system.modules.auth.entity.UserRole;
import lombok.Data;
import java.time.ZonedDateTime;
import java.util.UUID;

@Data
public class AnnouncementResponse {
    private UUID id;
    private String title;
    private String content;
    private UserRole targetRole;
    private String authorName;
    private ZonedDateTime createdAt;
}
