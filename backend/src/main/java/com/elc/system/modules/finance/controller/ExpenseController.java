package com.elc.system.modules.finance.controller;

import com.elc.system.modules.auth.entity.User;
import com.elc.system.modules.finance.dto.ExpenseDto.ExpenseRequest;
import com.elc.system.modules.finance.dto.ExpenseDto.ExpenseResponse;
import com.elc.system.modules.finance.service.ExpenseService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/expenses")
@RequiredArgsConstructor
@PreAuthorize("hasAnyRole('ACCOUNTANT', 'MANAGER')")
public class ExpenseController {

    private final ExpenseService expenseService;

    @GetMapping
    public ResponseEntity<List<ExpenseResponse>> getAllExpenses() {
        return ResponseEntity.ok(expenseService.getAllExpenses());
    }

    @PostMapping
    public ResponseEntity<ExpenseResponse> createExpense(
            @Valid @RequestBody ExpenseRequest request,
            @AuthenticationPrincipal User staff) {
        return ResponseEntity.ok(expenseService.createExpense(request, staff));
    }
}
