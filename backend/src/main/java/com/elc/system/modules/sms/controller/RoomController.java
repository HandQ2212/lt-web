package com.elc.system.modules.sms.controller;

import com.elc.system.modules.sms.dto.RoomDto.RoomRequest;
import com.elc.system.modules.sms.dto.RoomDto.RoomResponse;
import com.elc.system.modules.sms.service.RoomService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController("smsRoomController")
@RequestMapping("/api/sms/rooms")
@RequiredArgsConstructor
public class RoomController {

    private final RoomService roomService;

    @GetMapping("/branch/{branchId}")
    public ResponseEntity<List<RoomResponse>> getRoomsByBranch(@PathVariable UUID branchId) {
        return ResponseEntity.ok(roomService.getRoomsByBranch(branchId));
    }

    @PostMapping
    public ResponseEntity<RoomResponse> createRoom(@Valid @RequestBody RoomRequest request) {
        return ResponseEntity.ok(roomService.createRoom(request));
    }
}
