# Issue - Branch Mapping (Backend ELC)

Bảng này map các issue trong roadmap sang nhánh feature tương ứng.

## DEV 1 - Hạ tầng, Bảo mật & Core

| Issue ID | Issue Name | Branch | Milestone |
|---|---|---|---|
| AU-001 | Thiết lập Security Foundation | feature/BTL-5 | Authentication & Security (Tuần 1-2) |
| AU-002 | Hệ thống Đăng ký & Đăng nhập | feature/BTL-6 | Authentication & Security (Tuần 1-2) |
| US-001 | Quản lý thông tin cá nhân | feature/BTL-7 | User Profiling & Notifications (Tuần 3) |
| NT-001 | Dịch vụ Thông báo & Announcement | feature/BTL-8 | User Profiling & Notifications (Tuần 3) |

## DEV 2 - Quản lý Vận hành & CRM

| Issue ID | Issue Name | Branch | Milestone |
|---|---|---|---|
| CR-001 | Quản lý Khách hàng tiềm năng (Leads) | feature/BTL-9 | CRM & Tư vấn (Tuần 1-2) |
| CR-002 | Nhật ký Tư vấn (Consultations) | feature/BTL-10 | CRM & Tư vấn (Tuần 1-2) |
| SM-001 | Quản lý Chi nhánh & Khóa học | feature/BTL-11 | Center Resources (Tuần 3) |
| SM-002 | Quản lý Phòng học (Rooms) | feature/BTL-12 | Center Resources (Tuần 3) |

## DEV 3 - Nghiệp vụ Học thuật (LMS)

| Issue ID | Issue Name | Branch | Milestone |
|---|---|---|---|
| LM-001 | Quản lý Lớp học (Classes) | feature/BTL-13 | Class & Enrollment (Tuần 1-2) |
| LM-002 | Đăng ký & Ghi danh (Enrollment) | feature/BTL-14 | Class & Enrollment (Tuần 1-2) |
| LM-003 | Quản lý Điểm danh (Attendance) | feature/BTL-15 | Attendance & Assessments (Tuần 3) |
| LM-004 | Quản lý Bài tập (Assignments) | feature/BTL-16 | Attendance & Assessments (Tuần 3) |

## DEV 4 - Tài chính, Chi phí & Phân tích Dữ liệu

| Issue ID | Issue Name | Branch | Milestone |
|---|---|---|---|
| FN-001 | Hệ thống Hóa đơn & Học phí | feature/BTL-17 | Invoicing, Payments & Debt Management (Tuần 1-2) |
| FN-002 | Xử lý Giao dịch & Quản lý Nợ (Debt) | feature/BTL-18 | Invoicing, Payments & Debt Management (Tuần 1-2) |
| FN-003 | Quản lý Chi phí Vận hành (Expenses) | feature/BTL-19 | Expense Management & Financial Integrity (Tuần 3) |
| FN-004 | Tính toán Lương & Phụ cấp (Payroll Basic) | feature/BTL-20 | Expense Management & Financial Integrity (Tuần 3) |
| AN-001 | Doanh thu & Lợi nhuận (P&L Reports) | feature/BTL-21 | Business Intelligence & Advanced Reporting (Tuần 4) |
| AN-002 | Phân tích Hiệu suất & Marketing | feature/BTL-22 | Business Intelligence & Advanced Reporting (Tuần 4) |

## Ghi chú sử dụng

1. Mỗi issue làm trên đúng nhánh feature đã map ở trên.
2. Luồng đề xuất: feature/BTL-xx -> develop -> master.
3. Tạo pull request theo từng issue để review dễ hơn.
