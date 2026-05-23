package com.elc.system.modules.finance.repository;

import com.elc.system.modules.finance.entity.Expense;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.UUID;

@Repository
public interface ExpenseRepository extends JpaRepository<Expense, UUID> {
    @org.springframework.data.jpa.repository.Query("SELECT COALESCE(SUM(e.amount), 0) FROM Expense e")
    java.math.BigDecimal getTotalExpenses();

    @org.springframework.data.jpa.repository.Query("SELECT e.category, SUM(e.amount) FROM Expense e GROUP BY e.category")
    java.util.List<Object[]> getExpensesByCategory();

    @org.springframework.data.jpa.repository.Query("SELECT FUNCTION('TO_CHAR', e.expenseDate, 'YYYY-MM') as month, SUM(e.amount) FROM Expense e GROUP BY FUNCTION('TO_CHAR', e.expenseDate, 'YYYY-MM')")
    java.util.List<Object[]> getExpensesByMonth();
}
