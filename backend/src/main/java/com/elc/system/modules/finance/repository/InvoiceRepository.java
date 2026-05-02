package com.elc.system.modules.finance.repository;

import com.elc.system.modules.finance.entity.Invoice;
import com.elc.system.modules.finance.entity.InvoiceStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface InvoiceRepository extends JpaRepository<Invoice, UUID> {
    List<Invoice> findByEnrollmentId(UUID enrollmentId);
    List<Invoice> findByStatus(InvoiceStatus status);

    @org.springframework.data.jpa.repository.Query("SELECT i FROM Invoice i WHERE i.status IN (com.elc.system.modules.finance.entity.InvoiceStatus.UNPAID, com.elc.system.modules.finance.entity.InvoiceStatus.PARTIAL, com.elc.system.modules.finance.entity.InvoiceStatus.PENDING)")
    List<Invoice> findDebtInvoices();

    @org.springframework.data.jpa.repository.Query("SELECT COALESCE(SUM(i.finalAmount), 0) FROM Invoice i")
    java.math.BigDecimal getTotalInvoicedAmount();
}
