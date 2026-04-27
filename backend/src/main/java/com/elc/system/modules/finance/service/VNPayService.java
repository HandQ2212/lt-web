package com.elc.system.modules.finance.service;

import com.elc.system.modules.finance.config.VNPayConfig;
import com.elc.system.modules.finance.dto.TransactionDto.PaymentUrlResponse;
import com.elc.system.modules.finance.entity.TransactionMethod;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import java.math.BigDecimal;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.time.ZonedDateTime;
import java.time.format.DateTimeFormatter;
import java.util.*;

/**
 * VNPay payment gateway integration.
 *
 * Payment Flow:
 * 1. Frontend calls POST /api/payment/vnpay/create → receives paymentUrl
 * 2. User redirected to VNPay gateway to complete payment
 * 3. VNPay sends IPN callback to POST /api/payment/vnpay/ipn
 * 4. TransactionService.handlePaymentCallback() auto-updates Invoice
 * 5. User redirected back to returnUrl (frontend confirmation page)
 */
@Service
@Slf4j
@RequiredArgsConstructor
public class VNPayService {

    private final VNPayConfig vnPayConfig;
    private final TransactionService transactionService;

    /**
     * Create VNPay payment URL for an invoice.
     */
    public PaymentUrlResponse createPaymentUrl(UUID invoiceId, BigDecimal amount, String ipAddress) {
        String txnRef = UUID.randomUUID().toString().replace("-", "").substring(0, 16);
        long amountInVND = amount.multiply(BigDecimal.valueOf(100)).longValue();

        // Create transaction record with external ref
        transactionService.createGatewayTransaction(invoiceId, amount,
                TransactionMethod.ONLINE, "VNPAY_" + txnRef);

        Map<String, String> params = new TreeMap<>();
        params.put("vnp_Version", vnPayConfig.getVersion());
        params.put("vnp_Command", vnPayConfig.getCommand());
        params.put("vnp_TmnCode", vnPayConfig.getTmnCode());
        params.put("vnp_Amount", String.valueOf(amountInVND));
        params.put("vnp_CurrCode", "VND");
        params.put("vnp_TxnRef", txnRef);
        params.put("vnp_OrderInfo", "Thanh toan hoc phi ELC - " + invoiceId);
        params.put("vnp_OrderType", vnPayConfig.getOrderType());
        params.put("vnp_Locale", "vn");
        params.put("vnp_ReturnUrl", vnPayConfig.getReturnUrl());
        params.put("vnp_IpAddr", ipAddress);
        params.put("vnp_CreateDate", ZonedDateTime.now()
                .format(DateTimeFormatter.ofPattern("yyyyMMddHHmmss")));

        String queryString = buildQueryString(params);
        String secureHash = hmacSHA512(vnPayConfig.getHashSecret(), queryString);
        String paymentUrl = vnPayConfig.getPayUrl() + "?" + queryString + "&vnp_SecureHash=" + secureHash;

        log.info("VNPay payment URL created for invoice {} with txnRef {}", invoiceId, txnRef);

        return PaymentUrlResponse.builder()
                .paymentUrl(paymentUrl)
                .orderId(txnRef)
                .provider("VNPAY")
                .build();
    }

    /**
     * Verify VNPay IPN callback signature and process payment.
     */
    public boolean verifyIpnCallback(Map<String, String> params) {
        String secureHash = params.get("vnp_SecureHash");
        params.remove("vnp_SecureHash");
        params.remove("vnp_SecureHashType");

        String queryString = buildQueryString(new TreeMap<>(params));
        String expectedHash = hmacSHA512(vnPayConfig.getHashSecret(), queryString);

        if (!secureHash.equals(expectedHash)) {
            log.warn("VNPay IPN: Invalid signature");
            return false;
        }

        String txnRef = params.get("vnp_TxnRef");
        String responseCode = params.get("vnp_ResponseCode");
        boolean success = "00".equals(responseCode);

        transactionService.handlePaymentCallback("VNPAY_" + txnRef, success);
        log.info("VNPay IPN processed: txnRef={}, success={}", txnRef, success);
        return true;
    }

    private String buildQueryString(Map<String, String> params) {
        StringBuilder sb = new StringBuilder();
        for (Map.Entry<String, String> entry : params.entrySet()) {
            if (sb.length() > 0) sb.append("&");
            sb.append(URLEncoder.encode(entry.getKey(), StandardCharsets.UTF_8))
              .append("=")
              .append(URLEncoder.encode(entry.getValue(), StandardCharsets.UTF_8));
        }
        return sb.toString();
    }

    private String hmacSHA512(String key, String data) {
        try {
            Mac mac = Mac.getInstance("HmacSHA512");
            SecretKeySpec secretKeySpec = new SecretKeySpec(key.getBytes(StandardCharsets.UTF_8), "HmacSHA512");
            mac.init(secretKeySpec);
            byte[] hash = mac.doFinal(data.getBytes(StandardCharsets.UTF_8));
            StringBuilder hexString = new StringBuilder();
            for (byte b : hash) {
                String hex = Integer.toHexString(0xff & b);
                if (hex.length() == 1) hexString.append('0');
                hexString.append(hex);
            }
            return hexString.toString();
        } catch (Exception e) {
            throw new RuntimeException("Error generating HMAC SHA512", e);
        }
    }
}
