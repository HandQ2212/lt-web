package com.elc.system.modules.room.service;

import com.elc.system.modules.room.dto.RoomRequest;
import com.elc.system.modules.room.dto.RoomResponse;
import com.elc.system.modules.room.dto.RoomScheduleRequest;
import com.elc.system.modules.room.dto.RoomScheduleResponse;
import com.elc.system.modules.room.entity.Room;
import com.elc.system.modules.room.entity.RoomSchedule;
import com.elc.system.modules.room.exception.RoomConflictException;
import com.elc.system.modules.room.exception.RoomNotFoundException;
import com.elc.system.modules.room.mapper.RoomMapper;
import com.elc.system.modules.room.repository.RoomRepository;
import com.elc.system.modules.room.repository.RoomScheduleRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@Slf4j
@RequiredArgsConstructor
public class RoomServiceImpl implements RoomService {

    private final RoomRepository roomRepository;
    private final RoomScheduleRepository roomScheduleRepository;
    private final RoomMapper roomMapper;

    @Override
    @Transactional
    public RoomResponse createRoom(RoomRequest request) {
        if (roomRepository.existsByNameAndBranchId(request.getName(), request.getBranchId())) {
            throw new RoomConflictException("Room name already exists in this branch");
        }
        Room room = roomMapper.toEntity(request);
        room = roomRepository.save(room);
        log.info("Created room: {}", room.getName());
        return roomMapper.toResponse(room);
    }

    @Override
    @Transactional
    public RoomResponse updateRoom(UUID id, RoomRequest request) {
        Room room = roomRepository.findById(id)
                .orElseThrow(() -> new RoomNotFoundException("Room not found with id: " + id));
        
        // Check if name is changed and already exists
        if (!room.getName().equals(request.getName()) && 
            roomRepository.existsByNameAndBranchId(request.getName(), request.getBranchId())) {
            throw new RoomConflictException("Room name already exists in this branch");
        }

        roomMapper.updateEntity(request, room);
        room = roomRepository.save(room);
        log.info("Updated room: {}", room.getName());
        return roomMapper.toResponse(room);
    }

    @Override
    @Transactional
    public void deleteRoom(UUID id) {
        if (!roomRepository.existsById(id)) {
            throw new RoomNotFoundException("Room not found with id: " + id);
        }
        // TODO: Check if room has active schedules before deleting
        roomRepository.deleteById(id);
        log.info("Deleted room with id: {}", id);
    }

    @Override
    public RoomResponse getRoom(UUID id) {
        Room room = roomRepository.findById(id)
                .orElseThrow(() -> new RoomNotFoundException("Room not found with id: " + id));
        return roomMapper.toResponse(room);
    }

    @Override
    public List<RoomResponse> getAllRooms() {
        return roomRepository.findAll().stream()
                .map(roomMapper::toResponse)
                .collect(Collectors.toList());
    }

    @Override
    public boolean isRoomAvailable(UUID roomId, LocalDateTime startTime, LocalDateTime endTime) {
        List<RoomSchedule> overlaps = roomScheduleRepository.findOverlappingSchedules(roomId, startTime, endTime);
        return overlaps.isEmpty();
    }

    @Override
    public void checkScheduleConflict(UUID roomId, LocalDateTime startTime, LocalDateTime endTime) {
        List<RoomSchedule> overlaps = roomScheduleRepository.findOverlappingSchedules(roomId, startTime, endTime);
        if (!overlaps.isEmpty()) {
            throw new RoomConflictException("Room is already booked for this time period");
        }
    }

    @Override
    public String getRoomCurrentStatus(UUID roomId) {
        LocalDateTime now = LocalDateTime.now();
        List<RoomSchedule> current = roomScheduleRepository.findCurrentSchedules(roomId, now);
        return current.isEmpty() ? "AVAILABLE" : "OCCUPIED";
    }

    @Override
    @Transactional
    public RoomScheduleResponse bookRoom(UUID roomId, RoomScheduleRequest request) {
        Room room = roomRepository.findById(roomId)
                .orElseThrow(() -> new RoomNotFoundException("Room not found with id: " + roomId));

        checkScheduleConflict(roomId, request.getStartTime(), request.getEndTime());

        RoomSchedule schedule = roomMapper.toEntity(request);
        schedule.setRoom(room);
        schedule = roomScheduleRepository.save(schedule);
        log.info("Booked room {} from {} to {}", room.getName(), request.getStartTime(), request.getEndTime());
        return roomMapper.toResponse(schedule);
    }
}
