package com.elc.system.modules.finance.controller;

import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/promotions")
@RequiredArgsConstructor
public class PromotionController {

    @GetMapping
    public ResponseEntity<List<String>> getActivePromotions() {
        // Mocking promotions for now. In a real system, this would fetch from a PromotionService.
        return ResponseEntity.ok(List.of("SUMMER2024", "EARLYBIRD", "REFERRAL500K"));
    }
}
