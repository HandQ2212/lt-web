package com.elc.system.modules.finance.repository;

import com.elc.system.modules.finance.entity.Payment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface PaymentRepository extends JpaRepository<Payment, UUID> {
    List<Payment> findByInvoiceId(UUID invoiceId);

    @org.springframework.data.jpa.repository.Query("SELECT COALESCE(SUM(p.amount), 0) FROM Payment p")
    java.math.BigDecimal getTotalRevenue();

    @org.springframework.data.jpa.repository.Query("SELECT COALESCE(SUM(p.amount), 0) FROM Payment p WHERE p.invoice.enrollment.clazz.branch.id = :branchId")
    java.math.BigDecimal getTotalRevenueByBranchId(@org.springframework.data.repository.query.Param("branchId") UUID branchId);

    @org.springframework.data.jpa.repository.Query("SELECT FUNCTION('TO_CHAR', p.paymentDate, 'YYYY-MM') as month, SUM(p.amount) FROM Payment p GROUP BY FUNCTION('TO_CHAR', p.paymentDate, 'YYYY-MM')")
    List<Object[]> getRevenueByMonth();

    @org.springframework.data.jpa.repository.Query("SELECT p.paymentMethod, SUM(p.amount) FROM Payment p GROUP BY p.paymentMethod")
    List<Object[]> getRevenueByMethod();
}
