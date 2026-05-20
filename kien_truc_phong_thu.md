KIẾN TRÚC PHÒNG THỦ NHIỀU LỚP (JWT + CORS + SPRING SECURITY)
Luồng bắt đầu:
REQUEST: Client (Web / Mobile / Postman / ...) gửi HTTP Request.

CÁC BƯỚC XỬ LÝ TRONG LUỒNG
1. CORS

Xử lý: Kiểm tra nguồn gốc (Origin) và các phương thức/headers được phép.

Nếu lỗi: Không hợp lệ ➔ Chặn ngay.

2. JWT AUTHENTICATION

Xử lý: Xác thực JWT bao gồm:

Kiểm tra token

Kiểm tra chữ ký

Kiểm tra thời hạn

Trích xuất thông tin người dùng

Nếu lỗi: Không hợp lệ ➔ 401 Unauthorized

3. SPRING SECURITY AUTHORIZATION

Xử lý: Kiểm tra quyền truy cập ở cấp endpoint/path dựa trên role/authority (Filter Security).

Nếu lỗi: Không đủ quyền ➔ 403 Forbidden

4. METHOD SECURITY

Xử lý: Kiểm tra quyền truy cập phương thức thông qua các annotation như @PreAuthorize, @PostAuthorize, @Secured, ...

Nếu lỗi: Không đủ quyền ➔ 403 Forbidden

5. OBJECT-LEVEL AUTHORIZATION

Xử lý: Kiểm tra quyền với tài nguyên cụ thể (ví dụ: classId, userId, branchId, ...) thuộc phạm vi của người dùng.

Nếu lỗi: Không đủ quyền ➔ 403 Forbidden

6. DTO VALIDATION / FIELD-LEVEL CONTROL

Xử lý: Kiểm tra & ràng buộc dữ liệu đầu vào (DTO, Bean Validation). Kiểm soát các trường được phép cập nhật (whitelist).

Nếu lỗi: Dữ liệu không hợp lệ ➔ 400 Bad Request

7. CONTROLLER / SERVICE

Xử lý: Xử lý nghiệp vụ. Truy cập Service, Repository, Database.

Nếu thành công: Thành công ➔ 200 OK

KẾT QUẢ XỬ LÝ CHUNG
❌ BỊ TỪ CHỐI / CHẶN LẠI: Request bị dừng tại lớp không đạt yêu cầu và trả về lỗi tương ứng (CORS, 401 Unauthorized, 403 Forbidden, 400 Bad Request, ...).

✅ XỬ LÝ THÀNH CÔNG: Trả về dữ liệu cho client.

Ý NGHĨA TỪNG LỚP BẢO MẬT
1. CORS: Giới hạn nguồn gọi API từ trình duyệt. Chống tấn công từ domain lạ.

2. JWT AUTHENTICATION: Xác thực danh tính người dùng. Chống giả mạo, sửa token, hết hạn.

3. SPRING SECURITY AUTHORIZATION: Kiểm soát truy cập theo vai trò ở cấp endpoint.

4. METHOD SECURITY: Kiểm soát truy cập ở cấp phương thức nghiệp vụ. Linh hoạt theo role/authority.

5. OBJECT-LEVEL AUTHORIZATION: Đảm bảo người dùng chỉ truy cập tài nguyên thuộc phạm vi của mình.

6. DTO / FIELD CONTROL: Kiểm soát dữ liệu đầu vào. Chỉ cho phép cập nhật trường hợp lệ.

7. CONTROLLER / SERVICE: Xử lý nghiệp vụ an toàn. Trả về kết quả cho client.

⭐ KẾT QUẢ:
Kiến trúc nhiều lớp giúp ngăn chặn hiệu quả các lỗ hổng Broken Access Control như IDOR, BOLA, Mass Assignment, URL Bypass, HTTP Method Tampering, ...