package com.elc.system.modules.expense.repository;

import com.elc.system.modules.expense.entity.ExpenseCategory;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface ExpenseCategoryRepository extends JpaRepository<ExpenseCategory, UUID> {

    Optional<ExpenseCategory> findByName(String name);

    List<ExpenseCategory> findByActiveTrue();
}
