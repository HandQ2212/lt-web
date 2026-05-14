package com.elc.system.modules.room.dto;

import lombok.Data;

import java.time.LocalDateTime;
import java.util.UUID;

@Data
public class RoomScheduleResponse {
    private UUID id;
    private UUID roomId;
    private LocalDateTime startTime;
    private LocalDateTime endTime;
    private UUID classId;
    private String purpose;
}
