package com.elc.system.modules.auth.controller;

import com.elc.system.modules.auth.dto.UserDto.PublicTeacherResponse;
import com.elc.system.modules.auth.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/public/teachers")
@RequiredArgsConstructor
public class PublicTeacherController {

    private final UserService userService;

    @GetMapping
    public ResponseEntity<List<PublicTeacherResponse>> getPublicTeachers() {
        return ResponseEntity.ok(userService.getPublicTeachers());
    }
}
