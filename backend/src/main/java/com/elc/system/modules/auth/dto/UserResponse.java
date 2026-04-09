package com.elc.system.modules.auth.dto;

import com.elc.system.modules.auth.entity.UserRole;
import com.elc.system.modules.auth.entity.UserStatus;
import lombok.Data;
import java.util.UUID;

@Data
public class UserResponse {
    private UUID id;
    private String email;
    private String fullName;
    private String phone;
    private String avatarUrl;
    private UserRole role;
    private UserStatus status;
}
