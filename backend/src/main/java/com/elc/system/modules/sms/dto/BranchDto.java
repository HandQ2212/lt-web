package com.elc.system.modules.sms.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.UUID;

public class BranchDto {

    @Data
    @Builder
    @AllArgsConstructor
    @NoArgsConstructor
    public static class BranchRequest {
        private String name;
        private String address;
        private String phone;
        private UUID managerId;
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
        private UUID managerId;
        private String managerName;
    }
}
