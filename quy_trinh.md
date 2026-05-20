2.3.1. Tổng quan về lỗ hổng Broken Access Control 
Như đã trình bày ở phần 1.6, Broken Access Control xảy ra khi hệ thống không kiểm tra hoặc kiểm tra không đúng mức quyền truy cập của người dùng đối với tài nguyên, chức năng. Kẻ tấn công có thể tận dụng để truy cập dữ liệu, thao tác trái phép, leo thang quyền hạn hoặc phá hoại hệ thống.
Broken Access Control hiện đang là vấn đề bảo mật top 1 theo chuẩn OWSAP Top 10 năm 2021 và OWASP Top 10 2025. Lỗ hổng này cho phép kẻ tấn công truy cập hoặc thực hiện các hành động vượt ngoài quyền hạn cho phép, gây nguy cơ rò rỉ dữ liệu, chiếm quyền điều khiển hệ thống hoặc gây ra các hậu quả nghiêm trọng khác.
Việc nghiên cứu BAC là cần thiết vì lỗi này thường không xuất hiện rõ ràng trên giao diện. Một chức năng có thể đã được ẩn nút trên frontend nhưng API phía backend vẫn có thể bị gọi trực tiếp bằng công cụ như Postman hoặc Burp Suite. Do đó, chỉ kiểm tra giao diện là chưa đủ, cần kiểm thử trực tiếp ở mức API, URL, tham số request và quyền sở hữu dữ liệu.
2.3.2. Các cuộc tấn công thực tế liên quan đến lỗ hổng Broken Access Control
	Navia / HackerOne 2026: BOLA – Broken Object Level Authorization
HackerOne cho biết dữ liệu nhân viên bị lộ do nhà cung cấp Navia có lỗ hổng BOLA, cho phép tác nhân không xác định truy cập dữ liệu từ 22/12/2025 đến 15/01/2026.
	McDonald’s McHire 2025: IDOR / Broken Object Level Authorization
Nền tảng tuyển dụng McHire có lỗi IDOR trong API nội bộ. Nhà nghiên cứu chỉ cần thay đổi lead_id là truy cập được thông tin ứng viên khác; bài gốc ghi rõ lỗi này có thể truy cập dữ liệu hơn 64 triệu hồ sơ ứng tuyển.
	Kia 2024: Broken Access Control / authorization flaw
Nhà nghiên cứu tạo được tài khoản thường nhưng vẫn gọi được các endpoint kiểu dealer/admin, từ đó lấy thông tin chủ xe và thêm tài khoản tấn công làm chủ xe. Đây là lỗi kiểm soát quyền truy cập rất điển hình: backend không ràng buộc đúng quyền với tài nguyên xe.
	Bykea 2024: Broken Access Control / IDOR: 
Báo cáo HackerOne ghi rõ lỗi Broken Access Control (IDOR), trong đó người dùng độc hại có thể xem chi tiết booking của người dùng khác.
	U.S. Department of Defense 2025: IDOR / missing authorization
Endpoint /BugReport/Admin/Attachment/{id} để lộ attachment của bug report riêng tư khi thay đổi id. Đây là ví dụ rõ về việc object ID trong URL không được kiểm tra quyền truy cập
2.3.3. Các dạng lỗ hổng Broken Access Control
2.3.3.1. IDOR
IDOR (Insecure Direct Object Reference) là một dạng lỗ hổng kiểm soát truy cập xảy ra khi ứng dụng sử dụng trực tiếp định danh tài nguyên, chẳng hạn như ‘userId’, ‘orderId’,… trong URL hoặc request nhưng không kiểm tra người dùng hiện tại có quyền truy cập tài nguyên đó hay không. Khi đó kẻ tấn công có thể thay đổi giá trị định danh để truy cập dữ liệu hoặc thao tác trên tài nguyên người khác.
Ví dụ, một người dùng truy cập đơn hàng của mình thông qua API:
‘GET /api/orders/101’
Nếu kẻ tấn công thay đổi thành:
‘GET /api/orders/102’
và hệ thống trả về đơn hàng của người dùng khác, điều đó cho thấy backend không kiểm tra quyền sở hữu tài nguyên. Đây là lỗ hổng IDOR, có thể dẫn đến truy cập trái phép dữ liệu, sửa đổi thông tin hoặc thực hiện hành động không thuộc quyền hạn của người dùng.
2.3.3.2. BOLA
BOLA (Broken Object Level Authorization) là cách gọi thường dùng trong bảo mật API để chỉ lỗi không kiểm tra quyền truy cập ở cấp đối tượng. Về bản chất, BOLA rất gần với IDOR, nhưng nhấn mạnh hơn vào việc API không xác minh rằng người dùng hiện tại có quyền đối với object cụ thể được yêu cầu hay không.
Ví dụ, một API cho phép giáo viên xem danh sách học viên của lớp:
‘GET /api/classes/5/students’
Nếu giáo viên A có thể đổi classId thành lớp của giáo viên B:
‘GET /api/classes/6/students’
và vẫn xem được danh sách học viên, thì đây là lỗi BOLA. Trong trường hợp này, người dùng có thể có đúng vai trò là Teacher, nhưng lại không có quyền truy cập đối tượng cụ thể là lớp học không thuộc phạm vi phụ trách của mình.
Kết luận: IDOR/BOLA là các dạng lỗ hổng Broken Access Control ở cấp đối tượng. Chúng thường bị khai thác thông qua kỹ thuật Parameter Tampering, tức là thay đổi các định danh tài nguyên trong URL, query string, body hoặc header của request. Nếu backend không kiểm tra quyền sở hữu hoặc phạm vi truy cập của người dùng đối với từng tài nguyên, kẻ tấn công có thể truy cập dữ liệu của người khác, gây ra leo quyền theo chiều ngang hoặc rò rỉ dữ liệu trái phép.
2.3.3.3.  BFLA / cấu hình phân quyền không nhất quán theo phương thức HTTP
BFLA (Broken Function Level Authorization) là dạng lỗ hổng kiểm soát truy cập xảy ra khi ứng dụng không kiểm tra đầy đủ quyền của người dùng đối với từng chức năng hoặc endpoint API. Khi đó, người dùng có quyền thấp vẫn có thể gọi trực tiếp các chức năng chỉ dành cho người có quyền cao hơn, chẳng hạn như quản trị viên.
Ví dụ, trong hệ thống có API quản lý người dùng:
‘DELETE /api/users/5’
Chức năng này chỉ nên cho phép tài khoản Admin thực hiện. Tuy nhiên, nếu một tài khoản thường hoặc Student gửi request đến API này mà backend chỉ kiểm tra người dùng đã đăng nhập, không kiểm tra vai trò Admin, thì request vẫn có thể được xử lý thành công. Đây là lỗi Broken Function Level Authorization.
Lỗ hổng cấu hình phân quyền không nhất quán theo phương thức HTTP xảy ra khi hệ thống chỉ áp dụng kiểm tra quyền cho một số phương thức nhất định trên endpoint, nhưng bỏ sót các phương thức khác. Kẻ tấn công có thể lợi dụng điều này bằng cách thay đổi phương thức HTTP trong request, chẳng hạn từ GET sang POST, PUT, PATCH hoặc DELETE, để thực hiện các thao tác trái phép. Về bản chất, đây là một dạng Broken Access Control do backend không kiểm tra quyền đầy đủ cho từng hành động của người dùng.
2.3.3.4. BOPLA
BOPLA (Broken Object Property Level Authorization) là dạng lỗ hổng kiểm soát truy cập xảy ra khi ứng dụng không kiểm soát đầy đủ quyền truy cập hoặc quyền sửa đổi đối với từng thuộc tính của một đối tượng dữ liệu. Nói cách khác, người dùng có thể được phép thao tác với một object, nhưng không phải thuộc tính nào trong object đó họ cũng được phép xem hoặc chỉnh sửa.
Ví dụ, một người dùng được phép cập nhật thông tin cá nhân của mình thông qua API:
‘PUT /api/users/10’
Request hợp lệ có thể chỉ nên bao gồm:
{
  "fullName": "Nguyen Van A",
  "phone": "0123456789"
}
Tuy nhiên, nếu kẻ tấn công gửi thêm trường nhạy cảm:
{
  "fullName": "Nguyen Van A",
  "phone": "0123456789",
  "role": "ADMIN",
  "isActive": true
}
và backend cập nhật toàn bộ dữ liệu này vào cơ sở dữ liệu, người dùng thường có thể tự thay đổi quyền hoặc trạng thái tài khoản của mình. Đây là lỗi Broken Object Property Level Authorization, vì hệ thống không kiểm tra thuộc tính nào được phép sửa và thuộc tính nào phải bị cấm.
BOPLA thường xảy ra khi backend nhận trực tiếp toàn bộ dữ liệu từ client và ánh xạ vào object trong hệ thống mà không lọc các trường nhạy cảm. Dạng lỗi này liên quan gần với Mass Assignment hoặc Object Property Tampering. Hậu quả có thể là người dùng tự nâng quyền, thay đổi trạng thái nghiệp vụ, sửa dữ liệu không được phép hoặc xem các trường nhạy cảm mà họ không có quyền truy cập.
2.3.3.5. Authorization Bypass
Authorization Bypass là dạng lỗ hổng xảy ra khi kẻ tấn công có thể vượt qua cơ chế kiểm tra quyền để truy cập vào chức năng hoặc tài nguyên mà đáng lẽ họ không được phép sử dụng. Đây là một cách gọi khá rộng, có thể bao gồm nhiều trường hợp như truy cập URL bị hạn chế, gọi API admin bằng tài khoản thường, sửa token, sửa header hoặc lợi dụng cấu hình kiểm tra quyền sai.
Ví dụ, hệ thống có chức năng quản trị:
‘GET /api/admin/users’
Chức năng này chỉ nên cho phép tài khoản Admin truy cập. Tuy nhiên, nếu một tài khoản Student gửi request đến endpoint này mà hệ thống vẫn trả về danh sách người dùng, tức là cơ chế phân quyền đã bị vượt qua. Đây có thể được xem là lỗi Authorization Bypass.
Lỗi này có thể xuất hiện khi backend kiểm tra quyền không đầy đủ, tin tưởng dữ liệu phía client hoặc cấu hình phân quyền sai. Authorization Bypass có thể dẫn đến truy cập trái phép, leo quyền và thao tác dữ liệu ngoài phạm vi cho phép.
2.3.3.6. Missing Authorization
Missing Authorization là dạng lỗ hổng xảy ra khi một chức năng, API hoặc tài nguyên nhạy cảm không được kiểm tra quyền truy cập. Khác với Authorization Bypass, ở đây vấn đề không phải là cơ chế kiểm tra quyền bị vượt qua, mà là hệ thống gần như không thực hiện kiểm tra quyền tại điểm đó. Nguyên nhân thường là lập trình viên quên cấu hình middleware, filter, annotation hoặc rule phân quyền cho endpoint. Khi đó, người dùng không đủ quyền vẫn có thể truy cập hoặc thực hiện thao tác trái phép, dẫn đến rò rỉ dữ liệu, sửa đổi dữ liệu hoặc sử dụng chức năng quản trị ngoài phạm vi cho phép.
2.3.3.7. Trust header sai
Trust header sai là một dạng lỗi xảy ra khi máy chủ, proxy hoặc ứng dụng tin tưởng không đúng vào các HTTP header do phía client gửi lên để quyết định quyền truy cập, nguồn gốc request hoặc đường dẫn cần xử lý. Trong khi đó, nhiều HTTP header có thể bị kẻ tấn công tự thêm hoặc sửa bằng các công cụ như Postman, Burp Suite hoặc DevTools.
Ví dụ, hệ thống chỉ cho phép truy cập trang quản trị nếu request đến từ mạng nội bộ. Backend kiểm tra IP người gửi thông qua header:
‘X-Forwarded-For: 127.0.0.1’
Nếu kẻ tấn công tự thêm header này vào request:
‘GET /admin/users
X-Forwarded-For: 127.0.0.1’
và hệ thống tin rằng request đến từ máy nội bộ, từ đó cho phép truy cập vào chức năng quản trị, thì đây là lỗi trust header sai.
2.3.4. Các kĩ thuật tấn công phổ biến hiện nay nhằm vượt qua hệ thống kiểm soát truy cập
Các lỗ hổng trong hệ thống kiểm soát truy cập có thể bị khai thác bằng nhiều cách khác nhau. Việc hiểu rõ các phương thức tấn công này là điều cần thiết để có thể ngăn chặn chúng một cách hiệu quả. Các kẻ tấn công liên tục phát triển những phương pháp mới để vượt qua các biện pháp kiểm soát truy cập. Do đó, việc nắm rõ các phương thức tấn công phổ biến là yếu tố quan trọng để đảm bảo an ninh hiệu quả. Dưới đây là một số phương thức tấn công phổ biến nhất liên quan Broken Access Control
2.3.4.1. Parameter Tampering (Thao túng tham số)
Kẻ tấn công có thể can thiệp vào các tham số trong địa chỉ URL hoặc các giá trị trong các trường biểu mẫu, nhằm lừa gạt ứng dụng và giúp chúng có quyền truy cập trái phép vào hệ thống. Ví dụ, một ứng dụng thương mại điện tử có thể sử dụng tham số ID người dùng trong địa chỉ URL để hiển thị nội dung giỏ hàng người dùng này, bằng cách thay đổi tham số này, kẻ tấn công có thể xem nội dung giỏ hàng của người dùng khác. Hoặc có thể sửa đổi trường ẩn trong form/ body/query của API được dùng để phân quyền: sửa role=user thành role=admin hoặc is_admin=false thành true trước khi gửi
2.3.4.2. Tấn công qua mặt URL (URL Bypass/ Forced Browsing)
Kẻ tấn công có thể truy cập trực tiếp vào các đường dẫn URL hoặc endpint API bị hạn chế quyền, thay vì đi theo luồng thao tác thông thường trên giao diện. Kĩ thuật này thường khai thác trường hợp ứng dụng chỉ ẩn chức năng ở phía giao diện nhưng không kiểm tra quyền đầy đủ ở phía mát chủ. Ví dụ, một người dùng thường không được hiển thị nút “Quản lí người dùng” trên trang web, nhưng nếu họ nhập trực tiếp đường dẫn /admin/users hoặc gửi request đến API /api/admin/users, hệ thống vẫn trả về dữ liệu do backend không kiểm tra vai trò người dùng. Khi đó, kẻ tấn công có thể truy cập trái phép vào các chức năng hoặc tài nguyên chỉ dành cho người có quyền cao hơn. 
Ngoài ra, kẻ tấn công cũng có thể thử các biến thể URL như /admin, /admin/, /dashboard/admin, /api/users/export hoặc các enpoint không được liên kết trực tiếp trên giao diện để dò tìm chức năng nhạy cảm. Nếu các URL này không được bảo vệ bằng cơ chế xác thực và phân quyền ở backend, URL Bypass có thể dẫn đến leo quyền theo chiều dọc hoặc truy cập dữ liệu trái phép.
2.3.4.3. Thay đổi phương thức HTTP (HTTP Method Tampering)
Kẻ tấn công có thể thay đổi phương thức HTTP trong request, chẳng hạn như chuyển từ GET sang POST, PUT, PATCH hoặc DELETE, nhằm kiểm tra xem hệ thống có áp dụng kiểm soát truy cập đầy đủ cho tất cả các phương thức hay không. Kĩ thuật này thường khai thác trường hợp backend chỉ kiểm tra quyền đối với một số phương thức nhất định nhưng lại bỏ sót các phương thức khác trên cùng một endpoint.
Ví dụ hệ thống có API /api/users/5. Khi người dùng gửi request GET /api/users/5, hệ thống kiểm tra quyền và chặn truy cập. Tuy nhiên, nếu backend chỉ cấu hình kiểm soát quyền cho phương thức GET mà quên kiểm tra đối với PUT hoặc DELETE, kẻ tấn công có thể gửi request PUT /api/users/5 hoặc DELETE /api/users/5 để sửa hoặc xoá dữ liệu trái phép. Khi đó lỗi BAC xảy ra do cơ chế phân quyền công được áp dụng nhất quán cho tất cả các phương thức HTTP.
Ngoài ra, kẻ tấn công cũng có thể thử các phương thức khác nhau trên cùng một endpoint để dò tìm phương thức bị cấu hình thiếu bảo vệ. Nếu các thao tác nhạy cảm như thêm, sửa, xoá dữ liệu không được kiểm tra quyền ở backend, HTTP Method Tampering có thể dẫn đến truy cập trái phép, thay đổi dữ liệu hoặc leo quyền trong hệ thống
2.3.4.4. Vượt qua kiểm soát truy cập dựa trên Header (Header-based Access Control Bypass)
Kẻ tấn công có thể thêm hoặc sửa đổi các HTTP header trong quá trình request nhằm đánh lừa máy chủ, proxy hoặc ứng dụng rằng yêu cầu đến một nguồn đáng tin cậy hoặc đang truy cập một đường dẫn khác. Kĩ thuật này thường khai thác trường hợp hệ thống tin tưởng quá mức vào các header do client gửi lên, thay vì kiểm tra quyền truy cập chặt chẽ ở backend.
Ví dụ, một hệ thống chỉ cho phép truy cập trang quản trị khi request được xác định là đến từ mạng nội bộ. Nếu hệ thống dựa vào header X-Forwared-For để xác định địa chỉ ip người gửi, kẻ tấn công có thể tự thêm header: X-Forwarded-For: 127.0.0.1. Nếu backend tin tưởng giá trị này mà không kiểm tra đúng nguồn gốc request, hệ thống có thể hiểu nhầm rằng yêu cầu đến từ máy nội bộ và cho phép truy cập trái phép vào chức năng quản trị.
Ngoài ra, kẻ tấn công cũng có thể lợi dụng các header như X-Original-URL, X-Rewrite-URL, X-Forwarded-Host, X-Forwarded-Proto để thử thay đổi cách máy chủ định tuyến và xử lí request. Ví dụ, request ban đầu truy cập một đường dẫn bình thường nhưng kẻ tấn công thêm header X-Original-URL: /admin/users, khiến một số cấu hình proxy hoặc backend xử lý request như đang truy cập endpoint quản trị. Nếu hệ thống không kiểm soát chặt chẽ các header này, Header-based Access Control Bypass có thể dẫn đến truy cập trái phép vào các tài nguyên hoặc chức năng bị hạn chế quyền.
2.3.4.5.  Thao túng phiên làm việc (Session Tampering)
Kẻ tấn công có thể can thiệp vào thông tin phiên đăng nhập hoặc token xác thực nhằm giả mạo danh tính, thay đổi vai trò hoặc nâng quyền truy cập trong hệ thống. Kĩ thuật này thường khai thác trường hợp ứng dụng lưu trữ thông tin phân quyền ở phía client, chẳng hạn trong cookie hoặc JWT, nhưng không kiểm tra tính toàn vẹn và tính hợp lệ của dữ liệu trước khi xử lý request.
Ví dụ, một hệ thống sử dụng JWT để xác thực người dùng và trong payload của token có chứa thông tin vai trò:
{
  "userId": 10,
  "role": "USER"
}
Nếu backend cấu hình JWT không an toàn, chẳng hạn không kiểm tra chữ ký token, sử dụng secret yếu hoặc chấp nhận thuật toán none, kẻ tấn công có thể sửa trường role từ USER thành ADMIN rồi gửi lại request đến các API quản trị. Khi đó, hệ thống có thể hiểu nhầm người dùng thường là quản trị viên và cho phép truy cập trái phép vào các chức năng có quyền cao hơn.
Ngoài JWT, kẻ tấn công cũng có thể thử sửa đổi cookie hoặc session token nếu hệ thống lưu trực tiếp các thông tin nhạy cảm như role=user, is_admin=false ở phía client. Nếu máy chủ tin tưởng các giá trị này mà không xác minh lại với cơ sở dữ liệu hoặc cơ chế ký/mã hóa an toàn, Session Tampering có thể dẫn đến khai thác lỗ hổng Broken Access Control, gây leo quyền theo chiều dọc hoặc truy cập trái phép vào tài nguyên bị hạn chế.
2.3.5. Các hậu quả khi bị tấn công khai thác Broken Access Control
2.3.5.1. Horizontal Privilege Escalation (Nâng cao quyền hạn theo chiều ngang)
Việc nâng cao quyền hạn theo chiều ngang là hình thức lợi dụng các lỗ hổng trong quy trình quản lí phiên làm việc hoặc các biện pháp kiểm tra quyền hạn để giúp kẻ tấn công có được quyền hạn tương đương với người dùng khác. Ví dụ, kẻ tấn công có thể đánh cắp ID phiên làm việc của một người dùng hợp pháp, sau đó sử dụng ID đó để giả mạo người dùng đó và truy cập vào các tài nguyên của họ ( thường xuất phát từ lỗi IDOR)
2.3.5.2. Vertical Privilege Escalation (Nâng cao quyền hạn theo chiều dọc)
Việc nâng cao quyền hạn theo chiều dọc là hành vi lợi dụng các biện pháp kiểm soát quyền truy cập, nhằm có được quyền truy cập vào các tài nguyên hoặc chức năng vốn chỉ dành cho những người dùng có quyền hạn cao hơn. Ví dụ, kẻ tấn công có thể tìm cách vượt qua các biện pháp kiểm soát nhằm truy cập vào các chức năng quản trị mà không được phép.
2.3.6.  Thực nghiệm tấn công Broken Access Control
Trong phạm vi báo cáo này, nhóm thực hiện tấn công lên web “Quản lí trung tâm ngoại ngữ” do nhóm tự xây dựng.
Quy trình thực nghiệm kiểm thử phát hiện lỗ hổng BAC:
Xác định role trong hệ thống (Admin, Manager, User, Guest)
        ↓
Xác định tài nguyên/API cần bảo vệ
        ↓
Lập ma trận quyền Role - Object - Action
        ↓
Thu thập Token/Session ứng với từng Role (Chuẩn bị nguyên liệu)
        ↓
Chọn kỹ thuật kiểm thử BAC (IDOR, Parameter Tampering, URL Bypass,...)
        ↓
Thực hiện gửi request trái quyền (Tráo đổi Token hoặc tham số)
        ↓
Phân tích sâu Response (Kiểm tra HTTP Status, Response Body và DB State)
        ↓
Kết luận có/không có lỗi BAC
