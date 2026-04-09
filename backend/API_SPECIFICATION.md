# ELC Management System - API Specification

This document outlines the RESTful API endpoints required for the English Language Center (ELC) management system, mapped to the Spring Boot backend modules.

## 1. Authentication & Profile
Endpoints for user authentication and managing personal profile.

| Method | Endpoint | Description | Role Access |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/auth/login` | Authenticate user and return JWT | PUBLIC |
| `POST` | `/api/auth/register` | Student self-registration | PUBLIC |
| `POST` | `/api/auth/logout` | Invalidate token | AUTHENTICATED |
| `POST` | `/api/auth/refresh` | Refresh JWT token | AUTHENTICATED |
| `POST` | `/api/auth/forgot-password` | Send reset password email | PUBLIC |
| `POST` | `/api/auth/reset-password` | Update password using reset token | PUBLIC |
| `GET` | `/api/profile` | Get current user profile details | AUTHENTICATED |
| `PUT` | `/api/profile` | Update personal profile info | AUTHENTICATED |
| `PUT` | `/api/profile/password` | Change current password | AUTHENTICATED |

---

## 2. User Management (Admin/Manager)
CRUD operations for administrative oversight of all accounts.

| Method | Endpoint | Description | Role Access |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/users` | List all users (with filters & pagination) | MANAGER |
| `GET` | `/api/users/{id}` | Get specific user details | MANAGER |
| `POST` | `/api/users` | Create a new user account (Staff/Teacher) | MANAGER |
| `PUT` | `/api/users/{id}` | Update user role, status, or info | MANAGER |
| `DELETE` | `/api/users/{id}` | Deactivate/Soft-delete user | MANAGER |

---

## 3. School Management (SMS)
Managing center infrastructure, courses, and class schedules.

| Method | Endpoint | Description | Role Access |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/branches` | List all center branches | PUBLIC |
| `GET` | `/api/courses` | List courses (filtering by level/status) | PUBLIC |
| `POST` | `/api/courses` | Create new course training program | MANAGER |
| `GET` | `/api/rooms` | List classrooms and status | MANAGER |
| `GET` | `/api/classes` | List active/upcoming classes | AUTHENTICATED |
| `POST` | `/api/classes` | Open a new class session | MANAGER |
| `GET` | `/api/classes/{id}/schedule` | Get weekly timetable for a class | AUTHENTICATED |
| `POST` | `/api/classes/check-conflict` | Detect teacher/room schedule conflicts | MANAGER |

---

## 4. Learning Management (LMS)
Managing the student journey and academic performance.

| Method | Endpoint | Description | Role Access |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/enrollments` | Student requests to join a class | STUDENT |
| `GET` | `/api/enrollments` | List and filter enrollment requests | MANAGER |
| `PUT` | `/api/enrollments/{id}` | Approve, reject, or drop enrollment | MANAGER |
| `POST` | `/api/attendance` | Record daily attendance for a class | TEACHER |
| `GET` | `/api/attendance/{classId}` | View attendance history/heatmap | TEACHER, MANAGER |
| `POST` | `/api/assignments` | Create homework/assignments | TEACHER |
| `GET` | `/api/assignments/class/{id}` | List assignments for a class | STUDENT, TEACHER |
| `POST` | `/api/assignments/{id}/submit` | Upload student work | STUDENT |
| `GET` | `/api/assignments/{id}/submissions` | List student submissions | TEACHER |
| `PUT` | `/api/submissions/{id}/grade` | Grade submission and add feedback | TEACHER |

---

## 5. Customer Relationship (CRM)
Tracking leads and initial consultations.

| Method | Endpoint | Description | Role Access |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/leads` | Create lead from landing page form | PUBLIC |
| `GET` | `/api/leads` | List leads (CRM Pipeline view) | MANAGER |
| `PUT` | `/api/leads/{id}/status` | Update lead stage (Contacted, Interested...) | MANAGER |
| `POST` | `/api/leads/{id}/consultations`| Log a consultation session | MANAGER |
| `POST` | `/api/leads/{id}/convert` | Convert lead to Student account | MANAGER |

---

## 6. Financial Management
Billing, transactions, and operational expenses.

| Method | Endpoint | Description | Role Access |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/invoices` | List invoices and payment status | ACCOUNTANT |
| `GET` | `/api/invoices/student/me` | Student views their own bills | STUDENT |
| `POST` | `/api/transactions` | Record a payment (QR, Cash, etc.) | ACCOUNTANT |
| `PUT` | `/api/transactions/{id}/verify`| Confirm pending transaction | ACCOUNTANT |
| `POST` | `/api/expenses` | Log operational expense | ACCOUNTANT |
| `GET` | `/api/promotions` | List active discount codes | ACCOUNTANT, MANAGER |

---

## 7. Notifications & Communication
Announcements and user alerts.

| Method | Endpoint | Description | Role Access |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/announcements` | Get public/role-based announcements | AUTHENTICATED |
| `POST` | `/api/announcements` | Post a new center-wide news | MANAGER |
| `GET` | `/api/notifications` | Get unread alerts for current user | AUTHENTICATED |
| `PUT` | `/api/notifications/{id}/read` | Mark notification as read | AUTHENTICATED |

---

## 8. Reports & Analytics
Data for manager and accountant dashboards.

| Method | Endpoint | Description | Role Access |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/reports/revenue` | Revenue trends (Line/Bar chart data) | MANAGER, ACCOUNTANT |
| `GET` | `/api/reports/enrollment` | Stats on new students and class fill rate | MANAGER |
| `GET` | `/api/reports/performance` | Student grading & teacher utilization stats | MANAGER |
| `GET` | `/api/reports/salary` | Payroll calculation preview | ACCOUNTANT |
