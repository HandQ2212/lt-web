export interface Course {
  id: string;
  name: string;
  level: 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED';
  price: number;
  status: 'ACTIVE' | 'INACTIVE';
  description?: string;
  duration?: string;
  imageUrl?: string;
}

export interface Clazz {
  id: string;
  courseId: string;
  teacherId: string;
  roomId: string;
  schedule: Array<{ dayOfWeek: string; startTime: string; endTime: string }>;
  status: 'ACCEPTING' | 'UPCOMING' | 'ONGOING' | 'COMPLETED' | 'CANCELLED' | 'FULL' | 'CLOSED';
  name?: string;
  startDate?: string;
  endDate?: string;
}

export interface Transaction {
  id: string;
  studentId: string;
  amount: number;
  type: 'COURSE_FEE' | 'SALARY' | 'EXPENSE';
  status: 'PENDING' | 'CONFIRMED' | 'FAILED';
  date: string;
  description?: string;
}

export interface Lead {
  id: string;
  name: string;
  email: string;
  phone: string;
  status: 'NEW' | 'CONTACTED' | 'INTERESTED' | 'CONVERTED' | 'ENROLLED' | 'REJECTED';
  consultations: Consultation[];
  createdAt?: string;
}

export interface Consultation {
  id: string;
  leadId: string;
  consultantId: string;
  notes: string;
  date: string;
  outcome?: string;
}

export interface User {
  id: string;
  email: string;
  name: string;
  role: 'MANAGER' | 'TEACHER' | 'STUDENT' | 'ACCOUNTANT' | 'LEAD';
  status: 'ACTIVE' | 'INACTIVE';
  avatar?: string;
  phone?: string;
}

export interface Attendance {
  id: string;
  classId: string;
  studentId: string;
  date: string;
  status: 'PRESENT' | 'ABSENT' | 'LATE';
  notes?: string;
}

export interface Assignment {
  id: string;
  classId: string;
  title: string;
  description: string;
  deadline: string;
  maxScore: number;
  createdAt: string;
}

export interface Submission {
  id: string;
  assignmentId: string;
  studentId: string;
  content: string;
  submittedAt: string;
  score?: number;
  feedback?: string;
  status: 'SUBMITTED' | 'GRADED' | 'LATE';
}

export interface Enrollment {
  id: string;
  studentId: string;
  classId: string;
  status: 'ACTIVE' | 'COMPLETED' | 'DROPPED';
  enrolledAt: string;
  progress?: number;
}

export interface Branch {
  id: string;
  name: string;
  address: string;
  phone: string;
  status: 'ACTIVE' | 'INACTIVE';
}

export interface Room {
  id: string;
  branchId: string;
  name: string;
  capacity: number;
  status: 'AVAILABLE' | 'OCCUPIED' | 'MAINTENANCE';
}

export interface Invoice {
  id: string;
  studentId: string;
  amount: number;
  dueDate: string;
  paidDate?: string;
  status: 'PENDING' | 'PAID' | 'OVERDUE' | 'REFUNDED';
}

export interface Announcement {
  id: string;
  title: string;
  content: string;
  targetRole?: string;
  createdAt: string;
  createdBy: string;
}

export interface Notification {
  id: string;
  userId: string;
  title: string;
  message: string;
  read: boolean;
  createdAt: string;
  type: 'INFO' | 'WARNING' | 'SUCCESS' | 'ERROR';
}
