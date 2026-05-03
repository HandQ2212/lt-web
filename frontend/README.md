# ELC English Center Management System

Hệ thống quản lý trung tâm Anh ngữ toàn diện được xây dựng với React, TypeScript, Material-UI, Redux Toolkit và React Router.

## 🚀 Tính năng

### Public Pages (Trang công khai)
- **Landing Page**: Trang chủ với Hero section, Course highlights, Teacher spotlight, Testimonials
- **Course Catalog**: Danh sách khóa học với filter theo trình độ và tìm kiếm
- **Course Detail**: Chi tiết khóa học, lộ trình học, lớp sắp khai giảng
- **Teachers**: Danh sách giảng viên với thông tin chi tiết
- **Contact**: Form liên hệ và thông tin liên lạc

### Authentication (Xác thực)
- **Login**: Đăng nhập với email/password
- **Register**: Đăng ký tài khoản mới
- **Forgot Password**: Khôi phục mật khẩu

### Admin/Manager Portal
- **Dashboard**: Tổng quan với KPI cards, revenue charts, enrollment statistics
- **User Management**: Quản lý người dùng (CRUD operations)
- **Class Management**: Quản lý lớp học, xếp lịch
- **Lead Management**: CRM với Kanban board cho lead pipeline

### Teacher Portal
- **Schedule**: Lịch dạy theo tuần
- **Attendance**: Điểm danh học viên
- **Assignments**: Tạo và quản lý bài tập
- **Grading**: Chấm điểm và feedback cho học viên

### Student Portal
- **Dashboard**: Tổng quan tiến độ học tập, lớp học tiếp theo
- **Gradebook**: Xem điểm và nhận xét từ giáo viên
- **Payments**: Quản lý học phí, xem hóa đơn

### Finance/Accounting Portal
- **Dashboard**: Tổng quan tài chính với revenue/expense charts
- **Invoices**: Quản lý hóa đơn
- **Reports**: Báo cáo doanh thu, chi phí

## 🛠️ Tech Stack

- **Frontend Framework**: React 18.3.1
- **Language**: TypeScript
- **UI Library**: Material-UI (MUI) 7.3.5
- **State Management**: Redux Toolkit 2.11.2
- **Routing**: React Router DOM 7.14.2
- **HTTP Client**: Axios 1.16.0
- **Charts**: Recharts 2.15.2
- **i18n**: i18next, react-i18next
- **Build Tool**: Vite 6.3.5

## 📦 Cài đặt

\`\`\`bash
# Clone repository
git clone <repository-url>

# Di chuyển vào thư mục project
cd code

# Cài đặt dependencies
pnpm install

# Chạy development server
pnpm dev
\`\`\`

## 🔑 Mock Login Credentials

Để test hệ thống, bạn có thể sử dụng các tài khoản mock sau:

### Admin
- Email: admin@elc.com
- Password: admin123
- Redirect: /admin/users

### Teacher
- Email: teacher@elc.com
- Password: teacher123
- Redirect: /teacher/schedule

### Student
- Email: student@elc.com
- Password: student123
- Redirect: /student/courses

### Accountant
- Email: accountant@elc.com
- Password: accountant123
- Redirect: /finance/dashboard

## 📁 Cấu trúc thư mục

\`\`\`
src/
├── app/
│   ├── components/
│   │   ├── layouts/           # Layout components (Header, Sidebar, Footer)
│   │   ├── ui/                # Reusable UI components
│   │   └── ProtectedRoute.tsx # Route protection
│   ├── pages/
│   │   ├── public/            # Public pages
│   │   ├── auth/              # Authentication pages
│   │   ├── admin/             # Admin portal pages
│   │   ├── teacher/           # Teacher portal pages
│   │   ├── student/           # Student portal pages
│   │   ├── finance/           # Finance portal pages
│   │   └── common/            # Common pages (Profile)
│   └── App.tsx                # Main app component
├── store/
│   ├── slices/                # Redux slices
│   └── index.ts               # Store configuration
├── services/
│   └── api.ts                 # API service layer with Axios
├── types/
│   └── index.ts               # TypeScript type definitions
├── i18n/
│   ├── locales/               # Translation files (vi, en)
│   └── index.ts               # i18n configuration
└── styles/                    # Global styles
\`\`\`

## 🎨 Design System

### Colors
- **Primary**: #1976d2 (MUI Blue) - Chuyên nghiệp
- **Secondary**: #4caf50 (Success Green) - Giáo dục & tăng trưởng
- **Error**: #d32f2f

### Typography
- Font: Inter, Roboto

### Responsive Breakpoints
- Mobile: <600px
- Tablet: 600-1200px
- Desktop: >1200px

## 🔌 API Configuration

API base URL có thể được cấu hình qua environment variable:

\`\`\`bash
VITE_API_BASE_URL=http://localhost:8080/api
\`\`\`

## 🌐 Internationalization

Hệ thống hỗ trợ đa ngôn ngữ:
- Tiếng Việt (mặc định)
- English

## 📱 Features by Role

### Admin/Manager
- ✅ Dashboard với KPI và charts
- ✅ Quản lý người dùng (CRUD)
- ✅ Quản lý khóa học
- ✅ Quản lý lớp học & xếp lịch
- ✅ CRM & Lead management với Kanban board
- ✅ Quản lý chi nhánh & phòng học

### Teacher
- ✅ Xem lịch dạy
- ✅ Điểm danh học viên
- ✅ Tạo và quản lý bài tập
- ✅ Chấm điểm & feedback
- ✅ Xem danh sách lớp phụ trách

### Student
- ✅ Dashboard với tiến độ học tập
- ✅ Xem lịch học
- ✅ Xem bảng điểm
- ✅ Quản lý học phí
- ✅ Tải tài liệu học tập

### Accountant
- ✅ Dashboard tài chính
- ✅ Quản lý hóa đơn
- ✅ Theo dõi doanh thu/chi phí
- ✅ Báo cáo tài chính với charts

## 🔐 Protected Routes

Hệ thống sử dụng Protected Routes để kiểm soát quyền truy cập:
- Routes yêu cầu authentication
- Routes yêu cầu specific roles
- Auto redirect khi không có quyền

## 📊 Charts & Visualization

Sử dụng Recharts cho:
- Revenue trend (Area Chart)
- Enrollment statistics (Bar Chart)
- Expense breakdown (Pie Chart)
- Monthly comparison charts

## 🚧 Lưu ý

- Đây là frontend application, cần kết nối với backend API để hoạt động đầy đủ
- Mock data được sử dụng cho demo
- API calls sẽ thất bại nếu không có backend, nhưng UI vẫn hiển thị với mock data

## 📝 License

Copyright © 2026 ELC English Center
