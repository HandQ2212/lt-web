# Frontend Requirements - ELC Management System
## Quy định sử dụng Google Stitch / Material Design (MUI) để Generate UI

**Ngày:** 9/4/2026 | **Phiên bản:** 2.0 | **Tác giả:** Antigravity (Model Gemini 3 Flash)
**Trạng thái:** Optimized for AI Generation (Stitch)

---

## 1. Hệ Thống Kiến Trúc Frontend

### 1.1 Tech Stack Tiêu Chuẩn
- **Cơ chế chính:** React.js (v18+) + TypeScript.
- **Thư viện UI:** Material-UI (MUI) phiên bản mới nhất (Stitch-ready components).
- **Quản lý trạng thái:** Redux Toolkit (Slices cho Auth, SMS, LMS, Finance).
- **Giao tiếp API:** Axios (Interceptors xử lý JWT Bearer token).
- **Định tuyến:** React Router v6 (Protected Routes theo Role).
- **Đa ngôn ngữ:** i18next (Mặc định Tiếng Việt, hỗ trợ Tiếng Anh).

### 1.2 Design System & Nguyên Tắc UX
- **Color Palette:**
  - Primary: `#1976d2` (MUI Blue) - Tính chuyên nghiệp.
  - Secondary: `#4caf50` (Success/Finance) - Dấu ấn giáo dục & tăng trưởng.
  - Error: `#d32f2f`.
  - Background: Light Grey cho Dashboard, White cho content.
- **Typography:** Font 'Inter' hoặc 'Roboto' (Native MUI).
- **Responsive:** 
  - Mobile (<600px): Sidebar rút gọn, grid 1 cột, touch targets tối thiểu 44px.
  - Tablet (600-1200px): Sidebar mở rộng, grid 2 cột.
  - Desktop (>1200px): Grid 3-4 cột (Cards/Info).
- **Common Elements:** Sử dụng Card với elevation nhẹ (level 1-2), Buttons có icon trợ giúp, Table có pagination/sorting mặc định.

---

## 2. Các Phân Hệ & Màn Hình Chi Tiết

### 2.1 PUBLIC PAGES (Cho Guest & Leads)

#### 2.1.1 Landing Page (Trang chủ)
- **Header:** Logo, Menu (Khóa học, Giảng viên, Liên hệ), Nút Login/Register.
- **Hero Section:** Headline truyền cảm hứng, CTA "Đăng ký tư vấn" (Opens Modal).
- **Course Highlights:** Grid card (Course Image, Name, Level, Price).
- **Teacher Spotlight:** Avatar tròn, Tên, Chuyên môn, Rating.
- **Testimonials:** Carousel đánh giá từ học viên.
- **Footer:** Thông tin chi nhánh, Link mạng xã hội, Copyright.

#### 2.1.2 Catalog & Chi tiết Khóa học
- **Filter Bar:** Search theo tên, Filter theo Level (Beginner/Inter/Adv).
- **Course Detail:**
  - Banner khóa học.
  - Sidebar: Price, Duration, Enroll button.
  - Main: Mô tả chi tiết, Lộ trình học (Accordion), Danh sách lớp sắp khai giảng.

#### 2.1.3 Registration & Placement Test
- **Form Đăng ký:** Họ tên, Email, Số điện thoại (Validation real-time).
- **Placement Test Request:** Lead chọn trình độ mong muốn, ghi chú thời gian rảnh.
- **Success Page:** Lời cảm ơn và hướng dẫn bước tiếp theo.

---

### 2.2 AUTHENTICATION & PROFILE

#### 2.2.1 Login & Password Recovery
- Form Login với "Remember me", "Forgot Password?".
- Trang Reset Password (Email input -> OTP/Token -> New Password).

#### 2.2.2 User Profile & Account Settings
- **Dashboard Profile:** Thông tin định danh, Avatar upload.
- **Security:** Đổi mật khẩu, xem lịch sử đăng nhập.
- **Notification Settings:** Tùy chỉnh nhận Email/SMS.

---

### 2.3 QUẢN LÝ (MANAGER / ADMIN PORTAL)

#### 2.3.1 Dashboard Tổng Quan
- **KPI Cards:** Doanh thu tháng, Học viên mới, Tỷ lệ lớp đầy, Cảnh báo hệ thống.
- **Charts:** Revenue trend (Area chart), Enrollment by level (Bar chart).
- **Alert Panel:** Danh sách GV trống lịch, Phòng học đang bảo trì, Lớp sắp đóng.

#### 2.3.2 Quản trị Hệ thống (System Management)
- **User Management:** Bảng danh sách Staff/Teacher/Student (Filters: Role, Status).
- **Role Assignment:** Phân quyền chức năng cho nhân viên.
- **Branch/Room Management:** Quản lý cơ sở vật chất, phòng học (Status: Available/Occupied/Under Maintenance).

#### 2.3.3 Quản trị Đào tạo (SMS)
- **Course Catalog Management:** Tạo/Sửa chương trình đào tạo, học phí.
- **Class Scheduling:** Công cụ xếp lịch (Drag & Drop calendar).
- **Conflict Detection:** Tự động báo đỏ khi trùng lịch GV hoặc Phòng.
- **Teacher Assignment:** Theo dõi tải trọng công việc của giáo viên.

#### 2.3.4 CRM & Lead Pipeline
- **Lead Board (Kanban):** Các giai đoạn: New -> Contacted -> Interested -> Placement Test -> Enrolled.
- **Consultation Log:** Lịch sử tư vấn chi tiết cho mỗi Lead.
- **Conversion Tool:** Một click chuyển Lead thành Student account.

---

### 2.4 GIÁO VIÊN (TEACHER PORTAL)

#### 2.4.1 Lịch dạy & Quản lý Lớp
- **My Schedule:** Calendar view (Week/Month) chỉ hiển thị lớp phụ trách.
- **Class Detail:** Danh sách học sinh, trạng thái đóng học phí của lớp.
- **Digital Attendance:** Điểm danh theo buổi học (Radio buttons: Present, Absent, Late).

#### 2.4.2 Học thuật & LMS
- **Learning Materials:** Folder-tree upload tài liệu bài giảng.
- **Assignment Manager:** Tạo bài tập (Deadline, Target class).
- **Grading Interface:** Bảng chấm điểm, Ô nhập Feedback (Rich text support).

---

### 2.5 HỌC VIÊN (STUDENT PORTAL)

#### 2.5.1 Dashboard Học tập
- **Current Progress:** Progress bar cho khóa học đang tham gia.
- **Class Timeline:** Thông tin buổi học tiếp theo (Room, Teacher, Time).
- **Gradebook:** Bảng điểm chi tiết từng assignment, nhận xét từ GV.

#### 2.5.2 Financial & Documents
- **My Invoices:** Lịch sử đóng học phí, công nợ hiện tại.
- **Resources:** Tải tài liệu giáo trình, bài tập về nhà.
- **Admin Requests:** Form xin nghỉ học, chuyển lớp, hoặc bảo lưu.

---

### 2.6 KẾ TOÁN (FINANCE & ACCOUNTING)

#### 2.6.1 Financial Dashboard
- **Money Flow:** Thu (Học phí) vs Chi (Lương, Vận hành).
- **Outstanding Debt:** Cảnh báo học viên nợ phí quá hạn.

#### 2.6.2 Billing & Transactions
- **Invoice List:** Quản lý hóa đơn (Search by Student Name/Code).
- **Payment Verification:** Duyệt các giao dịch chuyển khoản (Check QR code hash).
- **Refund Management:** Xử lý hoàn phí cho các trường hợp bảo lưu/nghỉ học.

#### 2.6.3 Payroll & Expenses
- **Payroll Generator:** Tự động tính lương GV dựa trên số giờ dạy (Data từ Attendance).
- **Operational Expenses:** Ghi chép chi phí điện, nước, thuê mặt bằng.

---

## 3. Data Models & API Mapping (TypeScript Interfaces)

### 3.1 SMS & Academic Models
```typescript
interface Course {
  id: string;
  name: string;
  level: 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED';
  price: number;
  status: 'ACTIVE' | 'INACTIVE';
}

interface Clazz {
  id: string;
  courseId: string;
  teacherId: string;
  roomId: string;
  schedule: Array<{ dayOfWeek: string, startTime: string, endTime: string }>;
  status: 'ACCEPTING' | 'FULL' | 'CLOSED';
}
```

### 3.2 Finance & CRM Models
```typescript
interface Transaction {
  id: string;
  studentId: string;
  amount: number;
  type: 'COURSE_FEE' | 'SALARY' | 'EXPENSE';
  status: 'PENDING' | 'CONFIRMED' | 'FAILED';
  date: string;
}

interface Lead {
  id: string;
  name: string;
  status: 'NEW' | 'CONTACTED' | 'INTERESTED' | 'ENROLLED';
  consultations: Consultation[];
}
```

---

## 4. Danh sách API Endpoints Cốt lõi
- **Auth:** `POST /api/auth/login`, `POST /api/auth/register`.
- **Users:** `GET /api/users`, `PUT /api/users/{id}/status`.
- **SMS:** `GET /api/courses`, `POST /api/classes/check-conflict`.
- **Finance:** `POST /api/transactions/verify`, `GET /api/reports/revenue`.
- **LMS:** `POST /api/attendance`, `PUT /api/submissions/{id}/grade`.

---

## 5. Yêu Cầu Cho Stitch Generator
1.  **Layout nhất quán:** Tất cả các màn hình management phải sử dụng Sidebar bên trái và Topbar cho profile/search.
2.  **Xử lý Loading:** Mỗi bảng dữ liệu hoặc form submit phải có Skeleton/Spinner.
3.  **Thông báo:** Sử dụng Snackbar (Toast) cho các phản hồi Thành công/Lỗi.
4.  **Responsive:** Ưu tiên Mobile cho Học sinh, ưu tiên Desktop cho Kế toán & Quản lý.


---

## 6. Backend Audit — Endpoints thực tế & Thiếu sót

Tôi đã quét mã backend và bổ sung danh sách endpoint hiện có, các điểm thiếu trong spec frontend, và hành động đề xuất.

- **Endpoints bổ sung (hiện có trong backend):**
  - `GET/POST/PUT/DELETE /api/announcements` (Announcements CRUD)
  - `GET /api/notifications`, `GET /api/notifications/unread-count`, `PUT /api/notifications/{id}/read`
  - `GET /api/analytics/**`, `GET /api/reports/revenue|expenses|profit-loss|top-courses|churn-rate`
  - `GET/POST/PUT/DELETE /api/branches`, `GET/POST/PUT/DELETE /api/levels`, `GET/POST/PUT/DELETE /api/rooms` (+ availability/status/schedules)
  - `GET/POST/PUT/DELETE /api/classes`, `/api/classes/{id}/schedule`, `/api/classes/check-conflict`
  - `GET/POST /api/attendance`, `GET /api/attendance/{classId}`, `GET /api/attendance/report/monthly`
  - `GET/POST /api/assignments` (class assignments)
  - `GET/POST/PUT /api/submissions` (submit, grade)
  - `GET/POST /api/enrollments`, `GET /api/results/enrollment/{enrollmentId}`
  - `POST /api/transactions`, `GET/POST /api/payments` (incl. `/api/payments/invoice/{invoiceId}`), `/api/invoices` (incl. `/debt`, `/refund`)
  - `POST /api/leads`, `GET/PUT /api/leads`, `POST /api/leads/{id}/convert`
  - Auth & Profile: `/api/auth/*` (login, register, logout, refresh, forgot/reset), `/api/profile` (get/update/password)

- **Thiếu sót / Không có trong backend (cần quyết định):**
  - File upload endpoints cho avatar, tài liệu bài giảng, submission (MultipartFile) — backend hiện không báo có API upload.
  - QR code / QR-hash verification endpoint để xác thực giao dịch (Finance) — không tìm thấy.
  - Payroll generator API (tính lương từ attendance) — không tồn tại, nếu cần phải thêm.
  - WebSocket / STOMP real-time cho notifications hoặc scheduling updates — không thấy trong code; hiện dùng polling API.

- **Khuyến nghị cập nhật file này trước khi dùng Stitch:**
  1. Mở rộng mục API (mục 4) thành một bảng chi tiết: method, path, auth (public/auth), query params, sample request/response, paging.
  2. Quyết định về file upload + realtime + payroll + QR — hoặc tạo mock endpoints để frontend phát triển độc lập.
  3. Ghi rõ format lỗi (schema trả về lỗi) dựa trên `GlobalExceptionHandler` để xử lý Snackbar/Toast thống nhất.

---

## 7. Next Steps (gợi ý ngắn)

- Tôi có thể tự động chèn bảng endpoint (method/path/auth/sample) vào mục 4 — chọn `Yes` nếu đồng ý.  
- Nếu muốn, tôi sẽ tạo mock endpoints (Express) trong `frontend/mockApi.ts` để phát triển UI trước khi backend bổ sung.
