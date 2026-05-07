# Nhận xét hệ thống

## Manager
- Chưa có chức năng thêm học viên

## Student
- Chưa xem được lớp học của mình

## Teacher
- Lớp của teacher chưa có học viên nào
- Chưa xem được danh sách học viên (do chưa có học viên)
- Chưa điểm danh được (do chưa có học viên trong lớp)
- Chưa có màn hình Dashboard: Vừa vào là bị ném thẳng sang Lịch dạy chứ không có màn hình Thống kê tổng quan. Nên: 
    - Tạo một tab Dashboard ở đầu Sidebar (trên cả Lịch dạy):
    - Hiển thị các Widget: Tổng số lớp đang dạy, Tổng số học sinh, Số lượng bài tập đang chờ chấm điểm.
    - Hiển thị một danh sách "Các lớp học sắp diễn ra trong ngày hôm nay".

### Bài tập và Tài liệu
- Chưa thực hiện được:
  - Chấm điểm
  - Thống kê bài nộp  
  (do chưa có bài nộp nào)
- Chưa upload được tài liệu
- Hiện tại chỉ có phần ghi note
- Ở mục "Bài tập", dù đã có nút "Bài nộp & Chấm điểm" (Grading), nhưng luồng chấm điểm (Gradebook) chưa thực sự nổi bật. Ngoài ra tính năng "Tiến độ giảng dạy" (Tracking buổi đã dạy/chưa dạy) theo yêu cầu chưa rõ ràng.
- Datepicker bài tập: Ô nhập ngày hạn nộp hiện tại cho phép gõ phím tự do (chuẩn MMDDYYYY), điều này dễ gây lỗi nếu giáo viên gõ sai format. Nên ép buộc dùng DatePicker UI.
- Tiến trình học: Trong phần "Lớp học của tôi", thêm một thanh Progress Bar (Ví dụ: Đã dạy 5/12 buổi - 40%) để giáo viên dễ theo dõi.

### Lịch dạy
- Lịch dạy chỉ hiển thị thứ (Thứ 2, 3, ...) chưa có ngày cụ thể
- Không xem được lịch theo tháng
- Kiến nghị: thiết kế giống Google Calendar

### Theo dõi và Thống kê
- Chưa có:
  - Tiến độ giảng dạy
  - Theo dõi lớp học
  - Tổng quan phổ điểm
  - Tỷ lệ chuyên cần
  - Phát hiện học viên cần hỗ trợ thêm
- Thêm một mục Báo cáo (Reports) ở Sidebar, hoặc một nút Thống kê lớp học bên trong chi tiết từng Lớp.
- Vẽ biểu đồ (ví dụ dùng Recharts hoặc Chart.js) hiển thị: Tỷ lệ đi học trung bình của lớp, Phân bổ điểm số bài tập (Giỏi/Khá/Trung bình).
- Làm nổi bật (highlight đỏ) những học sinh nghỉ học quá 3 buổi liên tiếp hoặc có điểm số bài tập liên tục dưới 5.0.

### Thông báo
- Chưa có chức năng:
  - Gửi thông báo
  - Nhắc nhở làm bài tập
  - Nhắc lịch kiểm tra
  - Gửi tài liệu cần chuẩn bị
- Chưa có tùy chỉnh nhận thông báo
- Trong trang chi tiết của mỗi "Lớp học", thêm một tab Thông báo (Announcements).
Cho phép giáo viên đăng bài (Post) để hệ thống tự động đẩy thông báo (hoặc gửi email) tới toàn bộ học sinh trong lớp đó.

### Hiển thị thời gian
- Nên hiển thị định dạng: hh:mm
- Không cần hiển thị giây (ss)