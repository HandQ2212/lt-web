package com.elc.system.modules.announcement.controller;

import com.elc.system.modules.announcement.dto.AnnouncementDto.AnnouncementResponse;
import com.elc.system.modules.announcement.dto.AnnouncementDto.CreateAnnouncementRequest;
import com.elc.system.modules.announcement.service.AnnouncementService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;

@RestController
@RequestMapping("/api/announcements")
@RequiredArgsConstructor
public class AnnouncementController {

    private final AnnouncementService announcementService;

    @PostMapping
    @PreAuthorize("hasAnyRole('MANAGER', 'TEACHER', 'ACCOUNTANT')")
    public ResponseEntity<AnnouncementResponse> createAnnouncement(
            @Valid @RequestBody CreateAnnouncementRequest request,
            Principal principal
    ) {
        return ResponseEntity.ok(announcementService.createAnnouncement(request));
    }

    @GetMapping
    public ResponseEntity<Page<AnnouncementResponse>> getAnnouncements(
            @PageableDefault(size = 20) Pageable pageable
    ) {
        return ResponseEntity.ok(announcementService.getActiveAnnouncements(pageable));
    }

    @GetMapping("/sent")
    @PreAuthorize("hasAnyRole('MANAGER', 'TEACHER', 'ACCOUNTANT')")
    public ResponseEntity<Page<AnnouncementResponse>> getSentAnnouncements(
            @PageableDefault(size = 20) Pageable pageable
    ) {
        return ResponseEntity.ok(announcementService.getMySentAnnouncements(pageable));
    }
}
