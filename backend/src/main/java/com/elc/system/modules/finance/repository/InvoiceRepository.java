package com.elc.system.modules.finance.repository;

import com.elc.system.modules.finance.entity.Invoice;
import com.elc.system.modules.finance.entity.InvoiceStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

@Repository
public interface InvoiceRepository extends JpaRepository<Invoice, UUID> {

    Page<Invoice> findByStudentId(UUID studentId, Pageable pageable);

    Page<Invoice> findByStatus(InvoiceStatus status, Pageable pageable);

    /** Overdue unpaid invoices (debt list) */
    @Query("SELECT i FROM Invoice i WHERE i.status = 'PENDING' AND i.dueDate < :now")
    Page<Invoice> findOverdueInvoices(@Param("now") LocalDate now, Pageable pageable);

    /** Revenue: sum of confirmed invoices in date range */
    @Query("SELECT COALESCE(SUM(i.paidAmount), 0) FROM Invoice i WHERE i.status = 'CONFIRMED' " +
           "AND i.createdAt >= :startDate AND i.createdAt <= :endDate")
    java.math.BigDecimal sumConfirmedRevenue(
            @Param("startDate") java.time.ZonedDateTime startDate,
            @Param("endDate") java.time.ZonedDateTime endDate);

    /** Find invoices by enrollment */
    List<Invoice> findByEnrollmentId(UUID enrollmentId);

    /** Count pending invoices for a student */
    long countByStudentIdAndStatus(UUID studentId, InvoiceStatus status);
}
