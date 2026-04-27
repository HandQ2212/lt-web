package com.elc.system.modules.expense.service;

import com.elc.system.modules.auth.entity.User;
import com.elc.system.modules.auth.entity.UserRole;
import com.elc.system.modules.auth.service.UserService;
import com.elc.system.modules.expense.dto.ExpenseDto.*;
import com.elc.system.modules.expense.entity.Expense;
import com.elc.system.modules.expense.entity.ExpenseCategory;
import com.elc.system.modules.expense.entity.ExpenseStatus;
import com.elc.system.modules.expense.repository.ExpenseCategoryRepository;
import com.elc.system.modules.expense.repository.ExpenseRepository;
import com.elc.system.modules.notification.entity.NotificationType;
import com.elc.system.modules.notification.service.NotificationService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

@Service
@Slf4j
@RequiredArgsConstructor
public class ExpenseService {

    private final ExpenseRepository expenseRepository;
    private final ExpenseCategoryRepository categoryRepository;
    private final UserService userService;
    private final NotificationService notificationService;

    @Transactional
    public ExpenseResponse createExpense(CreateExpenseRequest request) {
        ExpenseCategory category = null;
        if (request.getCategoryId() != null) {
            category = categoryRepository.findById(request.getCategoryId()).orElse(null);
        }

        Expense expense = Expense.builder()
                .category(request.getCategory())
                .expenseCategory(category)
                .amount(request.getAmount())
                .expenseDate(request.getExpenseDate() != null
                        ? request.getExpenseDate() : java.time.LocalDate.now())
                .vendor(request.getVendor())
                .receiptUrl(request.getReceiptUrl())
                .notes(request.getNotes())
                .status(ExpenseStatus.DRAFT)
                .branchId(request.getBranchId())
                .build();

        expenseRepository.save(expense);
        log.info("Expense created: {} - {} VNĐ", request.getCategory(), request.getAmount());
        return mapToResponse(expense);
    }

    public Page<ExpenseResponse> getAllExpenses(Pageable pageable) {
        return expenseRepository.findAll(pageable).map(this::mapToResponse);
    }

    public Page<ExpenseResponse> getExpensesByStatus(ExpenseStatus status, Pageable pageable) {
        return expenseRepository.findByStatus(status, pageable).map(this::mapToResponse);
    }

    public ExpenseResponse getExpenseById(UUID id) {
        Expense expense = expenseRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Expense not found: " + id));
        return mapToResponse(expense);
    }

    /** Submit expense for approval (Accountant → Manager) */
    @Transactional
    public ExpenseResponse submitForApproval(UUID expenseId) {
        Expense expense = expenseRepository.findById(expenseId)
                .orElseThrow(() -> new RuntimeException("Expense not found: " + expenseId));

        if (expense.getStatus() != ExpenseStatus.DRAFT) {
            throw new IllegalStateException("Only DRAFT expenses can be submitted");
        }

        expense.setStatus(ExpenseStatus.PENDING_APPROVAL);
        expenseRepository.save(expense);
        log.info("Expense {} submitted for approval", expenseId);
        return mapToResponse(expense);
    }

    /** Approve or reject expense (Manager only) */
    @Transactional
    public ExpenseResponse processApproval(UUID expenseId, boolean approved, String reason) {
        User currentUser = userService.getCurrentUser();
        if (currentUser.getRole() != UserRole.MANAGER) {
            throw new RuntimeException("Only MANAGER can approve/reject expenses");
        }

        Expense expense = expenseRepository.findById(expenseId)
                .orElseThrow(() -> new RuntimeException("Expense not found: " + expenseId));

        if (expense.getStatus() != ExpenseStatus.PENDING_APPROVAL) {
            throw new IllegalStateException("Only PENDING_APPROVAL expenses can be processed");
        }

        expense.setStatus(approved ? ExpenseStatus.APPROVED : ExpenseStatus.REJECTED);
        expense.setApprovedBy(currentUser);
        if (reason != null) {
            expense.setNotes(expense.getNotes() != null
                    ? expense.getNotes() + " | " + reason : reason);
        }

        expenseRepository.save(expense);
        log.info("Expense {} {} by {}", expenseId, approved ? "APPROVED" : "REJECTED",
                currentUser.getEmail());

        return mapToResponse(expense);
    }

    // ---- Category Management ----

    public List<CategoryResponse> getAllCategories() {
        return categoryRepository.findByActiveTrue().stream()
                .map(this::mapCategoryToResponse).toList();
    }

    @Transactional
    public CategoryResponse createCategory(CreateCategoryRequest request) {
        ExpenseCategory category = ExpenseCategory.builder()
                .name(request.getName())
                .description(request.getDescription())
                .active(true)
                .build();
        categoryRepository.save(category);
        return mapCategoryToResponse(category);
    }

    private ExpenseResponse mapToResponse(Expense expense) {
        return ExpenseResponse.builder()
                .id(expense.getId())
                .category(expense.getCategory())
                .categoryName(expense.getExpenseCategory() != null
                        ? expense.getExpenseCategory().getName() : expense.getCategory())
                .amount(expense.getAmount())
                .expenseDate(expense.getExpenseDate())
                .vendor(expense.getVendor())
                .receiptUrl(expense.getReceiptUrl())
                .approvedByName(expense.getApprovedBy() != null
                        ? expense.getApprovedBy().getFullName() : null)
                .notes(expense.getNotes())
                .status(expense.getStatus().name())
                .createdAt(expense.getCreatedAt())
                .build();
    }

    private CategoryResponse mapCategoryToResponse(ExpenseCategory category) {
        return CategoryResponse.builder()
                .id(category.getId())
                .name(category.getName())
                .description(category.getDescription())
                .active(category.isActive())
                .build();
    }
}
