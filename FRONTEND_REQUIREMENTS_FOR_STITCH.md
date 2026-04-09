# Frontend Requirements - Hệ thống Quản lý Trung tâm Ngoại ngữ (ELC)
## Sử dụng Google Stitch / Material Design (MUI) để Generate UI

**Ngày:** 8/4/2026 | **Phiên bản:** 1.0 | **Trạng thái:** Ready for Stitch Generation

---

## 1. Tổng Quan Kiến Trúc Frontend

### 1.1 Tech Stack
- **Framework:** React.js (v18+) + TypeScript
- **UI Component Library:** Material-UI (MUI) / Google Stitch
- **State Management:** Redux Toolkit hoặc Context API
- **HTTP Client:** Axios
- **Routing:** React Router v6
- **Responsive:** Mobile-first design (Mobile, Tablet, Desktop)
- **Multilingual:** i18n (Vietnamese/English)

### 1.2 Design System
- **Color Scheme:** Material Design 3 (MUI default: Google Material Blue)
- **Typography:** Roboto font (MUI default)
- **Icons:** Material Icons / Google Chrome Icons
- **Spacing:** 8px grid system (MUI standard)
- **Responsive Breakpoints:**
  - Mobile: < 600px
  - Tablet: 600px - 960px
  - Desktop: > 960px

### 1.3 Authentication & Authorization
- JWT Token-based (from Backend)
- Store in localStorage (secure localStorage for production)
- Roles: MANAGER, TEACHER, STUDENT, ACCOUNTANT, LEAD/GUEST
- Role-based conditional rendering

---

## 2. Pages & Components Required

### 2.1 PUBLIC PAGES (No Authentication Required)

#### 2.1.1 Landing Page (/)
**Purpose:** Homepage cho Leads/Guests  
**Components:**
- **Header/Navigation Bar:**
  - Logo + Center name
  - Menu: Khóa học, Giáo viên, Đánh giá, Liên hệ
  - Button: Đăng nhập, Đăng ký (Lead form)
- **Hero Section:**
  - Banner image/gradient background
  - CTA text: "Khám phá các khóa học Tiếng Anh của chúng tôi"
  - CTA Button: "Đăng ký ngay", "Tư vấn miễn phí"
- **Courses Showcase:**
  - Grid card layout (responsive: 1 col mobile, 2 col tablet, 3+ col desktop)
  - Course cards: Image, Name, Level, Price, Student count, Rating stars
  - Filter/Search: By level, price range, duration
  - "Xem chi tiết" button per card
- **Teacher Profiles:**
  - Card grid: Teacher avatar, name, specialization, rating
- **Testimonials/Reviews:**
  - Carousel/slider of student ratings & quotes
- **FAQ Section:**
  - Accordion component
- **Footer:**
  - Links, contact info, social media

#### 2.1.2 Course Details Page (/courses/:id)
**Purpose:** View course details for Leads  
**Components:**
- Course banner image + back button
- Course info section:
  - Name, level/trình độ, price, duration, class size, schedule
  - Description, learning outcomes (as bullet list)
  - Pre-requisites, age group
- Teacher info card (name, avatar, bio)
- Schedule table: Classes ngày/giờ
- Student reviews (rating, comments)
- "Đăng ký học thử" CTA button + form modal
- "Yêu cầu tư vấn" button

#### 2.1.3 Placement Test / Skill Assessment Page
**Purpose:** Lead registers for placement test  
**Components:**
- Form (required fields):
  - Full name, email, phone, DOB, current English level (dropdown)
  - Preferred class level
  - Availability (checkboxes: weekday morning/evening, weekend)
  - Consent checkbox
- Submit button
- Success modal: "Cảm ơn! Chúng tôi sẽ liên hệ bạn trong 24h"

#### 2.1.4 Registration Page (/register)
**Purpose:** Lead self-registers to become Student  
**Components:**
- Form fields:
  - Personal: Full name, email, phone, DOB, gender (dropdown)
  - Course selection: dropdown/search (loaded from backend)
  - Payment method: Online payment QR / Deposit
  - Consent & Terms checkbox
- Form validation (real-time)
- Submit button
- Link to login if already have account
- Integration: After submit → redirect to payment page (for students) or "Pending approval" message

#### 2.1.5 Login Page (/login)
**Purpose:** Authentication for all internal roles  
**Components:**
- Form fields:
  - Email (with validation)
  - Password (with show/hide toggle)
  - "Remember me" checkbox
  - "Forgot password?" link
- Login button (with loading spinner)
- Signup link (redirect to /register)
- Error message display (invalid credentials)
- Integration: On success → store JWT token and redirect to role-based dashboard

#### 2.1.6 Forgot Password Page
**Purpose:** Reset password  
**Components:**
- Email input field
- "Send reset link" button
- Success message: "Vui lòng kiểm tra email để đặt mật khẩu mới"

#### 2.1.7 About Us Page (/about)
**Purpose:** Giới thiệu về trung tâm, tầm nhìn và sứ mệnh.
**Components:**
- **Mission & Vision Section:** Text + Image.
- **Facility Showcase:** Gallery of center photos (classrooms, labs).
- **Achievements Section:** Stats (years in business, students graduated, awards).
- **Core Values:** Cards with icons and descriptions.

#### 2.1.8 Branches & Contact Page (/contact)
**Purpose:** Thông tin liên hệ và danh sách chi nhánh.
**Components:**
- **Contact Form:** Name, Email, Subject, Message.
- **Branches List:** Cards for each branch (Name, Address, Phone, Google Map embed link).
- **Social Media Links:** List of icons linking to FB, YT, LinkedIn.

---

### 2.2 AUTHENTICATED PAGES (Role-Based Access)

#### 2.2.1 Shared Layout (All Authenticated Users)
**Purpose:** Main app shell/layout  
**Components:**
- **Sidebar Navigation:**
  - Collapsible on mobile (hamburger menu icon)
  - Logo + Center name at top
  - Menu items (role-based, conditional):
    - Trang chủ / Dashboard
    - Quản lý (Manager)
    - Lớp học (SMS) - Teacher/Manager
    - Khóa học (LMS) - Student/Teacher/Manager
    - Doanh thu/Tài chính (CRM/Financial) - Accountant/Manager
    - Tài khoản / Hồ sơ cá nhân
    - Đăng xuất
- **Top AppBar:**
  - Breadcrumb navigation (current page)
  - Search/Filter (if on listing page)
  - Notifications icon (bell) with badge count
  - User profile dropdown (name, avatar, settings, logout)
- **Main Content Area:**
  - Responsive padding
  - Loading spinner component (for async data)
  - Error/success toast notifications
- **Support & Chat Widget:**
  - Floating action button at bottom-right.
  - Opens chat window (Live chat / AI Chatbot).
  - Integration: FAQ quick links, message input.

#### 2.2.2 Manager Dashboard (/dashboard/manager)
**Purpose:** Bird's-eye view of system operations  
**Access:** MANAGER, ADMIN  
**Components:**
- **KPI Cards (Grid, 4 cards per row):**
  - Total Revenue (this month) - Large number + trend indicator (up/down arrow)
  - New Students (this month) - Number + icon
  - Total Classes - Number + icon
  - Alert count - Number + icon (red background if > 0)
- **Charts (2 charts per row):**
  - Revenue chart (Line/Area chart, X-axis: months, Y-axis: amount)
  - Student enrollment trend (Bar chart, X-axis: months, Y-axis: count)
  - Class occupancy pie chart (Full/Half/Empty classes)
  - Teacher utilization (Bar chart, teachers on X-axis, hours on Y-axis)
- **Alerts/Warnings Section:**
  - Table: Empty classes, Teachers with no schedule, Upcoming classes starting soon
  - Each row: Icon, Description, Action button (View class, Assign teacher, etc.)
- **Recent Activities (Feed):**
  - List of recent user actions (Student enrolled, Payment received, Class started)
  - Timestamp, actor name, action description

#### 2.2.3 Teacher Dashboard (/dashboard/teacher)
**Purpose:** Quick overview of teaching progress  
**Access:** TEACHER  
**Components:**
- **Quick Stats Cards (3 cards):**
  - Classes assigned this week - Number + icon
  - Students to teach - Number + icon
  - Assignments pending grading - Number + icon (red if > 0)
- **Weekly Schedule (Timetable):**
  - Calendar-like table: Days (Mon-Sun) on X-axis, Time slots (08:00-18:00) on Y-axis
  - Clickable class cells: Show class name, room, student count
  - Color-coded: Different colors per class
  - Edit/view class button on click
- **Classes This Week (Card list):**
  - Card per class: Class name, course level, room, time, student count
  - Action buttons: "Điểm danh" (Attendance), "Xem học viên" (View students), "Upload tài liệu"
- **Assignments Due (List):**
  - Table: Assignment name, class, deadline, submissions count, status (Pending/Graded)
  - Action button: "Chấm bài" (Grade assignments)
- **Notifications Panel:**
  - Recent messages, schedule changes

#### 2.2.4 Student Dashboard (/dashboard/student)
**Purpose:** Personal learning progress & engagement  
**Access:** STUDENT  
**Components:**
- **Quick Stats Cards (3 cards):**
  - Current course level - Text + progress bar
  - Classes this week - Number
  - Tasks due - Number (red if overdue)
- **Upcoming Classes (Card list, max 5):**
  - Card: Date, Time, Class name, Room, Teacher name, "Xem chi tiết" button
  - Mark as attended option (quick action)
- **Tasks/Assignments (List):**
  - Table: Name, Course, Due date, Status (Not started/In progress/Submitted/Graded)
  - Clickable row: Opens task detail modal → Can view assignment description, upload file, see feedback
- **Grade Summary:**
  - List of courses with average grade, comments from teacher
  - "Chi tiết" link to see full gradebook
- **Payment Info (Card):**
  - Course fee, Paid amount, Remaining balance
  - Due date, "Thanh toán" button if outstanding balance
- **Announcements (Feed):**
  - Center announcements, class announcements from teacher
  - Timestamp, icon, message, "Xem thêm" link

#### 2.2.5 Accountant Dashboard (/dashboard/accountant)
**Purpose:** Financial oversight & transaction tracking  
**Access:** ACCOUNTANT, MANAGER  
**Components:**
- **KPI Cards (4 cards):**
  - Total revenue (this month) - Amount
  - Outstanding debt (Công nợ chưa thu) - Amount (red highlight if high)
  - Payments received (today) - Count/Amount
  - Transactions count - Number
- **Financial Chart:**
  - Income vs Expense (Bar chart, X-axis: months, Y-axis: amount, 2 series)
- **Recent Transactions (Table):**
  - Columns: Date, Student name, Type (Fee/Salary/Expense), Amount, Method (QR/Transfer/Cash), Status (Pending/Confirmed), Action (View details/Edit)
  - Row click → Opens transaction detail modal
  - Filter buttons: By type, by status, by date range
- **Outstanding Payments (Table):**
  - Columns: Student name, Course, Amount due, Due date, Days overdue
  - Action: "Gửi nhắc nhở" button, "Chi tiết" link
- **Generator Buttons (Quick actions):**
  - "Xuất báo cáo" (Export report) → Generates Excel file
  - "In hóa đơn" (Print invoice) → Opens print-friendly modal

#### 2.2.6 Notifications Page (/notifications)
**Purpose:** View all notifications  
**Access:** All authenticated users  
**Components:**
- Notification list with filters: All, Unread, By type (System, Message, Assignment, etc.)
- Notification items: Icon, title, timestamp, read/unread indicator
- Mark as read/unread bulk action
- Delete button per notification

---

### 2.3 MANAGEMENT PAGES (CRUD Operations for Manager/Admin)

#### 2.3.1 Users Management Page (/management/users)
**Purpose:** CRUD for all user accounts  
**Access:** MANAGER, ADMIN  
**Components:**
- **Filter/Search Bar:**
  - Search by name/email
  - Filter by role (dropdown: All, Manager, Teacher, Student, Accountant)
  - Filter by status: Active/Inactive/Deactivated
- **User Table:**
  - Columns: ID, Name, Email, Phone, Role, Status (Active badge/Inactive badge), Created date, Actions
  - Sortable columns
  - Pagination (10, 25, 50 per page)
- **Action buttons per row:**
  - View icon → Opens user detail modal (read-only or editable)
  - Edit icon → Opens edit form modal
  - Delete/Deactivate icon → Confirmation modal
- **"Add new user" button (top-right):**
  - Opens modal form with fields: Name, Email, Phone, Role dropdown, Password (generated), Send credentials checkbox
- **Bulk actions:**
  - Checkboxes for select multiple users
  - Bulk action dropdown: Deactivate, Send password reset, Export selected

#### 2.3.2 Courses Management Page (/management/courses)
**Purpose:** CRUD for courses  
**Access:** MANAGER, ADMIN  
**Components:**
- **Filter/Search:**
  - Search by course name
  - Filter by level (Beginner, Intermediate, Advanced)
  - Filter by status (Active, Inactive, Upcoming)
- **Course Grid/Table (toggle view):**
  - **Card view (default):** Image, Name, Level, Duration, Price, Student count, Action buttons (Edit, Delete, View classes)
  - **Table view:** Columns: ID, Name, Level, Duration, Price, Classes count, Status, Created date, Actions
- **"Add new course" button:**
  - Opens form modal: Name, Description, Level dropdown, Duration (in weeks), Price, Max students, Curriculum file upload, Status
- **Edit form:**
  - Same fields as add, with pre-filled data
  - Save/Cancel buttons

#### 2.3.3 Classes Management Page (/management/classes)
**Purpose:** CRUD for classes (SMS)  
**Access:** MANAGER, ADMIN, TEACHER (view only)  
**Components:**
- **Filter/Search:**
  - Search by class name/code
  - Filter by course (dropdown)
  - Filter by status (Accepting, Full, Closed)
  - Filter by teacher (dropdown)
- **Classes Table:**
  - Columns: ID, Class name, Course, Teacher, Schedule (day/time), Room, Current/Max students, Status, Actions
  - Status badge colors: Green (Accepting), Yellow (Full), Gray (Closed)
- **"Create class" button:**
  - Opens form modal: Class name, Course dropdown, Teacher dropdown (with availability conflict check), Schedule (Day + time range), Room dropdown, Max students, Status radio
  - **Schedule conflict detection:** If teacher has conflict, show warning message in real-time
- **Edit class form:**
  - Same as create, but also shows current enrollment count (read-only)
  - Can re-assign teacher if fewer than max students
- **"View students" button per class:**
  - Opens modal with enrollment list (student name, email, status, enrollment date)
  - Can remove student with confirmation

#### 2.3.4 Teachers Management Page (/management/teachers)
**Purpose:** CRUD for teacher profiles  
**Access:** MANAGER, ADMIN  
**Components:**
- **Filter/Search:**
  - Search by teacher name
  - Filter by specialization (level: Beginner, Intermediate, Advanced)
  - Filter by availability status (Available, Unavailable, On leave)
- **Teacher Cards:**
  - Avatar, Name, Email, Phone, Specialization, Current availability status badge
  - "Edit profile" button, "View schedule" button, "Deactivate" button
- **"Add new teacher" button:**
  - Form modal: Name, Email, Phone, Date of birth, Qualifications (text area), Specialization checkboxes, Availability status
- **Edit teacher form:**
  - Same as add
- **Availability Schedule (separate view):**
  - Opens when click "View schedule"
  - Weekly grid showing available teaching slots (teacher can set from own profile)
  - Current class assignments overlay

#### 2.3.5 Leads/Customers CRM Page (/management/leads)
**Purpose:** Manage potential customers  
**Access:** MANAGER, ACCOUNTANT, ADMIN  
**Components:**
- **Filter/Search:**
  - Search by name/email/phone
  - Filter by status (New, Contacted, Interested, Enrolled, Rejected)
  - Filter by source (Website form, Referral, Walk-in)
- **Leads Table:**
  - Columns: ID, Name, Email, Phone, Assessment score, Status badge, Created date, Last contacted, Actions
  - Sortable
- **Row actions:**
  - "View details" → Opens lead detail modal with history of consultations
  - "Convert to student" → Opens enrollment form
  - "Send consultation form" → Pre-fills email with link to assessment
  - "Edit notes" → Quick inline edit or modal for consultation summary
- **Pipeline view toggle:**
  - Kanban board view: Columns = Lead statuses, Cards = Leads (drag to move between stages)
- **Bulk actions:**
  - "Send assessment link" to selected leads
  - "Schedule consultation" for selected

#### 2.3.6 Payments/Transactions Management Page (/management/payments)
**Purpose:** Financial & payment tracking  
**Access:** ACCOUNTANT, MANAGER, ADMIN  
**Components:**
- **Filter/Search:**
  - Date range picker
  - Search by student name/transaction ID
  - Filter by type (Course fee, Salary, Expense)
  - Filter by status (Pending, Confirmed, Failed, Refunded)
  - Filter by payment method (QR, Transfer, Cash)
- **Transactions Table:**
  - Columns: ID, Date, Student name, Type, Amount, Method, Status badge, Created by, Actions
- **Row actions:**
  - "View details" → Opens full transaction info modal (payer, payee, receipt, audit trail)
  - "Confirm payment" (if pending) → Confirmation modal + auto-update of student balance
  - "Refund" (if confirmed) → Refund modal (reason, amount, confirmation)
- **Generate Report button:**
  - Opens modal: Date range, Report type (Revenue, Outstanding debt, Salary, Expense)
  - Button: "Export to Excel", "Export to PDF"
  - Preview table before export
- **Announcements/Fee Structure:**
  - Card/section showing current fee structure per course level

#### 2.3.7 Room & Facility Management Page (/management/facilities)
**Purpose:** Quản lý phòng học và trang thiết bị.
**Access:** MANAGER, ADMIN
**Components:**
- **Rooms Table:** ID, Room Name, Capacity, Status (Available/Occupied), Equipment list.
- **Equipment Inventory Table:** Item Name, Quantity, Condition, Last Maintenance.
- **Add Room Modal:** Name, Capacity, Floor, checkboxes for equipment (Projector, AC, Wifi).
- **Maintenance Schedule:** Calendar view showing when rooms/equipment are scheduled for check-up.

#### 2.3.8 Announcements Management Page (/management/announcements)
**Purpose:** Soạn và gửi thông báo chung.
**Access:** MANAGER, ADMIN, TEACHER (limited)
**Components:**
- **Announcement List:** Title, Created By, Targeted To (All, Teachers, Classes), Status (Draft/Sent).
- **Composer Modal:** Rich text editor, Target audience selector, Schedule for later toggle, Attachments.
- **Analytics:** View/Read rate per announcement.

#### 2.3.9 Promotions & Discounts Management Page (/management/promotions)
**Purpose:** Quản lý mã giảm giá và chương trình ưu đãi.
**Access:** MANAGER, ADMIN, ACCOUNTANT
**Components:**
- **Promotion Table:** Code, Type (%), Amount, Min Purchase, Expiry, Usage Count.
- **Add Promo Form:** Form modal with validation for date ranges and usage limits.

---

### 2.4 LMS PAGES (Course Content & Learning)

#### 2.4.1 Course Content Page (/courses/:courseId/content)
**Purpose:** View/manage course materials  
**Access:** STUDENT (view), TEACHER (view+upload), MANAGER (view)  
**Components:**
- **Course header:**
  - Course name, level, progress bar (if student), teacher name, class schedule
- **Lessons/Units list (left sidebar or tabs):**
  - Collapsible tree: Week 1, Week 2, ... (toggle expand/collapse)
  - Under each: Lesson topics (clickable)
  - Status indicator: Done (checkmark), In progress, Not started
- **Main content area:**
  - Lesson title, lesson number
  - Learning objectives (bullet list)
  - Content (rich text, could be text area with preview)
  - Materials section: File list (PDFs, Word docs) with download links
  - Video embed (if available)
  - **Teacher view:** "Edit lesson" button (opens form modal to update content), "Add attachment" button
- **Assignments section (below content):**
  - Assignments for this lesson: Title, Deadline, Type (essay/quiz/file submission)
  - "View assignment" / "Submit assignment" button

#### 2.4.2 Assignments/Homework Page (/courses/:courseId/assignments)
**Purpose:** View and submit assignments (Student), Create/grade assignments (Teacher)  
**Access:** STUDENT (view+submit), TEACHER (manage), MANAGER (view)  
**Components:**
- **Assignment list (Table or Card):**
  - Columns: Name, Lesson, Due date, Type, Submission status (Not submitted/Submitted/Graded), Grade (if graded)
  - Row click → Opens assignment detail modal
- **Assignment detail modal (Student view):**
  - Title, Description, Due date, Type
  - Instructions (text area)
  - Attachment file list (view/download)
  - Submission section: File upload input (drag-drop) + Submit button
  - If already submitted: Show submitted file, submission date, feedback from teacher (if available), grade
  - If graded: Display grade, teacher comments (rich text)
- **Assignment detail modal (Teacher view):**
  - Same as student, but also shows:
    - List of student submissions (table: Student name, Submission date, File, Grade, Feedback status)
    - Bulk grading button: Select multiple, apply grade/feedback to all
  - Row action: Click student submission → Opens grading form (Grade dropdown, Feedback rich text, Save)
- **"Create assignment" button (Teacher):**
  - Form modal: Name, Description, Lesson dropdown, Due date + time picker, Type dropdown (File submission/Quiz), Instructions, Attachment upload
  - Save/Cancel

#### 2.4.3 Grades/Report Card Page (/student/grades)
**Purpose:** View grades for courses  
**Access:** STUDENT (view own), TEACHER (view class), MANAGER (view all)  
**Components:**
- **Course/Class selection (if manager/teacher):**
  - Dropdown or filter to select course/class
- **Grade table:**
  - Columns: Assignment/Exam name, Type, Points/Grade, Submission date, Feedback (view link)
  - Summary row: Total points, Average grade, Status (Passing/Failing)
- **Grade scale info:**
  - Chart/card showing grade scale (A = 90-100, B = 80-90, etc.)
- **Teacher notes/comments section:**
  - Overall feedback from teacher (text area, read-only for student)
- **Download transcript button:**
  - Generates PDF of grade report

#### 2.4.4 Attendance Management Detailed Page (/teacher/attendance/:classId)
**Purpose:** Xem và quản lý lịch sử điểm danh chi tiết.
**Access:** TEACHER, MANAGER
**Components:**
- **Attendance Heatmap:** Rows = Students, Columns = Dates. Colors: Green (Present), Red (Absent), Yellow (Late).
- **Edit Attendance:** Click on cell to change status.
- **Summary Section:** Total present/absent per student, percentage attendance.
- **Export CSV:** Export attendance for this class.

---

### 2.5 ENROLLMENT & STUDENT MANAGEMENT

#### 2.5.1 Student Enrollment Page (/management/enrollments or /student/enroll)
**Purpose:** Manage student enrollments in classes (Manager) or view own enrollment (Student)  
**Access:** STUDENT (view own), MANAGER (manage all)  
**Components:**
- **For Manager:**
  - Filter/search: By student name, by class, by status (Pending/Approved/Rejected/Dropped out)
  - **Enrollment requests table:**
    - Columns: ID, Student name, Requested class, Requested date, Status badge, Actions
    - Button: "Approve" (confirms enrollment), "Reject" (with reason modal), "Reassign to different class" (dropdown of available classes)
  - **Current enrollment table:**
    - Columns: Student name, Class, Course, Enrollment date, Status (Active/Completed/Dropped), Actions
    - Button: "Change class" (moves to different class), "Deactivate enrollment" (with reason)
- **For Student:**
  - Current enrollment card: Class name, course, teacher, schedule, progress
  - "Request class change" button → Opens form modal (new class dropdown with availability check)
  - "Withdraw" button → Confirmation modal

#### 2.5.2 Student Profile / My Account Page (/profile)
**Purpose:** Personal profile management  
**Access:** All authenticated users  
**Components:**
- **Profile info section:**
  - Avatar upload (drag-drop or click), Name, Email, Phone, Date of birth, Gender, Address
  - "Edit" button → Opens edit form modal
  - Save/Cancel
- **Account settings:**
  - Show email visibility checkbox (for lead/guest contact)
  - Notification preferences: Email notifications, SMS notifications (toggle checkboxes)
  - Language preference (dropdown: Vietnamese/English)
- **Change password section:**
  - "Change password" button → Opens modal with Current password, New password, Confirm password fields
  - Validation: New password != current, strength meter
- **Session management:**
  - Show list of active sessions (browser, device, last login time)
  - "Logout other sessions" button
  - "Logout all" button
- **Account security:**
  - 2FA setup (optional checkbox)
  - Recovery codes (download)

#### 2.5.3 Administrative Requests Page (/student/requests)
**Purpose:** Học viên tạo và theo dõi yêu cầu (xin nghỉ, chuyển lớp, bảo lưu).
**Access:** STUDENT (manage own), MANAGER (approve/reject)
**Components:**
- **Request List:** ID, Type (Leave, Change Class, Defer), Status (Pending, Approved, Rejected), Created Date.
- **New Request Form:** Request type dropdown, Reason text area, Date range (if leave), New class choice (if transfer), Attachment upload (e.g., doctor's note).
- **Detail View:** Timeline of request status (Submitted -> Under Review -> Manager Decision).

#### 2.5.4 Feedback & Course Rating Page (/student/feedback)
**Purpose:** Đánh giá chất lượng khóa học và giáo viên.
**Access:** STUDENT
**Components:**
- **Rating List:** Courses completed but not yet rated.
- **Feedback Form:** Star rating (1-5) for Course Content, Teaching Style, Support; Comment text area; Anonymous toggle.
- **Success screen:** "Cảm ơn bạn đã phản hồi!"

---

#### 2.6.1 Reports Page (/reports)
**Purpose:** Generate and view various reports  
**Access:** MANAGER, ACCOUNTANT, ADMIN  
**Components:**
- **Report type selector (tabs or dropdown):**
  - Revenue report
  - Student enrollment report
  - Attendance report
  - Performance report (by teacher, by class)
  - Payroll report
  - Outstanding debt report
- **For each report type:**
  - Date range picker / Month picker
  - Filter options (by course, by class, by teacher, by student status)
  - Generate button
  - Preview table/chart
  - Download buttons: Excel, PDF
  - Share button (email report)
- **Revenue Report example:**
  - Summary cards: Total revenue, Expenses, Net profit
  - Line chart: Revenue over time (selected date range)
  - Table: By course, by class, by payment method
- **Attendance Report example:**
  - Filter by class / date range
  - Table: Date, Class, Present count, Absent count, Attendance rate %
  - Heat map: Green (good attendance), Yellow (medium), Red (low)
- **Export options:**
  - Standard export formats listed
  - Scheduled report generation (e.g., monthly report sent to email every 1st of month)

#### 2.6.2 Payroll Management Page (/accountant/payroll)
**Purpose:** Chốt công và tính lương cho giáo viên/nhân viên.
**Access:** ACCOUNTANT, MANAGER
**Components:**
- **Payroll Table:** Staff name, Position, Base Salary, Overtime/Class bonus, Deductions, Net Salary, Month, Status (Draft/Approved/Paid).
- **Calculation Details Modal:** Log of classes taught, hours recorded via attendance system, bonus justification.
- **Quick Action:** "Approve all", "Generate Payroll for [Month]".

#### 2.6.3 Expense Tracking Page (/accountant/expenses)
**Purpose:** Quản lý chi phí vận hành trung tâm.
**Access:** ACCOUNTANT, MANAGER
**Components:**
- **Expense List:** Category (Electricity, Rent, Materials), Amount, Date, Vendor, Proof of payment (image), Approved by.
- **Add Expense Modal:** Category select, Amount, Receipt upload, Description.

---

## 3. Common Components & UI Patterns

### 3.1 Reusable Components (MUI-based)
- **Cards:** For displaying data chunks (profile, course, class, transaction)
- **Tables:** For list data with sorting, filtering, pagination
- **Modals/Dialogs:** For forms, confirmations, detail views
- **Tabs:** For grouping related pages
- **Dropdowns/Selects:** For filtering, selection
- **Date/Time pickers:** For scheduling, date range selection
- **Charts:** Line, Bar, Pie, Area charts (Chart.js or Recharts)
- **Progress bars:** For course progress, grade visualization
- **Badges:** For status indication (Active, Inactive, Pending, Approved, etc.)
- **Buttons:** Primary (CTA), Secondary, Tertiary, Danger (delete)
- **Input fields:** Text, Email, Number, Password, Textarea
- **Checkboxes, Radio buttons, Toggles:** For selections and settings
- **Loading spinners:** For async operations
- **Toast notifications:** For success, error, warning, info messages
- **Breadcrumb navigation:** For showing current page location
- **Pagination:** For large data lists

### 3.2 Form Validation & UX
- Real-time validation feedback (red border + error message under input)
- Required field indicator (*)
- Helper text under fields (Format: dd/mm/yyyy)
- Disabled submit button until all required fields filled
- Loading state on submit button (spinner + disabled)
- Success/error message after form submit
- Confirmation modal for destructive actions (delete, deactivate)

### 3.3 Responsive Design Rules
- **Mobile (<600px):**
  - Single column layouts
  - Sidebar collapses to hamburger menu
  - Cards stack vertically
  - Table scrolls horizontally (with sticky header)
  - Font sizes reduced slightly
  - Touch-friendly button sizes (min 44px)
- **Tablet (600-960px):**
  - 2-column layouts for some sections
  - Sidebar can stay collapsed or show collapsible
  - Charts stack vertically
- **Desktop (>960px):**
  - Multi-column layouts (2-4 columns)
  - Sidebar always visible
  - Full charts/tables display

### 3.4 Accessibility Requirements
- ARIA labels for icon buttons
- Color not only indicator (use text + color for status)
- Keyboard navigation support (Tab through inputs)
- Alt text for images
- Form labels linked to inputs
- Focus outlines visible

---

## 4. Data Models for Frontend State Management

### 4.1 User Model
```typescript
interface User {
  id: string;
  email: string;
  password?: string; // Only in registration form
  name: string;
  phone: string;
  dateOfBirth: Date;
  gender: 'MALE' | 'FEMALE' | 'OTHER';
  address?: string;
  profileImage?: string;
  role: 'MANAGER' | 'TEACHER' | 'STUDENT' | 'ACCOUNTANT' | 'LEAD';
  status: 'ACTIVE' | 'INACTIVE' | 'DEACTIVATED';
  createdAt: Date;
  updatedAt: Date;
}
```

### 4.2 Course Model
```typescript
interface Course {
  id: string;
  name: string;
  description: string;
  level: 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED';
  duration: number; // in weeks
  price: number;
  maxStudents: number;
  curriculum?: string; // File URL
  status: 'ACTIVE' | 'INACTIVE' | 'UPCOMING';
  createdAt: Date;
}
```

### 4.3 Class Model
```typescript
interface Class {
  id: string;
  name: string;
  courseId: string;
  teacherId: string;
  roomId?: string;
  schedule: {
    dayOfWeek: 'MON' | 'TUE' | 'WED' | 'THU' | 'FRI' | 'SAT' | 'SUN';
    startTime: string; // HH:mm
    endTime: string;
  }[];
  maxStudents: number;
  currentStudents: number;
  status: 'ACCEPTING' | 'FULL' | 'CLOSED';
  startDate: Date;
  endDate: Date;
}
```

### 4.4 Enrollment Model
```typescript
interface Enrollment {
  id: string;
  studentId: string;
  classId: string;
  enrollmentDate: Date;
  status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'ACTIVE' | 'COMPLETED' | 'DROPPED';
  notes?: string;
}
```

### 4.5 Assignment Model
```typescript
interface Assignment {
  id: string;
  courseId: string;
  lessonId: string;
  title: string;
  description: string;
  dueDate: Date;
  type: 'FILE_SUBMISSION' | 'QUIZ' | 'ESSAY';
  attachments?: string[]; // File URLs
  createdBy: string; // Teacher ID
}
```

### 4.6 Submission Model
```typescript
interface AssignmentSubmission {
  id: string;
  assignmentId: string;
  studentId: string;
  submissionDate: Date;
  fileUrl: string; // Uploaded file
  grade?: number;
  feedback?: string;
  status: 'SUBMITTED' | 'GRADED';
}
```

### 4.7 Payment/Transaction Model
```typescript
interface Transaction {
  id: string;
  studentId?: string;
  amount: number;
  type: 'COURSE_FEE' | 'SALARY' | 'EXPENSE';
  method: 'QR' | 'TRANSFER' | 'CASH' | 'ONLINE';
  description: string;
  status: 'PENDING' | 'CONFIRMED' | 'FAILED' | 'REFUNDED';
  relatedEnrollmentId?: string;
  createdDate: Date;
  createdBy: string;
}
```

### 4.8 Lead Model
```typescript
interface Lead {
  id: string;
  name: string;
  email: string;
  phone: string;
  preferredLevel?: 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED';
  assessmentScore?: number;
  status: 'NEW' | 'CONTACTED' | 'INTERESTED' | 'ENROLLED' | 'REJECTED';
  source: 'WEBSITE_FORM' | 'REFERRAL' | 'WALKIN';
  consultationHistory: Consultation[];
  createdAt: Date;
}
```

---

## 5. API Integration Overview

### 5.1 Frontend-to-Backend API Endpoints (Summary)

**Authentication:**
- POST /api/auth/login
- POST /api/auth/register
- POST /api/auth/logout
- POST /api/auth/refresh-token
- POST /api/auth/forgot-password
- POST /api/auth/reset-password

**Users:**
- GET /api/users (list all, with pagination & filters)
- GET /api/users/:id
- POST /api/users (create)
- PUT /api/users/:id (update)
- DELETE /api/users/:id (soft delete/deactivate)
- GET /api/users/profile (get current user profile)
- PUT /api/users/profile (update own profile)
- PUT /api/users/:id/password (change password)

**Courses:**
- GET /api/courses (list, with filters: level, status, search)
- GET /api/courses/:id
- POST /api/courses (create, manager only)
- PUT /api/courses/:id (update)
- DELETE /api/courses/:id

**Classes:**
- GET /api/classes (list, with filters: course, teacher, status)
- GET /api/classes/:id
- POST /api/classes (create)
- PUT /api/classes/:id (update)
- DELETE /api/classes/:id
- POST /api/classes/:id/check-teacher-conflict (conflict detection)

**Teachers:**
- GET /api/teachers (list)
- GET /api/teachers/:id
- PUT /api/teachers/:id (update availability, qualifications)
- GET /api/teachers/:id/schedule

**Enrollments:**
- GET /api/enrollments (list, manager/filterable)
- GET /api/enrollments/:id
- POST /api/enrollments (create enrollment request)
- PUT /api/enrollments/:id (approve/reject/change class)
- DELETE /api/enrollments/:id (drop out)
- GET /api/students/:id/enrollments (get student's enrollments)

**Assignments:**
- GET /api/assignments (list by course/student)
- GET /api/assignments/:id
- POST /api/assignments (create, teacher only)
- PUT /api/assignments/:id (update)
- DELETE /api/assignments/:id
- POST /api/assignments/:id/submissions (submit)
- GET /api/assignments/:id/submissions (list submissions, teacher only)
- PUT /api/submissions/:id (grade, teacher only)

**Attendance:**
- POST /api/attendance (mark attendance, teacher in-class)
- GET /api/attendance/report (attendance report)

**Payments:**
- GET /api/transactions (list, with filters)
- GET /api/transactions/:id
- POST /api/transactions (record manual payment)
- PUT /api/transactions/:id/confirm (confirm pending)
- POST /api/transactions/:id/refund (refund)

**Leads:**
- GET /api/leads (list CRM)
- POST /api/leads (create lead from form)
- PUT /api/leads/:id (update status, notes)
- DELETE /api/leads/:id

**Reports:**
- GET /api/reports/revenue (with date range)
- GET /api/reports/enrollment (with filters)
- GET /api/reports/attendance (with class/date filters)
- GET /api/reports/payroll (with date range)

**Notifications:**
- GET /api/notifications (list user's notifications)
- PUT /api/notifications/:id/read (mark as read)
- DELETE /api/notifications/:id

---

## 6. Implementation Notes

### 6.1 For Stitch/MUI Component Generation
- Use MUI v5+ for React components
- import from `@mui/material`, `@mui/icons-material`
- Follow MUI theme customization for branding if needed
- Use responsive hooks: `useTheme()`, `useMediaQuery()` for responsive logic

### 6.2 State Management Approach
- Redux Toolkit recommended for complex state (users, courses, enrollments)
- Context API + useReducer for local component state
- Custom hooks for API calls (useAuth, useCourses, useClasses, etc.)
- React Query / SWR for server-state management (caching, stale-while-revalidate)

### 6.3 Error Handling & Loading States
- Axios interceptor for global error handling
- Toast notification for user feedback (success, error, warning)
- Loading spinners on buttons, pages, and data fetches
- Fallback UI for error states (retry button, back link)

### 6.4 Authentication Flow
- Login → POST /api/auth/login → Store JWT token → Redirect to dashboard
- JWT token stored in localStorage (with httpOnly cookie for production)
- Axios interceptor adds token to Authorization header
- On 401/403 response, redirect to login or show permission denied
- Logout → Clear token + localStorage → Redirect to home

### 6.5 Optimization Tips
- Code-splitting by route (React.lazy + Suspense)
- Image optimization (next/image if using Next.js, or optimize manually)
- Memoization for expensive components (React.memo)
- Debounce search/filter inputs
- Virtualization for long lists (windowing library like react-window)

---

## 7. Acceptance Criteria for Stitch/UI Generation

- [ ] All pages listed in section 2 are generated with proper MUI components
- [ ] Responsive design works on mobile (375px), tablet (768px), desktop (1920px)
- [ ] Forms have validation and error messaging
- [ ] Tables have sorting, filtering, pagination
- [ ] Charts render correctly (no console errors)
- [ ] Navigation (sidebar, breadcrumb) works across all pages
- [ ] Modals/dialogs are functional (open/close)
- [ ] Loading and error states are visible
- [ ] Accessibility features are implemented (labels, ARIA, keyboard nav)
- [ ] Color scheme follows Material Design 3
- [ ] UI is ready for backend integration (API calls can be wired in)

---

## 8. Next Steps for Backend Team

After Frontend UI is generated:
1. Backend team will implement all API endpoints listed in section 5.1
2. Each endpoint returns data matching the data models (section 4)
3. Frontend team integrates Axios API calls to endpoints
4. End-to-end testing of frontend-backend interaction
5. Deploy to staging & production

**Approval:** Frontend team lead signs off on Stitch UI generation. Backend team creates Linear issues for each API endpoint.

---

**End of Document**

**Version History:**
- v1.0 (8/4/2026): Initial requirements for Stitch/MUI UI generation
