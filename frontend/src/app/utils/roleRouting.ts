import { User } from '../../types';

export function getDefaultRouteByRole(role?: User['role']): string {
  switch (role) {
    case 'ADMIN':
    case 'MANAGER':
      return '/admin/dashboard';
    case 'TEACHER':
      return '/teacher/schedule';
    case 'STUDENT':
      return '/student/courses';
    case 'ACCOUNTANT':
      return '/finance/dashboard';
    case 'LEAD':
      return '/profile';
    default:
      return '/';
  }
}
