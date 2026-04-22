package com.elc.system.modules.analytics.controller;

import com.elc.system.modules.analytics.dto.BranchAnalyticsDto;
import com.elc.system.modules.analytics.service.AnalyticsService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/analytics")
@RequiredArgsConstructor
public class AnalyticsController {

    private final AnalyticsService analyticsService;

    @GetMapping("/branches")
    public ResponseEntity<List<BranchAnalyticsDto>> getBranchPerformance() {
        return ResponseEntity.ok(analyticsService.getBranchPerformance());
    }
}
