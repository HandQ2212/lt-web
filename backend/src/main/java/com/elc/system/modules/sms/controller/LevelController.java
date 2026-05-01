package com.elc.system.modules.sms.controller;

import com.elc.system.modules.sms.dto.LevelDto.LevelRequest;
import com.elc.system.modules.sms.dto.LevelDto.LevelResponse;
import com.elc.system.modules.sms.service.LevelService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/levels")
@RequiredArgsConstructor
public class LevelController {

    private final LevelService levelService;

    @GetMapping
    public ResponseEntity<List<LevelResponse>> getAllLevels() {
        return ResponseEntity.ok(levelService.getAllLevels());
    }

    @GetMapping("/{id}")
    public ResponseEntity<LevelResponse> getLevelById(@PathVariable UUID id) {
        return ResponseEntity.ok(levelService.getLevelById(id));
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('MANAGER')")
    public ResponseEntity<LevelResponse> createLevel(@Valid @RequestBody LevelRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(levelService.createLevel(request));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('MANAGER')")
    public ResponseEntity<LevelResponse> updateLevel(@PathVariable UUID id,
                                                     @Valid @RequestBody LevelRequest request) {
        return ResponseEntity.ok(levelService.updateLevel(id, request));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyRole('MANAGER')")
    public ResponseEntity<Void> deleteLevel(@PathVariable UUID id) {
        levelService.deleteLevel(id);
        return ResponseEntity.noContent().build();
    }
}
