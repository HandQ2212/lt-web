package com.elc.system.modules.finance.repository;

import com.elc.system.modules.finance.entity.Transaction;
import com.elc.system.modules.finance.entity.TransactionStatus;
import com.elc.system.modules.finance.entity.TransactionType;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.time.ZonedDateTime;
import java.util.List;
import java.util.UUID;

@Repository
public interface TransactionRepository extends JpaRepository<Transaction, UUID> {

    List<Transaction> findByInvoiceId(UUID invoiceId);

    Page<Transaction> findByStudentId(UUID studentId, Pageable pageable);

    /** Sum confirmed payments for an invoice (partial payment tracking) */
    @Query("SELECT COALESCE(SUM(t.amount), 0) FROM Transaction t " +
           "WHERE t.invoice.id = :invoiceId AND t.status = 'CONFIRMED'")
    BigDecimal sumConfirmedByInvoiceId(@Param("invoiceId") UUID invoiceId);

    /** Revenue by type in date range */
    @Query("SELECT COALESCE(SUM(t.amount), 0) FROM Transaction t " +
           "WHERE t.type = :type AND t.status = 'CONFIRMED' " +
           "AND t.createdAt >= :start AND t.createdAt <= :end")
    BigDecimal sumByTypeAndDateRange(
            @Param("type") TransactionType type,
            @Param("start") ZonedDateTime start,
            @Param("end") ZonedDateTime end);

    /** Find by external reference (VNPay/MoMo callback lookup) */
    Transaction findByExternalRef(String externalRef);

    long countByStatusAndType(TransactionStatus status, TransactionType type);
}
