package com.elc.system.modules.sms.service;

import com.elc.system.modules.sms.dto.RoomDto.RoomRequest;
import com.elc.system.modules.sms.dto.RoomDto.RoomResponse;
import com.elc.system.modules.sms.entity.Branch;
import com.elc.system.modules.sms.entity.Room;
import com.elc.system.modules.sms.repository.BranchRepository;
import com.elc.system.modules.sms.repository.RoomRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class RoomService {

    private final RoomRepository roomRepository;
    private final BranchRepository branchRepository;

    public List<RoomResponse> getRoomsByBranch(UUID branchId) {
        return roomRepository.findByBranchId(branchId).stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Transactional
    public RoomResponse createRoom(RoomRequest request) {
        Branch branch = branchRepository.findById(request.getBranchId())
                .orElseThrow(() -> new RuntimeException("Branch not found"));

        Room room = Room.builder()
                .branch(branch)
                .name(request.getName())
                .capacity(request.getCapacity())
                .roomType(request.getRoomType())
                .build();

        return mapToResponse(roomRepository.save(room));
    }

    private RoomResponse mapToResponse(Room room) {
        return RoomResponse.builder()
                .id(room.getId())
                .branchId(room.getBranch().getId())
                .branchName(room.getBranch().getName())
                .name(room.getName())
                .capacity(room.getCapacity())
                .roomType(room.getRoomType())
                .build();
    }
}
