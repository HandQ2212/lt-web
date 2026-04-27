package com.elc.system.modules.expense.controller;

import com.elc.system.modules.expense.dto.ExpenseDto.*;
import com.elc.system.modules.expense.entity.ExpenseStatus;
import com.elc.system.modules.expense.service.ExpenseService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/expenses")
@RequiredArgsConstructor
public class ExpenseController {

    private final ExpenseService expenseService;

    @GetMapping
    @PreAuthorize("hasAnyRole('ACCOUNTANT', 'MANAGER')")
    public ResponseEntity<Page<ExpenseResponse>> getAllExpenses(
            @RequestParam(required = false) ExpenseStatus status,
            Pageable pageable) {
        Page<ExpenseResponse> expenses = status != null
                ? expenseService.getExpensesByStatus(status, pageable)
                : expenseService.getAllExpenses(pageable);
        return ResponseEntity.ok(expenses);
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('ACCOUNTANT', 'MANAGER')")
    public ResponseEntity<ExpenseResponse> getExpenseById(@PathVariable UUID id) {
        return ResponseEntity.ok(expenseService.getExpenseById(id));
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('ACCOUNTANT', 'MANAGER')")
    public ResponseEntity<ExpenseResponse> createExpense(@Valid @RequestBody CreateExpenseRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(expenseService.createExpense(request));
    }

    /** Submit expense for Manager approval */
    @PostMapping("/{id}/submit")
    @PreAuthorize("hasRole('ACCOUNTANT')")
    public ResponseEntity<ExpenseResponse> submitForApproval(@PathVariable UUID id) {
        return ResponseEntity.ok(expenseService.submitForApproval(id));
    }

    /** Approve or reject expense (Manager only) */
    @PutMapping("/{id}/approve")
    @PreAuthorize("hasRole('MANAGER')")
    public ResponseEntity<ExpenseResponse> processApproval(
            @PathVariable UUID id,
            @RequestParam boolean approved,
            @RequestParam(required = false) String reason) {
        return ResponseEntity.ok(expenseService.processApproval(id, approved, reason));
    }

    // ---- Expense Categories ----

    @GetMapping("/categories")
    @PreAuthorize("hasAnyRole('ACCOUNTANT', 'MANAGER')")
    public ResponseEntity<List<CategoryResponse>> getAllCategories() {
        return ResponseEntity.ok(expenseService.getAllCategories());
    }

    @PostMapping("/categories")
    @PreAuthorize("hasRole('MANAGER')")
    public ResponseEntity<CategoryResponse> createCategory(@Valid @RequestBody CreateCategoryRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(expenseService.createCategory(request));
    }
}
