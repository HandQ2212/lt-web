# Postman Environment Files - ELC System API

Tập tin cấu hình environment cho Postman để test API ELC System với các role khác nhau.

## 📂 Tệp Files

- **TEACHER-env.json** - Environment cho role TEACHER
- **MANAGER-env.json** - Environment cho role MANAGER  
- **STUDENT-env.json** - Environment cho role STUDENT
- **ACCOUNTANT-env.json** - Environment cho role ACCOUNTANT

## 🚀 Cách Sử Dụng

### Step 1: Import Environment vào Postman

1. Mở **Postman**
2. Click **Environments** (bên trái)
3. Click **Import** (góc phải)
4. Chọn file environment (VD: `TEACHER-env.json`)
5. Repeat cho các role khác

### Step 2: Chọn Environment khi Test

1. Click dropdown **Environment** (góc phải atas)
2. Chọn role muốn test (VD: `TEACHER Environment`)
3. Tất cả variables sẽ tự động load

### Step 3: Login & Lấy Token

1. Đi tới **Authentication > Login** request
2. Dùng email/password từ environment:
   - **TEACHER**: `teacher@elc.edu.vn` / `TeacherPassword123`
   - **MANAGER**: `manager@elc.edu.vn` / `ManagerPassword123`
   - **STUDENT**: `student@elc.edu.vn` / `StudentPassword123`
   - **ACCOUNTANT**: `accountant@elc.edu.vn` / `AccountantPassword123`

3. Copy **accessToken** từ response
4. Paste vào environment variable: `accessToken`

### Step 4: Test APIs theo Role

Sau khi login, bạn có thể:
- Test các API cho role đó
- Cột `Auth` sẽ tự động lấy token từ environment
- Nếu API không cho phép role này → sẽ thấy **403 Forbidden**

## 📋 Variables trong mỗi Environment

| Variable | Mô Tả | Default |
|----------|-------|---------|
| `baseUrl` | URL backend | `http://localhost:8080` |
| `role` | Role người dùng | TEACHER/MANAGER/STUDENT/ACCOUNTANT |
| `accessToken` | JWT token (cần update sau login) | (trống) |
| `refreshToken` | Refresh token (cần update sau login) | (trống) |
| `email` | Email tài khoản | role@elc.edu.vn |
| `password` | Password (chỉ dùng lần đầu) | Role Password123 |
| `userId` | ID người dùng (update sau login) | placeholder |
| `classId` | ID class để test | placeholder |
| `courseId` | ID course để test | placeholder |
| `studentId` | ID student để test | placeholder |
| ... | ... | ... |

## 🔑 Cách Lấy Token từ Login Response

Login request có script tự động:

```javascript
// Tests tab của Login request
if (pm.response.code === 200) {
    let responseData = pm.response.json();
    pm.environment.set("accessToken", responseData.accessToken);
    pm.environment.set("refreshToken", responseData.refreshToken);
    pm.environment.set("userId", responseData.user.id);
}
```

Sau khi Login thành công → token tự động được save vào environment ✅

## 🛡️ Permissions Reference

### TEACHER
- ✅ Get classes, courses, enrollments
- ✅ Create & grade assignments
- ✅ Create announcements
- ✅ Mark attendance
- ❌ Manage users, create courses, manage finances

### MANAGER
- ✅ Tất cả admin permissions
- ✅ Create users, courses, classes
- ✅ Manage enrollments, invoices
- ✅ View analytics & reports
- ✅ Manage leads

### STUDENT
- ✅ View profile
- ✅ View enrolled classes
- ✅ Submit assignments
- ✅ View notifications
- ✅ View announcements
- ❌ Create/manage anything

### ACCOUNTANT
- ✅ Create announcements
- ✅ Manage invoices & transactions
- ✅ View reports & analytics
- ✅ View branch performance
- ❌ Manage users, classes (unless MANAGER too)

## 🧪 Test Tips

1. **Test Permission Denied**: Test request yang không allow cho role
   - Kỳ vọng: 403 Forbidden

2. **Test Unauthorized**: Remove token từ request
   - Kỳ vọng: 401 Unauthorized

3. **Batch Test**: Test multiple endpoints cùng role
   - Switch environment → run Collection

4. **Compare Results**: Test API với 2 role khác nhau
   - Xem kết quả khác như thế nào

## 📝 Setup Checklist

- [ ] Import 4 environment files
- [ ] Kiểm tra credentials khớp với backend
- [ ] Login lần đầu từng role
- [ ] Copy token vào environment
- [ ] Test 1 API từng role
- [ ] Verify permission errors (403)

## ❓ Troubleshooting

**Q: Token không update tự động**
- A: Kiểm tra Tests tab của Login request có script không. Thêm vào nếu không có.

**Q: 401 Unauthorized mặc dù có token**
- A: Token hết hạn. Login lại hoặc dùng refresh token endpoint.

**Q: 403 Forbidden cho endpoint nên có quyền**
- A: Kiểm tra backend authorize logic. Role có thể khác tên.

**Q: Email/password sai**
- A: Kiểm tra backend có user test này không. Có thể cần tạo user test.

---

**Last Updated**: 2026-05-05
**Collection Version**: v2.1
