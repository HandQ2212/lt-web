package com.elc.system.modules.finance.dto;

import com.elc.system.modules.finance.entity.TransactionMethod;
import com.elc.system.modules.finance.entity.TransactionType;
import lombok.Data;
import java.math.BigDecimal;
import java.util.UUID;

@Data
public class TransactionRequest {
    private UUID invoiceId;
    private UUID studentId;
    private BigDecimal amount;
    private TransactionType type;
    private TransactionMethod method;
    private String description;
}
