package com.elc.system.modules.notifications.controller;

import com.elc.system.modules.auth.entity.User;
import com.elc.system.modules.notifications.entity.Announcement;
import com.elc.system.modules.notifications.repository.AnnouncementRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/announcements")
@RequiredArgsConstructor
public class AnnouncementController {

    private final AnnouncementRepository announcementRepository;

    @GetMapping
    public ResponseEntity<List<Announcement>> getAnnouncements(@AuthenticationPrincipal User user) {
        List<Announcement> announcements = announcementRepository.findAll().stream()
                .filter(a -> a.getTargetRole() == null || a.getTargetRole() == user.getRole())
                .collect(Collectors.toList());
        return ResponseEntity.ok(announcements);
    }

    @PostMapping
    @PreAuthorize("hasRole('MANAGER')")
    public ResponseEntity<Announcement> createAnnouncement(@RequestBody Announcement announcement) {
        return ResponseEntity.ok(announcementRepository.save(announcement));
    }
}
