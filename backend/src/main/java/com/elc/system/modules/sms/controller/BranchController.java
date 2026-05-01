package com.elc.system.modules.sms.controller;

import com.elc.system.modules.sms.dto.BranchDto.BranchRequest;
import com.elc.system.modules.sms.dto.BranchDto.BranchResponse;
import com.elc.system.modules.sms.service.BranchService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/branches")
@RequiredArgsConstructor
public class BranchController {

    private final BranchService branchService;

    @GetMapping
    public ResponseEntity<List<BranchResponse>> getAllBranches() {
        return ResponseEntity.ok(branchService.getAllBranches());
    }

    @PostMapping
    public ResponseEntity<BranchResponse> createBranch(@Valid @RequestBody BranchRequest request) {
        return ResponseEntity.ok(branchService.createBranch(request));
    }
}
