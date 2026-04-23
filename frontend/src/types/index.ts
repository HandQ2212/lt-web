export type Role = 'MANAGER' | 'TEACHER' | 'STUDENT' | 'ACCOUNTANT';

export interface User {
  id: string;
  email: string;
  fullName: string;
  role: Role;
  status: 'ACTIVE' | 'INACTIVE';
}

export interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}
