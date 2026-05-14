import '@fontsource/inter/400.css';
import '@fontsource/inter/500.css';
import '@fontsource/inter/600.css';
import '@fontsource/inter/700.css';
import '@fontsource/inter/800.css';

import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Provider } from 'react-redux';
import { ThemeProvider, createTheme, CssBaseline } from '@mui/material';
import { responsiveFontSizes } from '@mui/material/styles';
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

import PublicRoute from './components/PublicRoute';
import LoginPage from './pages/auth/LoginPage';
import RegisterPage from './pages/auth/RegisterPage';
import ForgotPasswordPage from './pages/auth/ForgotPasswordPage';

import ProfilePage from './pages/common/ProfilePage';
import RoleNotificationsPage from './pages/common/RoleNotificationsPage';

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
import StudentClassesPage from './pages/student/StudentClassesPage';
import GradebookPage from './pages/student/GradebookPage';
import PaymentPage from './pages/student/PaymentPage';
import StudentAssignmentsPage from './pages/student/StudentAssignmentsPage';
import StudentInvoicesPage from './pages/student/StudentInvoicesPage';

import FinanceDashboard from './pages/finance/FinanceDashboard';
import StudentDebtPage from './pages/finance/StudentDebtPage';
import TeacherPaymentsPage from './pages/finance/TeacherPaymentsPage';
import FinanceOperationsPage from './pages/finance/FinanceOperationsPage';
import { getDefaultRouteByRole } from './utils/roleRouting';

let theme = createTheme({
  palette: {
    primary: {
      main: '#8B5CF6',
      dark: '#7C3AED',
      light: '#A78BFA',
      contrastText: '#FFFFFF',
    },
    secondary: {
      main: '#F472B6',
      dark: '#DB2777',
      light: '#F9A8D4',
      contrastText: '#1E293B',
    },
    background: {
      default: '#FFFDF5',
      paper: '#ffffff',
    },
    text: {
      primary: '#1E293B',
      secondary: '#64748B',
    },
    divider: '#1E293B',
    warning: {
      main: '#FBBF24',
      contrastText: '#1E293B',
    },
    success: {
      main: '#34D399',
      contrastText: '#1E293B',
    },
    info: {
      main: '#38BDF8',
      contrastText: '#1E293B',
    },
  },
  shape: {
    borderRadius: 16,
  },
  typography: {
    fontFamily: '"Plus Jakarta Sans", "Inter", "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
    h1: { fontFamily: '"Outfit", "Plus Jakarta Sans", sans-serif', fontWeight: 900, letterSpacing: 0 },
    h2: { fontFamily: '"Outfit", "Plus Jakarta Sans", sans-serif', fontWeight: 900, letterSpacing: 0 },
    h3: { fontFamily: '"Outfit", "Plus Jakarta Sans", sans-serif', fontWeight: 900, letterSpacing: 0 },
    h4: { fontFamily: '"Outfit", "Plus Jakarta Sans", sans-serif', fontWeight: 800, letterSpacing: 0 },
    h5: { fontFamily: '"Outfit", "Plus Jakarta Sans", sans-serif', fontWeight: 800, letterSpacing: 0 },
    h6: { fontFamily: '"Outfit", "Plus Jakarta Sans", sans-serif', fontWeight: 800, letterSpacing: 0 },
    subtitle1: { fontWeight: 700 },
    subtitle2: { fontWeight: 700 },
    button: { fontWeight: 800, textTransform: 'none', letterSpacing: 0 },
  },
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        html: {
          WebkitFontSmoothing: 'antialiased',
          MozOsxFontSmoothing: 'grayscale',
          minHeight: '100%',
        },
        body: {
          background:
            'radial-gradient(circle at 12% 10%, rgba(251, 191, 36, 0.22), transparent 22rem), radial-gradient(circle at 90% 0%, rgba(139, 92, 246, 0.14), transparent 20rem), linear-gradient(180deg, #FFFDF5 0%, #FFF7DF 100%)',
          backgroundAttachment: 'fixed',
          color: '#1E293B',
        },
        '*': {
          boxSizing: 'border-box',
        },
        '::selection': {
          backgroundColor: '#FBBF24',
          color: '#1E293B',
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          border: '2px solid #1E293B',
          borderRadius: 24,
          boxShadow: '4px 4px 0 0 #1E293B',
          backgroundImage: 'none',
          overflow: 'hidden',
          transition: 'all 260ms cubic-bezier(0.34, 1.56, 0.64, 1)',
          '&:hover': {
            transform: 'translate(-2px, -2px)',
            boxShadow: '6px 6px 0 0 #1E293B',
          },
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundImage: 'none',
          borderRadius: 20,
        },
        elevation1: {
          border: '2px solid #1E293B',
          boxShadow: '4px 4px 0 0 #1E293B',
        },
        elevation2: {
          border: '2px solid #1E293B',
          boxShadow: '4px 4px 0 0 #1E293B',
        },
        elevation3: {
          border: '2px solid #1E293B',
          boxShadow: '6px 6px 0 0 #1E293B',
        },
        elevation4: {
          border: '2px solid #1E293B',
          boxShadow: '8px 8px 0 0 #1E293B',
        },
      },
    },
    MuiTab: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          fontWeight: 800,
          borderRadius: 999,
          minHeight: 42,
          color: '#1E293B',
          '&.Mui-selected': {
            backgroundColor: '#FBBF24',
            color: '#1E293B',
          },
        },
      },
    },
    MuiTabs: {
      styleOverrides: {
        root: {
          minHeight: 46,
          '& .MuiTabs-indicator': {
            display: 'none',
          },
        },
        flexContainer: {
          gap: 8,
        },
      },
    },
    MuiButton: {
      defaultProps: {
        disableElevation: true,
      },
      styleOverrides: {
        root: {
          borderRadius: 999,
          fontWeight: 800,
          minHeight: 42,
          transition: 'all 260ms cubic-bezier(0.34, 1.56, 0.64, 1)',
          '&:focus-visible': {
            outline: '3px solid rgba(139, 92, 246, 0.36)',
            outlineOffset: 2,
          },
        },
        contained: {
          border: '2px solid #1E293B',
          boxShadow: '4px 4px 0 0 #1E293B',
          '&:hover': {
            transform: 'translate(-2px, -2px)',
            boxShadow: '6px 6px 0 0 #1E293B',
          },
          '&:active': {
            transform: 'translate(2px, 2px)',
            boxShadow: '2px 2px 0 0 #1E293B',
          },
        },
        outlined: {
          border: '2px solid #1E293B',
          color: '#1E293B',
          backgroundColor: '#FFFFFF',
          '&:hover': {
            border: '2px solid #1E293B',
            backgroundColor: '#FBBF24',
          },
        },
        text: {
          color: '#1E293B',
          '&:hover': {
            backgroundColor: 'rgba(251, 191, 36, 0.28)',
          },
        },
      },
    },
    MuiIconButton: {
      styleOverrides: {
        root: {
          borderRadius: 14,
          transition: 'all 220ms cubic-bezier(0.34, 1.56, 0.64, 1)',
          '&:hover': {
            backgroundColor: '#FBBF24',
          },
          '&:focus-visible': {
            outline: '3px solid rgba(139, 92, 246, 0.36)',
            outlineOffset: 2,
          },
        },
      },
    },
    MuiTextField: {
      defaultProps: {
        variant: 'outlined',
      },
    },
    MuiOutlinedInput: {
      styleOverrides: {
        root: {
          backgroundColor: '#FFFFFF',
          borderRadius: 16,
          transition: 'all 220ms cubic-bezier(0.34, 1.56, 0.64, 1)',
          '& .MuiOutlinedInput-notchedOutline': {
            borderColor: '#CBD5E1',
            borderWidth: 2,
          },
          '&:hover .MuiOutlinedInput-notchedOutline': {
            borderColor: '#1E293B',
          },
          '&.Mui-focused': {
            boxShadow: '4px 4px 0 0 #8B5CF6',
            '& .MuiOutlinedInput-notchedOutline': {
              borderColor: '#8B5CF6',
            },
          },
        },
      },
    },
    MuiInputLabel: {
      styleOverrides: {
        root: {
          fontWeight: 800,
          color: '#64748B',
          '&.Mui-focused': {
            color: '#8B5CF6',
          },
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          borderRadius: 999,
          fontWeight: 800,
        },
        outlined: {
          borderWidth: 2,
          borderColor: '#1E293B',
        },
      },
    },
    MuiTableContainer: {
      styleOverrides: {
        root: {
          borderRadius: 20,
        },
      },
    },
    MuiTableCell: {
      styleOverrides: {
        head: {
          backgroundColor: '#FFF7DF',
          color: '#1E293B',
          fontWeight: 900,
          borderBottom: '2px solid #1E293B',
        },
        root: {
          borderBottomColor: '#E2E8F0',
        },
      },
    },
    MuiTableRow: {
      styleOverrides: {
        root: {
          '&:hover': {
            backgroundColor: 'rgba(251, 191, 36, 0.14)',
          },
        },
      },
    },
    MuiDialog: {
      styleOverrides: {
        paper: {
          border: '2px solid #1E293B',
          borderRadius: 24,
          boxShadow: '8px 8px 0 0 #1E293B',
          backgroundImage: 'none',
        },
      },
    },
    MuiDialogTitle: {
      styleOverrides: {
        root: {
          fontFamily: '"Outfit", "Plus Jakarta Sans", sans-serif',
          fontWeight: 900,
        },
      },
    },
    MuiAlert: {
      styleOverrides: {
        root: {
          border: '2px solid #1E293B',
          borderRadius: 16,
          boxShadow: '3px 3px 0 0 #1E293B',
          fontWeight: 700,
        },
      },
    },
    MuiAvatar: {
      styleOverrides: {
        root: {
          border: '2px solid #1E293B',
          fontWeight: 900,
        },
      },
    },
  },
});

theme = responsiveFontSizes(theme);

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

      <Route path="/login" element={<PublicRoute><LoginPage /></PublicRoute>} />
      <Route path="/register" element={<PublicRoute><RegisterPage /></PublicRoute>} />
      <Route path="/forgot-password" element={<PublicRoute><ForgotPasswordPage /></PublicRoute>} />

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
          path="/student/classes"
          element={
            <ProtectedRoute allowedRoles={['STUDENT']}>
              <StudentClassesPage />
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
        <Route path="/notifications" element={<RoleNotificationsPage />} />
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
