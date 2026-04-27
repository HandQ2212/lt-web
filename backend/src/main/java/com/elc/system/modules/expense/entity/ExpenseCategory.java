package com.elc.system.modules.expense.entity;

import com.elc.system.core.BaseEntity;
import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "expense_categories", schema = "public")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ExpenseCategory extends BaseEntity {

    @Column(nullable = false, unique = true)
    private String name;

    private String description;

    @Column(name = "is_active")
    @Builder.Default
    private boolean active = true;
}
