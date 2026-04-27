package com.elc.system.modules.payroll.repository;

import com.elc.system.modules.payroll.entity.AdjustmentType;
import com.elc.system.modules.payroll.entity.StaffAdjustment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

@Repository
public interface StaffAdjustmentRepository extends JpaRepository<StaffAdjustment, UUID> {

    List<StaffAdjustment> findByUserIdAndEffectiveDateBetween(
            UUID userId, LocalDate startDate, LocalDate endDate);

    @Query("SELECT COALESCE(SUM(sa.amount), 0) FROM StaffAdjustment sa " +
           "WHERE sa.user.id = :userId AND sa.type = :type " +
           "AND sa.effectiveDate BETWEEN :start AND :end")
    BigDecimal sumByUserAndTypeAndDateRange(
            @Param("userId") UUID userId,
            @Param("type") AdjustmentType type,
            @Param("start") LocalDate start,
            @Param("end") LocalDate end);
}
