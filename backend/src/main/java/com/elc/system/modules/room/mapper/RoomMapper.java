package com.elc.system.modules.room.mapper;

import com.elc.system.modules.room.dto.RoomRequest;
import com.elc.system.modules.room.dto.RoomResponse;
import com.elc.system.modules.room.dto.RoomScheduleRequest;
import com.elc.system.modules.room.dto.RoomScheduleResponse;
import com.elc.system.modules.room.entity.Room;
import com.elc.system.modules.room.entity.RoomSchedule;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingTarget;

@Mapper(componentModel = "spring")
public interface RoomMapper {
    Room toEntity(RoomRequest request);
    RoomResponse toResponse(Room entity);
    void updateEntity(RoomRequest request, @MappingTarget Room entity);

    @Mapping(target = "room", ignore = true)
    RoomSchedule toEntity(RoomScheduleRequest request);

    @Mapping(target = "roomId", source = "room.id")
    RoomScheduleResponse toResponse(RoomSchedule entity);
}
