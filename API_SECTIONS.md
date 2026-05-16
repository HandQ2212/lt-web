# 📋 ELC System API - Chi Tiết Từng Sections & Endpoints

Format chi tiết: từng API + role + status code

---

## 🔐 **Authentication**

### 1. POST /api/auth/register
**Description:** Register new user account
**Auth Required:** ❌ No
**Body Required:** email, password, fullName, phoneNumber, role

| Role | Status Expected | Response |
|------|---|---|
| Any | 200/201 | User created, accessToken, refreshToken |

**Test Status:** [ ]

---

### 2. POST /api/auth/login ✅ (Token Auto-save)
**Description:** User login
**Auth Required:** ❌ No
**Body Required:** email, password

| Role | Status Expected | Response |
|------|---|---|
| TEACHER | 200 | accessToken, refreshToken, user info |
| MANAGER | 200 | accessToken, refreshToken, user info |
| STUDENT | 200 | accessToken, refreshToken, user info |
| ACCOUNTANT | 200 | accessToken, refreshToken, user info |

**Test Status:** [ ] TEACHER [ ] MANAGER [ ] STUDENT [ ] ACCOUNTANT

---

### 3. POST /api/auth/logout
**Description:** User logout
**Auth Required:** ✅ Yes (Bearer token)
**Body Required:** refreshToken

| Role | Status Expected | Response |
|------|---|---|
| TEACHER | 200 | Success |
| MANAGER | 200 | Success |
| STUDENT | 200 | Success |
| ACCOUNTANT | 200 | Success |

**Test Status:** [ ] All roles

---

### 4. POST /api/auth/refresh ✅ (Token Auto-save)
**Description:** Refresh JWT token
**Auth Required:** ✅ Yes (Bearer token)
**Body Required:** refreshToken

| Role | Status Expected | Response |
|------|---|---|
| Any | 200 | New accessToken, refreshToken |

**Test Status:** [ ]

---

### 5. POST /api/auth/forgot-password
**Description:** Request password reset
**Auth Required:** ❌ No
**Body Required:** email

| Role | Status Expected | Response |
|------|---|---|
| Any | 200 | Reset token sent |

**Test Status:** [ ]

---

### 6. POST /api/auth/reset-password
**Description:** Reset password with token
**Auth Required:** ❌ No
**Body Required:** token, newPassword

| Role | Status Expected | Response |
|------|---|---|
| Any | 200 | Password reset success |

**Test Status:** [ ]

---

## 👤 **User Management**

### 1. GET /api/users
**Description:** Get all users (paginated)
**Auth Required:** ✅ Yes (Bearer token)
**Query Params:** page (default: 0), size (default: 20)

| Role | Status Expected | Response |
|------|---|---|
| TEACHER | 403 | Forbidden - insufficient permissions |
| MANAGER | 200 | List of users, pagination info |
| STUDENT | 403 | Forbidden - insufficient permissions |
| ACCOUNTANT | 403 | Forbidden - insufficient permissions |

**Test Status:** [ ] TEACHER [ ] MANAGER [ ] STUDENT [ ] ACCOUNTANT

---

### 2. GET /api/users/{id}
**Description:** Get user by ID
**Auth Required:** ✅ Yes (Bearer token)
**Path Params:** id (UUID)

| Role | Status Expected | Response |
|------|---|---|
| TEACHER | 403 | Forbidden |
| MANAGER | 200 | User details |
| STUDENT | 403 | Forbidden |
| ACCOUNTANT | 403 | Forbidden |

**Test Status:** [ ] TEACHER [ ] MANAGER [ ] STUDENT [ ] ACCOUNTANT

---

### 3. POST /api/users
**Description:** Create new user
**Auth Required:** ✅ Yes (Bearer token)
**Body Required:** email, password, fullName, phoneNumber, role

| Role | Status Expected | Response |
|------|---|---|
| TEACHER | 403 | Forbidden - cannot create users |
| MANAGER | 201 | User created, user details |
| STUDENT | 403 | Forbidden - cannot create users |
| ACCOUNTANT | 403 | Forbidden - cannot create users |

**Test Status:** [ ] TEACHER [ ] MANAGER [ ] STUDENT [ ] ACCOUNTANT

---

### 4. PUT /api/users/{id}
**Description:** Update user role/status
**Auth Required:** ✅ Yes (Bearer token)
**Path Params:** id (UUID)
**Body Required:** role, status

| Role | Status Expected | Response |
|------|---|---|
| TEACHER | 403 | Forbidden |
| MANAGER | 200 | User updated |
| STUDENT | 403 | Forbidden |
| ACCOUNTANT | 403 | Forbidden |

**Test Status:** [ ] TEACHER [ ] MANAGER [ ] STUDENT [ ] ACCOUNTANT

---

### 5. DELETE /api/users/{id}
**Description:** Deactivate user (soft delete)
**Auth Required:** ✅ Yes (Bearer token)
**Path Params:** id (UUID)

| Role | Status Expected | Response |
|------|---|---|
| TEACHER | 403 | Forbidden |
| MANAGER | 200 | User deactivated |
| STUDENT | 403 | Forbidden |
| ACCOUNTANT | 403 | Forbidden |

**Test Status:** [ ] TEACHER [ ] MANAGER [ ] STUDENT [ ] ACCOUNTANT

---

## 👤 **Profile**

### 1. GET /api/profile
**Description:** Get current user profile
**Auth Required:** ✅ Yes (Bearer token)

| Role | Status Expected | Response |
|------|---|---|
| TEACHER | 200 | Profile data |
| MANAGER | 200 | Profile data |
| STUDENT | 200 | Profile data |
| ACCOUNTANT | 200 | Profile data |

**Test Status:** [ ] All roles

---

### 2. PUT /api/profile
**Description:** Update current user profile
**Auth Required:** ✅ Yes (Bearer token)
**Body Required:** fullName, phoneNumber, avatar

| Role | Status Expected | Response |
|------|---|---|
| TEACHER | 200 | Profile updated |
| MANAGER | 200 | Profile updated |
| STUDENT | 200 | Profile updated |
| ACCOUNTANT | 200 | Profile updated |

**Test Status:** [ ] All roles

---

### 3. PUT /api/profile/password
**Description:** Change password
**Auth Required:** ✅ Yes (Bearer token)
**Body Required:** oldPassword, newPassword

| Role | Status Expected | Response |
|------|---|---|
| TEACHER | 200 | Password changed |
| MANAGER | 200 | Password changed |
| STUDENT | 200 | Password changed |
| ACCOUNTANT | 200 | Password changed |

**Test Status:** [ ] All roles

---

## 🏫 **Class Management**

### 1. GET /api/classes
**Description:** Get all classes
**Auth Required:** ❌ No (Public)

| Role | Status Expected | Response |
|------|---|---|
| Any | 200 | List of classes |

**Test Status:** [ ]

---

### 2. GET /api/classes/{id}
**Description:** Get class by ID
**Auth Required:** ❌ No (Public)
**Path Params:** id (UUID)

| Role | Status Expected | Response |
|------|---|---|
| Any | 200 | Class details |

**Test Status:** [ ]

---

### 3. POST /api/classes
**Description:** Create new class
**Auth Required:** ✅ Yes (Bearer token)
**Body Required:** name, courseId, capacity, startDate, endDate, description

| Role | Status Expected | Response |
|------|---|---|
| TEACHER | 201 | Class created |
| MANAGER | 201 | Class created |
| STUDENT | 403 | Forbidden |
| ACCOUNTANT | 403 | Forbidden |

**Test Status:** [ ] TEACHER [ ] MANAGER [ ] STUDENT [ ] ACCOUNTANT

---

### 4. PUT /api/classes/{id}
**Description:** Update class
**Auth Required:** ✅ Yes (Bearer token)
**Path Params:** id (UUID)
**Body Required:** name, capacity, description

| Role | Status Expected | Response |
|------|---|---|
| TEACHER | 200 | Class updated |
| MANAGER | 200 | Class updated |
| STUDENT | 403 | Forbidden |
| ACCOUNTANT | 403 | Forbidden |

**Test Status:** [ ] TEACHER [ ] MANAGER [ ] STUDENT [ ] ACCOUNTANT

---

### 5. DELETE /api/classes/{id}
**Description:** Delete class
**Auth Required:** ✅ Yes (Bearer token)
**Path Params:** id (UUID)

| Role | Status Expected | Response |
|------|---|---|
| TEACHER | 200 | Class deleted |
| MANAGER | 200 | Class deleted |
| STUDENT | 403 | Forbidden |
| ACCOUNTANT | 403 | Forbidden |

**Test Status:** [ ] TEACHER [ ] MANAGER [ ] STUDENT [ ] ACCOUNTANT

---

### 6. PATCH /api/classes/{id}/status
**Description:** Update class status
**Auth Required:** ✅ Yes (Bearer token)
**Path Params:** id (UUID)
**Query Params:** status (ClassStatus enum)

| Role | Status Expected | Response |
|------|---|---|
| TEACHER | 200 | Status updated |
| MANAGER | 200 | Status updated |
| STUDENT | 403 | Forbidden |
| ACCOUNTANT | 403 | Forbidden |

**Test Status:** [ ] TEACHER [ ] MANAGER [ ] STUDENT [ ] ACCOUNTANT

---

### 7. GET /api/classes/{id}/schedule
**Description:** Get class schedules
**Auth Required:** ❌ No (Public)
**Path Params:** id (UUID)

| Role | Status Expected | Response |
|------|---|---|
| Any | 200 | List of schedules |

**Test Status:** [ ]

---

### 8. POST /api/classes/{id}/schedule
**Description:** Add schedule to class
**Auth Required:** ✅ Yes (Bearer token)
**Path Params:** id (UUID)
**Body Required:** dayOfWeek, startTime, endTime, roomId

| Role | Status Expected | Response |
|------|---|---|
| TEACHER | 201 | Schedule added |
| MANAGER | 201 | Schedule added |
| STUDENT | 403 | Forbidden |
| ACCOUNTANT | 403 | Forbidden |

**Test Status:** [ ] TEACHER [ ] MANAGER [ ] STUDENT [ ] ACCOUNTANT

---

### 9. POST /api/classes/check-conflict
**Description:** Check schedule conflict
**Auth Required:** ❌ No (Public)
**Body Required:** roomId, dayOfWeek, startTime, endTime

| Role | Status Expected | Response |
|------|---|---|
| Any | 200 | { hasConflict: boolean } |

**Test Status:** [ ]

---

## 📚 **Course Management**

### 1. GET /api/courses
**Description:** Get all courses
**Auth Required:** ❌ No (Public)

| Role | Status Expected | Response |
|------|---|---|
| Any | 200 | List of courses |

**Test Status:** [ ]

---

### 2. GET /api/courses/{id}
**Description:** Get course by ID
**Auth Required:** ❌ No (Public)
**Path Params:** id (UUID)

| Role | Status Expected | Response |
|------|---|---|
| Any | 200 | Course details |

**Test Status:** [ ]

---

### 3. POST /api/courses
**Description:** Create course
**Auth Required:** ✅ Yes (Bearer token)
**Body Required:** code, name, description, levelId

| Role | Status Expected | Response |
|------|---|---|
| TEACHER | 403 | Forbidden - MANAGER only |
| MANAGER | 201 | Course created |
| STUDENT | 403 | Forbidden - MANAGER only |
| ACCOUNTANT | 403 | Forbidden - MANAGER only |

**Test Status:** [ ] TEACHER [ ] MANAGER [ ] STUDENT [ ] ACCOUNTANT

---

### 4. PUT /api/courses/{id}
**Description:** Update course
**Auth Required:** ✅ Yes (Bearer token)
**Path Params:** id (UUID)
**Body Required:** name, description

| Role | Status Expected | Response |
|------|---|---|
| TEACHER | 403 | Forbidden - MANAGER only |
| MANAGER | 200 | Course updated |
| STUDENT | 403 | Forbidden - MANAGER only |
| ACCOUNTANT | 403 | Forbidden - MANAGER only |

**Test Status:** [ ] TEACHER [ ] MANAGER [ ] STUDENT [ ] ACCOUNTANT

---

### 5. DELETE /api/courses/{id}
**Description:** Delete course
**Auth Required:** ✅ Yes (Bearer token)
**Path Params:** id (UUID)

| Role | Status Expected | Response |
|------|---|---|
| TEACHER | 403 | Forbidden - MANAGER only |
| MANAGER | 200 | Course deleted |
| STUDENT | 403 | Forbidden - MANAGER only |
| ACCOUNTANT | 403 | Forbidden - MANAGER only |

**Test Status:** [ ] TEACHER [ ] MANAGER [ ] STUDENT [ ] ACCOUNTANT

---

## 📝 **Enrollment**

### 1. GET /api/enrollments/class/{classId}
**Description:** Get enrollments by class
**Auth Required:** ❌ No (Public)
**Path Params:** classId (UUID)

| Role | Status Expected | Response |
|------|---|---|
| Any | 200 | List of enrollments |

**Test Status:** [ ]

---

### 2. GET /api/enrollments/student/{studentId}
**Description:** Get enrollments by student
**Auth Required:** ❌ No (Public)
**Path Params:** studentId (UUID)

| Role | Status Expected | Response |
|------|---|---|
| Any | 200 | List of enrollments |

**Test Status:** [ ]

---

### 3. POST /api/enrollments
**Description:** Enroll student to class
**Auth Required:** ✅ Yes (Bearer token)
**Body Required:** studentId, classId

| Role | Status Expected | Response |
|------|---|---|
| TEACHER | 201 | Enrollment created |
| MANAGER | 201 | Enrollment created |
| STUDENT | 403 | Forbidden |
| ACCOUNTANT | 403 | Forbidden |

**Test Status:** [ ] TEACHER [ ] MANAGER [ ] STUDENT [ ] ACCOUNTANT

---

### 4. PATCH /api/enrollments/{id}/status
**Description:** Update enrollment status
**Auth Required:** ✅ Yes (Bearer token)
**Path Params:** id (UUID)
**Query Params:** status (EnrollmentStatus enum)

| Role | Status Expected | Response |
|------|---|---|
| TEACHER | 200 | Status updated |
| MANAGER | 200 | Status updated |
| STUDENT | 403 | Forbidden |
| ACCOUNTANT | 403 | Forbidden |

**Test Status:** [ ] TEACHER [ ] MANAGER [ ] STUDENT [ ] ACCOUNTANT

---

## ✅ **Attendance**

### 1. GET /api/attendance/{classId}
**Description:** Get class attendance by date
**Auth Required:** ❌ No (Public)
**Path Params:** classId (UUID)
**Query Params:** date (YYYY-MM-DD)

| Role | Status Expected | Response |
|------|---|---|
| Any | 200 | List of attendance records |

**Test Status:** [ ]

---

### 2. POST /api/attendance
**Description:** Mark attendance
**Auth Required:** ✅ Yes (Bearer token)
**Body Required:** classId, studentId, date, status

| Role | Status Expected | Response |
|------|---|---|
| TEACHER | 201 | Attendance marked |
| MANAGER | 201 | Attendance marked |
| STUDENT | 403 | Forbidden |
| ACCOUNTANT | 403 | Forbidden |

**Test Status:** [ ] TEACHER [ ] MANAGER [ ] STUDENT [ ] ACCOUNTANT

---

### 3. GET /api/attendance/report/monthly
**Description:** Get monthly attendance report
**Auth Required:** ❌ No (Public)
**Query Params:** studentId (UUID), classId (UUID), year (optional), month (optional)

| Role | Status Expected | Response |
|------|---|---|
| Any | 200 | Monthly attendance report |

**Test Status:** [ ]

---

## 📋 **Assignment**

### 1. GET /api/assignments/class/{classId}
**Description:** Get assignments by class
**Auth Required:** ❌ No (Public)
**Path Params:** classId (UUID)

| Role | Status Expected | Response |
|------|---|---|
| Any | 200 | List of assignments |

**Test Status:** [ ]

---

### 2. POST /api/assignments
**Description:** Create assignment
**Auth Required:** ✅ Yes (Bearer token)
**Body Required:** classId, title, description, dueDate, maxScore

| Role | Status Expected | Response |
|------|---|---|
| TEACHER | 201 | Assignment created |
| MANAGER | 201 | Assignment created |
| STUDENT | 403 | Forbidden |
| ACCOUNTANT | 403 | Forbidden |

**Test Status:** [ ] TEACHER [ ] MANAGER [ ] STUDENT [ ] ACCOUNTANT

---

## 💰 **Finance - Invoice**

### 1. GET /api/invoices
**Description:** Get all invoices
**Auth Required:** ❌ No (Public)

| Role | Status Expected | Response |
|------|---|---|
| Any | 200 | List of invoices |

**Test Status:** [ ]

---

### 2. POST /api/invoices
**Description:** Create invoice
**Auth Required:** ✅ Yes (Bearer token)
**Body Required:** studentId, amount, description, dueDate

| Role | Status Expected | Response |
|------|---|---|
| TEACHER | 403 | Forbidden |
| MANAGER | 201 | Invoice created |
| STUDENT | 403 | Forbidden |
| ACCOUNTANT | 201 | Invoice created |

**Test Status:** [ ] TEACHER [ ] MANAGER [ ] STUDENT [ ] ACCOUNTANT

---

### 3. PATCH /api/invoices/{id}/status
**Description:** Update invoice status
**Auth Required:** ✅ Yes (Bearer token)
**Path Params:** id (UUID)
**Query Params:** status (InvoiceStatus enum)

| Role | Status Expected | Response |
|------|---|---|
| TEACHER | 403 | Forbidden |
| MANAGER | 200 | Status updated |
| STUDENT | 403 | Forbidden |
| ACCOUNTANT | 200 | Status updated |

**Test Status:** [ ] TEACHER [ ] MANAGER [ ] STUDENT [ ] ACCOUNTANT

---

### 4. GET /api/invoices/debt
**Description:** Get debt invoices
**Auth Required:** ❌ No (Public)

| Role | Status Expected | Response |
|------|---|---|
| Any | 200 | List of debt invoices |

**Test Status:** [ ]

---

### 5. POST /api/invoices/{id}/refund
**Description:** Process refund
**Auth Required:** ✅ Yes (Bearer token)
**Path Params:** id (UUID)
**Body Required:** refundAmount, reason

| Role | Status Expected | Response |
|------|---|---|
| TEACHER | 403 | Forbidden |
| MANAGER | 200 | Refund processed |
| STUDENT | 403 | Forbidden |
| ACCOUNTANT | 200 | Refund processed |

**Test Status:** [ ] TEACHER [ ] MANAGER [ ] STUDENT [ ] ACCOUNTANT

---

## 🎁 **Finance - Promotion**

### 1. GET /api/promotions
**Description:** Get all promotions
**Auth Required:** ❌ No (Public)

| Role | Status Expected | Response |
|------|---|---|
| Any | 200 | List of promotions |

**Test Status:** [ ]

---

## 💳 **Finance - Transaction**

### 1. GET /api/transactions
**Description:** Get transactions
**Auth Required:** ✅ Yes (Bearer token)

| Role | Status Expected | Response |
|------|---|---|
| TEACHER | 200 | List of transactions |
| MANAGER | 200 | List of transactions |
| STUDENT | 200 | List of transactions |
| ACCOUNTANT | 200 | List of transactions |

**Test Status:** [ ] All roles

---

## 📢 **Announcement**

### 1. POST /api/announcements
**Description:** Create announcement
**Auth Required:** ✅ Yes (Bearer token)
**Body Required:** title, content, priority

| Role | Status Expected | Response |
|------|---|---|
| TEACHER | 201 | Announcement created |
| MANAGER | 201 | Announcement created |
| STUDENT | 403 | Forbidden |
| ACCOUNTANT | 201 | Announcement created |

**Test Status:** [ ] TEACHER [ ] MANAGER [ ] STUDENT [ ] ACCOUNTANT

---

### 2. GET /api/announcements
**Description:** Get active announcements
**Auth Required:** ❌ No (Public)
**Query Params:** page (default: 0), size (default: 20)

| Role | Status Expected | Response |
|------|---|---|
| Any | 200 | List of announcements |

**Test Status:** [ ]

---

### 3. DELETE /api/announcements/{id}
**Description:** Delete an announcement and its delivered notifications
**Auth Required:** ✅ Yes (Bearer token)
**Path Params:** id

| Role | Status Expected | Response |
|------|---|---|
| MANAGER | 204 | Announcement deleted |
| TEACHER | 204/403 | Own announcement deleted or forbidden |
| ACCOUNTANT | 204/403 | Own announcement deleted or forbidden |
| STUDENT | 403 | Forbidden |

**Test Status:** [ ] TEACHER [ ] MANAGER [ ] STUDENT [ ] ACCOUNTANT

---

## 🔔 **Notification**

### 1. GET /api/notifications
**Description:** Get user notifications
**Auth Required:** ✅ Yes (Bearer token)
**Query Params:** page (default: 0), size (default: 20)

| Role | Status Expected | Response |
|------|---|---|
| TEACHER | 200 | List of notifications |
| MANAGER | 200 | List of notifications |
| STUDENT | 200 | List of notifications |
| ACCOUNTANT | 200 | List of notifications |

**Test Status:** [ ] All roles

---

### 2. GET /api/notifications/unread-count
**Description:** Get unread notification count
**Auth Required:** ✅ Yes (Bearer token)

| Role | Status Expected | Response |
|------|---|---|
| TEACHER | 200 | { unreadCount: number } |
| MANAGER | 200 | { unreadCount: number } |
| STUDENT | 200 | { unreadCount: number } |
| ACCOUNTANT | 200 | { unreadCount: number } |

**Test Status:** [ ] All roles

---

### 3. PUT /api/notifications/{id}/read
**Description:** Mark notification as read
**Auth Required:** ✅ Yes (Bearer token)
**Path Params:** id (UUID)

| Role | Status Expected | Response |
|------|---|---|
| TEACHER | 200 | Notification marked as read |
| MANAGER | 200 | Notification marked as read |
| STUDENT | 200 | Notification marked as read |
| ACCOUNTANT | 200 | Notification marked as read |

**Test Status:** [ ] All roles

---

### 4. PATCH /api/notifications/read-all
**Description:** Mark all notifications as read
**Auth Required:** ✅ Yes (Bearer token)

| Role | Status Expected | Response |
|------|---|---|
| TEACHER | 200 | All marked as read |
| MANAGER | 200 | All marked as read |
| STUDENT | 200 | All marked as read |
| ACCOUNTANT | 200 | All marked as read |

**Test Status:** [ ] All roles

---

## 📊 **Analytics**

### 1. GET /api/analytics/branch-performance
**Description:** Get branch performance stats
**Auth Required:** ❌ No (Public)

| Role | Status Expected | Response |
|------|---|---|
| Any | 200 | Branch performance data |

**Test Status:** [ ]

---

### 2. GET /api/analytics/revenue
**Description:** Get revenue report
**Auth Required:** ❌ No (Public)

| Role | Status Expected | Response |
|------|---|---|
| Any | 200 | Revenue data |

**Test Status:** [ ]

---

### 3. GET /api/analytics/academic
**Description:** Get academic analytics
**Auth Required:** ❌ No (Public)

| Role | Status Expected | Response |
|------|---|---|
| Any | 200 | Academic data |

**Test Status:** [ ]

---

### 4. GET /api/analytics/dashboard
**Description:** Get dashboard overview
**Auth Required:** ❌ No (Public)

| Role | Status Expected | Response |
|------|---|---|
| Any | 200 | Dashboard data |

**Test Status:** [ ]

---

## 📄 **Report**

### 1. GET /api/reports
**Description:** Get reports
**Auth Required:** ✅ Yes (Bearer token)

| Role | Status Expected | Response |
|------|---|---|
| TEACHER | 200 | List of reports |
| MANAGER | 200 | List of reports |
| STUDENT | 200 | List of reports |
| ACCOUNTANT | 200 | List of reports |

**Test Status:** [ ] All roles

---

## 💼 **Lead**

### 1. POST /api/leads
**Description:** Create lead
**Auth Required:** ❌ No (Public)
**Body Required:** fullName, email, phoneNumber, source, courseInterest

| Role | Status Expected | Response |
|------|---|---|
| Any | 201 | Lead created |

**Test Status:** [ ]

---

### 2. GET /api/leads
**Description:** Get leads (with filters)
**Auth Required:** ✅ Yes (Bearer token)
**Query Params:** status (optional), source (optional), fromDate (optional), toDate (optional), page (default: 0), size (default: 20)

| Role | Status Expected | Response |
|------|---|---|
| TEACHER | 403 | Forbidden - MANAGER only |
| MANAGER | 200 | List of leads |
| STUDENT | 403 | Forbidden - MANAGER only |
| ACCOUNTANT | 403 | Forbidden - MANAGER only |

**Test Status:** [ ] TEACHER [ ] MANAGER [ ] STUDENT [ ] ACCOUNTANT

---

### 3. PUT /api/leads/{id}/status
**Description:** Update lead status
**Auth Required:** ✅ Yes (Bearer token)
**Path Params:** id (UUID)
**Body Required:** status

| Role | Status Expected | Response |
|------|---|---|
| TEACHER | 403 | Forbidden - MANAGER only |
| MANAGER | 200 | Status updated |
| STUDENT | 403 | Forbidden - MANAGER only |
| ACCOUNTANT | 403 | Forbidden - MANAGER only |

**Test Status:** [ ] TEACHER [ ] MANAGER [ ] STUDENT [ ] ACCOUNTANT

---

## 🏆 **Course Result**

### 1. GET /api/course-results
**Description:** Get course results
**Auth Required:** ✅ Yes (Bearer token)

| Role | Status Expected | Response |
|------|---|---|
| TEACHER | 200 | List of course results |
| MANAGER | 200 | List of course results |
| STUDENT | 200 | List of course results |
| ACCOUNTANT | 200 | List of course results |

**Test Status:** [ ] All roles

---

## 📤 **Submission**

### 1. POST /api/submissions
**Description:** Submit assignment
**Auth Required:** ✅ Yes (Bearer token)
**Body Required:** assignmentId, content

| Role | Status Expected | Response |
|------|---|---|
| TEACHER | 403 | Forbidden - STUDENT only |
| MANAGER | 403 | Forbidden - STUDENT only |
| STUDENT | 201 | Submission created |
| ACCOUNTANT | 403 | Forbidden - STUDENT only |

**Test Status:** [ ] TEACHER [ ] MANAGER [ ] STUDENT [ ] ACCOUNTANT

---

## 💬 **Consultation**

### 1. GET /api/consultations
**Description:** Get consultations
**Auth Required:** ✅ Yes (Bearer token)

| Role | Status Expected | Response |
|------|---|---|
| TEACHER | 200 | List of consultations |
| MANAGER | 200 | List of consultations |
| STUDENT | 200 | List of consultations |
| ACCOUNTANT | 200 | List of consultations |

**Test Status:** [ ] All roles

---

## 🏢 **Room**

### 1. GET /api/rooms
**Description:** Get rooms
**Auth Required:** ❌ No (Public)

| Role | Status Expected | Response |
|------|---|---|
| Any | 200 | List of rooms |

**Test Status:** [ ]

---

## 📊 **Level**

### 1. GET /api/levels
**Description:** Get all levels
**Auth Required:** ❌ No (Public)

| Role | Status Expected | Response |
|------|---|---|
| Any | 200 | List of levels |

**Test Status:** [ ]

---

## 🏛️ **Branch**

### 1. GET /api/branches
**Description:** Get all branches
**Auth Required:** ❌ No (Public)

| Role | Status Expected | Response |
|------|---|---|
| Any | 200 | List of branches |

**Test Status:** [ ]

---

## 🧪 Test Checklist Summary

| Section | Endpoints | Status |
|---------|-----------|--------|
| 🔐 Authentication | 6 | [ ] |
| 👤 User Management | 5 | [ ] |
| 👤 Profile | 3 | [ ] |
| 🏫 Class Management | 9 | [ ] |
| 📚 Course Management | 5 | [ ] |
| 📝 Enrollment | 4 | [ ] |
| ✅ Attendance | 3 | [ ] |
| 📋 Assignment | 2 | [ ] |
| 💰 Finance - Invoice | 5 | [ ] |
| 🎁 Finance - Promotion | 1 | [ ] |
| 💳 Finance - Transaction | 1 | [ ] |
| 📢 Announcement | 3 | [ ] |
| 🔔 Notification | 4 | [ ] |
| 📊 Analytics | 4 | [ ] |
| 📄 Report | 1 | [ ] |
| 💼 Lead | 3 | [ ] |
| 🏆 Course Result | 1 | [ ] |
| 📤 Submission | 1 | [ ] |
| 💬 Consultation | 1 | [ ] |
| 🏢 Room | 1 | [ ] |
| 📊 Level | 1 | [ ] |
| 🏛️ Branch | 1 | [ ] |

**TOTAL: 70 Endpoints**

---

## 📋 Permission Levels Summary

### Public (❌ No Auth)
- GET /api/classes
- GET /api/courses
- GET /api/enrollments/*
- GET /api/attendance/*
- GET /api/assignments/class/*
- GET /api/invoices (all)
- GET /api/promotions
- GET /api/announcements
- GET /api/analytics/*
- POST /api/leads (create only)
- GET /api/rooms
- GET /api/levels
- GET /api/branches

### Auth Required (✅ Bearer token)
- All POST/PUT/DELETE (except register, login)
- All User Management
- All Profile
- All Notification
- All Report
- All Consultation

### Role-Specific
- **MANAGER**: Users, Courses, Classes, Enrollments, Attendance, Assignments, Invoices, Leads, Announcements
- **TEACHER**: Classes, Schedules, Assignments, Attendance, Announcements, Enrollments
- **STUDENT**: Submissions, Profile, Notifications, Consultations
- **ACCOUNTANT**: Invoices, Refunds, Announcements, Transactions

---

## 🚀 Testing Instructions

1. **For each endpoint:**
   - Change environment (TEACHER, MANAGER, STUDENT, ACCOUNTANT)
   - Run the request
   - Check actual status code vs expected status code
   - Mark checkbox when tested

2. **If error occurs:**
   - Copy error response to `ERROR.md`
   - Include: Section/Endpoint, Status Code, Error Message

3. **After all tests:**
   - Count total passed/failed
   - Fix any 403 (permission) issues
   - Fix any 400 (validation) issues
   - Fix any 500 (server) errors

---

**Last Updated:** 2026-05-05
**Total Endpoints:** 70
**Total Sections:** 22
