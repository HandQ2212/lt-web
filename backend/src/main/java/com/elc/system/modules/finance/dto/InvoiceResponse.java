package com.elc.system.modules.finance.dto;

import com.elc.system.modules.finance.entity.TransactionStatus;
import lombok.Data;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.UUID;

@Data
public class InvoiceResponse {
    private UUID id;
    private String studentName;
    private BigDecimal totalAmount;
    private LocalDate dueDate;
    private TransactionStatus status;
}
