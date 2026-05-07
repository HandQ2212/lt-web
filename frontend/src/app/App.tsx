import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Provider } from 'react-redux';
import { ThemeProvider, createTheme, CssBaseline } from '@mui/material';
import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { store } from '../store';
import { RootState } from '../store';
import { I18nextProvider } from 'react-i18next';
import i18n from '../i18n';
import { authApi } from '../services/api';
import { logout, setCurrentUser } from '../store/slices/authSlice';

import PublicLayout from './components/layouts/PublicLayout';
import DashboardLayout from './components/layouts/DashboardLayout';
import ProtectedRoute from './components/ProtectedRoute';

import LandingPage from './pages/public/LandingPage';
import CourseListPage from './pages/public/CourseListPage';
import CourseDetailPage from './pages/public/CourseDetailPage';
import ContactPage from './pages/public/ContactPage';
import TeachersPage from './pages/public/TeachersPage';

import LoginPage from './pages/auth/LoginPage';
import RegisterPage from './pages/auth/RegisterPage';
import ForgotPasswordPage from './pages/auth/ForgotPasswordPage';

import ProfilePage from './pages/common/ProfilePage';

import AdminDashboard from './pages/admin/AdminDashboard';
import UserManagementPage from './pages/admin/UserManagementPage';
import ClassManagementPage from './pages/admin/ClassManagementPage';
import LeadManagementPage from './pages/admin/LeadManagementPage';
import TeacherManagementPage from './pages/admin/TeacherManagementPage';
import StudentManagementPage from './pages/admin/StudentManagementPage';
import AccountantManagementPage from './pages/admin/AccountantManagementPage';
import NotificationManagementPage from './pages/admin/NotificationManagementPage';
import ProgramManagementPage from './pages/admin/ProgramManagementPage';

import TeacherSchedulePage from './pages/teacher/TeacherSchedulePage';
import TeacherClassesPage from './pages/teacher/TeacherClassesPage';
import AttendancePage from './pages/teacher/AttendancePage';
import AssignmentPage from './pages/teacher/AssignmentPage';

import StudentDashboard from './pages/student/StudentDashboard';
import GradebookPage from './pages/student/GradebookPage';
import PaymentPage from './pages/student/PaymentPage';
import StudentAssignmentsPage from './pages/student/StudentAssignmentsPage';
import StudentInvoicesPage from './pages/student/StudentInvoicesPage';

import FinanceDashboard from './pages/finance/FinanceDashboard';
import StudentDebtPage from './pages/finance/StudentDebtPage';
import TeacherPaymentsPage from './pages/finance/TeacherPaymentsPage';
import FinanceOperationsPage from './pages/finance/FinanceOperationsPage';
import { getDefaultRouteByRole } from './utils/roleRouting';

const theme = createTheme({
  palette: {
    primary: {
      main: '#1976d2',
    },
    secondary: {
      main: '#4caf50',
    },
  },
  typography: {
    fontFamily: 'Inter, Roboto, sans-serif',
  },
});

export default function App() {
  return (
    <Provider store={store}>
      <I18nextProvider i18n={i18n}>
        <ThemeProvider theme={theme}>
          <CssBaseline />
          <BrowserRouter>
            <AppRoutes />
          </BrowserRouter>
        </ThemeProvider>
      </I18nextProvider>
    </Provider>
  );
}

function AppRoutes() {
  const dispatch = useDispatch();
  const { token, user } = useSelector((state: RootState) => state.auth);

  useEffect(() => {
    if (!token || user) {
      return;
    }

    authApi
      .getProfile()
      .then((profile) => {
        dispatch(setCurrentUser(profile));
      })
      .catch(() => {
        dispatch(logout());
      });
  }, [token, user, dispatch]);

  return (
    <Routes>
              <Route element={<PublicLayout />}>
                <Route path="/" element={<LandingPage />} />
                <Route path="/courses" element={<CourseListPage />} />
                <Route path="/courses/:id" element={<CourseDetailPage />} />
                <Route path="/teachers" element={<TeachersPage />} />
                <Route path="/contact" element={<ContactPage />} />
              </Route>

              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />
              <Route path="/forgot-password" element={<ForgotPasswordPage />} />

              <Route
                element={
                  <ProtectedRoute>
                    <DashboardLayout />
                  </ProtectedRoute>
                }
              >
                <Route
                  path="/dashboard"
                  element={<Navigate to={getDefaultRouteByRole(user?.role)} replace />}
                />

                <Route
                  path="/admin/dashboard"
                  element={
                    <ProtectedRoute allowedRoles={['MANAGER']}>
                      <AdminDashboard />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/admin/users"
                  element={
                    <ProtectedRoute allowedRoles={['MANAGER']}>
                      <UserManagementPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/admin/classes"
                  element={
                    <ProtectedRoute allowedRoles={['MANAGER']}>
                      <ClassManagementPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/admin/leads"
                  element={
                    <ProtectedRoute allowedRoles={['MANAGER', 'ACCOUNTANT']}>
                      <LeadManagementPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/admin/teachers"
                  element={
                    <ProtectedRoute allowedRoles={['MANAGER']}>
                      <TeacherManagementPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/admin/students"
                  element={
                    <ProtectedRoute allowedRoles={['MANAGER']}>
                      <StudentManagementPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/admin/accountants"
                  element={
                    <ProtectedRoute allowedRoles={['MANAGER']}>
                      <AccountantManagementPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/admin/notifications"
                  element={
                    <ProtectedRoute allowedRoles={['MANAGER']}>
                      <NotificationManagementPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/admin/programs"
                  element={
                    <ProtectedRoute allowedRoles={['MANAGER']}>
                      <ProgramManagementPage />
                    </ProtectedRoute>
                  }
                />

                <Route
                  path="/teacher/schedule"
                  element={
                    <ProtectedRoute allowedRoles={['TEACHER']}>
                      <TeacherSchedulePage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/teacher/classes"
                  element={
                    <ProtectedRoute allowedRoles={['TEACHER']}>
                      <TeacherClassesPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/teacher/attendance"
                  element={
                    <ProtectedRoute allowedRoles={['TEACHER']}>
                      <AttendancePage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/teacher/assignments"
                  element={
                    <ProtectedRoute allowedRoles={['TEACHER']}>
                      <AssignmentPage />
                    </ProtectedRoute>
                  }
                />

                <Route
                  path="/student/courses"
                  element={
                    <ProtectedRoute allowedRoles={['STUDENT']}>
                      <StudentDashboard />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/student/grades"
                  element={
                    <ProtectedRoute allowedRoles={['STUDENT']}>
                      <GradebookPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/student/payments"
                  element={
                    <ProtectedRoute allowedRoles={['STUDENT', 'LEAD']}>
                      <PaymentPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/student/assignments"
                  element={
                    <ProtectedRoute allowedRoles={['STUDENT']}>
                      <StudentAssignmentsPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/student/invoices"
                  element={
                    <ProtectedRoute allowedRoles={['STUDENT']}>
                      <StudentInvoicesPage />
                    </ProtectedRoute>
                  }
                />

                <Route
                  path="/finance/dashboard"
                  element={
                    <ProtectedRoute allowedRoles={['ACCOUNTANT']}>
                      <FinanceDashboard />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/finance/debts"
                  element={
                    <ProtectedRoute allowedRoles={['ACCOUNTANT']}>
                      <StudentDebtPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/finance/teacher-payments"
                  element={
                    <ProtectedRoute allowedRoles={['ACCOUNTANT']}>
                      <TeacherPaymentsPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/finance/operations"
                  element={
                    <ProtectedRoute allowedRoles={['ACCOUNTANT']}>
                      <FinanceOperationsPage />
                    </ProtectedRoute>
                  }
                />

                <Route path="/profile" element={<ProfilePage />} />
              </Route>

              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
  );
}
