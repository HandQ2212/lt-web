import { createBrowserRouter, Navigate } from 'react-router-dom';
import AppLayout from '../components/layout/AppLayout';
import PublicLayout from '../components/layout/PublicLayout';
import ProtectedRoute from './ProtectedRoute';

// --- Public Pages ---
import LandingPage from '../pages/public/LandingPage';
import CourseCatalog from '../pages/public/CourseCatalog';
import CourseDetail from '../pages/public/CourseDetail';
import Registration from '../pages/public/Registration';

// --- Auth Pages ---
import LoginPage from '../pages/auth/LoginPage';
import ForgotPasswordPage from '../pages/auth/ForgotPasswordPage';
import ResetPasswordPage from '../pages/auth/ResetPasswordPage';

// --- Manager Pages ---
import ManagerDashboard from '../pages/manager/ManagerDashboard';
import UserManagement from '../pages/manager/UserManagement';
import CourseManagement from '../pages/manager/CourseManagement';
import ClassManagement from '../pages/manager/ClassManagement';
import LeadPipeline from '../pages/manager/LeadPipeline';

// --- Teacher Pages ---
import TeacherDashboard from '../pages/teacher/TeacherDashboard';
import MyClasses from '../pages/teacher/MyClasses';
import Attendance from '../pages/teacher/Attendance';
import AssignmentManager from '../pages/teacher/AssignmentManager';

// --- Student Pages ---
import StudentDashboard from '../pages/student/StudentDashboard';
import MySchedule from '../pages/student/MySchedule';
import Gradebook from '../pages/student/Gradebook';
import StudentInvoices from '../pages/student/StudentInvoices';

// --- Accountant Pages ---
import FinanceDashboard from '../pages/accountant/FinanceDashboard';
import InvoiceManagement from '../pages/accountant/InvoiceManagement';
import Payroll from '../pages/accountant/Payroll';
import Expenses from '../pages/accountant/Expenses';

export const router = createBrowserRouter([
  {
    path: '/',
    element: <PublicLayout />,
    children: [
      { index: true, element: <LandingPage /> },
      { path: 'courses', element: <CourseCatalog /> },
      { path: 'courses/:id', element: <CourseDetail /> },
      { path: 'register', element: <Registration /> },
      { path: 'login', element: <LoginPage /> },
      { path: 'forgot-password', element: <ForgotPasswordPage /> },
      { path: 'reset-password', element: <ResetPasswordPage /> },
    ],
  },
  {
    path: '/',
    element: <ProtectedRoute />, // Base protection (must be logged in)
    children: [
      {
        path: 'manager',
        element: <ProtectedRoute allowedRoles={['MANAGER']} />,
        children: [
          {
            element: <AppLayout />,
            children: [
              { path: 'dashboard', element: <ManagerDashboard /> },
              { path: 'users', element: <UserManagement /> },
              { path: 'courses', element: <CourseManagement /> },
              { path: 'classes', element: <ClassManagement /> },
              { path: 'crm', element: <LeadPipeline /> },
              { index: true, element: <Navigate to="dashboard" replace /> }
            ]
          }
        ]
      },
      {
        path: 'teacher',
        element: <ProtectedRoute allowedRoles={['TEACHER']} />,
        children: [
          {
            element: <AppLayout />,
            children: [
              { path: 'dashboard', element: <TeacherDashboard /> },
              { path: 'classes', element: <MyClasses /> },
          { path: 'attendance', element: <Attendance /> },
          { path: 'assignments', element: <AssignmentManager /> },
              { index: true, element: <Navigate to="dashboard" replace /> }
            ]
          }
        ]
      },
      {
        path: 'student',
        element: <ProtectedRoute allowedRoles={['STUDENT']} />,
        children: [
          {
            element: <AppLayout />,
            children: [
              { path: 'dashboard', element: <StudentDashboard /> },
              { path: 'schedule', element: <MySchedule /> },
          { path: 'gradebook', element: <Gradebook /> },
          { path: 'invoices', element: <StudentInvoices /> },
              { index: true, element: <Navigate to="dashboard" replace /> }
            ]
          }
        ]
      },
      {
        path: 'accountant',
        element: <ProtectedRoute allowedRoles={['ACCOUNTANT']} />,
        children: [
          {
            element: <AppLayout />,
            children: [
              { path: 'dashboard', element: <FinanceDashboard /> },
              { path: 'invoices', element: <InvoiceManagement /> },
          { path: 'payroll', element: <Payroll /> },
          { path: 'expenses', element: <Expenses /> },
              { index: true, element: <Navigate to="dashboard" replace /> }
            ]
          }
        ]
      }
    ]
  },
  {
    path: '*',
    element: <Navigate to="/" replace />
  }
]);
