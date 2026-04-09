package com.elc.system.modules.sms.dto;

import com.elc.system.modules.sms.entity.RoomStatus;
import lombok.Data;
import java.util.UUID;

@Data
public class RoomResponse {
    private UUID id;
    private String name;
    private Integer capacity;
    private RoomStatus status;
    private String equipment;
}
