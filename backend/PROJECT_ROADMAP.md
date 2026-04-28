# Lộ trình Phát triển Backend Chi tiết - Hệ thống ELC

Tài liệu này cung cấp các đầu việc cụ thể cho 4 Developer. Mỗi đầu mục lớn là một **Milestone**, các gạch đầu dòng là **Issue**, và các gạch đầu dòng nhỏ hơn là **Sub-tasks** kỹ thuật.

---

## 🏗️ DEV 1: Hạ tầng, Bảo mật & Core
Tập trung vào nền tảng hệ thống, Auth và các dịch vụ dùng chung.

### Milestone 1: Authentication & Security (Tuần 1-2)
- **[AU-001] Thiết lập Security Foundation - Nhánh feature/BTL-5**
    - [ ] Cấu hình Spring Security 6 với lọc JWT (JwtAuthenticationFilter).
    - [ ] Cài đặt JwtUtils để generate và validate tokens (Access token & Refresh token).
    - [ ] Xây dựng CustomUserDetailsService để xác thực từ Database.
    - [ ] Cấu hình PasswordEncoder (BCrypt) và xử lý phân quyền (Role-based Access Control).
- **[AU-002] Hệ thống Đăng ký & Đăng nhập - Nhánh feature/BTL-6**
    - [ ] Implement `AuthController.login`: Xác thực -> Trả về JWT & UserResponse.
    - [ ] Implement `AuthController.register`: Validate dữ liệu -> Mã hóa pass -> Lưu DB.
    - [ ] Xử lý Logout và cơ chế thu hồi (Revoke) Refresh token.
    - [ ] Xử lý Exception tập trung cho các lỗi Auth (401 Unauthorized, 403 Forbidden).

### Milestone 2: User Profiling & Notifications (Tuần 3)
- **[US-001] Quản lý thông tin cá nhân - Nhánh feature/BTL-7**
    - [ ] Implement API `/api/users/me` để lấy thông tin phiên đăng nhập hiện tại.
    - [ ] Implement API cập nhật Profile (Họ tên, Ảnh đại diện, Số điện thoại).
    - [ ] Implement API đổi mật khẩu (Bắt buộc verify mật khẩu cũ).
- **[NT-001] Dịch vụ Thông báo & Announcement - Nhánh feature/BTL-8**
    - [ ] Xây dựng NotificationRepository & Service để lưu trữ thông báo cho từng User.
    - [ ] API lấy danh sách thông báo cá nhân (Phân trang, Lọc chưa đọc).
    - [ ] API Đánh dấu đã đọc thông báo.
    - [ ] API Admin tạo thông báo hệ thống (Announcement) cho toàn bộ trung tâm hoặc theo Role.

---

## 📈 DEV 2: Quản lý Vận hành & CRM
Tập trung vào quản lý tài nguyên và khách hàng tiềm năng.

### Milestone 1: CRM & Tư vấn (Tuần 1-2)
- **[CR-001] Quản lý Khách hàng tiềm năng (Leads) - Nhánh feature/BTL-9**
    - [ ] Implement CRUD LeadRepository & LeadService.
    - [ ] API lấy danh sách Leads với bộ lọc (Status, Source, Date range).
    - [ ] API chuyển đổi Lead thành Student (Khi lead đóng tiền/nhập học).
    - [ ] Validation dữ liệu Lead (Số điện thoại, Email chuẩn format).
- **[CR-002] Nhật ký Tư vấn (Consultations) - Nhánh feature/BTL-10**
    - [ ] Xây dựng thực thể và API ghi lại log các buổi tư vấn cho Lead.
    - [ ] Chức năng nhắc lịch tư vấn lại (Reminder) cho tư vấn viên.

### Milestone 2: Center Resources (Tuần 3)
- **[SM-001] Quản lý Chi nhánh & Khóa học - Nhánh feature/BTL-11**
    - [x] API quản lý danh sách Chi nhánh (CRUD Branch).
    - [x] API quản lý danh mục Khóa học (CRUD Course) và cấp độ (Level).
    - [x] Logic kiểm tra xóa chi nhánh (Không cho xóa nếu còn lớp đang hoạt động).
- **[SM-002] Quản lý Phòng học (Rooms) - Nhánh feature/BTL-12**
    - [ ] API CRUD Room (Tên phòng, Sức chứa, Loại phòng).
    - [ ] Logic kiểm tra tình trạng sử dụng phòng học theo thời gian thực.
    - [ ] Xử lý lỗi trùng lịch phòng học.

---

## 🎓 DEV 3: Nghiệp vụ Học thuật (LMS)
Tập trung vào quản lý Lớp học, Học viên và kết quả học tập.

### Milestone 1: Class & Enrollment (Tuần 1-2)
- **[LM-001] Quản lý Lớp học (Classes) - Nhánh feature/BTL-13**
    - [ ] Implement CRUD Clazz cho từng khóa học.
    - [ ] API Thiết lập lịch học cố định cho lớp (Class Schedule).
    - [ ] API quản lý trạng thái lớp (Chờ mở, Đang học, Kết thúc).
- **[LM-002] Đăng ký & Ghi danh (Enrollment) - Nhánh feature/BTL-14**
    - [ ] Xử lý logic ghi danh học viên vào lớp (Kiểm tra sỉ số tối đa).
    - [ ] API lấy danh sách học viên trong một lớp cụ thể.
    - [ ] API lịch sử học tập của một học viên.

### Milestone 2: Attendance & Assessments (Tuần 3)
- **[LM-003] Quản lý Điểm danh (Attendance) - Nhánh feature/BTL-15**
    - [ ] API giáo viên điểm danh theo buổi học.
    - [ ] API học viên/phụ huynh xem báo cáo điểm danh theo tháng.
    - [ ] Logic tính toán tỷ lệ đi học chuyên cần.
- **[LM-004] Quản lý Bài tập (Assignments) - Nhánh feature/BTL-16**
    - [ ] API Giáo viên giao bài tập (Hỗ trợ file đính kèm/link).
    - [ ] API Học viên nộp bài (Lưu link file, track thời gian nộp bài).
    - [ ] API Chấm điểm và Feedback (Có thông báo khi bài được chấm).

---

## 💰 DEV 4: Tài chính, Quản lý Chi phí & Phân tích Dữ liệu
Tập trung vào dòng tiền, quản lý nợ, chi phí vận hành và các báo cáo thông minh cho nhà quản lý.

### Milestone 1: Invoicing, Payments & Debt Management (Tuần 1-2)
- **[FN-001] Hệ thống Hóa đơn & Học phí - Nhánh feature/BTL-17**
    - [ ] Logic tự động sinh hóa đơn khi học viên ghi danh lớp.
    - [ ] API CRUD Invoice với các trạng thái (Chưa thanh toán, Đã thanh toán, Hủy).
    - [ ] Xử lý logic hoàn tiền (Refund) và bảo lưu học phí.
- **[FN-002] Xử lý Giao dịch & Quản lý Nợ (Debt) - Nhánh feature/BTL-18**
    - [ ] API ghi nhận giao dịch thanh toán (Tiền mặt, Chuyển khoản, Thẻ).
    - [ ] API danh sách học viên nợ học phí (Debt list) với tính năng nhắc nợ.
    - [ ] Logic cập nhật trạng thái hóa đơn tự động sau khi giao dịch thành công.
    - [ ] Hỗ trợ thanh toán từng phần (Partial payments) cho các khóa học giá trị cao.

### Milestone 2: Expense Management & Financial Integrity (Tuần 3)
- **[FN-003] Quản lý Chi phí Vận hành (Expenses) - Nhánh feature/BTL-19**
    - [ ] Implement CRUD Expense cho trung tâm (Tiền điện, nước, mặt bằng, văn phòng phẩm).
    - [ ] API quản lý danh mục loại chi phí.
    - [ ] API phê duyệt các khoản chi ngoài kế hoạch (Staff request -> Manager approve).
- **[FN-004] Tính toán Lương & Phụ cấp (Payroll Basic) - Nhánh feature/BTL-20**
    - [ ] Logic tính toán lương giáo viên dựa trên số buổi dạy (lấy từ dữ liệu LMS).
    - [ ] API quản lý các khoản thưởng/phạt cho nhân viên.

### Milestone 3: Business Intelligence & Advanced Reporting (Tuần 4)
- **[AN-001] Doanh thu & Lợi nhuận (P&L Reports)  - Nhánh feature/BTL-21**
    - [ ] API báo cáo Doanh thu (Revenue) theo Chi nhánh/Khóa học/Thời gian.
    - [ ] API báo cáo Chi phí (Expense) tổng hợp.
    - [ ] API tính toán Lợi nhuận thuần (Net Profit) = Doanh thu - Chi phí.
- **[AN-002] Phân tích Hiệu suất & Marketing - Nhánh feature/BTL-22**
    - [ ] API báo cáo tỷ lệ chuyển đổi Lead -> Student (Conversion rate).
    - [ ] API thống kê các khóa học mang lại doanh thu cao nhất (Top-performing courses).
    - [ ] API báo cáo tỷ lệ học viên nghỉ học/bỏ học (Churn rate).
    - [ ] API Dashboard tổng hợp cho Manager (Trả về định dạng JSON phù hợp cho Chart.js/Recharts).

---

## 🛠️ Quy chuẩn Kỹ thuật (Bắt buộc cho cả đội)
- **DTOs:** Tuyệt đối không trả về Entity. Sử dụng MapStruct hoặc manual mapping qua DTO.
- **Validation:** Sử dụng `@Valid` và `@Validated` tại tầng Controller.
- **Error Handling:** Sử dụng `@RestControllerAdvice` để format lỗi trả về thống nhất.
- **Logging:** Sử dụng SLF4J để log các sự kiện quan trọng (Transaction thành công, Login thất bại).
- **Performance:** Sử dụng `FetchType.LAZY` cho các mối quan hệ `@ManyToOne`/@`OneToMany` để tránh N+1 query.
