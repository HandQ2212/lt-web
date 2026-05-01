package com.elc.system.modules.sms.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.UUID;

public class RoomDto {

    @Data
    @Builder
    @AllArgsConstructor
    @NoArgsConstructor
    public static class RoomRequest {
        private UUID branchId;
        private String name;
        private Integer capacity;
        private String roomType;
    }

    @Data
    @Builder
    @AllArgsConstructor
    @NoArgsConstructor
    public static class RoomResponse {
        private UUID id;
        private UUID branchId;
        private String branchName;
        private String name;
        private Integer capacity;
        private String roomType;
    }
}
