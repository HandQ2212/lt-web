package com.elc.system.modules.finance.service;

import com.elc.system.modules.finance.config.MoMoConfig;
import com.elc.system.modules.finance.dto.TransactionDto.PaymentUrlResponse;
import com.elc.system.modules.finance.entity.TransactionMethod;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import java.math.BigDecimal;
import java.nio.charset.StandardCharsets;
import java.util.Map;
import java.util.UUID;

/**
 * MoMo payment gateway integration.
 *
 * Payment Flow:
 * 1. Frontend calls POST /api/payment/momo/create → receives paymentUrl
 * 2. User redirected to MoMo app/web to complete payment
 * 3. MoMo sends IPN callback to POST /api/payment/momo/ipn
 * 4. TransactionService.handlePaymentCallback() auto-updates Invoice
 * 5. User redirected back to returnUrl (frontend confirmation page)
 */
@Service
@Slf4j
@RequiredArgsConstructor
public class MoMoService {

    private final MoMoConfig moMoConfig;
    private final TransactionService transactionService;

    /**
     * Create MoMo payment URL for an invoice.
     */
    public PaymentUrlResponse createPaymentUrl(UUID invoiceId, BigDecimal amount) {
        String orderId = "MOMO_" + UUID.randomUUID().toString().replace("-", "").substring(0, 16);
        String requestId = UUID.randomUUID().toString();
        long amountLong = amount.longValue();
        String orderInfo = "Thanh toan hoc phi ELC - " + invoiceId;

        // Create transaction record with external ref
        transactionService.createGatewayTransaction(invoiceId, amount,
                TransactionMethod.ONLINE, orderId);

        // Build raw signature
        String rawSignature = String.format(
                "accessKey=%s&amount=%d&extraData=&ipnUrl=%s&orderId=%s&orderInfo=%s&partnerCode=%s&redirectUrl=%s&requestId=%s&requestType=%s",
                moMoConfig.getAccessKey(), amountLong, moMoConfig.getIpnUrl(),
                orderId, orderInfo, moMoConfig.getPartnerCode(),
                moMoConfig.getReturnUrl(), requestId, moMoConfig.getRequestType());

        String signature = hmacSHA256(moMoConfig.getSecretKey(), rawSignature);

        // In production: Make HTTP POST to MoMo API and parse payUrl from response.
        // For now, return the constructed parameters (MoMo requires server-to-server call).
        String paymentUrl = moMoConfig.getPayUrl()
                + "?partnerCode=" + moMoConfig.getPartnerCode()
                + "&orderId=" + orderId
                + "&amount=" + amountLong
                + "&orderInfo=" + orderInfo
                + "&requestId=" + requestId
                + "&requestType=" + moMoConfig.getRequestType()
                + "&signature=" + signature;

        log.info("MoMo payment URL created for invoice {} with orderId {}", invoiceId, orderId);

        return PaymentUrlResponse.builder()
                .paymentUrl(paymentUrl)
                .orderId(orderId)
                .provider("MOMO")
                .build();
    }

    /**
     * Verify MoMo IPN callback and process payment.
     */
    public boolean verifyIpnCallback(Map<String, String> params) {
        String orderId = params.get("orderId");
        String resultCode = params.get("resultCode");
        boolean success = "0".equals(resultCode);

        // TODO: Verify signature from MoMo callback for security
        transactionService.handlePaymentCallback(orderId, success);
        log.info("MoMo IPN processed: orderId={}, success={}", orderId, success);
        return true;
    }

    private String hmacSHA256(String key, String data) {
        try {
            Mac mac = Mac.getInstance("HmacSHA256");
            SecretKeySpec secretKeySpec = new SecretKeySpec(key.getBytes(StandardCharsets.UTF_8), "HmacSHA256");
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
            throw new RuntimeException("Error generating HMAC SHA256", e);
        }
    }
}
