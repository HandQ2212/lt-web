o	Mô tả: Student có thể xóa user bất kỳ bằng cách đổi `{id}` trong URL
o	Mục đích: 
•	Kịch bản này nhằm kiểm tra xem tài khoản Student có thể thực hiện chức năng xóa người dùng hay không. Theo ma trận phân quyền của hệ thống, chức năng xóa/vô hiệu hóa user chỉ được phép đối với vai trò Quản lý, trong khi các vai trò như Lead, Học viên, Giáo viên và Kế toán đều không được phép thực hiện. 
•	Nếu tài khoản Student vẫn có thể gửi request xóa tài khoản Teacher thành công, hệ thống tồn tại lỗi Broken Function Level Authorization thuộc nhóm Broken Access Control.
o	Bối cảnh mô phỏng tấn công:
Trong thực tế, kẻ tấn công có thể có được token hợp lệ của một tài khoản Student bằng nhiều cách khác nhau, ví dụ tài khoản Student của chính kẻ tấn công, token bị rò rỉ, hoặc token bị đánh cắp thông qua một lỗ hổng khác như XSS.
Trong phần báo cáo này, nhóm giả sử hacker đã tấn công và lấy được access token của một student.
o	Bước 1: Thử danh sách users
 
	Kết quả cho thấy tài khoản student bị chặn truy cập danh sách người dùng của hệ thống, tuy nhiên chứng minh được là hệ thống có api/users vì kết quả báo về 403 chứ không phải 404.
o	Bước 2: Thử xem danh sách giáo viên, vì trên landing page có hiện thông tin giáo viên -> khả năng truy cập public
 
	Kết quả cho thấy lấy được danh sách đầy đủ id và tên giáo viên.
o	Bước 3: Thử xem chi tiết 1 giáo viên
 
	Kết quả là 403 -> endpoint tồn tại, và tài khoản student bị cấm
o	Bước 4: Có thể thử các phương thức khác như POST, PUT, DELETE xem kết quả như thế nào
 
	Kết quả xoá được giáo viên, và khi vào tài khoản manager để kiểm tra thì giáo viên bị xoá đã chuyển trạng thái thành “Ngừng”
 
	Kết luận được : api DELETE/users/teacher_id bị lỗ hổng BFLA

**Hậu quả:** Nếu bị khai thác trong thực tế, kẻ tấn công có thể xóa tài khoản của bất kỳ người dùng nào trong hệ thống, bao gồm giáo viên, quản lý, và quản trị viên, dẫn đến việc vô hiệu hóa tài khoản (thay đổi trạng thái sang INACTIVE), khiến người dùng không thể đăng nhập và truy cập hệ thống. Đây là hành vi phá hoại hệ thống nghiêm trọng, có thể gây ra mất dữ liệu người dùng, gián đoạn hoàn toàn hoạt động kinh doanh (vì không có giáo viên để dạy, không có quản lý để vận hành), và trong trường hợp xóa tài khoản quản trị viên cao nhất có thể dẫn đến mất hoàn toàn quyền điều khiển hệ thống, yêu cầu khôi phục từ backup và gây ra downtime kéo dài.

**Điều này cho thấy backend chỉ kiểm tra token đăng nhập hợp lệ (authentication), nhưng hoàn toàn không kiểm tra quyền truy cập level (authorization) thông qua annotation `@PreAuthorize("hasRole('MANAGER')")` trong endpoint `DELETE /api/users/{id}`, cho phép bất kỳ người dùng đã đăng nhập (kể cả STUDENT) đều có thể thực hiện thao tác xóa người dùng.