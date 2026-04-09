# Đặc tả Yêu cầu (Requirements Document) - Hệ thống Quản lý Trung tâm Ngoại ngữ

## 1. Tổng quan hệ thống (System Overview)

### Mục đích cốt lõi của ứng dụng
Ứng dụng web "Quản lý Trung tâm Ngoại ngữ" (ELC - English Language Center Management) được thiết kế nhằm số hóa và tự động hóa toàn bộ quy trình vận hành, giảng dạy, học tập và quản lý tài chính của một hoặc chuỗi trung tâm. Hệ thống giúp tối ưu hóa nguồn lực, nâng cao chất lượng dịch vụ giáo dục, tăng tính tương tác với học viên, đồng thời cung cấp hệ thống báo cáo minh bạch, tức thời cho Ban giám đốc.

### Phạm vi của hệ thống (In-scope)
Hệ thống sẽ tập trung vào các phân hệ (Modules) cốt lõi sau:
- **School Management System (SMS):** Quản lý khóa học, xếp lịch học, giáo viên, phòng học.
- **Learning Management System (LMS cơ bản):** Phân phối tài liệu, giao bài tập, chấm điểm, theo dõi tiến trình học tập.
- **Customer Relationship Management (CRM):** Quản lý danh sách khách hàng tiềm năng (Leads), lịch sử tư vấn, và quy trình chuyển đổi học viên.
- **Financial & Accounting:** Quản lý học phí (kể cả tự động qua cổng thanh toán online), trả lương nhân sự, xuất hóa đơn chứng từ.

---

## 2. Phân tích yêu cầu chức năng (Functional Requirements)

Hệ thống cung cấp các chức năng cụ thể dành riêng cho mỗi nhóm người dùng (Role) như sau:

### 2.1. Quản lý (Manager/Admin)
*Tại sao cần? Để có một tầm nhìn toàn cảnh (bird's-eye view) kiểm soát mọi hoạt động, thiết lập cấu hình hệ thống và tối ưu hóa vận hành.*
* **Dashboard tổng quan (Manager Dashboard):** Theo dõi số liệu đồ thị về doanh thu, số lượng học viên mới, tỷ lệ tái đăng ký và các cảnh báo hệ thống nhanh (lớp trống, giáo viên trống lịch).
* **Quản trị hệ thống (CRUD & Auth):** Thêm/Sửa/Xóa tài khoản dành cho các nhóm nhân sự; phân quyền (Authorization) truy cập phân hệ.
* **Quản lý học viên:** Thêm/Sửa/Xóa (CRUD) hồ sơ học viên, lưu trữ thông tin và xem lịch sử học tập.
* **Duyệt đăng ký & Phân lớp:** Xem xét duyệt danh sách đăng ký học, xếp học viên vào lớp (phân lớp) hoặc hỗ trợ chuyển lớp theo yêu cầu.
* **Quản lý lớp học:** Khởi tạo, mở/đóng lớp, thiết lập sĩ số tối đa, và theo dõi trạng thái tuyển sinh (đang trống, đã đầy).
* **Quản lý giáo viên:** Cập nhật hồ sơ, lĩnh vực/chuyên môn giảng dạy, và kiểm tra tình trạng sẵn sàng dạy (Availability) của từng giáo viên.
* **Quản trị đào tạo & Lịch học:** Tạo chương trình học, khóa học; xếp thời khóa biểu thông minh, tự động cảnh báo (Conflict detection) nếu giáo viên hoặc phòng học bị trùng lịch.
* **Quản lý phòng học & Cơ sở vật chất:** Khởi tạo danh sách phòng học (nếu học offline), phân bổ phòng và quản lý trang thiết bị.
* **Thông báo hệ thống (Announcements):** Tính năng soạn và gửi thông báo chung (Push notification/Email) đến giáo viên/học viên.
* **Theo dõi chất lượng vận hành:** Phân tích tỷ lệ chuyên cần (Attendance rate), tỷ lệ nghỉ học (Drop-out rate), và đo lường hiệu suất báo cáo của từng lớp.

### 2.2. Giáo viên (Teacher)
*Tại sao cần? Cải thiện hiệu suất để giáo viên có thể tập trung vào chuyên môn thay vì bị sa đà vào các tác vụ hành chính, sổ sách.*
* **Dashboard giáo viên:** Màn hình tổng quan nhanh tiến trình giảng dạy, sĩ số lớp, các bài tập cần chấm.
* **Quản lý lịch giảng dạy cá nhân:** Xem thời khóa biểu theo tuần/tháng, theo dõi các ca dạy được phân công và nhận thông báo khi có thay đổi lịch.
* **Xem danh sách học viên:** Xem họ tên, trình độ, tình trạng học tập (giúp giáo viên nắm bắt lớp nhanh chóng).
* **Tiến độ giảng dạy:** Theo dõi buổi đã dạy, nội dung bài giảng đã hoàn thành và nội dung chương trình còn lại.
* **Sổ điểm danh kỹ thuật số:** Điểm danh học viên theo thời gian thực tại lớp học.
* **Quản lý học thuật & Bài tập (Assignment):** Upload tài liệu, tạo bài tập/kiểm tra, chấm bài và nhập điểm (Grades) trực tiếp.
* **Theo dõi kết quả lớp học:** Xem tổng quan phổ điểm, tỷ lệ chuyên cần của lớp, phát hiện học viên cần hỗ trợ phụ đạo thêm.
* **Gửi thông báo/Nhắc nhở:** Gửi tin nhắn hoặc thông báo nhắc nhở làm bài tập, lịch kiểm tra, các tài liệu cần chuẩn bị đến cho học viên phụ trách.

### 2.3. Học sinh (Student)
*Tại sao cần? Để tăng tính chủ động, trải nghiệm học tập trơn tru và dễ dàng tiếp cận mọi tài nguyên học tập mà trung tâm cung cấp.*
* **Dashboard học tập cá nhân:** Hiển thị tổng quan lịch học sắp tới, bài tập cần hoàn thành, thông báo mới và tiến độ khóa học.
* **Quản lý kết quả học tập:** Xem bảng điểm số, đọc nhận xét từ giáo viên và theo dõi quá trình hoàn thành khóa học.
* **Quản lý khóa học & TKB:** Đăng ký thông tin, theo dõi khóa học; xem thời khóa biểu cá nhân và lịch thi cực kỳ chi tiết.
* **Học phí & Thanh toán:** Xem thông tin học phí, công nợ và truy xuất lịch sử thanh toán cá nhân.
* **Học liệu & Bài tập (LMS):** Tải tài liệu bài giảng, thực hiện nộp bài tập đúng deadline quy định.
* **Yêu cầu hành chính trực tuyến:** Tính năng tạo và gửi các form yêu cầu xin nghỉ học, học bù, chuyển lớp, hoặc bảo lưu khóa học.
* **Hệ thống thông báo & Phản hồi:** Nhận thông báo trực tiếp từ giáo viên hoặc trung tâm; gửi đánh giá (Rating) chất lượng khóa học.

### 2.4. Kế toán (Accountant)
*Tại sao cần? Đảm bảo minh bạch dòng tiền, ngăn chặn rủi ro thất thoát và giảm tải công việc đối soát thủ công.*
* **Dashboard tài chính tổng quan:** Biểu đồ hiển thị tình hình thu/chi theo thời gian thực, tổng công nợ học phí chưa thu, và cảnh báo các khoản chi bất thường.
* **Quản lý chứng từ:** Tạo lập và quản lý các phiếu thu, phiếu chi rõ ràng.
* **Theo dõi công nợ chi tiết:** Quản lý học phí định kỳ, theo dõi sát sao công nợ của từng cá nhân học viên.
* **Thanh toán đa phương thức:** Quản lý cổng thanh toán trực tuyến (VNPay/Momo/QR Code), chuyển khoản hoặc tiền mặt.
* **Xử lý tài chính học vụ:** Quản lý quy trình hoàn phí học, tính toán chi phí bảo lưu, sự chênh lệch trong chuyển khóa học.
* **Chốt công & tính lương:** Chốt lịch tự động với hệ thống điểm danh, từ đó tính lương chi tiết dựa trên số giờ hay hiệu suất cho giáo viên.
* **Chi phí vận hành & Audit Log:** Theo dõi chi phí duy trì cơ sở (điện, nước, mặt bằng v.v.); lưu lại lịch sử mọi giao dịch, cùng nhật ký chỉnh sửa hóa đơn (Audit Log) để rà soát.

### 2.5. Khách hàng tiềm năng (Lead/Guest)
*Tại sao cần? Thu hút chuyển đổi (Conversion), tạo ra một kênh giao tiếp ban đầu dễ dùng, chuyên nghiệp.*
* **Dashboard khách hàng (Trang chủ/Landing Page):** Màn hình tổng quan được thiết kế trực quan, đóng vai trò như bộ mặt của hệ thống giúp khách truy cập dễ dàng tìm hiểu thông tin các khóa học, khám phá hồ sơ đội ngũ giảng viên, theo dõi các feedback/đánh giá của học viên cũ, cũng như xem giới thiệu chung về thông tin trung tâm, hệ thống chi nhánh và các cổng liên hệ tư vấn.
* **Tra cứu & Lọc khóa học:** Cung cụ tìm kiếm và sử dụng bộ lọc linh hoạt để chọn lọc khóa học đang mở phù hợp với nhu cầu, độ tuổi, trình độ cũng như xem chi tiết thông tin học phí.
* **Đăng ký tư vấn/Trải nghiệm:** Đăng ký học thử, đăng ký tham gia kiểm tra phân mảnh trình độ đầu vào.
* **Đăng ký khóa học trực tuyến:** Điền form định danh ghi danh chính thức vào một khóa học cụ thể, hỗ trợ chuyển đến cổng thanh toán hoặc đặt cọc giữ chỗ (nếu có) để chuyển đổi từ Lead sang Student.
* **Theo dõi yêu cầu & Ưu đãi:** Tracking trạng thái yêu cầu đặt lịch hẹn, và đăng ký email/SDT để nhận khuyến mãi, thông báo khai giảng.
* **Tư vấn tự động (AI Chatbot/Live Chat):** Tích hợp cửa sổ Chat trực tuyến hoặc AI Chatbot hỗ trợ 24/7 nhằm giải đáp nhanh các thắc mắc (FAQs), tư vấn hướng nghiệp/chọn khóa học và hướng dẫn lộ trình đăng ký.

### 2.6. Tính năng chung cho các Tài khoản Nội bộ (Manager, Teacher, Student, Accountant)
* **Quản lý tài khoản cá nhân (Profile CRUD):** Tự cập nhật các thông tin cá nhân cơ bản, ảnh đại diện, thay đổi mật khẩu (Change Password) và tuỳ chỉnh nhận thông báo.

### 2.7. Yêu cầu mở rộng cho hệ thống (System Extensibility Requirements)
* **Thông báo tự động (Notification Automation):** Gửi SMS, Email (ví dụ qua AWS SES hoặc SendGrid) để nhắc nợ học phí, báo nghỉ học tự động.
* **Quản lý cơ sở vật chất (Facility Management):** Quản lý tình trạng sử dụng và bảo trì của thiết bị trong phòng học (máy chiếu, điều hòa).
* **Hỗ trợ Online E-Learning:** Khả năng kết xuất Link học (Zoom/Google Meet API) trong trường hợp có lớp học chuyển đổi hình thức Online sang Offline một cách linh động.

---

## 3. Yêu cầu phi chức năng (Non-functional Requirements)

| Tiêu chí | Cụ thể |
| --- | --- |
| **Hiệu năng (Performance)** | - Thời gian chờ xử lý (Response Time): Dưới 1 giây cho các tác vụ CRUD. Dưới 3 giây cho kết xuất báo cáo dữ liệu phức tạp.<br>- Khả năng đồng thời (Concurrency): Database và Server phải chịu được lượng tải lên đến 1.000 người dùng thao tác cùng lúc (khi có kỳ thi hệ thống hoặc nộp bài tập). |
| **Bảo mật (Security & Auth)** | - **Tuân thủ OWASP Top 10:** Phát triển và vận hành hệ thống đảm bảo phòng chống các lỗ hổng bảo mật phổ biến. Cụ thể: áp dụng Input Validation/Sanitization và Parameterized Queries để chống SQL Injection/XSS; dùng các cơ chế chống CSRF; và thiết lập Rate Limiting chống Brute-force.<br>- **Mã hóa:** Áp dụng chuẩn SSL/TLS cho mọi truyền tin. Password phải được băm (hashing) với salt bằng thuật toán chuẩn như `bcrypt` hoặc `Argon2`.<br>- **Phân quyền chặt chẽ (RBAC) & Authentication:** Chống Broken Access Control/IDOR bằng cách phân quyền cấp API (VD: Chỉ Role "Kế toán" và "Manager" thao tác được dữ liệu tài chính). Sử dụng JWT để quản lý phiên bản một cách an toàn.<br>- **Audit & Log:** Ghi log an toàn (Security Logging) mọi thao tác nhạy cảm. Dữ liệu định kỳ sao lưu tự động (Automated Backup) ít nhất 1 lần/ngày. |
| **Khả năng mở rộng (Scalability)** | Kiến trúc phần mềm (Cloud-native hoặc Modular Monolith) phải hỗ trợ tính năng Multi-tenant (Đa cơ sở), cho phép trung tâm dễ dàng mở chi nhánh mới mà không ảnh hưởng tới dữ liệu cũ. |
| **Tính khả dụng (Usability)** | Giao diện phải chuẩn **Responsive Design** (Hiển thị tốt trên Desktop định dạng Admin Dashboard và Mobile thân thiện cho học sinh/phụ huynh sử dụng). Hỗ trợ song ngữ (Vietnamese/English) nếu cần. |

---

## 4. Danh sách User Story tiêu biểu (Top 10 User Stories)

*(Sử dụng chuẩn Agile: "Là một [Role], tôi muốn [Action] để [Benefit/Value]")*

1. **Khách hàng tiềm năng (Lead):** Là một khách hàng tiềm năng, tôi muốn điền form đặt lịch kiểm tra năng lực (Placement test) trực tuyến nhanh chóng để trung tâm liên hệ xếp lớp có trình độ phù hợp với tôi.
2. **Học sinh (Student):** Là một học sinh, tôi muốn xem thời khóa biểu trong tuần trên giao diện điện thoại di động để biết chắc chắn hôm nay học môn gì, tại phòng học nào.
3. **Học sinh (Student):** Là một học sinh, tôi muốn nhận được thông báo qua di động (SMS/Zalo/Email) mỗi khi có sự thay đổi lịch học khẩn cấp để tôi không mất công di chuyển đến trung tâm.
4. **Giáo viên (Teacher):** Là một giáo viên, tôi muốn điểm danh học viên trên chính hệ thống ngay trong lớp để dữ liệu tự động đồng bộ lên bộ phận quản lý mà không cần chờ nộp sổ giấy.
5. **Giáo viên (Teacher):** Là một giáo viên, tôi muốn đăng tải tài liệu học tập và tạo bài tập về nhà với mức thời hạn (Deadline), để học viên có thể vào tải xuống và làm bài tập ngay tại nhà.
6. **Kế toán (Accountant):** Là một nhân viên kế toán, tôi muốn hệ thống sinh mã QR code cho từng lệnh thu học phí và tự động gạch nợ ngay khi học viên chuyển khoản thành công, để tôi tiết kiệm thời gian đối soát thủ công hàng ngày.
7. **Kế toán (Accountant):** Là một nhân viên kế toán, tôi muốn kết xuất báo cáo doanh thu theo tháng trực tiếp sang định dạng file Excel để dễ dàng xử lý và nộp lên Ban giám đốc.
8. **Quản lý (Manager):** Là một người quản lý, tôi muốn có một Dashboard thống kê đồ thị biểu diễn số lượng học sinh mới và doanh thu trong tháng để có thể đánh giá hiệu quả kinh doanh của trung tâm.
9. **Quản lý (Manager):** Là một người quản lý, tôi muốn tính năng tự động cảnh báo xung đột (Conflict) mỗi khi tôi cố xếp một giáo viên dạy 2 lớp cùng giờ để đảm bảo không xảy ra sự cố sắp lịch.
10. **Quản lý hệ thống (Admin):** Là một quản trị viên, tôi muốn ngay lập tức vô hiệu hóa (Deactivate) tài khoản của một giáo viên/nhân viên vừa mới nghỉ việc, để bảo vệ tính bảo mật thông tin và dữ liệu toàn hệ thống.
