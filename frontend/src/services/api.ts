import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api';

export type UserRole = 'ADMIN' | 'MANAGER' | 'TEACHER' | 'STUDENT' | 'ACCOUNTANT' | 'LEAD';

export interface AppUser {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  status: 'ACTIVE' | 'INACTIVE';
  phone?: string;
}

export interface PageResponse<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  number: number;
  size: number;
}

type BackendUser = {
  id: string;
  email: string;
  fullName?: string;
  name?: string;
  role: UserRole;
  status?: 'ACTIVE' | 'INACTIVE';
  phone?: string;
};

const normalizeUser = (user: BackendUser): AppUser => ({
  id: user.id,
  email: user.email,
  name: user.fullName || user.name || user.email,
  role: user.role,
  status: user.status || 'ACTIVE',
  phone: user.phone,
});

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('refreshToken');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;

export const authApi = {
  login: async (email: string, password: string) => {
    const response = await api.post('/auth/login', { email, password });
    const data = response.data;
    return {
      token: data.accessToken,
      refreshToken: data.refreshToken,
      user: normalizeUser(data.user),
    };
  },
  register: (data: {
    email: string;
    password: string;
    fullName: string;
    phone?: string;
    branchId?: string;
  }) => api.post('/auth/register', data),
  logout: (refreshToken: string) => api.post('/auth/logout', { refreshToken }),
  forgotPassword: (email: string) => api.post('/auth/forgot-password', { email }),
  resetPassword: (token: string, newPassword: string) =>
    api.post('/auth/reset-password', { token, newPassword }),
  getProfile: async () => {
    const response = await api.get('/profile');
    return normalizeUser(response.data);
  },
  refresh: (refreshToken: string) => api.post('/auth/refresh', { refreshToken }),
};

export const courseApi = {
  getAll: async () => {
    const response = await api.get('/courses');
    return (response.data as any[]).map((course) => ({
      id: course.id,
      name: course.name,
      level: course.level,
      price: Number(course.basePrice || 0),
      status: 'ACTIVE',
      description: course.description,
      imageUrl: course.imageUrl,
    }));
  },
  getById: async (id: string) => {
    const response = await api.get(`/courses/${id}`);
    const course = response.data;
    return {
      id: course.id,
      name: course.name,
      level: course.level,
      price: Number(course.basePrice || 0),
      status: 'ACTIVE',
      description: course.description,
      imageUrl: course.imageUrl,
    };
  },
  create: (data: any) => api.post('/courses', data),
  update: (id: string, data: any) => api.put(`/courses/${id}`, data),
  delete: (id: string) => api.delete(`/courses/${id}`),
};

export const classApi = {
  getAll: async () => {
    const response = await api.get('/classes');
    return response.data;
  },
  getById: (id: string) => api.get(`/classes/${id}`),
  create: (data: any) => api.post('/classes', data),
  update: (id: string, data: any) => api.put(`/classes/${id}`, data),
  checkConflict: (data: any) => api.post('/classes/check-conflict', data),
  getSchedule: (id: string) => api.get(`/classes/${id}/schedule`),
  delete: (id: string) => api.delete(`/classes/${id}`),
  updateStatus: (id: string, status: string) => api.patch(`/classes/${id}/status`, { status }),
  addSchedule: (classId: string, schedule: any) => api.post(`/classes/${classId}/schedule`, schedule),
};

export const enrollmentApi = {
  getByClass: (classId: string) => api.get(`/enrollments/class/${classId}`),
  getByStudent: (studentId: string) => api.get(`/enrollments/student/${studentId}`),
  create: (data: any) => api.post('/enrollments', data),
  updateStatus: (id: string, status: string) => api.patch(`/enrollments/${id}/status`, { status }),
};

export const leadApi = {
  getAll: async (params?: any) => {
    const response = await api.get('/leads', { params });
    return response.data as PageResponse<any>;
  },
  create: (data: any) => api.post('/leads', data),
  updateStatus: (id: string, status: string) => api.put(`/leads/${id}/status`, { status }),
  convert: (id: string, payload: { email: string; password: string }) =>
    api.post(`/leads/${id}/convert`, payload),
};

export const userApi = {
  getAll: async (params?: any) => {
    const response = await api.get('/users', { params });
    const page = response.data as PageResponse<BackendUser>;
    return {
      ...page,
      content: page.content.map(normalizeUser),
    };
  },
  create: async (payload: {
    email: string;
    password: string;
    fullName: string;
    phone?: string;
    role: UserRole;
  }) => {
    const response = await api.post('/users', payload);
    return normalizeUser(response.data);
  },
  update: async (
    id: string,
    payload: { fullName?: string; phone?: string; role?: UserRole; status?: 'ACTIVE' | 'INACTIVE' }
  ) => {
    const response = await api.put(`/users/${id}`, payload);
    return normalizeUser(response.data);
  },
  deactivate: (id: string) => api.delete(`/users/${id}`),
};

export const profileApi = {
  update: async (payload: {
    fullName: string;
    phone?: string;
    dateOfBirth?: string;
    gender?: string;
    address?: string;
    avatarUrl?: string;
  }) => {
    const response = await api.put('/profile', payload);
    return normalizeUser(response.data);
  },
  changePassword: (payload: { oldPassword: string; newPassword: string }) =>
    api.put('/profile/password', payload),
};

export const attendanceApi = {
  getByClass: (classId: string) => api.get(`/attendance/${classId}`),
  submit: (data: any) => api.post('/attendance', data),
  getMonthlyReport: (params: any) => api.get('/attendance/report/monthly', { params }),
};

export const assignmentApi = {
  getByClass: (classId: string) => api.get(`/assignments/class/${classId}`),
  create: (data: any) => api.post('/assignments', data),
};

export const submissionApi = {
  submit: (data: any) => api.post('/submissions', data),
  grade: (id: string, score: number, feedback: string) =>
    api.put(`/submissions/${id}/grade`, { score, feedback }),
  getByAssignment: (assignmentId: string) =>
    api.get(`/submissions/assignment/${assignmentId}`),
};

export const transactionApi = {
  getAll: (params?: any) => api.get('/transactions', { params }),
  create: (data: any) => api.post('/transactions', data),
};

export const invoiceApi = {
  getAll: (params?: any) => api.get('/invoices', { params }),
  getDebt: () => api.get('/invoices/debt'),
  refund: (id: string) => api.post(`/invoices/${id}/refund`),
  create: (data: any) => api.post('/invoices', data),
  updateStatus: (id: string, status: string) => api.patch(`/invoices/${id}/status`, { status }),
};

export const notificationApi = {
  getAll: () => api.get('/notifications'),
  getUnreadCount: () => api.get('/notifications/unread-count'),
  markAsRead: (id: string) => api.put(`/notifications/${id}/read`),
  markAllAsRead: () => api.patch('/notifications/read-all'),
};

export const analyticsApi = {
  getBranchPerformance: () => api.get('/analytics/branch-performance'),
  getRevenue: (params?: any) => api.get('/analytics/revenue', { params }),
  getAcademic: () => api.get('/analytics/academic'),
  getDashboard: () => api.get('/analytics/dashboard'),
};

export const reportsApi = {
  getAll: (params?: any) => api.get('/reports', { params }),
};
