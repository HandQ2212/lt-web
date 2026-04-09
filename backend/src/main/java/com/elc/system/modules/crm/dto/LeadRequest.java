package com.elc.system.modules.crm.dto;

import com.elc.system.modules.sms.entity.CourseLevel;
import lombok.Data;
import java.util.UUID;

@Data
public class LeadRequest {
    private String fullName;
    private String email;
    private String phone;
    private CourseLevel preferredLevel;
    private UUID branchId;
    private String notes;
}
