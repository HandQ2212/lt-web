package com.elc.system.modules.expense.repository;

import com.elc.system.modules.expense.entity.Expense;
import com.elc.system.modules.expense.entity.ExpenseStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.time.ZonedDateTime;
import java.util.UUID;

@Repository
public interface ExpenseRepository extends JpaRepository<Expense, UUID> {

    Page<Expense> findByStatus(ExpenseStatus status, Pageable pageable);

    Page<Expense> findByCategory(String category, Pageable pageable);

    @Query("SELECT COALESCE(SUM(e.amount), 0) FROM Expense e " +
           "WHERE e.status = 'APPROVED' AND e.createdAt >= :start AND e.createdAt <= :end")
    BigDecimal sumApprovedExpenses(@Param("start") ZonedDateTime start, @Param("end") ZonedDateTime end);

    @Query("SELECT e.category, COALESCE(SUM(e.amount), 0) FROM Expense e " +
           "WHERE e.status = 'APPROVED' AND e.createdAt >= :start AND e.createdAt <= :end " +
           "GROUP BY e.category")
    java.util.List<Object[]> sumByCategory(@Param("start") ZonedDateTime start, @Param("end") ZonedDateTime end);
}
