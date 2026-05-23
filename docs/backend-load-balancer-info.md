# Tài liệu backend phục vụ tích hợp Load Balancer

## 1. Thông tin tổng quan backend

### Backend dùng công nghệ gì
- Ngôn ngữ và runtime: Java 21.
- Framework chính: Spring Boot `3.3.5`.
- Web server nhúng: Apache Tomcat.
- Bảo mật: Spring Security + JWT.
- ORM và truy cập dữ liệu: Spring Data JPA + Hibernate.
- Cơ sở dữ liệu: PostgreSQL, connection pool HikariCP.
- Tích hợp ngoài: PayOS, OpenAI.

Minh chứng:
- [backend/pom.xml](D:/DaiHoc/Nam3/LT%20WEB/elc-system/backend/pom.xml:6)
- [backend/pom.xml](D:/DaiHoc/Nam3/LT%20WEB/elc-system/backend/pom.xml:35)
- [backend/pom.xml](D:/DaiHoc/Nam3/LT%20WEB/elc-system/backend/pom.xml:57)
- [backend/pom.xml](D:/DaiHoc/Nam3/LT%20WEB/elc-system/backend/pom.xml:63)

### Chức năng chính của backend
- Xác thực và hồ sơ người dùng: đăng nhập, refresh token, quên mật khẩu, profile.
- SMS/CRM học vụ: branch, course, level, lead.
- LMS: class, enrollment, attendance, assignment, submission, course result.
- Tài chính: invoice, payment, transaction, expense, PayOS webhook.
- Analytics và report.
- Notification và announcement.
- Public chatbot.
- Quản lý phòng học.

Minh chứng controller:
- [AuthController.java](D:/DaiHoc/Nam3/LT%20WEB/elc-system/backend/src/main/java/com/elc/system/modules/auth/controller/AuthController.java:16)
- [ClazzController.java](D:/DaiHoc/Nam3/LT%20WEB/elc-system/backend/src/main/java/com/elc/system/modules/lms/controller/ClazzController.java:17)
- [InvoiceController.java](D:/DaiHoc/Nam3/LT%20WEB/elc-system/backend/src/main/java/com/elc/system/modules/finance/controller/InvoiceController.java:19)
- [AnalyticsController.java](D:/DaiHoc/Nam3/LT%20WEB/elc-system/backend/src/main/java/com/elc/system/modules/analytics/controller/AnalyticsController.java:18)
- [ChatbotController.java](D:/DaiHoc/Nam3/LT%20WEB/elc-system/backend/src/main/java/com/elc/system/modules/chatbot/controller/ChatbotController.java:20)

### Backend chạy trên máy nào
- Theo cấu hình repo, backend hiện được thiết kế chạy local trên chính máy host chứa ứng dụng.
- `server.address` hiện là `localhost`, nghĩa là chỉ bind vào loopback của máy đó, chưa mở cho máy khác trong mạng gọi trực tiếp.

Minh chứng:
- [backend/src/main/resources/application.yml](D:/DaiHoc/Nam3/LT%20WEB/elc-system/backend/src/main/resources/application.yml:58)

## 2. Thông tin kết nối

### IP của máy backend
Tại thời điểm kiểm tra trên máy hiện tại có các IPv4 đáng chú ý:
- Wi-Fi: `192.168.1.98`
- Radmin VPN: `26.150.15.154`

Lưu ý:
- Đây là IP của máy đang mở repo.
- Do backend đang bind `localhost`, các IP trên chưa dùng được cho load balancer nếu không đổi cấu hình bind.

### Port backend đang chạy
- Cấu hình port: `8080`.
- Tại thời điểm kiểm tra, cổng `8080` không có service lắng nghe thành công.

Minh chứng:
- [backend/src/main/resources/application.yml](D:/DaiHoc/Nam3/LT%20WEB/elc-system/backend/src/main/resources/application.yml:60)
- `Test-NetConnection -ComputerName localhost -Port 8080` trả về `TcpTestSucceeded : False`
- `curl http://localhost:8080/api/health` lỗi `Failed to connect to localhost port 8080`

### URL mà load balancer dùng để gọi backend
Hiện trạng:
- Chưa tìm thấy file cấu hình load balancer trong repo.
- Frontend local mặc định đang gọi API qua `http://localhost:8080/api`.

Minh chứng frontend:
- [frontend/src/services/api.ts](D:/DaiHoc/Nam3/LT%20WEB/elc-system/frontend/src/services/api.ts:3)

Khuyến nghị URL upstream cho load balancer sau khi sửa bind:
- `http://192.168.1.98:8080`
- Hoặc `http://26.150.15.154:8080`

Lưu ý quan trọng:
- Upstream của load balancer nên trỏ tới gốc backend host `http://<backend-ip>:8080`.
- Phần `/api` là prefix endpoint của ứng dụng, không phải `server.servlet.context-path`.

## 3. Cấu hình backend

### File cấu hình chính
- File cấu hình đang dùng: [backend/src/main/resources/application.yml](D:/DaiHoc/Nam3/LT%20WEB/elc-system/backend/src/main/resources/application.yml:1)
- Không thấy `application.properties`.

### Các cấu hình liên quan
- `server.port: 8080`
- `server.address: localhost`
- `context path`: không thấy cấu hình `server.servlet.context-path`, vì vậy context path hiện là `/`

Minh chứng:
- [backend/src/main/resources/application.yml](D:/DaiHoc/Nam3/LT%20WEB/elc-system/backend/src/main/resources/application.yml:58)

Đánh giá cho load balancer:
- Cấu hình hiện tại chưa phù hợp để receive traffic từ load balancer chạy trên máy khác.
- Cần đổi `server.address: 0.0.0.0` hoặc bỏ hẳn cấu hình `server.address`.

## 4. Cấu hình bảo mật và CORS

### File SecurityConfig
- File: [backend/src/main/java/com/elc/system/core/config/SecurityConfig.java](D:/DaiHoc/Nam3/LT%20WEB/elc-system/backend/src/main/java/com/elc/system/core/config/SecurityConfig.java:1)

Các điểm chính:
- Dùng JWT filter cho request API.
- Cho phép toàn bộ request `OPTIONS /**`.
- Public endpoints:
  - `/api/auth/**`
  - `/api/public/**`
  - `POST /api/leads`
  - `GET /api/branches/**`
  - `GET /api/courses/**`
  - `GET /api/levels/**`
  - `POST /api/v1/payment/payos-webhook`
- Endpoint `/api/**` còn lại yêu cầu authenticated.
- `/error` được permit.

Minh chứng:
- [SecurityConfig.java](D:/DaiHoc/Nam3/LT%20WEB/elc-system/backend/src/main/java/com/elc/system/core/config/SecurityConfig.java:35)
- [SecurityConfig.java](D:/DaiHoc/Nam3/LT%20WEB/elc-system/backend/src/main/java/com/elc/system/core/config/SecurityConfig.java:45)
- [SecurityConfig.java](D:/DaiHoc/Nam3/LT%20WEB/elc-system/backend/src/main/java/com/elc/system/core/config/SecurityConfig.java:48)
- [SecurityConfig.java](D:/DaiHoc/Nam3/LT%20WEB/elc-system/backend/src/main/java/com/elc/system/core/config/SecurityConfig.java:60)

### File CorsConfig
- Có 2 nơi cấu hình CORS:
  - [backend/src/main/java/com/elc/system/core/config/SecurityConfig.java](D:/DaiHoc/Nam3/LT%20WEB/elc-system/backend/src/main/java/com/elc/system/core/config/SecurityConfig.java:72)
  - [backend/src/main/java/com/elc/config/CorsConfig.java](D:/DaiHoc/Nam3/LT%20WEB/elc-system/backend/src/main/java/com/elc/config/CorsConfig.java:1)

Nhận xét:
- Repo đang có cấu hình CORS trùng lặp.
- Khi triển khai production, nên thống nhất một nguồn cấu hình để tránh khó debug.

### Thiết lập cho phép OPTIONS
- Có cho phép `OPTIONS /**` trong SecurityConfig.
- Đây là cấu hình cần thiết cho preflight request đi qua load balancer/reverse proxy.

Minh chứng:
- [SecurityConfig.java](D:/DaiHoc/Nam3/LT%20WEB/elc-system/backend/src/main/java/com/elc/system/core/config/SecurityConfig.java:45)

### Thiết lập allowed origins, methods, headers
Trong `SecurityConfig`:
- `allowedOriginPatterns`:
  - `https://elc.handq2212.site`
  - `http://localhost:*`
  - `http://127.0.0.1:*`
  - `http://26.150.15.154:*`
- `allowedMethods`: `GET`, `POST`, `PUT`, `PATCH`, `DELETE`, `OPTIONS`
- `allowedHeaders`: `*`
- `exposedHeaders`: `Authorization`, `Content-Type`
- `allowCredentials`: `true`
- `maxAge`: `3600`

Minh chứng:
- [SecurityConfig.java](D:/DaiHoc/Nam3/LT%20WEB/elc-system/backend/src/main/java/com/elc/system/core/config/SecurityConfig.java:77)
- [SecurityConfig.java](D:/DaiHoc/Nam3/LT%20WEB/elc-system/backend/src/main/java/com/elc/system/core/config/SecurityConfig.java:84)
- [SecurityConfig.java](D:/DaiHoc/Nam3/LT%20WEB/elc-system/backend/src/main/java/com/elc/system/core/config/SecurityConfig.java:87)

Trong `CorsConfig`:
- `allowedOriginPatterns(frontendOrigin)`
- `allowedMethods("GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS")`
- `allowedHeaders("*")`
- `allowCredentials(true)`

Minh chứng:
- [CorsConfig.java](D:/DaiHoc/Nam3/LT%20WEB/elc-system/backend/src/main/java/com/elc/config/CorsConfig.java:15)

## 5. Danh sách API chính

### Một số endpoint tiêu biểu và method tương ứng
- `POST /api/auth/login`
- `POST /api/auth/refresh`
- `GET /api/profile`
- `GET /api/courses`
- `GET /api/levels`
- `GET /api/branches`
- `GET /api/classes`
- `POST /api/classes/check-conflict`
- `GET /api/enrollments/student/{studentId}`
- `GET /api/attendance/{classId}`
- `POST /api/attendance`
- `GET /api/assignments/mine`
- `POST /api/submissions/submit`
- `GET /api/invoices`
- `PATCH /api/invoices/{id}/status`
- `POST /api/payments`
- `POST /api/v1/payment/create-link`
- `GET /api/notifications`
- `GET /api/analytics/dashboard`
- `GET /api/reports/revenue`
- `POST /api/public/leads`
- `POST /api/public/chatbot/messages`
- `GET /api/public/chatbot/tasks/{taskId}`

Minh chứng controller:
- [AuthController.java](D:/DaiHoc/Nam3/LT%20WEB/elc-system/backend/src/main/java/com/elc/system/modules/auth/controller/AuthController.java:22)
- [ProfileController.java](D:/DaiHoc/Nam3/LT%20WEB/elc-system/backend/src/main/java/com/elc/system/modules/auth/controller/ProfileController.java:21)
- [CourseController.java](D:/DaiHoc/Nam3/LT%20WEB/elc-system/backend/src/main/java/com/elc/system/modules/sms/controller/CourseController.java:22)
- [ClazzController.java](D:/DaiHoc/Nam3/LT%20WEB/elc-system/backend/src/main/java/com/elc/system/modules/lms/controller/ClazzController.java:23)
- [InvoiceController.java](D:/DaiHoc/Nam3/LT%20WEB/elc-system/backend/src/main/java/com/elc/system/modules/finance/controller/InvoiceController.java:25)
- [PaymentController.java](D:/DaiHoc/Nam3/LT%20WEB/elc-system/backend/src/main/java/com/elc/system/modules/finance/controller/PaymentController.java:18)
- [com/elc/system/modules/payos/controller/PaymentController.java](D:/DaiHoc/Nam3/LT%20WEB/elc-system/backend/src/main/java/com/elc/system/modules/payos/controller/PaymentController.java:22)
- [ChatbotController.java](D:/DaiHoc/Nam3/LT%20WEB/elc-system/backend/src/main/java/com/elc/system/modules/chatbot/controller/ChatbotController.java:26)

### Endpoint nào đang được frontend gọi
Frontend đang gọi trực tiếp các nhóm endpoint sau:
- Auth, profile.
- Courses, levels, branches.
- Rooms, classes, schedules.
- Enrollments, results, attendance.
- Leads, users, teachers public/private.
- Assignments, submissions.
- Transactions, invoices, payments, expenses, PayOS.
- Notifications, announcements.
- Analytics, reports.
- Public chatbot.

Minh chứng:
- [frontend/src/services/api.ts](D:/DaiHoc/Nam3/LT%20WEB/elc-system/frontend/src/services/api.ts:77)
- [frontend/src/services/chatbot-api.ts](D:/DaiHoc/Nam3/LT%20WEB/elc-system/frontend/src/services/chatbot-api.ts:36)

### Endpoint health nếu có
- Không tìm thấy endpoint health chuyên dụng trong mã nguồn.
- Không thấy dependency `spring-boot-starter-actuator` trong `pom.xml`.
- Không thấy controller expose `/health`, `/actuator/health`.

Kết luận:
- Hiện tại backend chưa có health endpoint đúng chuẩn cho load balancer.
- Nên bổ sung ít nhất một endpoint như `GET /actuator/health` hoặc `GET /api/health`.

## 6. Cơ chế health check và xử lý lỗi

### Backend có endpoint health không
- Chưa có theo mã nguồn hiện tại.

### Khi backend lỗi thì biểu hiện ra sao
- Nếu lỗi business/runtime trong controller, backend trả JSON error theo `GlobalExceptionHandler`.
- Nếu lỗi nghiêm trọng ở startup, backend không mở cổng 8080 và load balancer sẽ nhận connection failure/timeout.
- File `error.log` đang cho thấy một lần khởi động thất bại do lỗi schema:
  - `Schema-validation: missing column [delivered_at] in table [public.announcements]`

Minh chứng:
- [GlobalExceptionHandler.java](D:/DaiHoc/Nam3/LT%20WEB/elc-system/backend/src/main/java/com/elc/system/core/exception/GlobalExceptionHandler.java:28)
- [backend/error.log](D:/DaiHoc/Nam3/LT%20WEB/elc-system/backend/error.log:81)

### Backend có log lỗi hoặc log request không
- Có log startup, log SQL debug và stacktrace lỗi.
- Chưa thấy cấu hình log request HTTP riêng như access log, interceptor log, filter log request.
- Trong `GlobalExceptionHandler`, lỗi generic đang `printStackTrace()`.

Minh chứng:
- [backend/src/main/resources/application.yml](D:/DaiHoc/Nam3/LT%20WEB/elc-system/backend/src/main/resources/application.yml:62)
- [GlobalExceptionHandler.java](D:/DaiHoc/Nam3/LT%20WEB/elc-system/backend/src/main/java/com/elc/system/core/exception/GlobalExceptionHandler.java:236)

## 7. Thông tin mạng và firewall

### Backend có bind 0.0.0.0 hay không
- Không.
- Backend đang bind `localhost`.

Kết luận:
- Load balancer chạy trên máy khác sẽ không gọi vào backend hiện tại được.

### Firewall đã mở cổng chưa
- Chưa xác minh được.
- Lý do: lệnh đọc firewall Windows yêu cầu quyền cao hơn, phiên làm việc hiện tại bị `Access denied`.

### Có giới hạn chỉ cho IP load balancer truy cập không
- Không thấy cấu hình nào trong repo giới hạn truy cập inbound theo IP load balancer.
- Nếu cần, phần này thường phải cấu hình ở OS firewall, cloud security group hoặc reverse proxy tầng trước.

## 8. Minh chứng kiểm thử

### Log backend khi nhận request từ load balancer
- Chưa có log thực tế cho request từ load balancer.
- Nguyên nhân hiện tại: backend chưa khởi động thành công, nên chưa thể nhận request.

### Kết quả Test-NetConnection hoặc curl
Kết quả thực tế tại thời điểm kiểm tra:

```text
Test-NetConnection -ComputerName localhost -Port 8080
TcpTestSucceeded : False
```

```text
Test-NetConnection -ComputerName 192.168.1.98 -Port 8080
TcpTestSucceeded : False
```

```text
curl.exe -i http://localhost:8080/api/health
curl: (7) Failed to connect to localhost port 8080 after 2255 ms: Could not connect to server
```

```text
curl.exe -i -X OPTIONS http://localhost:8080/api/auth/login -H "Origin: http://localhost:5173" -H "Access-Control-Request-Method: POST"
curl: (7) Failed to connect to localhost port 8080 after 2255 ms: Could not connect to server
```

### Ảnh hoặc log khi xảy ra lỗi OPTIONS, timeout, failover
- Chưa có ảnh chụp.
- Có log và kết quả command cho thấy backend down nên preflight `OPTIONS` và health check đều thất bại ở mức kết nối.
- Đây là lỗi trước tầng ứng dụng, chưa đi tới bước kiểm tra CORS runtime.

## 9. Kết luận ngắn gọn cho đội triển khai

Hiện trạng backend chưa sẵn sàng để đặt sau load balancer do 4 điểm chính:
- Backend đang bind `localhost`, không phải `0.0.0.0`.
- Hiện chưa có health endpoint chuẩn.
- Backend đang không mở cổng `8080` vì có log khởi động lỗi schema DB.
- Chưa xác minh firewall inbound.

Các việc nên làm trước khi đưa vào LB:
1. Sửa `server.address` thành `0.0.0.0` hoặc bỏ cấu hình này.
2. Thêm health endpoint, ưu tiên `spring-boot-starter-actuator`.
3. Sửa lỗi schema DB để backend boot thành công.
4. Xác minh firewall mở cổng `8080`.
5. Nếu cần an toàn hơn, giới hạn inbound chỉ từ IP của load balancer.

## 10. Lý do chọn thuật toán cân bằng tải Weighted Least Connections

### Thuật toán đề xuất
- Nên ưu tiên `Weighted Least Connections`.

### So sánh với các thuật toán khác

| Thuật toán | Cách hoạt động | Ưu điểm | Nhược điểm | Mức độ phù hợp với backend này |
|---|---|---|---|---|
| `Round Robin` | Chia request lần lượt đều cho từng backend node | Đơn giản, dễ cấu hình, dễ debug | Không quan tâm node nào đang bận hay request nào nặng | Phù hợp thấp đến trung bình |
| `Weighted Round Robin` | Giống Round Robin nhưng node mạnh nhận nhiều request hơn theo trọng số | Tốt hơn Round Robin khi phần cứng các node khác nhau | Vẫn không phản ánh số connection đang active hoặc request chậm | Phù hợp trung bình |
| `IP Hash` | Cùng một IP client sẽ thường vào cùng một backend node | Hữu ích khi cần session affinity | Dễ lệch tải, không hợp khi nhiều người dùng đi qua cùng NAT hoặc proxy; không tận dụng tốt node rảnh | Phù hợp thấp |
| `Least Connections` | Chuyển request mới tới node có ít connection active nhất | Hợp với hệ có request nhanh/chậm lẫn nhau; phản ánh tải tốt hơn Round Robin | Không tính đến chênh lệch cấu hình giữa các node | Phù hợp cao |
| `Weighted Least Connections` | Giống Least Connections nhưng có thêm trọng số theo năng lực từng node | Cân bằng theo tải thực tế và tận dụng tốt node mạnh hơn | Cần xác định trọng số hợp lý, cấu hình nhỉnh hơn chút | Phù hợp rất cao |
| `Least Response Time` | Chọn node có thời gian phản hồi thấp nhất, thường kết hợp số connection | Tối ưu tốt khi có metric response time chính xác | Phụ thuộc vào khả năng đo response time ổn định; dễ nhiễu khi metric chưa đủ tốt; cấu hình/quan sát phức tạp hơn | Phù hợp trung bình đến cao |

### Phân tích từng thuật toán trong ngữ cảnh dự án này

#### `Round Robin`
- Phù hợp khi mọi request gần như giống nhau và mọi backend node có cùng cấu hình.
- Backend này không hoàn toàn như vậy vì có request CRUD rất nhanh nhưng cũng có request nặng như chatbot, analytics, report, payment.
- Vì thế `Round Robin` có thể khiến một node đang xử lý nhiều request chậm vẫn tiếp tục bị chia thêm request mới.

#### `Weighted Round Robin`
- Tốt hơn `Round Robin` nếu bạn có node mạnh, node yếu.
- Tuy nhiên nó vẫn chia theo số lượng request chứ không chia theo tải thực tế.
- Nếu một node đang giữ nhiều connection lâu, thuật toán này không phản ứng tốt bằng nhóm `Least Connections`.

#### `IP Hash`
- Thường dùng khi ứng dụng cần giữ người dùng về cùng một server do có session state trên server.
- Backend này hiện dùng JWT bearer token, nên không có nhu cầu rõ ràng cho sticky session ở tầng load balancer.
- Với mạng nội bộ, Wi-Fi công ty, NAT hoặc reverse proxy phía trước, nhiều client có thể bị gom cùng IP, làm phân phối tải lệch đáng kể.

#### `Least Connections`
- Phù hợp hơn vì backend có loại request chạy nhanh và loại request giữ connection lâu.
- Khi một node bận xử lý chatbot hoặc truy vấn tổng hợp, request mới sẽ được đẩy sang node rảnh hơn.
- Đây đã là lựa chọn tốt nếu toàn bộ backend node có cấu hình ngang nhau.

#### `Weighted Least Connections`
- Kế thừa ưu điểm của `Least Connections`.
- Bổ sung thêm khả năng ưu tiên node mạnh hơn bằng trọng số.
- Đây là lựa chọn hợp nhất cho hệ thống này nếu:
  - số lượng backend node từ 2 trở lên
  - có khả năng các máy không đồng đều CPU/RAM
  - có request nặng nhẹ xen kẽ

#### `Least Response Time`
- Về mặt lý thuyết, đây là lựa chọn mạnh khi hệ thống có giám sát tốt và metric response time đủ ổn định.
- Tuy nhiên với một dự án như hiện tại, backend còn chưa có health endpoint chuẩn và observability vẫn còn cơ bản, nên dùng thuật toán này sớm có thể làm vận hành khó hơn cần thiết.
- Thuật toán này hợp hơn ở giai đoạn sau, khi đã có monitoring tốt từ Nginx Plus, HAProxy stats, Envoy hoặc service mesh.

### Lý do phù hợp với backend này
- Backend này chủ yếu là stateless theo request vì frontend gửi `Bearer token` và backend xác thực bằng JWT, nên không phụ thuộc sticky session để giữ trạng thái người dùng trên một node cố định.
- Thời gian xử lý request không đồng đều giữa các nhóm API. Các API như chatbot, analytics, report, payment hoặc các truy vấn tổng hợp có thể giữ connection lâu hơn các API CRUD thông thường.
- Nếu dùng `Round Robin`, load balancer chỉ chia đều số request, nhưng không phản ánh việc có node đang bận xử lý nhiều connection dài hơn.
- `Least Connections` tốt hơn vì nó ưu tiên đẩy request mới sang node đang có ít connection active hơn.
- `Weighted Least Connections` còn phù hợp hơn nếu các máy backend không cùng cấu hình CPU, RAM hoặc số worker, vì có thể gán trọng số cao hơn cho máy mạnh và trọng số thấp hơn cho máy yếu.

### Liên hệ với mã nguồn hiện tại
- Frontend dùng JWT bearer token trong mọi request API:
  - [frontend/src/services/api.ts](D:/DaiHoc/Nam3/LT%20WEB/elc-system/frontend/src/services/api.ts:84)
- Backend dùng JWT filter thay cho session server-side:
  - [SecurityConfig.java](D:/DaiHoc/Nam3/LT%20WEB/elc-system/backend/src/main/java/com/elc/system/core/config/SecurityConfig.java:65)
- Backend có chatbot gọi OpenAI, timeout tới 20 giây và có executor async riêng, nên đây là ví dụ rõ của nhóm request giữ tài nguyên lâu hơn:
  - [OpenAiChatClient.java](D:/DaiHoc/Nam3/LT%20WEB/elc-system/backend/src/main/java/com/elc/system/modules/chatbot/service/OpenAiChatClient.java:67)
  - [AsyncConfig.java](D:/DaiHoc/Nam3/LT%20WEB/elc-system/backend/src/main/java/com/elc/system/config/AsyncConfig.java:12)
- Backend cũng có các API analytics/report truy vấn tổng hợp dữ liệu, vốn thường nặng hơn request CRUD đơn giản:
  - [AnalyticsController.java](D:/DaiHoc/Nam3/LT%20WEB/elc-system/backend/src/main/java/com/elc/system/modules/analytics/controller/AnalyticsController.java:25)
  - [ReportController.java](D:/DaiHoc/Nam3/LT%20WEB/elc-system/backend/src/main/java/com/elc/system/modules/analytics/controller/ReportController.java:25)

### Khi nào thuật toán này đặc biệt hữu ích
- Khi có 2 hoặc nhiều backend node với cấu hình khác nhau.
- Khi traffic không đồng đều, có request nhanh và request chậm trộn lẫn.
- Khi muốn tránh tình trạng một node yếu bị phân phối lượng request ngang với node mạnh.

### Kết luận triển khai
- Nếu tất cả backend node giống hệt nhau, có thể dùng `Least Connections`.
- Nếu backend node khác nhau về năng lực xử lý, nên dùng `Weighted Least Connections` để vừa cân bằng theo tải thực tế, vừa tận dụng tốt máy mạnh hơn.
- Trong giai đoạn hiện tại của dự án, `Weighted Least Connections` là điểm cân bằng tốt nhất giữa hiệu quả thực tế, độ ổn định và độ phức tạp vận hành.
