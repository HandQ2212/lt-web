package com.elc.system.modules.lead.entity;

public enum LeadStatus {
    NEW,            // Mới đăng ký
    INTERESTED,     // Quan tâm
    CONSULTING,     // Đang liên hệ, tư vấn
    CONTACTED,      // Đã liên hệ (Tương thích ngược)
    AGREED,         // Đồng ý (Đã chọn lớp, chờ thanh toán)
    PAID,           // Đã thanh toán
    CONVERTED,      // Đã chuyển thành Student
    REJECTED        // Từ chối
}
