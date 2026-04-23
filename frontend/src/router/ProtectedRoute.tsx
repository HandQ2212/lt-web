import { Navigate, Outlet } from 'react-router-dom';
import { useSelector } from 'react-redux';
import type {  RootState  } from '../app/store';
import type {  Role  } from '../types';

interface ProtectedRouteProps {
  allowedRoles?: Role[];
}

const ProtectedRoute = ({ allowedRoles }: ProtectedRouteProps) => {
  const { isAuthenticated, user } = useSelector((state: RootState) => state.auth);

  if (!isAuthenticated) {
    // Redirect to login if not authenticated
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && user && !allowedRoles.includes(user.role)) {
    // Redirect to unauthorized or default dashboard if role doesn't match
    switch (user.role) {
      case 'MANAGER': return <Navigate to="/manager/dashboard" replace />;
      case 'TEACHER': return <Navigate to="/teacher/dashboard" replace />;
      case 'STUDENT': return <Navigate to="/student/dashboard" replace />;
      case 'ACCOUNTANT': return <Navigate to="/accountant/dashboard" replace />;
      default: return <Navigate to="/" replace />;
    }
  }

  // If authenticated and role matches (or no role required), render children via Outlet
  return <Outlet />;
};

export default ProtectedRoute;
