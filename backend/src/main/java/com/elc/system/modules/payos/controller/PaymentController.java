package com.elc.system.modules.payos.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import vn.payos.PayOS;
import vn.payos.model.v2.paymentRequests.CreatePaymentLinkRequest;
import vn.payos.model.v2.paymentRequests.CreatePaymentLinkResponse;
import vn.payos.model.webhooks.Webhook;
import vn.payos.model.webhooks.WebhookData;

import com.elc.system.modules.finance.dto.PaymentDto.PaymentRequest;
import com.elc.system.modules.finance.entity.PaymentMethod;
import com.elc.system.modules.finance.service.PaymentService;

import java.math.BigDecimal;
import java.time.ZonedDateTime;
import java.util.Map;
import java.util.UUID;
import java.util.concurrent.ConcurrentHashMap;

@RestController("payOsPaymentController")
@RequestMapping("/api/v1/payment")
public class PaymentController {

    private final PayOS payOS;
    private final PaymentService paymentService;
    
    // Lưu tạm thời mapping giữa mã đơn hàng PayOS và InvoiceID để khi Webhook về ta biết cập nhật cho hóa đơn nào
    private static final Map<Long, UUID> orderInvoiceMap = new ConcurrentHashMap<>();

    public PaymentController(PayOS payOS, PaymentService paymentService) {
        this.payOS = payOS;
        this.paymentService = paymentService;
    }

    // 1. API tạo link thanh toán (Cho cả Web và Mobile)
    @PostMapping("/create-link")
    public ResponseEntity<?> createPaymentLink(@RequestBody Map<String, Object> request) {
        try {
            // Lưu ý: orderCode phải là số kiểu long (không trùng lặp)
            long orderCode = System.currentTimeMillis() / 1000; 
            int amount = (int) request.get("amount");
            String description = "ELC #" + orderCode; // Rút ngắn để < 25 ký tự theo quy định PayOS
            
            // Lấy invoiceId từ request và lưu vào map
            if (request.containsKey("invoiceId")) {
                String invoiceIdStr = (String) request.get("invoiceId");
                orderInvoiceMap.put(orderCode, UUID.fromString(invoiceIdStr));
            }
            
            // Link trả về sau khi khách thanh toán xong trên trình duyệt
            String returnUrl = (String) request.getOrDefault("returnUrl", "https://elc.handq2212.site/student/payments");
            String cancelUrl = (String) request.getOrDefault("cancelUrl", "https://elc.handq2212.site/student/payments");

            CreatePaymentLinkRequest paymentRequest = CreatePaymentLinkRequest.builder()
                    .orderCode(orderCode)
                    .amount((long) amount)
                    .description(description)
                    .returnUrl(returnUrl)
                    .cancelUrl(cancelUrl)
                    .build();

            CreatePaymentLinkResponse data = payOS.paymentRequests().create(paymentRequest);
            
            // Trả checkoutUrl về cho Mobile mở trình duyệt hoặc Web nhúng Form
            return ResponseEntity.ok(data);
        } catch (Exception e) {
            return ResponseEntity.status(500).body(e.getMessage());
        }
    }

    // 2. Webhook: PayOS sẽ gọi vào đây khi tiền về tài khoản MB của bạn
    @PostMapping("/payos-webhook")
    public ResponseEntity<?> handlePayOSWebhook(@RequestBody Webhook payload) {
        try {
            // Tự động kiểm tra Checksum Key để verify dữ liệu đúng từ PayOS
            WebhookData data = payOS.webhooks().verify(payload);
            
            long orderCode = data.getOrderCode();
            
            // CẬP NHẬT DATABASE Ở ĐÂY
            UUID invoiceId = orderInvoiceMap.get(orderCode);
            if (invoiceId != null) {
                PaymentRequest req = PaymentRequest.builder()
                        .invoiceId(invoiceId)
                        .amount(BigDecimal.valueOf(data.getAmount()))
                        .paymentDate(ZonedDateTime.now())
                        .paymentMethod(PaymentMethod.BANK_TRANSFER)
                        .transactionId(String.valueOf(orderCode))
                        .notes("Thanh toán tự động qua PayOS Webhook")
                        .build();
                        
                paymentService.createPayment(req);
                orderInvoiceMap.remove(orderCode); // dọn dẹp cache
                System.out.println("Đã ghi nhận thanh toán tự động (Webhook) cho hóa đơn: " + invoiceId);
            } else {
                System.out.println("Thanh toán thành công đơn hàng: " + orderCode + " nhưng không tìm thấy trong cache!");
            }

            return ResponseEntity.ok("Success");
        } catch (Exception e) {
            // Nếu chữ ký không khớp hoặc dữ liệu lỗi
            return ResponseEntity.status(400).body("Invalid Webhook Data");
        }
    }
}
