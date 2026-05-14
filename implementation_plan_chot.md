# Kế hoạch Tái cấu trúc Hệ thống Toàn diện (ĐÃ CHỐT)

Bản kế hoạch này đã thống nhất tất cả các quyết định nghiệp vụ và chốt phương án thực thi.
Hãy lấy database local mà hôm qua vừa sử dụng để làm chuẩn so sánh với database trên supabase
# PHẢI SỬA DATA TRÊN SUPABASE, KHÔNG SỬA GÌ Ở LOCAL
## 1. Kiểm tra lại Course, Level, Class trên supabase

## 2. Dọn dẹp Database Supabase
- **Xóa Bảng:** `lead_interests`, `consultations`, `promotions`.
- **Kiểm tra xem các cột sau đã xóa hay chưa:** `users.is_active`, `classes.meeting_url`, `classes.is_active`, `courses.duration_weeks`, `courses.max_students`, `courses.curriculum_url`, `courses.status`, `courses.is_active`, `attendance.class_id`, `attendance.student_id`, `attendance.session_date`, `attendance.present`, `invoices.student_id`, `invoices.amount`, `invoices.paid_amount`, `invoices.payment_method`, `invoices.notes`, `leads.user_id`, `rooms.equipment`, `rooms.room_type`, `expenses.branch_id`, `expenses.status`, `expenses.category_id`.

## 3. Kiểm tra xem đã vá Constraint Bảng Notifications hay chưa
- Check `CHECK` constraint của cột `type` xem đã thêm giá trị `GRADE_PUBLISHED` chưa.

---

## Lộ trình Thực thi

1. Viết file Migration `.sql` xử lý DB.
2. Sửa Entities và xóa các class/enum cũ.
3. Sửa DTOs theo chuẩn API mới.
4. Sửa Services và Repositories để đảm bảo không lỗi biên dịch.
5. Kiểm tra tính toàn vẹn (Build successful).
