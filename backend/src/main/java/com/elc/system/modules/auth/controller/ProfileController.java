package com.elc.system.modules.auth.controller;

import com.elc.system.modules.auth.dto.AuthDto.UserResponse;
import com.elc.system.modules.auth.dto.ProfileDto.ChangePasswordRequest;
import com.elc.system.modules.auth.dto.ProfileDto.ProfileUpdateRequest;
import com.elc.system.modules.auth.entity.User;
import com.elc.system.modules.auth.service.ProfileService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/profile")
@RequiredArgsConstructor
public class ProfileController {

    private final ProfileService profileService;

    @GetMapping
    public ResponseEntity<UserResponse> getProfile(@AuthenticationPrincipal User currentUser) {
        return ResponseEntity.ok(profileService.getCurrentUserResponse());
    }

    @PutMapping
    public ResponseEntity<UserResponse> updateProfile(
            @Valid @RequestBody ProfileUpdateRequest request) {
        return ResponseEntity.ok(profileService.updateProfile(request));
    }

    @PutMapping("/password")
    public ResponseEntity<Void> changePassword(
            @Valid @RequestBody ChangePasswordRequest request) {
        profileService.changePassword(request);
        return ResponseEntity.ok().build();
    }
}
