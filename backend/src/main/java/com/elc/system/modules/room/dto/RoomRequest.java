package com.elc.system.modules.room.dto;

import com.elc.system.modules.room.entity.RoomType;
import com.elc.system.modules.room.entity.RoomStatus;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.util.UUID;

@Data
public class RoomRequest {
    @NotBlank(message = "Room name is required")
    private String name;

    @NotNull(message = "Capacity is required")
    @Min(value = 1, message = "Capacity must be at least 1")
    private Integer capacity;

    @NotNull(message = "Room type is required")
    private RoomType type;

    private String description;

    @NotNull(message = "Room status is required")
    private RoomStatus status;

    private UUID branchId;
}
