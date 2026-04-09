package com.elc.system.modules.finance.entity;

import com.elc.system.core.BaseEntity;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.UUID;

@Entity
@Table(name = "promotions")
@Getter
@Setter
public class Promotion extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private UUID id;

    @Column(unique = true, nullable = false)
    private String code;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private PromotionType type; // PERCENTAGE, FIXED_AMOUNT

    @Column(nullable = false)
    private BigDecimal amount;

    @Column(name = "min_purchase")
    private BigDecimal minPurchase = BigDecimal.ZERO;

    @Column(name = "expiry_date")
    private LocalDate expiryDate;

    @Column(name = "usage_limit")
    private Integer usageLimit = 100;

    @Column(name = "usage_count")
    private Integer usageCount = 0;

    @Column(name = "is_active")
    private Boolean isActive = true;
}
