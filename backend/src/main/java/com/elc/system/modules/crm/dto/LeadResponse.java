package com.elc.system.modules.crm.dto;

import com.elc.system.modules.crm.entity.LeadSource;
import com.elc.system.modules.crm.entity.LeadStatus;
import com.elc.system.modules.sms.entity.CourseLevel;
import lombok.Data;
import java.util.UUID;

@Data
public class LeadResponse {
    private UUID id;
    private String fullName;
    private String email;
    private String phone;
    private CourseLevel preferredLevel;
    private Integer assessmentScore;
    private LeadStatus status;
    private LeadSource source;
    private String notes;
}
