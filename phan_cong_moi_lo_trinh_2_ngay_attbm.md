# Kế hoạch phân công mới và lộ trình hoàn thành trong 2 ngày

## Đề tài: An toàn bảo mật - Tấn công và phòng thủ Web

## 1. Mục tiêu của nhóm

Nhóm thực hiện đề tài **“Tấn công và phòng thủ Web”** theo hướng không chỉ tìm hiểu lý thuyết, mà còn có sản phẩm demo và phần đóng góp riêng.

Với thời gian chỉ có **2 ngày**, nhóm không nên cố gắng demo toàn bộ OWASP Top 10. Thay vào đó, nhóm nên chọn một số kỹ thuật tiêu biểu, dễ triển khai, dễ giải thích và có thể chứng minh được hiệu quả phòng thủ.

Mục tiêu cuối cùng của nhóm là:

```text
1. Tìm hiểu 3 kỹ thuật tấn công Web phổ biến.
2. Mỗi kỹ thuật đều có demo tấn công và demo phòng thủ.
3. Xây dựng mô hình triển khai phòng thủ nhiều lớp có cân bằng tải.
4. Có bảng so sánh kết quả trước và sau khi phòng thủ.
5. Có đóng góp riêng: bộ test case, checklist, bảng đánh giá và mô hình triển khai.
```
## Quy trình:
Web ban đầu trên GitHub
        ↓
3 người clone về
        ↓
Mỗi người tạo lỗi cho kỹ thuật của mình
        ↓
Mỗi người tự phòng thủ lỗi đó
        ↓
Ghi lại file đã sửa + sửa chỗ nào ( để phục vụ báo cáo và merge code)
        ↓
Quay về web ban đầu sạch
        ↓
merge code lại 3 phần phòng thủ vào một bản secure chung
---

## 3. Bảng phân công mới

| Thành viên | Nội dung phụ trách | Công việc chính | Mức độ |
|---|---|---|---|
| Hiếu| SQL Injection | Tìm hiểu, demo tấn công, vá bằng PreparedStatement/parameterized query, test lại | Trung bình |
| Lực| XSS | Tìm hiểu, demo tấn công, vá bằng escape/sanitize, test lại | Dễ |
| Mlinh | Broken Access Control | Tìm hiểu, demo truy cập trái phép, vá bằng kiểm tra role/permission, test lại | Dễ - Trung bình |
| Hải | Load Balancer & mô hình triển khai | Tìm hiểu cân bằng tải, nối tiếp/song song, mô hình phòng thủ nhiều lớp, tổng hợp kiến trúc | Dễ - Trung bình |

---

## 4. Mô hình tổng thể của nhóm

Nhóm nên thống nhất mô hình triển khai như sau:

```text
Client / Attacker
        |
        v
WAF / Reverse Proxy
        |
        v
Load Balancer
        |
        +----------------+
        |                |
        v                v
   Web Server 1     Web Server 2
        |                |
        +--------+-------+
                 |
                 v
              Database
```

Trong mô hình này:

```text
- Client / Attacker: nơi gửi request tấn công hoặc request hợp lệ.
- WAF / Reverse Proxy: lớp kiểm tra, lọc hoặc chặn request độc hại.
- Load Balancer: phân phối request hợp lệ đến nhiều Web Server.
- Web Server 1 và Web Server 2: chạy ứng dụng Web song song.
- Database: lưu trữ dữ liệu của hệ thống.
```

Mô hình này kết hợp cả **nối tiếp** và **song song**:

```text
Nối tiếp:
Client → WAF/Reverse Proxy → Load Balancer → Web Server → Database

Song song:
Web Server 1 và Web Server 2 cùng chạy phía sau Load Balancer.
```

Ý nghĩa bảo mật:

```text
- Request không đi trực tiếp vào Web Server.
- WAF có thể chặn request độc hại trước khi đến ứng dụng.
- Load Balancer giúp hệ thống không bị phụ thuộc vào một Web Server duy nhất.
- Web Server vẫn cần được vá lỗi trong code vì WAF không thay thế được phòng thủ ở tầng mã nguồn.
```

---

# 5. Phân công chi tiết từng thành viên

---

## 5.1. Người 1: SQL Injection - Tấn công và phòng thủ

### Yêu cầu viết báo cáo về các phần sau:
- Giai đoạn 1: Tấn công trước khi phòng thủ
 + Giải thích tại sao phải nghiên cứu và thực hiện tấn công và phòng thủ SQL Injection, thực tế hiện nay người ta đã làm như thế nào để tấn công và phòng thủ 
 + Quay video thực hiện tấn công ( đẩy lên drive)
 + Cap màn hình bắt đầu, kết thúc  -> Giải thích kĩ thuật tấn công, kết quả khi tấn công (tại sao lại có kết quả như thế, đánh giá về kết quả)
- Giai đoạn 2: Phòng thủ
 + Giải thích kĩ thuật phòng thủ, tại sao lựa chọn
 + Quá trình phòng thủ
- Giai đoạn 3: Tấn công sau khi phòng thủ:
+ Thực hiện tấn công lại vào web và ghi lại kết quả, giải thích kết quả, đánh giá
+ Phát triển thêm gì vào kĩ thuật tấn công để có thể tấn công được web -> thực hiện tấn công, cho kết quả, đánh giá kết quả so với kĩ thuật tấn công lúc đầu.
- Giai đoạn 4: Nếu phòng thủ thất bại -> giải thích tại sao thất bại, thực hiện cải tiến phòng thủ, nếu phòng thủ thành công -> giải thích tại sao thành công
- phần Sản phẩm bàn giao ở bên dưới

### 5.1.1. Vai trò

Người 1 phụ trách kỹ thuật **SQL Injection**, một trong những lỗi bảo mật phổ biến trên ứng dụng Web có sử dụng cơ sở dữ liệu.

Người 1 cần trình bày được:

```text
- SQL Injection là gì.
- Vì sao lỗi này xảy ra.
- Payload tấn công hoạt động như thế nào.
- Hậu quả khi khai thác thành công.
- Cách phòng thủ bằng code.
- Cách kiểm thử lại sau khi vá.
```

### 5.1.2. Khái niệm

SQL Injection xảy ra khi ứng dụng ghép trực tiếp dữ liệu người dùng nhập vào câu truy vấn SQL. Attacker có thể chèn thêm đoạn SQL độc hại để thay đổi logic truy vấn.

Ví dụ câu truy vấn không an toàn:

```java
String sql = "SELECT * FROM users WHERE username = '" 
             + username + "' AND password = '" 
             + password + "'";
```

Nếu attacker nhập:

```sql
' OR '1'='1
```

thì câu truy vấn có thể bị biến đổi theo hướng luôn đúng điều kiện đăng nhập.

### 5.1.3. Kịch bản tấn công

Kịch bản demo đề xuất:

```text
1. Truy cập form đăng nhập.
2. Nhập username hoặc password có chứa payload SQL Injection.
3. Nếu hệ thống chưa phòng thủ, attacker có thể đăng nhập trái phép.
4. Ghi lại ảnh hoặc video minh chứng.
5. Sau khi vá lỗi, nhập lại payload cũ để kiểm tra.
```

Payload gợi ý:

```sql
' OR '1'='1
```

hoặc:

```sql
admin' --
```

### 5.1.4. Hậu quả

Nếu khai thác thành công, SQL Injection có thể gây ra:

```text
- Đăng nhập trái phép.
- Xem dữ liệu không được phép.
- Thay đổi hoặc xóa dữ liệu.
- Lộ thông tin người dùng.
- Ảnh hưởng đến toàn bộ cơ sở dữ liệu.
```

### 5.1.5. Phòng thủ

Biện pháp chính là dùng **PreparedStatement** hoặc **parameterized query**.

Ví dụ code an toàn hơn:

```java
String sql = "SELECT * FROM users WHERE username = ? AND password = ?";
PreparedStatement ps = conn.prepareStatement(sql);
ps.setString(1, username);
ps.setString(2, password);
```

Giải thích:

```text
PreparedStatement giúp tách dữ liệu người dùng khỏi cấu trúc câu lệnh SQL.
Payload do người dùng nhập vào sẽ được xem là dữ liệu bình thường, không thể làm thay đổi logic truy vấn.
```

Ngoài ra có thể áp dụng:

```text
- Validate dữ liệu đầu vào.
- Không hiển thị lỗi SQL chi tiết ra giao diện.
- Phân quyền tài khoản database hợp lý.
- Ghi log các request nghi vấn.
```

### 5.1.6. WAF/rule bổ sung cho SQL Injection

Nếu nhóm có rule WAF đơn giản, có thể chặn các mẫu như:

```text
' OR '1'='1
UNION SELECT
DROP TABLE
SLEEP(
--
```

Lưu ý:

```text
WAF chỉ là lớp hỗ trợ. Cách phòng thủ chính vẫn là sửa code bằng PreparedStatement hoặc parameterized query.
```

### 5.1.7. Sản phẩm bàn giao của Người 1

```text
- Phần lý thuyết ngắn về SQL Injection.
- Demo tấn công SQL Injection.
- Payload sử dụng.
- Code trước khi vá và sau khi vá.
- Kết quả test lại sau khi vá.
- Một test case SQL Injection đưa vào bảng đánh giá chung.
```

### 5.1.8. Test case mẫu

| Mã test | Lỗ hổng | Vị trí kiểm thử | Payload | Kết quả trước phòng thủ | Kết quả sau phòng thủ |
|---|---|---|---|---|---|
| TC01 | SQL Injection | Form login | `' OR '1'='1` | Đăng nhập trái phép | Không đăng nhập được |

---

## 5.2. Người 2: XSS - Tấn công và phòng thủ

### Yêu cầu viết báo cáo về các phần sau:
- Giai đoạn 1: Tấn công trước khi phòng thủ
 + Giải thích tại sao phải nghiên cứu và thực hiện tấn công và phòng thủ XSS, thực tế hiện nay người ta đã làm như thế nào để tấn công và phòng thủ 
 + Quay video thực hiện tấn công ( đẩy lên drive)
 + Cap màn hình bắt đầu, kết thúc  -> Giải thích kĩ thuật tấn công, kết quả khi tấn công (tại sao lại có kết quả như thế, đánh giá về kết quả)
- Giai đoạn 2: Phòng thủ
 + Giải thích kĩ thuật phòng thủ, tại sao lựa chọn
 + Quá trình phòng thủ
- Giai đoạn 3: Tấn công sau khi phòng thủ:
+ Thực hiện tấn công lại vào web và ghi lại kết quả, giải thích kết quả, đánh giá
+ Phát triển thêm gì vào kĩ thuật tấn công để có thể tấn công được web -> thực hiện tấn công, cho kết quả, đánh giá kết quả so với kĩ thuật tấn công lúc đầu.
- Giai đoạn 4: Nếu phòng thủ thất bại -> giải thích tại sao thất bại, thực hiện cải tiến phòng thủ, nếu phòng thủ thành công -> giải thích tại sao thành công
- phần Sản phẩm bàn giao ở bên dưới

### 5.2.1. Vai trò

Người 2 phụ trách kỹ thuật **Cross-Site Scripting - XSS**. Đây là phần dễ học, dễ demo và rất trực quan.

Người 2 cần trình bày được:

```text
- XSS là gì.
- Vì sao website bị XSS.
- Cách chèn payload JavaScript.
- Hậu quả nếu script độc hại được thực thi.
- Cách phòng thủ bằng escape hoặc sanitize.
- Kết quả trước và sau khi vá.
```

### 5.2.2. Khái niệm

XSS xảy ra khi website hiển thị dữ liệu người dùng nhập vào mà không xử lý an toàn. Attacker có thể chèn mã JavaScript vào trang, khiến trình duyệt của người dùng khác thực thi mã độc.

Ví dụ payload:

```html
<script>alert('XSS')</script>
```

hoặc:

```html
<img src=x onerror=alert(1)>
```

### 5.2.3. Kịch bản tấn công

Kịch bản demo đề xuất:

```text
1. Truy cập chức năng có ô nhập liệu như bình luận, tìm kiếm, tên người dùng hoặc mô tả.
2. Nhập payload XSS.
3. Nếu website chưa xử lý an toàn, trình duyệt sẽ thực thi JavaScript.
4. Ghi lại ảnh hoặc video minh chứng.
5. Sau khi vá lỗi, nhập lại payload cũ để kiểm tra.
```

Ví dụ:

```html
<script>alert('XSS')</script>
```

Kết quả mong muốn trước khi vá:

```text
Trình duyệt hiện hộp thoại alert.
```

Kết quả mong muốn sau khi vá:

```text
Payload không được thực thi.
Nội dung được hiển thị như văn bản bình thường hoặc bị loại bỏ.
```

### 5.2.4. Hậu quả

XSS có thể dẫn đến:

```text
- Đánh cắp cookie hoặc session token.
- Giả mạo hành động người dùng.
- Chèn giao diện giả mạo để lừa nhập thông tin.
- Chuyển hướng người dùng đến trang độc hại.
- Làm giảm độ tin cậy của website.
```

### 5.2.5. Phòng thủ

Các biện pháp phòng thủ:

```text
- Escape dữ liệu trước khi hiển thị ra HTML.
- Không render trực tiếp dữ liệu người dùng nhập.
- Sanitize input nếu cho phép nhập nội dung HTML.
- Validate input theo định dạng mong muốn.
- Có thể bổ sung Content Security Policy nếu muốn nâng cao.
```

Ví dụ ý tưởng:

```java
String safeOutput = HtmlUtils.htmlEscape(userInput);
```

Giải thích:

```text
Khi dữ liệu được escape, các ký tự đặc biệt như <, >, ", ' không còn được trình duyệt hiểu là mã HTML hoặc JavaScript.
Do đó payload <script>alert(1)</script> sẽ không được thực thi.
```

### 5.2.6. WAF/rule bổ sung cho XSS

Có thể thêm rule chặn các mẫu:

```text
<script>
</script>
onerror=
onload=
javascript:
```

Lưu ý:

```text
Rule WAF giúp chặn một số payload rõ ràng, nhưng không thể thay thế việc escape output trong code.
```

### 5.2.7. Sản phẩm bàn giao của Người 2

```text
- Phần lý thuyết ngắn về XSS.
- Demo tấn công XSS.
- Payload sử dụng.
- Cách vá bằng escape/sanitize.
- Kết quả test lại sau khi vá.
- Một test case XSS đưa vào bảng đánh giá chung.
```

### 5.2.8. Test case mẫu

| Mã test | Lỗ hổng | Vị trí kiểm thử | Payload | Kết quả trước phòng thủ | Kết quả sau phòng thủ |
|---|---|---|---|---|---|
| TC02 | XSS | Ô bình luận/tìm kiếm | `<script>alert(1)</script>` | Script được thực thi | Script không chạy |

---

## 5.3. Người 3: Broken Access Control - Tấn công và phòng thủ

### Yêu cầu viết báo cáo về các phần sau: 
- Giai đoạn 1: Tấn công trước khi phòng thủ
 + Giải thích tại sao phải nghiên cứu và thực hiện tấn công và phòng thủ BAC, thực tế hiện nay người ta đã làm như thế nào để tấn công và phòng thủ 
 + Quay video thực hiện tấn công ( đẩy lên drive)
 + Cap màn hình bắt đầu, kết thúc  -> Giải thích kĩ thuật tấn công, kết quả khi tấn công (tại sao lại có kết quả như thế, đánh giá về kết quả)
- Giai đoạn 2: Phòng thủ
 + Giải thích kĩ thuật phòng thủ, tại sao lựa chọn
 + Quá trình phòng thủ
- Giai đoạn 3: Tấn công sau khi phòng thủ:
+ Thực hiện tấn công lại vào web và ghi lại kết quả, giải thích kết quả, đánh giá
+ Phát triển thêm gì vào kĩ thuật tấn công để có thể tấn công được web -> thực hiện tấn công, cho kết quả, đánh giá kết quả so với kĩ thuật tấn công lúc đầu.
- Giai đoạn 4: Nếu phòng thủ thất bại -> giải thích tại sao thất bại, thực hiện cải tiến phòng thủ, nếu phòng thủ thành công -> giải thích tại sao thành công
- phần Sản phẩm bàn giao ở bên dưới

### 5.3.1. Vai trò

Người 3 phụ trách kỹ thuật **Broken Access Control**, tức là lỗi kiểm soát truy cập và phân quyền.

Đây là phần rất phù hợp để demo trong hệ thống có tài khoản user/admin.

Người 3 cần trình bày được:

```text
- Broken Access Control là gì.
- Vì sao lỗi phân quyền xảy ra.
- Cách user thường truy cập trái phép.
- Hậu quả khi phân quyền sai.
- Cách phòng thủ bằng kiểm tra quyền ở backend.
- Kết quả trước và sau khi vá.
```

### 5.3.2. Khái niệm

Broken Access Control xảy ra khi hệ thống không kiểm tra đúng quyền của người dùng trước khi cho phép truy cập tài nguyên hoặc chức năng.

Ví dụ:

```text
User thường vẫn truy cập được trang /admin.
User A xem được dữ liệu của User B bằng cách đổi ID trên URL.
```

### 5.3.3. Kịch bản tấn công

Kịch bản 1: Truy cập trang admin trái phép

```text
1. Đăng nhập bằng tài khoản user thường.
2. Truy cập trực tiếp URL /admin.
3. Nếu hệ thống không kiểm tra role ở backend, user thường có thể vào trang admin.
4. Sau khi vá lỗi, user thường phải bị chặn.
```

Kịch bản 2: Truy cập dữ liệu người khác

```text
1. Đăng nhập bằng tài khoản User A.
2. Truy cập URL /user/2 hoặc /profile?id=2.
3. Nếu User A xem được dữ liệu của User B, hệ thống bị lỗi phân quyền.
4. Sau khi vá lỗi, User A chỉ được xem dữ liệu của chính mình.
```

### 5.3.4. Hậu quả

Broken Access Control có thể gây ra:

```text
- User thường truy cập được chức năng admin.
- Lộ dữ liệu cá nhân của người dùng khác.
- Sửa, xóa dữ liệu trái phép.
- Leo thang đặc quyền.
- Ảnh hưởng nghiêm trọng đến toàn bộ hệ thống.
```

### 5.3.5. Phòng thủ

Nguyên tắc quan trọng:

```text
Không chỉ ẩn chức năng trên giao diện.
Phải kiểm tra quyền ở phía server.
```

Ví dụ logic kiểm tra role:

```java
if (!currentUser.getRole().equals("ADMIN")) {
    response.sendError(HttpServletResponse.SC_FORBIDDEN);
    return;
}
```

Các biện pháp cần áp dụng:

```text
- Mỗi API quan trọng phải kiểm tra quyền.
- User chỉ được truy cập tài nguyên thuộc về mình.
- Admin mới được truy cập chức năng quản trị.
- Không tin dữ liệu role hoặc userId gửi từ client.
- Trả về 403 Forbidden nếu không đủ quyền.
```

### 5.3.6. WAF/rule bổ sung cho Broken Access Control

WAF thường không xử lý tốt lỗi phân quyền vì đây là lỗi logic nghiệp vụ.

Có thể giải thích:

```text
Broken Access Control chủ yếu phải được phòng thủ trong code.
WAF có thể hỗ trợ chặn một số URL nhạy cảm hoặc request bất thường, nhưng không thể hiểu đầy đủ user nào có quyền truy cập dữ liệu nào.
```

### 5.3.7. Sản phẩm bàn giao của Người 3

```text
- Phần lý thuyết ngắn về Broken Access Control.
- Demo user thường truy cập trái phép.
- Cách vá bằng kiểm tra role/permission ở backend.
- Kết quả test lại sau khi vá.
- Ma trận phân quyền cho hệ thống.
- Một test case Broken Access Control đưa vào bảng đánh giá chung.
```

### 5.3.8. Ma trận phân quyền mẫu

| Chức năng | Guest | User | Admin |
|---|---|---|---|
| Xem trang chủ | Có | Có | Có |
| Đăng nhập | Có | Có | Có |
| Xem thông tin cá nhân | Không | Chỉ của mình | Tất cả |
| Truy cập trang admin | Không | Không | Có |
| Xóa người dùng | Không | Không | Có |

### 5.3.9. Test case mẫu

| Mã test | Lỗ hổng | Vị trí kiểm thử | Cách test | Kết quả trước phòng thủ | Kết quả sau phòng thủ |
|---|---|---|---|---|---|
| TC03 | Broken Access Control | Trang `/admin` | User thường truy cập trực tiếp | Truy cập được | Bị chặn 403 |

---

## 5.4. Người 4: Load Balancer và mô hình triển khai nối tiếp/song song

### 5.4.1. Vai trò

Người 4 phụ trách phần **cân bằng tải**, **mô hình nối tiếp/song song** và **kiến trúc phòng thủ nhiều lớp**.

Đây là phần giúp kết nối ba kỹ thuật tấn công/phòng thủ của ba người đầu vào một mô hình hệ thống hoàn chỉnh.

Người 4 cần trình bày được:

```text
- Load Balancer là gì.
- Mô hình nối tiếp là gì.
- Mô hình song song là gì.
- Vì sao hệ thống nên kết hợp cả hai.
- Load Balancer khác gì khi đặt trong kiến trúc bảo mật nhiều lớp.
- Cách demo chia tải giữa nhiều Web Server.
```

### 5.4.2. Cân bằng tải là gì?

Cân bằng tải là kỹ thuật phân phối request đến nhiều server khác nhau nhằm:

```text
- Tránh một server bị quá tải.
- Tăng khả năng chịu tải.
- Tăng tính sẵn sàng.
- Hỗ trợ mở rộng hệ thống.
```

Mô hình cơ bản:

```text
Client
   |
   v
Load Balancer
   |
   +----> Web Server 1
   |
   +----> Web Server 2
```

### 5.4.3. Mô hình nối tiếp

Mô hình nối tiếp là khi request đi qua các thành phần theo thứ tự.

Ví dụ:

```text
Client → WAF/Reverse Proxy → Load Balancer → Web Server → Database
```

Giải thích:

```text
Request phải đi qua WAF để kiểm tra, sau đó qua Load Balancer để phân phối, rồi mới đến Web Server.
Các thành phần được đặt theo chuỗi nên gọi là mô hình nối tiếp.
```

Ưu điểm:

```text
- Dễ kiểm soát luồng request.
- Có thể chặn request độc hại từ bên ngoài.
- Dễ ghi log, giám sát.
- Phù hợp với phòng thủ nhiều lớp.
```

Nhược điểm:

```text
- Nếu một thành phần trong chuỗi lỗi, hệ thống có thể bị ảnh hưởng.
- WAF hoặc Load Balancer có thể trở thành điểm nghẽn nếu cấu hình chưa tốt.
```

### 5.4.4. Mô hình song song

Mô hình song song là khi có nhiều server cùng thực hiện một nhiệm vụ.

Ví dụ:

```text
                 +--> Web Server 1
Client → LB -----+--> Web Server 2
                 +--> Web Server 3
```

Giải thích:

```text
Các Web Server cùng chạy một ứng dụng.
Load Balancer phân phối request đến từng Web Server.
```

Ưu điểm:

```text
- Tăng khả năng chịu tải.
- Nếu một Web Server lỗi, request vẫn có thể chuyển sang server khác.
- Dễ mở rộng bằng cách thêm server mới.
```

Nhược điểm:

```text
- Cần đảm bảo các Web Server có cùng phiên bản ứng dụng.
- Cần xử lý session nếu session lưu trên server.
- Cần cấu hình kết nối database hợp lý.
```

### 5.4.5. Mô hình nhóm lựa chọn

Nhóm lựa chọn mô hình kết hợp:

```text
Client / Attacker
        |
        v
WAF / Reverse Proxy
        |
        v
Load Balancer
        |
        +----------------+
        |                |
        v                v
   Web Server 1     Web Server 2
        |                |
        +--------+-------+
                 |
                 v
              Database
```

Lý do chọn:

```text
- WAF/Reverse Proxy đứng trước để lọc request độc hại.
- Load Balancer phân phối các request hợp lệ đến nhiều Web Server.
- Web Server chạy song song giúp tăng khả năng chịu tải.
- Database không public trực tiếp ra bên ngoài.
- Mô hình này vừa phục vụ bảo mật, vừa phục vụ hiệu năng và tính sẵn sàng.
```

### 5.4.6. Demo gợi ý

Người 4 có thể dựng demo đơn giản bằng 2 Web Server.

Ví dụ:

```text
Web Server 1 chạy ở port 8081, trả về: Hello from Web Server 1
Web Server 2 chạy ở port 8082, trả về: Hello from Web Server 2
Nginx Load Balancer chạy ở port 8080.
```

Khi truy cập nhiều lần:

```text
http://localhost:8080
```

Kết quả:

```text
Lần 1: Hello from Web Server 1
Lần 2: Hello from Web Server 2
Lần 3: Hello from Web Server 1
Lần 4: Hello from Web Server 2
```

Kết quả này chứng minh request đã được phân phối đến nhiều server.

### 5.4.7. Sản phẩm bàn giao của Người 4

```text
- Sơ đồ kiến trúc tổng thể.
- Giải thích mô hình nối tiếp.
- Giải thích mô hình song song.
- Phần so sánh cân bằng tải thông thường và cân bằng tải trong phòng thủ nhiều lớp.
- Demo chia tải giữa Web Server 1 và Web Server 2.
- Phần kết luận vì sao mô hình phù hợp với đề tài tấn công và phòng thủ Web.
```

---

# 6. Đóng góp của nhóm

Để đáp ứng yêu cầu của giảng viên rằng đề tài không chỉ thực hiện lại những gì đã có, nhóm cần xác định rõ phần đóng góp.

## 6.1. Đóng góp tổng thể

Đóng góp của nhóm là:

```text
Xây dựng quy trình kiểm thử và phòng thủ Web nhiều lớp cho một hệ thống demo cụ thể, bao gồm:
- Bộ test case cho từng lỗ hổng.
- Biện pháp vá lỗi tương ứng ở tầng mã nguồn.
- Rule WAF/Gateway đơn giản để chặn một số payload phổ biến.
- Mô hình triển khai kết hợp nối tiếp và song song có cân bằng tải.
- Bảng đánh giá hiệu quả trước và sau khi phòng thủ.
```

## 6.2. Đóng góp theo từng thành viên

| Thành viên | Đóng góp |
|---|---|
| Người 1 | Bộ test case kiểm thử SQL Injection và cách vá bằng truy vấn tham số |
| Người 2 | Bộ test case kiểm thử XSS và cách vá bằng escape/sanitize |
| Người 3 | Ma trận phân quyền và test case kiểm thử Broken Access Control |
| Người 4 | Mô hình triển khai phòng thủ nhiều lớp kết hợp WAF, Load Balancer và nhiều Web Server |

---

# 7. Bảng đánh giá hiệu quả trước và sau phòng thủ

Nhóm nên có bảng đánh giá chung như sau:

| Mã test | Lỗ hổng / Tình huống | Trước phòng thủ | Biện pháp phòng thủ | Sau phòng thủ | Nhận xét |
|---|---|---|---|---|---|
| TC01 | SQL Injection | Có thể đăng nhập trái phép | PreparedStatement / parameterized query | Không khai thác được | Vá code là biện pháp chính |
| TC02 | XSS | Script được thực thi | Escape output / sanitize input | Script không chạy | Cần xử lý dữ liệu trước khi hiển thị |
| TC03 | Broken Access Control | User thường truy cập được trang admin | Kiểm tra role ở backend | Bị chặn 403 | WAF không thay thế được kiểm tra quyền |
| TC04 | Payload độc hại đi vào hệ thống | Request được chuyển vào Web Server | WAF/rule chặn đơn giản | Request bị chặn | WAF là lớp hỗ trợ |
| TC05 | Nhiều request vào một server | Một Web Server xử lý toàn bộ | Load Balancer | Request được chia sang nhiều server | Giúp tăng khả năng chịu tải |

---

# 8. Lộ trình hoàn thành trong 2 ngày

## 8.1. Ngày 1 - Hoàn thành phần kỹ thuật tấn công và vá lỗi

### Buổi sáng ngày 1: Chốt hệ thống demo

Mục tiêu:

```text
- Thống nhất website demo.
- Thống nhất 3 lỗ hổng chính.
- Thống nhất công cụ sử dụng.
- Chia rõ phần việc cho từng người.
```

Việc cần làm:

| Thời gian | Công việc | Người phụ trách |
|---|---|---|
| 08:00 - 09:00 | Chốt mô hình tổng thể và công cụ | Cả nhóm |
| 09:00 - 10:00 | Chuẩn bị website demo có login, ô nhập liệu, trang admin | Cả nhóm / người phụ trách code |
| 10:00 - 11:00 | Tạo dữ liệu mẫu: user thường, admin, dữ liệu test | Cả nhóm |
| 11:00 - 12:00 | Kiểm tra website chạy được trước khi chia việc | Cả nhóm |

Kết quả cần có sau buổi sáng:

```text
- Website demo chạy được.
- Có form login để test SQL Injection.
- Có ô comment/search/profile để test XSS.
- Có trang /admin hoặc dữ liệu riêng tư để test Broken Access Control.
- Có tài khoản user và admin.
```

---

### Buổi chiều ngày 1: 3 người đầu làm tấn công

Mục tiêu:

```text
Mỗi người thực hiện thành công demo tấn công cho kỹ thuật của mình.
```

| Thời gian | Công việc | Người phụ trách |
|---|---|---|
| 13:30 - 15:00 | Demo SQL Injection và ghi lại bằng chứng | Người 1 |
| 13:30 - 15:00 | Demo XSS và ghi lại bằng chứng | Người 2 |
| 13:30 - 15:00 | Demo Broken Access Control và ghi lại bằng chứng | Người 3 |
| 15:00 - 16:00 | Viết test case cho từng lỗi | Người 1, 2, 3 |
| 16:00 - 17:00 | Tổng hợp kết quả trước phòng thủ | Cả nhóm |

Kết quả cần có sau buổi chiều:

```text
- Ảnh hoặc video demo SQL Injection trước khi vá.
- Ảnh hoặc video demo XSS trước khi vá.
- Ảnh hoặc video demo Broken Access Control trước khi vá.
- Bảng test case ban đầu.
```

---

### Buổi tối ngày 1: Vá lỗi và test lại

Mục tiêu:

```text
Mỗi người vá lỗi cho kỹ thuật của mình và kiểm thử lại payload cũ.
```

| Thời gian | Công việc | Người phụ trách |
|---|---|---|
| 19:00 - 20:00 | Vá SQL Injection bằng PreparedStatement/parameterized query | Người 1 |
| 19:00 - 20:00 | Vá XSS bằng escape/sanitize | Người 2 |
| 19:00 - 20:00 | Vá Broken Access Control bằng kiểm tra role/permission | Người 3 |
| 20:00 - 21:00 | Test lại payload cũ sau khi vá | Người 1, 2, 3 |
| 21:00 - 22:00 | Cập nhật bảng trước/sau phòng thủ | Cả nhóm |
| 22:00 - 23:00 | Chụp ảnh hoặc quay video kết quả sau khi vá | Cả nhóm |

Kết quả cần có cuối ngày 1:

```text
- 3 lỗi đã có demo trước phòng thủ.
- 3 lỗi đã có biện pháp vá.
- 3 lỗi đã được test lại sau khi vá.
- Có bảng kết quả trước/sau.
```

---

## 8.2. Ngày 2 - Hoàn thành WAF/rule, Load Balancer, báo cáo và slide

### Buổi sáng ngày 2: Làm mô hình phòng thủ nhiều lớp và cân bằng tải

Mục tiêu:

```text
Hoàn thành phần kiến trúc hệ thống, WAF/rule đơn giản và Load Balancer.
```

| Thời gian | Công việc | Người phụ trách |
|---|---|---|
| 08:00 - 09:00 | Vẽ lại sơ đồ kiến trúc tổng thể | Người 4 |
| 09:00 - 10:30 | Dựng demo Load Balancer với 2 Web Server | Người 4 |
| 09:00 - 10:30 | Tổng hợp rule WAF đơn giản cho SQLi, XSS | Người 1, 2, 4 |
| 10:30 - 11:30 | Test request đi qua Load Balancer | Người 4 |
| 11:30 - 12:00 | Ghi lại ảnh/video demo chia tải | Người 4 |

Nếu không kịp dựng WAF thật, nhóm có thể trình bày rule ở mức đơn giản hoặc middleware trong ứng dụng. Tuy nhiên vẫn nên có ít nhất một minh chứng request độc hại bị chặn.

Kết quả cần có sau buổi sáng:

```text
- Sơ đồ kiến trúc tổng thể.
- Demo Load Balancer chia request sang 2 Web Server.
- Danh sách rule WAF/Gateway đơn giản.
- Ảnh hoặc video minh chứng phần cân bằng tải.
```

---

### Buổi chiều ngày 2: Hoàn thiện báo cáo

Mục tiêu:

```text
Ghép toàn bộ phần nội dung thành báo cáo hoàn chỉnh.
```

| Thời gian | Công việc | Người phụ trách |
|---|---|---|
| 13:30 - 14:30 | Viết phần SQL Injection | Người 1 |
| 13:30 - 14:30 | Viết phần XSS | Người 2 |
| 13:30 - 14:30 | Viết phần Broken Access Control | Người 3 |
| 13:30 - 14:30 | Viết phần Load Balancer, nối tiếp/song song | Người 4 |
| 14:30 - 15:30 | Ghép bảng test case và bảng đánh giá trước/sau | Cả nhóm |
| 15:30 - 16:30 | Viết phần đóng góp của nhóm | Cả nhóm |
| 16:30 - 17:30 | Kiểm tra lại nội dung, hình ảnh, lỗi trình bày | Cả nhóm |

Kết quả cần có sau buổi chiều:

```text
- Báo cáo có đủ 4 phần chính.
- Có bảng phân công.
- Có sơ đồ kiến trúc.
- Có test case.
- Có bảng đánh giá trước/sau.
- Có phần đóng góp của nhóm.
```

---

### Buổi tối ngày 2: Làm slide và luyện thuyết trình

Mục tiêu:

```text
Hoàn thiện slide ngắn gọn và luyện demo.
```

| Thời gian | Công việc | Người phụ trách |
|---|---|---|
| 19:00 - 20:00 | Làm slide giới thiệu đề tài, mô hình, phân công | Cả nhóm |
| 20:00 - 21:00 | Làm slide cho 3 kỹ thuật tấn công/phòng thủ | Người 1, 2, 3 |
| 21:00 - 21:30 | Làm slide cho Load Balancer và mô hình triển khai | Người 4 |
| 21:30 - 22:00 | Làm slide đóng góp và kết luận | Cả nhóm |
| 22:00 - 23:00 | Luyện demo và chia lời nói | Cả nhóm |

Kết quả cần có cuối ngày 2:

```text
- Slide hoàn chỉnh.
- Demo chạy được.
- Mỗi người biết phần mình cần nói.
- Có phương án dự phòng nếu demo lỗi.
```

---

# 9. Kịch bản thuyết trình đề xuất

## 9.1. Thứ tự trình bày

```text
1. Giới thiệu đề tài và mục tiêu.
2. Giới thiệu mô hình tổng thể.
3. Người 1 trình bày SQL Injection.
4. Người 2 trình bày XSS.
5. Người 3 trình bày Broken Access Control.
6. Người 4 trình bày Load Balancer, nối tiếp/song song và phòng thủ nhiều lớp.
7. Trình bày bảng đánh giá trước/sau.
8. Trình bày đóng góp của nhóm.
9. Kết luận.
```

## 9.2. Lời nói mẫu cho từng người

### Người 1 - SQL Injection

```text
Em phụ trách phần SQL Injection. Đây là lỗi xảy ra khi dữ liệu người dùng nhập vào được ghép trực tiếp vào câu truy vấn SQL. Em thực hiện kiểm thử trên form đăng nhập bằng payload ' OR '1'='1. Trước khi phòng thủ, hệ thống có thể bị đăng nhập trái phép. Sau đó em phòng thủ bằng cách sử dụng PreparedStatement để tách dữ liệu người dùng khỏi câu lệnh SQL. Khi kiểm thử lại payload cũ, hệ thống không còn bị khai thác.
```

### Người 2 - XSS

```text
Em phụ trách phần XSS. Đây là lỗi xảy ra khi website hiển thị dữ liệu người dùng nhập vào mà không xử lý an toàn. Em demo bằng cách nhập payload <script>alert(1)</script> vào ô nhập liệu. Trước khi vá, trình duyệt thực thi script. Sau khi phòng thủ bằng escape/sanitize dữ liệu đầu ra, payload không còn được thực thi.
```

### Người 3 - Broken Access Control

```text
Em phụ trách phần Broken Access Control. Đây là lỗi xảy ra khi hệ thống không kiểm tra đúng quyền truy cập của người dùng. Em demo bằng cách đăng nhập tài khoản user thường nhưng truy cập trực tiếp vào trang /admin. Trước khi vá, user thường có thể truy cập trái phép. Sau khi bổ sung kiểm tra role ở backend, hệ thống trả về 403 Forbidden.
```

### Người 4 - Load Balancer và mô hình triển khai

```text
Em phụ trách phần cân bằng tải và mô hình triển khai. Nhóm lựa chọn mô hình kết hợp giữa nối tiếp và song song. Các lớp WAF/Reverse Proxy, Load Balancer và Web Server được đặt nối tiếp để kiểm soát luồng request. Các Web Server được triển khai song song phía sau Load Balancer để tăng khả năng chịu tải và tính sẵn sàng. Mô hình này giúp hệ thống vừa có khả năng phòng thủ, vừa có khả năng mở rộng.
```

---

# 10. Checklist hoàn thành

Trước khi nộp, nhóm cần kiểm tra:

## 10.1. Phần kỹ thuật

```text
[ ] Có demo SQL Injection trước và sau khi vá.
[ ] Có demo XSS trước và sau khi vá.
[ ] Có demo Broken Access Control trước và sau khi vá.
[ ] Có demo Load Balancer chia request.
[ ] Có sơ đồ mô hình phòng thủ nhiều lớp.
[ ] Có bảng test case.
[ ] Có bảng đánh giá trước/sau.
```

## 10.2. Phần báo cáo

```text
[ ] Có phần giới thiệu đề tài.
[ ] Có bảng phân công.
[ ] Có lý thuyết ngắn cho từng kỹ thuật.
[ ] Có kịch bản tấn công.
[ ] Có biện pháp phòng thủ.
[ ] Có kết quả demo.
[ ] Có phần đóng góp của nhóm.
[ ] Có kết luận.
```

## 10.3. Phần thuyết trình

```text
[ ] Mỗi người có phần nói rõ ràng.
[ ] Demo đã được chạy thử trước.
[ ] Có ảnh/video dự phòng nếu demo trực tiếp lỗi.
[ ] Slide không quá dài.
[ ] Có câu trả lời nếu thầy hỏi “đóng góp mới của nhóm là gì?”.
```

---

# 11. Phương án dự phòng nếu không kịp

Nếu chỉ còn rất ít thời gian, nhóm nên ưu tiên:

```text
1. SQL Injection trước/sau.
2. XSS trước/sau.
3. Broken Access Control trước/sau.
4. Sơ đồ Load Balancer và giải thích nối tiếp/song song.
5. Ảnh minh chứng thay cho demo trực tiếp nếu cần.
```

Không nên cố làm quá nhiều công cụ phức tạp.

Có thể bỏ bớt:

```text
- WAF thật bằng ModSecurity nếu không kịp.
- Docker nhiều container nếu nhóm chưa quen.
- Demo đủ OWASP Top 10.
- Công cụ quét tự động nâng cao.
```

Nhưng không nên bỏ:

```text
- Bảng test case.
- Bảng trước/sau phòng thủ.
- Phần đóng góp của nhóm.
- Mô hình kiến trúc tổng thể.
```

---

# 12. Kết luận

Với thời gian 2 ngày, cách chia hợp lý nhất là:

```text
Người 1: SQL Injection - tấn công và phòng thủ.
Người 2: XSS - tấn công và phòng thủ.
Người 3: Broken Access Control - tấn công và phòng thủ.
Người 4: Load Balancer, nối tiếp/song song và kiến trúc phòng thủ nhiều lớp.
```

Cách chia này giúp mỗi thành viên có phần độc lập, dễ học, dễ demo và dễ trả lời khi được hỏi.

Điểm đóng góp của nhóm không nằm ở việc phát minh ra kỹ thuật mới, mà nằm ở việc nhóm tự xây dựng được một quy trình áp dụng cho hệ thống demo:

```text
Test case tấn công → Vá lỗi → Kiểm thử lại → Rule phòng thủ bổ sung → Mô hình triển khai nhiều lớp → Đánh giá hiệu quả trước/sau
```

Đây là hướng phù hợp với yêu cầu của giảng viên: không chỉ thực hiện lại kiến thức có sẵn, mà có áp dụng, đánh giá và đề xuất mô hình cụ thể cho hệ thống của nhóm.
