package com.elc.system.modules.room.dto;

import com.elc.system.modules.room.entity.RoomType;
import com.elc.system.modules.room.entity.RoomStatus;
import lombok.Data;

import java.time.ZonedDateTime;
import java.util.UUID;

@Data
public class RoomResponse {
    private UUID id;
    private String name;
    private Integer capacity;
    private RoomType type;
    private String description;
    private RoomStatus status;
    private UUID branchId;
    private ZonedDateTime createdAt;
    private ZonedDateTime updatedAt;
}
