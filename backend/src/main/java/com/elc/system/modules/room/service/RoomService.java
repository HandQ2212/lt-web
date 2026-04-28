package com.elc.system.modules.room.service;

import com.elc.system.modules.room.dto.RoomRequest;
import com.elc.system.modules.room.dto.RoomResponse;
import com.elc.system.modules.room.dto.RoomScheduleRequest;
import com.elc.system.modules.room.dto.RoomScheduleResponse;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

public interface RoomService {
    RoomResponse createRoom(RoomRequest request);
    RoomResponse updateRoom(UUID id, RoomRequest request);
    void deleteRoom(UUID id);
    RoomResponse getRoom(UUID id);
    List<RoomResponse> getAllRooms();
    
    // Real-time status and conflict check
    boolean isRoomAvailable(UUID roomId, LocalDateTime startTime, LocalDateTime endTime);
    void checkScheduleConflict(UUID roomId, LocalDateTime startTime, LocalDateTime endTime);
    String getRoomCurrentStatus(UUID roomId);
    
    RoomScheduleResponse bookRoom(UUID roomId, RoomScheduleRequest request);

    List<RoomScheduleResponse> getRoomSchedules(UUID roomId, LocalDateTime start, LocalDateTime end);
}
