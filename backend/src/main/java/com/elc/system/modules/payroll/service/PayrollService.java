package com.elc.system.modules.payroll.service;

import com.elc.system.modules.auth.entity.User;
import com.elc.system.modules.auth.entity.UserRole;
import com.elc.system.modules.auth.repository.UserRepository;
import com.elc.system.modules.auth.service.UserService;
import com.elc.system.modules.payroll.dto.PayrollDto.*;
import com.elc.system.modules.payroll.entity.AdjustmentType;
import com.elc.system.modules.payroll.entity.StaffAdjustment;
import com.elc.system.modules.payroll.repository.StaffAdjustmentRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

/**
 * Payroll service calculating teacher salary based on attendance sessions.
 *
 * Formula: netSalary = (totalSessions * ratePerSession) + bonuses - penalties
 *
 * Note: Attendance data comes from DEV 3's attendance table.
 * This service queries it via native query since the entity may not exist yet.
 */
@Service
@Slf4j
@RequiredArgsConstructor
public class PayrollService {

    private final StaffAdjustmentRepository adjustmentRepository;
    private final UserRepository userRepository;
    private final UserService userService;

    @Value("${payroll.default-rate-per-session:300000}")
    private BigDecimal defaultRatePerSession;

    /**
     * Calculate payroll for a specific teacher for a given month.
     */
    @Transactional(readOnly = true)
    public PayrollResponse calculatePayroll(UUID teacherId, int month, int year) {
        User teacher = userRepository.findById(teacherId)
                .orElseThrow(() -> new RuntimeException("Teacher not found: " + teacherId));

        if (teacher.getRole() != UserRole.TEACHER) {
            throw new IllegalArgumentException("User is not a TEACHER");
        }

        LocalDate startDate = LocalDate.of(year, month, 1);
        LocalDate endDate = startDate.plusMonths(1).minusDays(1);

        // Count teaching sessions from attendance (query attendance table)
        // Note: Using count of distinct session_dates where teacher had a class
        int totalSessions = countTeachingSessions(teacherId, startDate, endDate);

        BigDecimal baseSalary = defaultRatePerSession.multiply(BigDecimal.valueOf(totalSessions));

        // Get bonuses and penalties
        BigDecimal totalBonuses = adjustmentRepository.sumByUserAndTypeAndDateRange(
                teacherId, AdjustmentType.BONUS, startDate, endDate);
        BigDecimal totalPenalties = adjustmentRepository.sumByUserAndTypeAndDateRange(
                teacherId, AdjustmentType.PENALTY, startDate, endDate);

        BigDecimal netSalary = baseSalary.add(totalBonuses).subtract(totalPenalties);

        List<StaffAdjustment> adjustments = adjustmentRepository
                .findByUserIdAndEffectiveDateBetween(teacherId, startDate, endDate);

        log.info("Payroll calculated for teacher {}: {} sessions, net salary: {}",
                teacher.getEmail(), totalSessions, netSalary);

        return PayrollResponse.builder()
                .teacherId(teacherId)
                .teacherName(teacher.getFullName())
                .teacherEmail(teacher.getEmail())
                .totalSessions(totalSessions)
                .ratePerSession(defaultRatePerSession)
                .baseSalary(baseSalary)
                .totalBonuses(totalBonuses)
                .totalPenalties(totalPenalties)
                .netSalary(netSalary)
                .month(month)
                .year(year)
                .adjustments(adjustments.stream().map(this::mapAdjustment).toList())
                .build();
    }

    /**
     * Calculate payroll summary for all teachers in a month.
     */
    @Transactional(readOnly = true)
    public PayrollSummary calculateMonthlyPayroll(int month, int year) {
        List<User> teachers = userRepository.findActiveByRole(UserRole.TEACHER);

        List<PayrollResponse> payrollDetails = teachers.stream()
                .map(t -> calculatePayroll(t.getId(), month, year))
                .toList();

        BigDecimal totalCost = payrollDetails.stream()
                .map(PayrollResponse::getNetSalary)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        return PayrollSummary.builder()
                .month(month)
                .year(year)
                .totalTeachers(teachers.size())
                .totalSalaryCost(totalCost)
                .payrollDetails(payrollDetails)
                .build();
    }

    @Transactional
    public AdjustmentResponse createAdjustment(CreateAdjustmentRequest request) {
        User currentUser = userService.getCurrentUser();
        User targetUser = userRepository.findById(request.getUserId())
                .orElseThrow(() -> new RuntimeException("User not found: " + request.getUserId()));

        StaffAdjustment adjustment = StaffAdjustment.builder()
                .user(targetUser)
                .type(request.getType())
                .amount(request.getAmount())
                .reason(request.getReason())
                .effectiveDate(request.getEffectiveDate() != null
                        ? request.getEffectiveDate() : LocalDate.now())
                .approvedBy(currentUser)
                .build();

        adjustmentRepository.save(adjustment);
        log.info("Staff adjustment created: {} {} for user {}",
                request.getType(), request.getAmount(), targetUser.getEmail());

        return mapAdjustment(adjustment);
    }

    /**
     * Count teaching sessions from attendance table.
     * Uses the class→teacher relationship and distinct session dates.
     */
    private int countTeachingSessions(UUID teacherId, LocalDate startDate, LocalDate endDate) {
        // TODO: When DEV 3 completes Attendance entity, replace with JPA query:
        // SELECT COUNT(DISTINCT a.session_date) FROM attendance a
        // JOIN classes c ON a.class_id = c.id
        // WHERE c.teacher_id = :teacherId
        // AND a.session_date BETWEEN :startDate AND :endDate
        //
        // For now, return 0 (stub). Will integrate with DEV 3's attendance module.
        log.warn("Teaching session count is STUB - awaiting DEV 3 attendance integration");
        return 0;
    }

    private AdjustmentResponse mapAdjustment(StaffAdjustment adjustment) {
        return AdjustmentResponse.builder()
                .id(adjustment.getId())
                .type(adjustment.getType().name())
                .amount(adjustment.getAmount())
                .reason(adjustment.getReason())
                .effectiveDate(adjustment.getEffectiveDate())
                .approvedByName(adjustment.getApprovedBy() != null
                        ? adjustment.getApprovedBy().getFullName() : null)
                .createdAt(adjustment.getCreatedAt())
                .build();
    }
}
