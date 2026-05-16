import axios from 'axios';

const API_BASE_URL = ((import.meta as any).env?.VITE_API_BASE_URL as string) || 'http://localhost:8080/api';

export type UserRole = 'MANAGER' | 'TEACHER' | 'STUDENT' | 'ACCOUNTANT' | 'LEAD';

export interface AppUser {
  id: string;
  email: string;
  fullName: string;
  role: UserRole;
  status: 'ACTIVE' | 'INACTIVE' | 'DEACTIVATED';
  phone?: string;
  avatarUrl?: string;
  address?: string;
  dateOfBirth?: string;
  gender?: string;
  branchId?: string;
}

export interface PublicTeacher {
  id: string;
  fullName: string;
  avatarUrl?: string;
  specialties: string[];
  activeClassCount: number;
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
  status?: 'ACTIVE' | 'INACTIVE' | 'DEACTIVATED';
  phone?: string;
  avatarUrl?: string;
  address?: string;
  dateOfBirth?: string;
  gender?: string;
  branchId?: string;
};

const normalizeUser = (user: BackendUser | null | undefined): AppUser => {
  if (!user) {
    return {
      id: '',
      email: '',
      fullName: 'Người dùng hệ thống',
      role: 'STUDENT',
      status: 'INACTIVE',
    };
  }
  return {
    id: user.id || '',
    email: user.email || '',
    fullName: user.fullName || user.name || user.email || 'Học viên',
    role: user.role || 'STUDENT',
    status: user.status || 'ACTIVE',
    phone: user.phone,
    avatarUrl: user.avatarUrl,
    address: user.address,
    dateOfBirth: user.dateOfBirth,
    gender: user.gender,
    branchId: user.branchId,
  };
};

const api = axios.create({
  baseURL: API_BASE_URL.endsWith('/') ? API_BASE_URL : `${API_BASE_URL}/`,
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
    const response = await api.post('auth/login', { email, password });
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
  refresh: (refreshToken: string) => api.post('auth/refresh', { refreshToken }),
};

export const courseApi = {
  getAll: async () => {
    const response = await api.get('courses');
    const list = Array.isArray(response.data) ? response.data : response.data?.content || response.data?.data || [];
    return list.map((course: any) => ({
      id: course.id,
      name: course.name,
      description: course.description,
      imageUrl: course.imageUrl,
      level: course.level,
      price: Number(course.price || 0),
      status: course.status,
      levels: Array.isArray(course.levels)
        ? course.levels.map((level: any) => ({
            id: level.id,
            code: level.code,
            name: level.name,
            basePrice: Number(level.basePrice || 0),
            durationWeeks: level.durationWeeks ?? null,
          }))
        : [],
    }));
  },
  getById: async (id: string) => {
    const response = await api.get(`courses/${id}`);
    const course = response.data;
    return {
      id: course.id,
      name: course.name,
      description: course.description,
      imageUrl: course.imageUrl,
      level: course.level,
      price: Number(course.price || 0),
      status: course.status,
      levels: Array.isArray(course.levels)
        ? course.levels.map((level: any) => ({
            id: level.id,
            code: level.code,
            name: level.name,
            basePrice: Number(level.basePrice || 0),
            durationWeeks: level.durationWeeks ?? null,
          }))
        : [],
    };
  },
  create: (data: any) => api.post('courses', data),
  update: (id: string, data: any) => api.put(`courses/${id}`, data),
  delete: (id: string) => api.delete(`courses/${id}`),
};

export const levelApi = {
  getAll: async () => {
    const response = await api.get('levels');
    const list = Array.isArray(response.data) ? response.data : response.data?.content || response.data?.data || [];
    return list.map((level: any) => ({
      id: level.id,
      courseId: level.courseId,
      courseName: level.courseName,
      code: level.code,
      name: level.name,
      description: level.description,
      displayOrder: level.displayOrder,
      basePrice: Number(level.basePrice || 0),
      durationWeeks: level.durationWeeks ?? null,
      isActive: Boolean(level.isActive),
      createdAt: level.createdAt,
    }));
  },
  getById: async (id: string) => {
    const response = await api.get(`levels/${id}`);
    const level = response.data;
    return {
      id: level.id,
      courseId: level.courseId,
      courseName: level.courseName,
      code: level.code,
      name: level.name,
      description: level.description,
      displayOrder: level.displayOrder,
      basePrice: Number(level.basePrice || 0),
      durationWeeks: level.durationWeeks ?? null,
      isActive: Boolean(level.isActive),
      createdAt: level.createdAt,
    };
  },
  create: (data: any) => api.post('levels', data),
  update: (id: string, data: any) => api.put(`levels/${id}`, data),
  delete: (id: string) => api.delete(`levels/${id}`),
};

export const branchApi = {
  getAll: async () => {
    const response = await api.get('branches');
    return Array.isArray(response.data) ? response.data : response.data?.content || response.data?.data || [];
  },
};

export const roomApi = {
  getAll: async () => {
    const response = await api.get('rooms');
    return Array.isArray(response.data) ? response.data : response.data?.content || response.data?.data || [];
  },
};

export const classApi = {
  getAll: async () => {
    const response = await api.get('classes');
    return Array.isArray(response.data) ? response.data : response.data?.content || response.data?.data || [];
  },
  getById: (id: string) => api.get(`classes/${id}`),
  create: (data: any) => api.post('classes', data),
  update: (id: string, data: any) => api.put(`classes/${id}`, data),
  checkConflict: (data: any) => api.post('classes/check-conflict', data),
  getSchedule: (id: string) => api.get(`classes/${id}/schedule`),
  delete: (id: string) => api.delete(`classes/${id}`),
  updateStatus: (id: string, status: string) =>
    api.patch(`classes/${id}/status`, null, { params: { status } }),
  addSchedule: (classId: string, schedule: any) => api.post(`classes/${classId}/schedule`, schedule),
  updateSchedule: (classId: string, scheduleId: string, schedule: any) =>
    api.put(`classes/${classId}/schedule/${scheduleId}`, schedule),
  deleteSchedule: (classId: string, scheduleId: string) =>
    api.delete(`classes/${classId}/schedule/${scheduleId}`),
};

export const enrollmentApi = {
  getByClass: (classId: string) => api.get(`enrollments/class/${classId}`),
  getByStudent: (studentId: string) => api.get(`enrollments/student/${studentId}`),
  create: (data: any) => api.post('enrollments', data),
  updateStatus: (id: string, status: string) =>
    api.patch(`enrollments/${id}/status`, null, { params: { status } }),
  transferClass: (id: string, targetClassId: string) =>
    api.patch(`enrollments/${id}/class`, { targetClassId }),
};

export const resultApi = {
  getByEnrollment: (enrollmentId: string) => api.get(`results/enrollment/${enrollmentId}`),
};

export const leadApi = {
  getAll: async (params?: any) => {
    const response = await api.get('leads', { params });
    return response.data as PageResponse<any>;
  },
  getMine: async () => {
    const response = await api.get('leads/me');
    return response.data;
  },
  create: (data: any) => api.post('leads', data),
  addMyInterests: async (payload: { courseIds: string[]; notes?: string }) => {
    const response = await api.post('leads/me/interests', payload);
    return response.data;
  },
  updateStatus: (id: string, status: string) => api.put(`leads/${id}/status`, { status }),
  convert: (id: string) => api.post(`leads/${id}/convert`),
  moveToConsulting: (id: string) => api.post(`leads/${id}/consulting`),
  agree: (id: string, classId: string) => api.post(`leads/${id}/agree`, null, { params: { classId } }),
  reject: (id: string) => api.post(`leads/${id}/reject`),
  confirmCash: async (id: string) => {
    const response = await api.post(`leads/${id}/confirm-cash`);
    return response.data;
  },
  interestClass: (classId: string, notes?: string) => api.post('leads/me/interest-class', null, { params: { classId, notes } }),
  publicSubmit: (data: any) => api.post('public/leads', data),
};

export const userApi = {
  getAll: async (params?: any) => {
    const response = await api.get('users', { params });
    const raw = response.data;
    // Handle both paginated ({content:[], page:{}}}) and flat array responses
    const content = Array.isArray(raw) ? raw : (raw?.content ?? []);
    const normalized = content.map(normalizeUser);
    return {
      content: normalized,
      totalElements: raw?.totalElements ?? raw?.page?.totalElements ?? normalized.length,
      totalPages: raw?.totalPages ?? raw?.page?.totalPages ?? 1,
      number: raw?.number ?? raw?.page?.number ?? 0,
      size: raw?.size ?? raw?.page?.size ?? normalized.length,
    };
  },
  create: async (payload: {
    email: string;
    password: string;
    fullName: string;
    phone?: string;
    role: UserRole;
  }) => {
    const response = await api.post('users', payload);
    return normalizeUser(response.data);
  },
  update: async (
    id: string,
    payload: { fullName?: string; phone?: string; role?: UserRole; status?: 'ACTIVE' | 'INACTIVE' | 'DEACTIVATED'; avatarUrl?: string; address?: string; dateOfBirth?: string; gender?: string }
  ) => {
    const response = await api.put(`users/${id}`, payload);
    return normalizeUser(response.data);
  },
  deactivate: (id: string) => api.delete(`users/${id}`),
  getTeachers: async () => {
    const response = await api.get('users/teachers');
    return (response.data as BackendUser[]).map(normalizeUser);
  },
};

export const publicTeacherApi = {
  getAll: async (): Promise<PublicTeacher[]> => {
    const response = await api.get('public/teachers');
    const raw = Array.isArray(response.data) ? response.data : response.data?.content || response.data?.data || [];
    return raw.map((teacher: any) => ({
      id: teacher.id || '',
      fullName: teacher.fullName || 'Giảng viên',
      avatarUrl: teacher.avatarUrl,
      specialties: Array.isArray(teacher.specialties) ? teacher.specialties : [],
      activeClassCount: Number(teacher.activeClassCount || 0),
    }));
  },
};

export const profileApi = {
  update: async (payload: {
    fullName: string;
    phone?: string;
    dateOfBirth?: string;
    gender?: string;
    address?: string;
    avatarUrl?: string;
  } | {
    fullName?: string;
    phone?: string;
    dateOfBirth?: string;
    gender?: string;
    address?: string;
    avatarUrl?: string;
  }) => {
    const response = await api.put('profile', payload);
    return normalizeUser(response.data);
  },
  changePassword: (payload: { oldPassword: string; newPassword: string }) =>
    api.put('profile/password', payload),
};

export const attendanceApi = {
  getByClass: (classId: string, date?: string) => api.get(`attendance/${classId}`, { params: date ? { date } : undefined }),
  submit: (data: any) => api.post('attendance', data),
  getMonthlyReport: (params: any) => api.get('attendance/report/monthly', { params }),
  getByEnrollment: (enrollmentId: string) => api.get(`attendance/enrollment/${enrollmentId}`),
};

export const assignmentApi = {
  getByClass: (classId: string) => api.get(`assignments/class/${classId}`),
  create: (data: any) => api.post('assignments', data),
};

export const submissionApi = {
  submit: (data: any) => api.post('submissions/submit', data),
  grade: (id: string, score: number, feedback: string) =>
    api.put(`submissions/${id}/grade`, { grade: score, feedback }),
  getByAssignment: (assignmentId: string) =>
    api.get(`submissions/assignment/${assignmentId}`),
  getMine: () => api.get('submissions/me'),
};

export const transactionApi = {
  getAll: (params?: any) => api.get('transactions', { params }),
  create: (data: any) => api.post('transactions', data),
};

export const invoiceApi = {
  getAll: (params?: any) => api.get('invoices', { params }),
  getById: async (id: string) => {
    const response = await api.get(`invoices/${id}`);
    return response.data;
  },
  getDebt: () => api.get('invoices/debt'),
  refund: (id: string, payload: { amount: number; reason?: string }) =>
    api.post(`invoices/${id}/refund`, payload),
  create: (data: any) => api.post('invoices', data),
  delete: (id: string) => api.delete(`invoices/${id}`),
  updateStatus: (id: string, status: string) =>
    api.patch(`invoices/${id}/status`, null, { params: { status } }),
};

export const paymentApi = {
  getAll: (params?: any) => api.get('transactions', { params }),
  getByInvoice: (invoiceId: string) => api.get(`payments/invoice/${invoiceId}`),
  create: (payload: {
    invoiceId: string;
    amount: number;
    paymentMethod: 'CASH' | 'BANK_TRANSFER' | 'CREDIT_CARD' | 'MOMO' | 'VN_PAY';
    paymentDate?: string;
    transactionId?: string;
    notes?: string;
  }) => api.post('payments', payload),
  createPayosLink: (payload: { amount: number; invoiceId: string }) => api.post('v1/payment/create-link', payload),
};

export const expenseApi = {
  getAll: (params?: any) => api.get('expenses', { params }),
  create: (payload: {
    category: string;
    amount: number;
    expenseDate?: string;
    vendor?: string;
    receiptUrl?: string;
    notes?: string;
  }) => api.post('expenses', payload),
};

export const notificationApi = {
  getAll: async () => {
    const response = await api.get('notifications');
    return {
      ...response,
      data: Array.isArray(response.data) ? response.data : response.data?.content || [],
    };
  },
  getUnreadCount: () => api.get('notifications/unread-count'),
  markAsRead: (id: string) => api.put(`notifications/${id}/read`),
  markAllAsRead: () => api.patch('notifications/read-all'),
};

export const announcementApi = {
  getAll: async (params?: any): Promise<any[]> => {
    const response = await api.get('announcements', { params });
    const raw = response.data;
    // Always return a flat array regardless of paginated or direct response
    return Array.isArray(raw) ? raw : (raw?.content ?? raw?.data ?? []);
  },
  getSent: async (params?: any): Promise<any[]> => {
    const response = await api.get('announcements/sent', { params });
    const raw = response.data;
    return Array.isArray(raw) ? raw : (raw?.content ?? raw?.data ?? []);
  },
  create: (payload: any) => api.post('announcements', payload),
  delete: (id: string) => api.delete(`announcements/${id}`),
};

export const analyticsApi = {
  getBranchPerformance: () => api.get('analytics/branch-performance'),
  getRevenue: (params?: any) => api.get('analytics/revenue', { params }),
  getAcademic: () => api.get('analytics/academic'),
  getDashboard: async () => {
    const response = await api.get('analytics/dashboard');
    return response.data;
  },
};

export const reportsApi = {
  getRevenue: () => api.get('reports/revenue'),
  getExpenses: () => api.get('reports/expenses'),
  getProfitLoss: () => api.get('reports/profit-loss'),
  getConversion: () => api.get('reports/conversion'),
  getTopCourses: () => api.get('reports/top-courses'),
  getChurnRate: () => api.get('reports/churn-rate'),
};
