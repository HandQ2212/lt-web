# ELC Management System - Complete API Specification

**Generated:** 2026-05-16
**Source:** Backend Code Analysis
**Total Endpoints:** 150+
**Purpose:** Complete API catalog for security testing

**Legend:**
- 🔴 = VULNERABLE endpoint (BAC training)
- 🟢 = NEW endpoint (BAC training)

---

## 1. Xác thực & Hồ sơ

| Method | Endpoint | Mô tả | Quyền truy cập |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/auth/register` | Đăng ký tài khoản tự động | CÔNG KHAI |
| `POST` | `/api/auth/login` | Đăng nhập, trả về JWT | CÔNG KHAI |
| `POST` | `/api/auth/logout` | Hủy JWT token | ĐÃ XÁC THỰC |
| `POST` | `/api/auth/refresh` | Làm mới access token | CÔNG KHAI |
| `POST` | `/api/auth/forgot-password` | Yêu cầu reset password qua email | CÔNG KHAI |
| `POST` | `/api/auth/reset-password` | Reset password với token | CÔNG KHAI |
| `GET` | `/api/profile` | Lấy hồ sơ user hiện tại | ĐÃ XÁC THỰC |
| `PUT` | `/api/profile` | Cập nhật thông tin hồ sơ | ĐÃ XÁC THỰC |
| `PUT` | `/api/profile/password` | Đổi mật khẩu | ĐÃ XÁC THỰC |

---

## 2. Quản lý Người dùng

| Method | Endpoint | Mô tả | Quyền truy cập |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/users` | Liệt kê tất cả users (phân trang) | QUẢN LÝ |
| `GET` | `/api/users/teachers` | Lấy danh sách giáo viên đang hoạt động | QUẢN LÝ, KẾ TOÁN |
| `GET` | `/api/users/{id}` | Lấy thông tin chi tiết user | QUẢN LÝ |
| `POST` | `/api/users` | Tạo tài khoản user mới | QUẢN LÝ |
| `PUT` | `/api/users/{id}` | 🔴 **BOPLA** - Cập nhật role/status (bỏ kiểm tra) | ĐÃ XÁC THỰC (vÙng) |
| `DELETE` | `/api/users/{id}` | 🔴 **BFLA** - Xóa user (bỏ kiểm tra) | ĐÃ XÁC THỰC (vÙng) |
| `GET` | `/api/public/teachers` | Lấy hồ sơ giáo viên công khai | CÔNG KHAI |

---

## 3. Quản lý Trường (SMS)

| Method | Endpoint | Mô tả | Quyền truy cập |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/branches` | Liệt kê tất cả chi nhánh | CÔNG KHAI |
| `GET` | `/api/branches/{id}` | Lấy thông tin chi nhánh | CÔNG KHAI |
| `POST` | `/api/branches` | Tạo chi nhánh mới | QUẢN LÝ |
| `PUT` | `/api/branches/{id}` | Cập nhật thông tin chi nhánh | QUẢN LÝ |
| `DELETE` | `/api/branches/{id}` | Xóa chi nhánh | QUẢN LÝ |
| `GET` | `/api/courses` | Liệt kê tất cả khóa học | CÔNG KHAI |
| `GET` | `/api/courses/{id}` | Lấy thông tin khóa học | CÔNG KHAI |
| `POST` | `/api/courses` | Tạo khóa học mới | QUẢN LÝ |
| `PUT` | `/api/courses/{id}` | Cập nhật khóa học | QUẢN LÝ |
| `DELETE` | `/api/courses/{id}` | Xóa khóa học | QUẢN LÝ |
| `GET` | `/api/levels` | Liệt kê tất cả trình độ | CÔNG KHAI |
| `GET` | `/api/levels/{id}` | Lấy thông tin trình độ | CÔNG KHAI |
| `POST` | `/api/levels` | Tạo trình độ mới | QUẢN LÝ |
| `PUT` | `/api/levels/{id}` | Cập nhật trình độ | QUẢN LÝ |
| `DELETE` | `/api/levels/{id}` | Xóa trình độ | QUẢN LÝ |

---

## 5. Quản lý Lớp & Phòng học

| Method | Endpoint | Mô tả | Quyền truy cập |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/rooms` | Liệt kê tất cả phòng | CÔNG KHAI |
| `GET` | `/api/rooms/{id}` | Lấy thông tin phòng | CÔNG KHAI |
| `POST` | `/api/rooms` | Tạo phòng mới | QUẢN LÝ |
| `PUT` | `/api/rooms/{id}` | Cập nhật phòng | QUẢN LÝ |
| `DELETE` | `/api/rooms/{id}` | Xóa phòng | QUẢN LÝ |
| `GET` | `/api/rooms/{id}/availability` | Kiểm tra phòng trống | CÔNG KHAI |
| `GET` | `/api/rooms/{id}/status` | Lấy trạng thái phòng hiện tại | CÔNG KHAI |
| `POST` | `/api/rooms/{id}/schedules` | Đặt phòng cho lịch học | QUẢN LÝ |
| `GET` | `/api/rooms/{id}/schedules` | Lấy lịch phòng | CÔNG KHAI |
| `GET` | `/api/classes` | Liệt kê tất cả lớp | CÔNG KHAI |
| `GET` | `/api/classes/{id}` | 🔴 **BOLA** - Lấy thông tin lớp (không kiểm tra giáo viên) | GIÁO VIÊN, QUẢN LÝ (vÙng) |
| `POST` | `/api/classes` | Mở lớp học mới | QUẢN LÝ |
| `PUT` | `/api/classes/{id}` | Cập nhật thông tin lớp | QUẢN LÝ |
| `DELETE` | `/api/classes/{id}` | Xóa lớp | QUẢN LÝ |
| `PATCH` | `/api/classes/{id}/status` | Cập nhật trạng thái lớp | QUẢN LÝ |
| `GET` | `/api/classes/{id}/schedule` | Lấy lịch học | CÔNG KHAI |
| `POST` | `/api/classes/{id}/schedule` | Thêm lịch vào lớp | QUẢN LÝ |
| `PUT` | `/api/classes/{id}/schedule/{scheduleId}` | Cập nhật lịch | QUẢN LÝ |
| `DELETE` | `/api/classes/{id}/schedule/{scheduleId}` | Xóa lịch | QUẢN LÝ |
| `POST` | `/api/classes/check-conflict` | Kiểm tra xung đột lịch | QUẢN LÝ |

---

## 6. Quản lý Học tập (LMS)

### Đăng ký học

| Method | Endpoint | Mô tả | Quyền truy cập |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/enrollments/class/{classId}` | Lấy đăng ký theo lớp | CÔNG KHAI |
| `GET` | `/api/enrollments/student/{studentId}` | Lấy đăng ký theo học viên | CÔNG KHAI |
| `POST` | `/api/enrollments` | Đăng ký học viên vào lớp | QUẢN LÝ |
| `PATCH` | `/api/enrollments/{id}/status` | Cập nhật trạng thái đăng ký | QUẢN LÝ |
| `PATCH` | `/api/enrollments/{id}/class` | Chuyển học viên sang lớp khác | QUẢN LÝ |

### Bài tập & Nộp bài

| Method | Endpoint | Mô tả | Quyền truy cập |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/assignments/class/{classId}` | Lấy bài tập theo lớp | CÔNG KHAI |
| `GET` | `/api/assignments/mine` | Lấy bài tập của tôi | GIÁO VIÊN, QUẢN LÝ |
| `POST` | `/api/assignments` | Tạo bài tập mới | GIÁO VIÊN, QUẢN LÝ |
| `GET` | `/api/submissions/assignment/{assignmentId}` | Lấy bài nộp theo bài tập | CÔNG KHAI |
| `GET` | `/api/submissions/me` | Lấy bài nộp của tôi | HỌC VIÊN |
| `POST` | `/api/submissions/submit` | Nộp bài tập | HỌC VIÊN |
| `PUT` | `/api/submissions/{id}/grade` | Chấm bài nộp | GIÁO VIÊN, QUẢN LÝ |

### Điểm danh

| Method | Endpoint | Mô tả | Quyền truy cập |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/attendance/{classId}` | Lấy điểm danh theo lớp | ĐÃ XÁC THỰC |
| `POST` | `/api/attendance` | Điểm danh | HỌC VIÊN, GIÁO VIÊN, QUẢN LÝ |
| `GET` | `/api/attendance/report/monthly` | Báo cáo điểm danh hàng tháng | CÔNG KHAI |
| `GET` | `/api/attendance/enrollment/{enrollmentId}` | Lấy điểm danh theo đăng ký | CÔNG KHAI |

### Kết quả học

| Method | Endpoint | Mô tả | Quyền truy cập |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/results/enrollment/{enrollmentId}` | Lấy kết quả theo đăng ký | CÔNG KHAI |
| `POST` | `/api/results` | Lưu kết quả học | GIÁO VIÊN, QUẢN LÝ |

---

## 7. Quản lý Khách hàng (CRM)

| Method | Endpoint | Mô tả | Quyền truy cập |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/leads` | Tạo lead từ form | CÔNG KHAI |
| `GET` | `/api/leads/test` | Test API lead | CÔNG KHAI |
| `GET` | `/api/leads` | Liệt kê leads (phân trang) | QUẢN LÝ, KẾ TOÁN |
| `GET` | `/api/leads/me` | Lấy hồ sơ lead hiện tại | LEAD |
| `POST` | `/api/leads/me/interests` | Thêm sở thích cho lead | LEAD |
| `POST` | `/api/leads/me/interest-class` | Thể hiện quan tâm lớp học | LEAD |
| `PUT` | `/api/leads/{id}/status` | Cập nhật trạng thái lead | QUẢN LÝ, KẾ TOÁN |
| `POST` | `/api/leads/{id}/consulting` | Chuyển sang giai đoạn tư vấn | QUẢN LÝ, KẾ TOÁN |
| `POST` | `/api/leads/{id}/agree` | Lead đồng ý đăng ký | QUẢN LÝ, KẾ TOÁN |
| `POST` | `/api/leads/{id}/confirm-cash` | Xác nhận thanh toán tiền mặt | QUẢN LÝ, KẾ TOÁN |
| `POST` | `/api/leads/{id}/reject` | Từ chối lead | QUẢN LÝ, KẾ TOÁN |
| `POST` | `/api/leads/{id}/convert` | Chuyển đổi lead sang học viên | QUẢN LÝ, KẾ TOÁN |
| `POST` | `/api/public/leads` | Gửi form liên hệ công khai | CÔNG KHAI |

---

## 8. Quản lý Tài chính

### Hóa đơn

| Method | Endpoint | Mô tả | Quyền truy cập |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/invoices` | Liệt kê hóa đơn của user | HỌC VIÊN, LEAD, KẾ TOÁN, QUẢN LÝ |
| `GET` | `/api/invoices/{id}` | 🔴 **IDOR** - Lấy hóa đơn theo ID (không kiểm tra sở hữu) | HỌC VIÊN, LEAD, KẾ TOÁN, QUẢN LÝ (vÙng) |
| `POST` | `/api/invoices` | Tạo hóa đơn mới | KẾ TOÁN, QUẢN LÝ |
| `PATCH` | `/api/invoices/{id}/status` | Cập nhật trạng thái hóa đơn | KẾ TOÁN, QUẢN LÝ |
| `DELETE` | `/api/invoices/{id}` | Xóa hóa đơn | KẾ TOÁN, QUẢN LÝ |
| `GET` | `/api/invoices/debt` | Lấy hóa đơn nợ | KẾ TOÁN, QUẢN LÝ |
| `POST` | `/api/invoices/{id}/refund` | Xử lý hoàn tiền hóa đơn | KẾ TOÁN, QUẢN LÝ |

### Thanh toán & Giao dịch

| Method | Endpoint | Mô tả | Quyền truy cập |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/payments/invoice/{invoiceId}` | Lấy thanh toán theo hóa đơn | HỌC VIÊN, LEAD, KẾ TOÁN, QUẢN LÝ |
| `POST` | `/api/payments` | Tạo thanh toán mới | HỌC VIÊN, LEAD, KẾ TOÁN, QUẢN LÝ |
| `GET` | `/api/transactions` | Liệt kê tất cả giao dịch | KẾ TOÁN, QUẢN LÝ |
| `POST` | `/api/transactions` | Tạo giao dịch | KẾ TOÁN, QUẢN LÝ |

### Chi phí

| Method | Endpoint | Mô tả | Quyền truy cập |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/expenses` | Liệt kê tất cả chi phí | KẾ TOÁN, QUẢN LÝ |
| `POST` | `/api/expenses` | Tạo chi phí mới | KẾ TOÁN, QUẢN LÝ |

### Cổng thanh toán (PayOS)

| Method | Endpoint | Mô tả | Quyền truy cập |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/v1/payment/create-link` | Tạo link thanh toán PayOS | CÔNG KHAI |
| `POST` | `/api/v1/payment/payos-webhook` | Xử lý webhook PayOS | CÔNG KHAI |

---

## 9. Thông báo & Truyền thông

### Thông báo

| Method | Endpoint | Mô tả | Quyền truy cập |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/announcements` | Tạo thông báo | QUẢN LÝ, GIÁO VIÊN, KẾ TOÁN |
| `GET` | `/api/announcements` | Lấy thông báo hoạt động | CÔNG KHAI |
| `GET` | `/api/announcements/sent` | Lấy thông báo đã gửi | QUẢN LÝ, GIÁO VIÊN, KẾ TOÁN |

### Thông báo cá nhân

| Method | Endpoint | Mô tả | Quyền truy cập |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/notifications` | Lấy thông báo của tôi (phân trang) | ĐÃ XÁC THỰC |
| `GET` | `/api/notifications/unread-count` | Đếm số chưa đọc | ĐÃ XÁC THỰC |
| `PUT` | `/api/notifications/{id}/read` | Đánh dấu đã đọc | ĐÃ XÁC THỰC |
| `PATCH` | `/api/notifications/read-all` | Đánh dấu tất cả đã đọc | ĐÃ XÁC THỰC |

### Chatbot

| Method | Endpoint | Mô tả | Quyền truy cập |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/public/chatbot/messages` | Gửi tin nhắn đến chatbot | ĐÃ XÁC THỰC |
| `GET` | `/api/public/chatbot/tasks/{taskId}` | Lấy trạng thái task | CÔNG KHAI |

---

## 10. Báo cáo & Phân tích

| Method | Endpoint | Mô tả | Quyền truy cập |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/analytics/branch-performance` | 🔴 **THIẾU XÁC THỰC** - Phân tích chi nhánh | NÊN LÀ QUẢN LÝ, KẾ TOÁN |
| `GET` | `/api/analytics/revenue` | 🔴 **THIẾU XÁC THỰC** - Báo cáo doanh thu | NÊN LÀ QUẢN LÝ, KẾ TOÁN |
| `GET` | `/api/analytics/academic` | 🔴 **THIẾU XÁC THỰC** - Báo cáo học tập | NÊN LÀ QUẢN LÝ, KẾ TOÁN |
| `GET` | `/api/analytics/dashboard` | 🔴 **THIẾU XÁC THỰC** - Tổng quan dashboard | NÊN LÀ QUẢN LÝ, KẾ TOÁN |
| `GET` | `/api/reports/revenue` | 🔴 **THIẾU XÁC THỰC** - Báo cáo doanh thu | NÊN LÀ QUẢN LÝ, KẾ TOÁN |
| `GET` | `/api/reports/expenses` | 🔴 **THIẾU XÁC THỰC** - Báo cáo chi phí | NÊN LÀ QUẢN LÝ, KẾ TOÁN |
| `GET` | `/api/reports/profit-loss` | 🔴 **THIẾU XÁC THỰC** - Báo cáo lãi lỗ | NÊN LÀ QUẢN LÝ, KẾ TOÁN |
| `GET` | `/api/reports/conversion` | 🔴 **THIẾU XÁC THỰC** - Báo cáo chuyển đổi | NÊN LÀ QUẢN LÝ, KẾ TOÁN |
| `GET` | `/api/reports/top-courses` | 🔴 **THIẾU XÁC THỰC** - Báo cáo khóa học top | NÊN LÀ QUẢN LÝ, KẾ TOÁN |
| `GET` | `/api/reports/churn-rate` | 🔴 **THIẾU XÁC THỰC** - Báo cáo tỷ lệ rời bỏ | NÊN LÀ QUẢN LÝ, KẾ TOÁN |

---

## 🔴 Tóm tắt Lỗ hổng Bảo mật

### Các Lỗ hổng Nghiêm trọng (6 Tổng)

| # | Loại | Endpoint | Vấn đề |
|---|------|----------|-------|
| 1 | **IDOR** | `GET /api/invoices/{id}` | Có thể truy cập BẤT KỲ hóa đơn nào |
| 2 | **BOLA** | `GET /api/classes/{id}` | Giáo viên có thể truy cập BẤT KỲ lớp nào |
| 3 | **BFLA** | `DELETE /api/users/{id}` | Thiếu @PreAuthorize - bất kỳ ai đều xóa được |
| 4 | **BOPLA** | `PUT /api/users/{id}` | Có thể tự cập nhật role/status lên Manager |
| 5 | **Thiếu Auth** | `GET /api/analytics/*` | Không yêu cầu xác thực - công khai |
| 6 | **Thiếu Auth** | `GET /api/reports/*` | Không yêu cầu xác thực - công khai |

---

**Tổng Controllers:** 26
**Tổng Endpoints:** 150+
**Endpoints có Lỗ hổng:** 6
**Endpoints Công khai:** ~35
**Endpoints Được bảo vệ:** ~115

**Báo cáo được tạo:** 2026-05-16
**Nguồn:** Phân tích Code Backend Hoàn chỉnh
