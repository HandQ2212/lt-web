package com.elc.system.modules.finance.entity;

import com.elc.system.modules.auth.entity.User;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.ZonedDateTime;
import java.util.UUID;

@Entity
@Table(name = "expenses")
@Getter
@Setter
public class Expense {

    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private UUID id;

    @Column(nullable = false)
    private String category;

    @Column(nullable = false)
    private BigDecimal amount;

    @Column(name = "expense_date")
    private LocalDate expenseDate = LocalDate.now();

    private String vendor;

    @Column(name = "receipt_url")
    private String receiptUrl;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "approved_by")
    private User approvedBy;

    private String notes;

    @Column(name = "updated_at")
    private ZonedDateTime updatedAt = ZonedDateTime.now();

    @PreUpdate
    protected void onUpdate() {
        updatedAt = ZonedDateTime.now();
    }
}
