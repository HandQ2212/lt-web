# 📋 ELC System API - Chi Tiết Từng Sections & Endpoints

Format để test từng phần. Ghi lỗi vào `ERROR.md`

---

## 🔐 **Authentication**

### Endpoints:
- POST /api/auth/register - Register new user account
- POST /api/auth/login - User login (✅ Token tự động save)
- POST /api/auth/logout - User logout
- POST /api/auth/refresh - Refresh JWT token (✅ Token tự động save)
- POST /api/auth/forgot-password - Request password reset
- POST /api/auth/reset-password - Reset password with token

**Test Status:**
- [ ] Register
- [ ] Login (✅ Token auto-save)
- [ ] Logout
- [ ] Refresh (✅ Token auto-save)
- [ ] Forgot Password
- [ ] Reset Password

---

## 👤 **User Management**

### Endpoints:
- GET /api/users - Get all users (paginated) [MANAGER only]
- GET /api/users/{id} - Get user by ID [MANAGER only]
- POST /api/users - Create new user [MANAGER only]
- PUT /api/users/{id} - Update user role/status [MANAGER only]
- DELETE /api/users/{id} - Deactivate user (soft delete) [MANAGER only]

**Permission Test:**
- [ ] GET /api/users → TEACHER: 403, MANAGER: 200
- [ ] POST /api/users → TEACHER: 403, MANAGER: 201
- [ ] PUT /api/users/{id} → TEACHER: 403, MANAGER: 200
- [ ] DELETE /api/users/{id} → TEACHER: 403, MANAGER: 200

---

## 👤 **Profile**

### Endpoints:
- GET /api/profile - Get current user profile [Auth required]
- PUT /api/profile - Update current user profile [Auth required]
- PUT /api/profile/password - Change password [Auth required]

**Test Status:**
- [ ] GET /api/profile - Should work for all roles
- [ ] PUT /api/profile - Update profile
- [ ] PUT /api/profile/password - Change password

---

## 🏫 **Class Management**

### Endpoints:
- GET /api/classes - Get all classes [Public]
- GET /api/classes/{id} - Get class by ID [Public]
- POST /api/classes - Create new class [Auth required]
- PUT /api/classes/{id} - Update class [Auth required]
- DELETE /api/classes/{id} - Delete class [Auth required]
- PATCH /api/classes/{id}/status - Update class status [Auth required]
- GET /api/classes/{id}/schedule - Get class schedules [Public]
- POST /api/classes/{id}/schedule - Add schedule to class [Auth required]
- POST /api/classes/check-conflict - Check schedule conflict [Public]

**Permission Test:**
- [ ] POST /api/classes → TEACHER: ?, MANAGER: 201
- [ ] PUT /api/classes/{id} → TEACHER: ?, MANAGER: 200
- [ ] DELETE /api/classes/{id} → TEACHER: ?, MANAGER: 200
- [ ] PATCH /api/classes/{id}/status → TEACHER: ?, MANAGER: 200

---

## 📚 **Course Management**

### Endpoints:
- GET /api/courses - Get all courses [Public]
- GET /api/courses/{id} - Get course by ID [Public]
- POST /api/courses - Create course [MANAGER only]
- PUT /api/courses/{id} - Update course [MANAGER only]
- DELETE /api/courses/{id} - Delete course [MANAGER only]

**Permission Test:**
- [ ] POST /api/courses → TEACHER: 403, MANAGER: 201
- [ ] PUT /api/courses/{id} → TEACHER: 403, MANAGER: 200
- [ ] DELETE /api/courses/{id} → TEACHER: 403, MANAGER: 200

---

## 📝 **Enrollment**

### Endpoints:
- GET /api/enrollments/class/{classId} - Get enrollments by class [Public]
- GET /api/enrollments/student/{studentId} - Get enrollments by student [Public]
- POST /api/enrollments - Enroll student to class [Auth required]
- PATCH /api/enrollments/{id}/status - Update enrollment status [Auth required]

**Test Status:**
- [ ] POST /api/enrollments - Create enrollment
- [ ] PATCH /api/enrollments/{id}/status - Update enrollment status

---

## ✅ **Attendance**

### Endpoints:
- GET /api/attendance/{classId} - Get class attendance by date [Public]
- POST /api/attendance - Mark attendance [Auth required]
- GET /api/attendance/report/monthly - Get monthly attendance report [Public]

**Permission Test:**
- [ ] POST /api/attendance → TEACHER: 201, STUDENT: ?
- [ ] GET /api/attendance/{classId} → All roles: 200

---

## 📋 **Assignment**

### Endpoints:
- GET /api/assignments/class/{classId} - Get assignments by class [Public]
- POST /api/assignments - Create assignment [TEACHER/MANAGER]

**Permission Test:**
- [ ] POST /api/assignments → TEACHER: 201, STUDENT: 403, MANAGER: 201

---

## 💰 **Finance - Invoice**

### Endpoints:
- GET /api/invoices - Get all invoices [Public]
- POST /api/invoices - Create invoice [MANAGER/ACCOUNTANT]
- PATCH /api/invoices/{id}/status - Update invoice status [MANAGER/ACCOUNTANT]
- GET /api/invoices/debt - Get debt invoices [Public]
- POST /api/invoices/{id}/refund - Process refund [MANAGER/ACCOUNTANT]

**Permission Test:**
- [ ] POST /api/invoices → TEACHER: 403, MANAGER: 201, ACCOUNTANT: 201
- [ ] PATCH /api/invoices/{id}/status → TEACHER: 403, ACCOUNTANT: 200

---

## 🎁 **Finance - Promotion**

### Endpoints:
- GET /api/promotions - Get all promotions [Public]

**Test Status:**
- [ ] GET /api/promotions - Should work for all

---

## 💳 **Finance - Transaction**

### Endpoints:
- GET /api/transactions - Get transactions [Auth required]

**Test Status:**
- [ ] GET /api/transactions - Should work for all authenticated users

---

## 📢 **Announcement**

### Endpoints:
- POST /api/announcements - Create announcement [MANAGER/TEACHER/ACCOUNTANT]
- GET /api/announcements - Get active announcements [Public]

**Permission Test:**
- [ ] POST /api/announcements → STUDENT: 403, TEACHER: 201, MANAGER: 201
- [ ] GET /api/announcements → All: 200

---

## 🔔 **Notification**

### Endpoints:
- GET /api/notifications - Get user notifications [Auth required]
- GET /api/notifications/unread-count - Get unread notification count [Auth required]
- PUT /api/notifications/{id}/read - Mark notification as read [Auth required]
- PATCH /api/notifications/read-all - Mark all notifications as read [Auth required]

**Test Status:**
- [ ] GET /api/notifications - Should work for all authenticated
- [ ] PUT /api/notifications/{id}/read - Mark as read
- [ ] PATCH /api/notifications/read-all - Mark all as read

---

## 📊 **Analytics**

### Endpoints:
- GET /api/analytics/branch-performance - Get branch performance stats [Public]
- GET /api/analytics/revenue - Get revenue report [Public]
- GET /api/analytics/academic - Get academic analytics [Public]
- GET /api/analytics/dashboard - Get dashboard overview [Public]

**Test Status:**
- [ ] GET /api/analytics/branch-performance - 200
- [ ] GET /api/analytics/revenue - 200
- [ ] GET /api/analytics/academic - 200
- [ ] GET /api/analytics/dashboard - 200

---

## 📄 **Report**

### Endpoints:
- GET /api/reports - Get reports [Auth required]

**Test Status:**
- [ ] GET /api/reports - Should work for authenticated users

---

## 💼 **Lead**

### Endpoints:
- POST /api/leads - Create lead [Public]
- GET /api/leads - Get leads (with filters) [MANAGER only]
- PUT /api/leads/{id}/status - Update lead status [MANAGER only]

**Permission Test:**
- [ ] POST /api/leads → All: 201 (public)
- [ ] GET /api/leads → TEACHER: 403, MANAGER: 200

---

## 🏆 **Course Result**

### Endpoints:
- GET /api/course-results - Get course results [Auth required]

**Test Status:**
- [ ] GET /api/course-results - Should work for authenticated

---

## 📤 **Submission**

### Endpoints:
- POST /api/submissions - Submit assignment [STUDENT]

**Permission Test:**
- [ ] POST /api/submissions → STUDENT: 201, TEACHER: 403

---

## 💬 **Consultation**

### Endpoints:
- GET /api/consultations - Get consultations [Auth required]

**Test Status:**
- [ ] GET /api/consultations - Should work for authenticated

---

## 🏢 **Room**

### Endpoints:
- GET /api/rooms - Get rooms [Public]

**Test Status:**
- [ ] GET /api/rooms - 200 for all

---

## 📊 **Level**

### Endpoints:
- GET /api/levels - Get all levels [Public]

**Test Status:**
- [ ] GET /api/levels - 200 for all

---

## 🏛️ **Branch**

### Endpoints:
- GET /api/branches - Get all branches [Public]

**Test Status:**
- [ ] GET /api/branches - 200 for all

---

## 🧪 Test Checklist

### Trang Thái Test Overall:
- [ ] Authentication (6 endpoints)
- [ ] User Management (5 endpoints)
- [ ] Profile (3 endpoints)
- [ ] Class Management (9 endpoints)
- [ ] Course Management (5 endpoints)
- [ ] Enrollment (4 endpoints)
- [ ] Attendance (3 endpoints)
- [ ] Assignment (2 endpoints)
- [ ] Finance - Invoice (5 endpoints)
- [ ] Finance - Promotion (1 endpoint)
- [ ] Finance - Transaction (1 endpoint)
- [ ] Announcement (2 endpoints)
- [ ] Notification (4 endpoints)
- [ ] Analytics (4 endpoints)
- [ ] Report (1 endpoint)
- [ ] Lead (3 endpoints)
- [ ] Course Result (1 endpoint)
- [ ] Submission (1 endpoint)
- [ ] Consultation (1 endpoint)
- [ ] Room (1 endpoint)
- [ ] Level (1 endpoint)
- [ ] Branch (1 endpoint)

**Total: 70 Endpoints**

---

**Ghi lỗi từ test vào: `ERROR.md`**
