package com.elc.system.modules.finance.controller;

import com.elc.system.modules.finance.dto.TransactionDto.PaymentUrlResponse;
import com.elc.system.modules.finance.service.MoMoService;
import com.elc.system.modules.finance.service.VNPayService;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.Map;
import java.util.UUID;

/**
 * Payment gateway controller handling VNPay and MoMo integrations.
 * 
 * Flow:
 * 1. Student/Accountant calls /create → gets payment URL
 * 2. User pays on gateway
 * 3. Gateway sends IPN to /ipn → auto-confirms transaction → auto-updates invoice
 */
@RestController
@RequestMapping("/api/payment")
@RequiredArgsConstructor
@Slf4j
public class PaymentGatewayController {

    private final VNPayService vnPayService;
    private final MoMoService moMoService;

    // ===================== VNPay =====================

    /** Create VNPay payment URL */
    @PostMapping("/vnpay/create")
    public ResponseEntity<PaymentUrlResponse> createVNPayPayment(
            @RequestParam UUID invoiceId,
            @RequestParam BigDecimal amount,
            HttpServletRequest request) {
        String ipAddress = request.getRemoteAddr();
        return ResponseEntity.ok(vnPayService.createPaymentUrl(invoiceId, amount, ipAddress));
    }

    /** VNPay IPN Callback (called by VNPay server) */
    @GetMapping("/vnpay/ipn")
    public ResponseEntity<Map<String, String>> vnpayIpn(@RequestParam Map<String, String> params) {
        boolean valid = vnPayService.verifyIpnCallback(params);
        if (valid) {
            return ResponseEntity.ok(Map.of("RspCode", "00", "Message", "Confirm Success"));
        }
        return ResponseEntity.ok(Map.of("RspCode", "97", "Message", "Invalid Checksum"));
    }

    /** VNPay Return URL (user redirect after payment) */
    @GetMapping("/vnpay/return")
    public ResponseEntity<Map<String, String>> vnpayReturn(@RequestParam Map<String, String> params) {
        String responseCode = params.get("vnp_ResponseCode");
        String txnRef = params.get("vnp_TxnRef");
        if ("00".equals(responseCode)) {
            return ResponseEntity.ok(Map.of("status", "SUCCESS", "txnRef", txnRef));
        }
        return ResponseEntity.ok(Map.of("status", "FAILED", "txnRef", txnRef));
    }

    // ===================== MoMo =====================

    /** Create MoMo payment URL */
    @PostMapping("/momo/create")
    public ResponseEntity<PaymentUrlResponse> createMoMoPayment(
            @RequestParam UUID invoiceId,
            @RequestParam BigDecimal amount) {
        return ResponseEntity.ok(moMoService.createPaymentUrl(invoiceId, amount));
    }

    /** MoMo IPN Callback (called by MoMo server) */
    @PostMapping("/momo/ipn")
    public ResponseEntity<Void> momoIpn(@RequestBody Map<String, String> params) {
        moMoService.verifyIpnCallback(params);
        return ResponseEntity.noContent().build();
    }
}
