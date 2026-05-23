package com.elc.system.modules.finance.service;

import com.elc.system.modules.auth.entity.User;
import com.elc.system.modules.finance.dto.ExpenseDto.ExpenseRequest;
import com.elc.system.modules.finance.dto.ExpenseDto.ExpenseResponse;
import com.elc.system.modules.finance.entity.Expense;
import com.elc.system.modules.finance.repository.ExpenseRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ExpenseService {

    private final ExpenseRepository expenseRepository;

    @org.springframework.transaction.annotation.Transactional(readOnly = true)
    public List<ExpenseResponse> getAllExpenses() {
        return expenseRepository.findAll().stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Transactional
    public ExpenseResponse createExpense(ExpenseRequest request, User staff) {
        Expense expense = Expense.builder()
                .category(request.getCategory())
                .amount(request.getAmount())
                .expenseDate(request.getExpenseDate() != null ? request.getExpenseDate() : java.time.LocalDate.now())
                .vendor(request.getVendor())
                .receiptUrl(request.getReceiptUrl())
                .notes(request.getNotes())
                .approvedBy(staff)
                .build();

        return mapToResponse(expenseRepository.save(expense));
    }

    private ExpenseResponse mapToResponse(Expense expense) {
        return ExpenseResponse.builder()
                .id(expense.getId())
                .category(expense.getCategory())
                .amount(expense.getAmount())
                .expenseDate(expense.getExpenseDate())
                .vendor(expense.getVendor())
                .receiptUrl(expense.getReceiptUrl())
                .approvedById(expense.getApprovedBy() != null ? expense.getApprovedBy().getId() : null)
                .approvedByName(expense.getApprovedBy() != null ? expense.getApprovedBy().getFullName() : null)
                .notes(expense.getNotes())
                .build();
    }
}
