import { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  Alert,
  Avatar,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  Grid,
  IconButton,
  LinearProgress,
  MenuItem,
  Paper,
  Snackbar,
  Stack,
  Tab,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Tabs,
  TextField,
  Typography,
  useTheme,
  useMediaQuery,
} from '@mui/material';
import {
  Add as AddIcon,
  Delete as DeleteIcon,
  Edit as EditIcon,
  ExpandMore as ExpandMoreIcon,
  EventBusy as EventBusyIcon,
  Search as SearchIcon,
  People as PeopleIcon,
  School as SchoolIcon,
} from '@mui/icons-material';
import { branchApi, classApi, courseApi, enrollmentApi, roomApi, userApi, attendanceApi, resultApi } from '../../../services/api';
import { formatDateToDDMMYYYY, formatTimeToHHMM } from '../../utils/dateFormatter';

type ClassItem = {
  id: string;
  name?: string;
  status?: string;
  startDate?: string;
  endDate?: string;
  maxStudents?: number;
  currentStudents?: number;
  courseName?: string;
  roomName?: string;
  teacherName?: string;
  schedules?: Array<{ id?: string; dayOfWeek: string; startTime: string; endTime: string }>;
};

type EnrollmentItem = {
  id: string;
  studentId: string;
  studentName: string;
  classId: string;
  className: string;
  enrollmentDate?: string;
  status?: string;
};

type AttendanceItem = {
  id: string;
  enrollmentId: string;
  studentName: string;
  attendanceDate: string;
  status: string;
  notes?: string;
};

type StudentReport = {
  studentName?: string;
  className?: string;
  attendanceRate?: number;
  totalSessions?: number;
  presentCount?: number;
  absentCount?: number;
  excusedCount?: number;
  lateCount?: number;
  dailyRecords?: Array<{ date: string; status: string; notes?: string }>;
};

type ClassForm = {
  name: string;
  courseId: string;
  roomId: string;
  teacherId: string;
  branchId: string;
  startDate: string;
  endDate: string;
  maxStudents: string;
  status: string;
};

type ScheduleForm = {
  dayOfWeek: string;
  startTime: string;
  endTime: string;
};

type ScheduleSessionRow = {
  key: string;
  sortTime: number;
  dateLabel: string;
  timeLabel: string;
  roomLabel: string;
  formatLabel: string;
  attendanceLabel: string;
  teacherLabel: string;
  titleLabel: string;
  materialLabel: string;
  scheduleId?: string;
  dayOfWeek?: string;
  startTime?: string;
  endTime?: string;
};

const defaultForm: ClassForm = {
  name: '',
  courseId: '',
  roomId: '',
  teacherId: '',
  branchId: '',
  startDate: '',
  endDate: '',
  maxStudents: '15',
  status: 'UPCOMING',
};

const defaultScheduleForm: ScheduleForm = {
  dayOfWeek: 'MONDAY',
  startTime: '18:00',
  endTime: '20:00',
};

const statusOrder = ['UPCOMING', 'ACCEPTING', 'ONGOING', 'COMPLETED'];

const dayOfWeekIndexMap: Record<string, number> = {
  SUNDAY: 0,
  MONDAY: 1,
  TUESDAY: 2,
  WEDNESDAY: 3,
  THURSDAY: 4,
  FRIDAY: 5,
  SATURDAY: 6,
};

const dayOfWeekLabelMap: Record<string, string> = {
  SUNDAY: 'Chủ Nhật',
  MONDAY: 'Thứ Hai',
  TUESDAY: 'Thứ Ba',
  WEDNESDAY: 'Thứ Tư',
  THURSDAY: 'Thứ Năm',
  FRIDAY: 'Thứ Sáu',
  SATURDAY: 'Thứ Bảy',
};

const formatSessionDateLabel = (date: Date) => {
  const raw = date.toLocaleDateString('vi-VN', {
    weekday: 'long',
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });

  return raw.charAt(0).toUpperCase() + raw.slice(1);
};

export default function ClassManagementPage() {
  const [searchParams] = useSearchParams();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const [classes, setClasses] = useState<ClassItem[]>([]);
  const [searchQuery, setSearchQuery] = useState(() => searchParams.get('course') || '');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [courseFilter, setCourseFilter] = useState<string>('ALL');
  const [sortBy, setSortBy] = useState<string>('START_DATE');

  const [statusDialogOpen, setStatusDialogOpen] = useState<boolean>(false);
  const [targetClassForStatus, setTargetClassForStatus] = useState<ClassItem | null>(null);
  const [selectedNewStatus, setSelectedNewStatus] = useState<string>('');
  const [courses, setCourses] = useState<any[]>([]);
  const [teachers, setTeachers] = useState<any[]>([]);
  const [rooms, setRooms] = useState<any[]>([]);
  const [branches, setBranches] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [openDialog, setOpenDialog] = useState(false);
  const [form, setForm] = useState<ClassForm>(defaultForm);
  const [selectedClass, setSelectedClass] = useState<ClassItem | null>(null);
  const [detailTab, setDetailTab] = useState(0);
  const [detailLoading, setDetailLoading] = useState(false);
  const [enrollments, setEnrollments] = useState<EnrollmentItem[]>([]);
  const [attendance, setAttendance] = useState<AttendanceItem[]>([]);
  const [studentReport, setStudentReport] = useState<StudentReport | null>(null);
  const [studentDialogOpen, setStudentDialogOpen] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<EnrollmentItem | null>(null);
  const [scheduleDialog, setScheduleDialog] = useState<{ open: boolean; classId: string; scheduleId?: string }>({
    open: false,
    classId: '',
  });
  const [scheduleForm, setScheduleForm] = useState<ScheduleForm>(defaultScheduleForm);
  const [scheduleSubmitting, setScheduleSubmitting] = useState(false);
  const [scheduleMode, setScheduleMode] = useState<'create' | 'edit'>('create');
  const [snackbar, setSnackbar] = useState<{ open: boolean; message: string; severity: 'success' | 'error' }>({
    open: false,
    message: '',
    severity: 'success',
  });

  const selectedClassId = selectedClass?.id;
  const todayIso = new Date().toISOString().slice(0, 10);

  useEffect(() => {
    void fetchClasses();
    void fetchOptions();
  }, []);

  useEffect(() => {
    const courseQuery = searchParams.get('course');
    if (courseQuery !== null) {
      setSearchQuery(courseQuery);
      if (courseQuery && courseFilter === 'ALL') {
        // Option to pre-select course filter if exact match or keep search query
      }
    }
  }, [searchParams]);

  useEffect(() => {
    if (selectedClassId) {
      void fetchClassDetails(selectedClassId);
    }
  }, [selectedClassId]);

  const fetchClasses = async () => {
    try {
      setLoading(true);
      const data = await classApi.getAll();
      setClasses(Array.isArray(data) ? data : []);
    } catch (error: any) {
      setSnackbar({
        open: true,
        message: error?.response?.data?.message || 'Không thể tải danh sách lớp học',
        severity: 'error',
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchOptions = async () => {
    try {
      const [courseList, roomList, branchList, userPage] = await Promise.all([
        courseApi.getAll(),
        roomApi.getAll(),
        branchApi.getAll(),
        userApi.getAll({ size: 200, sort: 'fullName,asc' }),
      ]);

      setCourses(Array.isArray(courseList) ? courseList : []);
      setRooms(Array.isArray(roomList) ? roomList : []);
      setBranches(Array.isArray(branchList) ? branchList : []);
      setTeachers((userPage?.content || []).filter((user: any) => user.role === 'TEACHER'));
    } catch (error: any) {
      setSnackbar({
        open: true,
        message: error?.response?.data?.message || 'Không thể tải dữ liệu tùy chọn lớp học',
        severity: 'error',
      });
    }
  };

  const fetchClassDetails = async (classId: string) => {
    try {
      setDetailLoading(true);
      const [enrollmentResponse, attendanceResponse] = await Promise.all([
        enrollmentApi.getByClass(classId),
        attendanceApi.getByClass(classId, todayIso),
      ]);

      setEnrollments(Array.isArray(enrollmentResponse.data) ? enrollmentResponse.data : []);
      setAttendance(Array.isArray(attendanceResponse.data) ? attendanceResponse.data : []);
    } catch (error: any) {
      setSnackbar({
        open: true,
        message: error?.response?.data?.message || 'Không thể tải chi tiết lớp học',
        severity: 'error',
      });
    } finally {
      setDetailLoading(false);
    }
  };

  const handleSearch = (query: string) => {
    setSearchQuery(query);
  };

  const filteredClasses = useMemo(() => {
    let result = [...classes];

    if (searchQuery.trim()) {
      const lowercaseQuery = searchQuery.toLowerCase();
      result = result.filter(
        (cls) =>
          cls.name?.toLowerCase().includes(lowercaseQuery) ||
          cls.id?.toLowerCase().includes(lowercaseQuery) ||
          cls.courseName?.toLowerCase().includes(lowercaseQuery) ||
          cls.status?.toLowerCase().includes(lowercaseQuery)
      );
    }

    if (statusFilter !== 'ALL') {
      result = result.filter((cls) => cls.status === statusFilter);
    }

    if (courseFilter !== 'ALL') {
      result = result.filter((cls) => cls.courseName === courseFilter || cls.name?.includes(courseFilter));
    }

    if (sortBy === 'START_DATE') {
      result.sort((a, b) => {
        if (!a.startDate) return 1;
        if (!b.startDate) return -1;
        return new Date(b.startDate).getTime() - new Date(a.startDate).getTime(); // Ngày khai giảng gần nhất (mới nhất)
      });
    } else if (sortBy === 'FILL_RATE') {
      result.sort((a, b) => {
        const fillA = ((a as any).students || a.currentStudents || 0) / (a.maxStudents || 15);
        const fillB = ((b as any).students || b.currentStudents || 0) / (b.maxStudents || 15);
        return fillA - fillB; // Tỷ lệ lấp đầy thấp nhất
      });
    }

    return result;
  }, [classes, searchQuery, statusFilter, courseFilter, sortBy]);

  const handleCreate = async () => {
    try {
      setSubmitting(true);
      await classApi.create({
        name: form.name,
        courseId: form.courseId,
        roomId: form.roomId,
        teacherId: form.teacherId,
        branchId: form.branchId,
        startDate: form.startDate,
        endDate: form.endDate,
        maxStudents: Number(form.maxStudents),
        status: form.status,
      });

      setSnackbar({ open: true, message: 'Tạo lớp học thành công', severity: 'success' });
      setOpenDialog(false);
      setForm(defaultForm);
      await fetchClasses();
    } catch (error: any) {
      setSnackbar({
        open: true,
        message: error?.response?.data?.message || 'Không thể tạo lớp học',
        severity: 'error',
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await classApi.delete(id);
      setSnackbar({ open: true, message: 'Xóa lớp học thành công', severity: 'success' });
      if (selectedClassId === id) {
        setSelectedClass(null);
        setEnrollments([]);
        setAttendance([]);
      }
      await fetchClasses();
    } catch (error: any) {
      setSnackbar({
        open: true,
        message: error?.response?.data?.message || 'Không thể xóa lớp học',
        severity: 'error',
      });
    }
  };

  const handleUpdateStatus = async (id: string, newStatus: string) => {
    try {
      await classApi.updateStatus(id, newStatus);
      setSnackbar({ open: true, message: 'Cập nhật trạng thái thành công', severity: 'success' });
      await fetchClasses();
      if (selectedClassId === id) {
        setSelectedClass((prev) => (prev ? { ...prev, status: newStatus } : prev));
      }
    } catch (error: any) {
      setSnackbar({
        open: true,
        message: error?.response?.data?.message || 'Không thể cập nhật trạng thái lớp học',
        severity: 'error',
      });
    }
  };

  const openScheduleDialog = (classId: string, schedule?: { id?: string; dayOfWeek: string; startTime: string; endTime: string }) => {
    setScheduleMode(schedule ? 'edit' : 'create');
    setScheduleDialog({ open: true, classId, scheduleId: schedule?.id });
    setScheduleForm(
      schedule
        ? {
          dayOfWeek: schedule.dayOfWeek,
          startTime: formatTimeToHHMM(schedule.startTime),
          endTime: formatTimeToHHMM(schedule.endTime),
        }
        : defaultScheduleForm
    );
  };

  const handleSaveSchedule = async () => {
    try {
      setScheduleSubmitting(true);
      const targetClassId = scheduleDialog.classId || selectedClassId || activeClass?.id;

      if (!targetClassId) {
        throw new Error('Không tìm thấy lớp học để lưu lịch');
      }

      if (scheduleMode === 'edit' && scheduleDialog.scheduleId) {
        await classApi.updateSchedule(targetClassId, scheduleDialog.scheduleId, scheduleForm);
        setSnackbar({ open: true, message: 'Cập nhật lịch học thành công', severity: 'success' });
      } else {
        await classApi.addSchedule(targetClassId, scheduleForm);
        setSnackbar({ open: true, message: 'Thêm lịch học thành công', severity: 'success' });
      }
      setScheduleDialog({ open: false, classId: '' });
      setScheduleForm(defaultScheduleForm);
      await fetchClasses();
      if (selectedClassId) {
        await fetchClassDetails(selectedClassId);
      }
    } catch (error: any) {
      setSnackbar({
        open: true,
        message: error?.response?.data?.message || 'Không thể lưu lịch học',
        severity: 'error',
      });
    } finally {
      setScheduleSubmitting(false);
    }
  };

  const handleDeleteSchedule = async (classId: string, scheduleId: string) => {
    try {
      await classApi.deleteSchedule(classId, scheduleId);
      setSnackbar({ open: true, message: 'Xóa buổi học thành công', severity: 'success' });
      await fetchClasses();
      if (selectedClassId) {
        await fetchClassDetails(selectedClassId);
      }
    } catch (error: any) {
      setSnackbar({
        open: true,
        message: error?.response?.data?.message || 'Không thể xóa buổi học',
        severity: 'error',
      });
    }
  };

  const handleOpenStudent = async (enrollment: EnrollmentItem) => {
    try {
      setSelectedStudent(enrollment);
      const response = await resultApi.getByEnrollment(enrollment.id);
      setStudentReport(response.data || null);
      setStudentDialogOpen(true);
    } catch (error: any) {
      setSnackbar({
        open: true,
        message: error?.response?.data?.message || 'Không thể tải kết quả học tập của học viên',
        severity: 'error',
      });
      setStudentDialogOpen(true);
    }
  };

  const getStatusColor = (status?: string): 'default' | 'info' | 'success' | 'warning' | 'error' => {
    switch (status) {
      case 'UPCOMING':
        return 'warning';
      case 'ACCEPTING':
        return 'info';
      case 'ONGOING':
        return 'success';
      case 'COMPLETED':
        return 'default';
      case 'CANCELLED':
        return 'error';
      default:
        return 'default';
    }
  };

  const getStatusLabel = (status?: string) => {
    switch (status) {
      case 'UPCOMING':
        return 'Chờ khai giảng';
      case 'ACCEPTING':
        return 'Đang tuyển sinh';
      case 'ONGOING':
        return 'Đang diễn ra';
      case 'COMPLETED':
        return 'Đã hoàn thành';
      case 'CANCELLED':
        return 'Đã hủy';
      default:
        return status || 'Không xác định';
    }
  };

  const getLifecycleIndex = (status?: string) => {
    const index = statusOrder.indexOf(status || '');
    return index < 0 ? 0 : index;
  };

  const attendanceSummary = useMemo(() => {
    const total = attendance.length;
    const present = attendance.filter((item) => item.status === 'PRESENT').length;
    const absent = attendance.filter((item) => item.status === 'ABSENT').length;
    const late = attendance.filter((item) => item.status === 'LATE').length;
    const excused = attendance.filter((item) => item.status === 'EXCUSED').length;
    return { total, present, absent, late, excused };
  }, [attendance]);

  const activeClass = classes.find((item) => item.id === selectedClassId) || selectedClass;

  const scheduleSessionRows = useMemo<ScheduleSessionRow[]>(() => {
    if (!activeClass?.schedules?.length) {
      return [];
    }

    const rows: ScheduleSessionRow[] = [];

    const startDate = activeClass.startDate ? new Date(`${activeClass.startDate}T00:00:00`) : null;
    const endDate = activeClass.endDate ? new Date(`${activeClass.endDate}T23:59:59`) : null;

    const validRange = startDate && endDate && !Number.isNaN(startDate.getTime()) && !Number.isNaN(endDate.getTime()) && startDate <= endDate;

    // If we have a valid start/end range, expand schedules into actual occurrences
    if (validRange) {
      activeClass.schedules.forEach((schedule) => {
        const targetDay = dayOfWeekIndexMap[schedule.dayOfWeek.toUpperCase()];
        if (targetDay === undefined) {
          return;
        }

        const firstOccurrence = new Date(startDate as Date);
        const daysUntilFirstOccurrence = (targetDay - firstOccurrence.getDay() + 7) % 7;
        firstOccurrence.setDate(firstOccurrence.getDate() + daysUntilFirstOccurrence);

        for (let occurrence = new Date(firstOccurrence); occurrence <= (endDate as Date); occurrence.setDate(occurrence.getDate() + 7)) {
          const occurrenceDateKey = [
            occurrence.getFullYear(),
            String(occurrence.getMonth() + 1).padStart(2, '0'),
            String(occurrence.getDate()).padStart(2, '0'),
          ].join('-');

          rows.push({
            key: `${schedule.id || `${schedule.dayOfWeek}-${schedule.startTime}`}-${occurrenceDateKey}`,
            sortTime: occurrence.getTime(),
            dateLabel: formatSessionDateLabel(new Date(occurrence)),
            timeLabel: `${formatTimeToHHMM(schedule.startTime)} - ${formatTimeToHHMM(schedule.endTime)}`,
            roomLabel: activeClass.roomName || '-',
            formatLabel: activeClass.roomName ? 'Trực tiếp' : 'Online',
            attendanceLabel: 'Chưa điểm danh',
            teacherLabel: activeClass.teacherName || '-',
            titleLabel: activeClass.name || activeClass.courseName || '-',
            materialLabel: '-',
            scheduleId: schedule.id,
            dayOfWeek: schedule.dayOfWeek,
            startTime: schedule.startTime,
            endTime: schedule.endTime,
          });
        }
      });

      return rows.sort((left, right) => left.sortTime - right.sortTime);
    }

    // Fallback: no valid start/end range — show weekly schedule definitions instead
    activeClass.schedules.forEach((schedule) => {
      const labelDay = dayOfWeekLabelMap[schedule.dayOfWeek.toUpperCase()] || schedule.dayOfWeek;
      rows.push({
        key: schedule.id || `${schedule.dayOfWeek}-${schedule.startTime}`,
        sortTime: dayOfWeekIndexMap[schedule.dayOfWeek.toUpperCase()] || 0,
        dateLabel: labelDay,
        timeLabel: `${formatTimeToHHMM(schedule.startTime)} - ${formatTimeToHHMM(schedule.endTime)}`,
        roomLabel: activeClass.roomName || '-',
        formatLabel: activeClass.roomName ? 'Trực tiếp' : 'Online',
        attendanceLabel: 'Chưa điểm danh',
        teacherLabel: activeClass.teacherName || '-',
        titleLabel: activeClass.name || activeClass.courseName || '-',
        materialLabel: '-',
        scheduleId: schedule.id,
        dayOfWeek: schedule.dayOfWeek,
        startTime: schedule.startTime,
        endTime: schedule.endTime,
      });
    });

    return rows.sort((l, r) => l.sortTime - r.sortTime);
  }, [activeClass]);

  return (
    <Box sx={{ pb: 4 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4, gap: 2 }}>
        <Box>
          <Typography variant="h4" fontWeight={800} color="primary.main">
            Quản lý Lớp học
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Xem chi tiết buổi học, danh sách học viên và điều chỉnh lịch học cho các lớp.
          </Typography>
        </Box>
        <Button variant="contained" startIcon={<AddIcon />} onClick={() => setOpenDialog(true)} sx={{ borderRadius: 2, px: 3, py: 1, fontWeight: 700 }}>
          Tạo lớp mới
        </Button>
      </Box>

      <Grid container spacing={2} sx={{ mb: 4 }}>
        <Grid item xs={12} md={4}>
          <TextField
            fullWidth
            placeholder="Tìm kiếm lớp học theo tên, mã lớp..."
            value={searchQuery}
            onChange={(e) => handleSearch(e.target.value)}
            InputProps={{
              startAdornment: <SearchIcon sx={{ mr: 1, color: 'text.secondary' }} />,
            }}
            variant="outlined"
            size="small"
            sx={{ bgcolor: 'white', borderRadius: 2, '& fieldset': { borderRadius: 2 } }}
          />
        </Grid>
        <Grid item xs={12} sm={4} md={2.5}>
          <TextField
            select
            fullWidth
            label="Trạng thái"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            size="small"
            sx={{ bgcolor: 'white', borderRadius: 2 }}
          >
            <MenuItem value="ALL">Tất cả trạng thái</MenuItem>
            <MenuItem value="UPCOMING">Chờ khai giảng</MenuItem>
            <MenuItem value="ACCEPTING">Đang tuyển sinh</MenuItem>
            <MenuItem value="ONGOING">Đang diễn ra</MenuItem>
            <MenuItem value="COMPLETED">Đã hoàn thành</MenuItem>
            <MenuItem value="CANCELLED">Đã hủy</MenuItem>
          </TextField>
        </Grid>
        <Grid item xs={12} sm={4} md={3}>
          <TextField
            select
            fullWidth
            label="Khóa học"
            value={courseFilter}
            onChange={(e) => setCourseFilter(e.target.value)}
            size="small"
            sx={{ bgcolor: 'white', borderRadius: 2 }}
          >
            <MenuItem value="ALL">Tất cả khóa học</MenuItem>
            {courses.map((c) => (
              <MenuItem key={c.id} value={c.name}>
                {c.name}
              </MenuItem>
            ))}
          </TextField>
        </Grid>
        <Grid item xs={12} sm={4} md={2.5}>
          <TextField
            select
            fullWidth
            label="Sắp xếp"
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            size="small"
            sx={{ bgcolor: 'white', borderRadius: 2 }}
          >
            <MenuItem value="START_DATE">Khai giảng gần nhất</MenuItem>
            <MenuItem value="FILL_RATE">Tỷ lệ lấp đầy thấp nhất</MenuItem>
          </TextField>
        </Grid>
      </Grid>

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 10 }}>
          <CircularProgress />
        </Box>
      ) : filteredClasses.length === 0 ? (
        <Paper sx={{ p: 6, textAlign: 'center', borderRadius: 4, bgcolor: 'rgba(0,0,0,0.02)' }}>
          <Typography color="text.secondary" variant="h6">
            {searchQuery ? 'Không tìm thấy kết quả phù hợp' : 'Chưa có lớp học nào trong hệ thống'}
          </Typography>
        </Paper>
      ) : (
        <Grid container spacing={3}>
          {filteredClasses.map((cls) => {
            const scheduleCount = cls.schedules?.length || 0;
            const enrolCount = cls.id === selectedClassId ? enrollments.length : undefined;
            const fillRate = cls.maxStudents ? Math.min(100, Math.round(((enrolCount || 0) / cls.maxStudents) * 100)) : 0;
            const lifecycleIndex = getLifecycleIndex(cls.status);
            const lifecyclePct = Math.min(100, Math.round((lifecycleIndex / 3) * 100));

            return (
              <Grid key={cls.id} item xs={12} sm={6} lg={4}>
                <Card
                  onClick={() => setSelectedClass(cls)}
                  sx={{
                    cursor: 'pointer',
                    height: '100%',
                    borderRadius: 4,
                    border: selectedClassId === cls.id ? '2px solid' : '1px solid transparent',
                    borderColor: selectedClassId === cls.id ? 'primary.main' : 'transparent',
                    boxShadow: '0 4px 20px rgba(0,0,0,0.05)',
                    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                    '&:hover': { transform: 'translateY(-4px)', boxShadow: '0 12px 32px rgba(0,0,0,0.1)' },
                  }}
                >
                  <CardContent sx={{ p: 3 }}>
                    <Stack direction="row" justifyContent="space-between" alignItems="flex-start" sx={{ mb: 2.5 }}>
                      <Box sx={{ minWidth: 0 }}>
                        <Stack direction="row" spacing={1} sx={{ mb: 1.5, flexWrap: 'wrap' }}>
                          <Chip size="small" label={getStatusLabel(cls.status)} color={getStatusColor(cls.status)} sx={{ fontWeight: 800 }} />
                          <Chip size="small" variant="outlined" label={`#${cls.id.slice(0, 8).toUpperCase()}`} sx={{ fontWeight: 600 }} />
                        </Stack>
                        <Typography variant="h6" fontWeight={800} noWrap sx={{ mb: 0.5 }}>
                          {cls.name || cls.id}
                        </Typography>
                        <Typography variant="body2" color="text.secondary" sx={{ display: 'flex', alignItems: 'center' }}>
                          <EventBusyIcon sx={{ fontSize: 14, mr: 0.5 }} /> {formatDateToDDMMYYYY(cls.startDate)} - {formatDateToDDMMYYYY(cls.endDate)}
                        </Typography>
                      </Box>
                    </Stack>

                    <Grid container spacing={2} sx={{ mb: 3 }}>
                      <Grid item xs={4}>
                        <Box sx={{ p: 1.5, textAlign: 'center', bgcolor: 'rgba(0,0,0,0.02)', borderRadius: 2 }}>
                          <Typography variant="h6" fontWeight={800}>{scheduleCount}</Typography>
                          <Typography variant="caption" color="text.secondary" fontWeight={600}>Buổi/Tuần</Typography>
                        </Box>
                      </Grid>
                      <Grid item xs={4}>
                        <Box sx={{ p: 1.5, textAlign: 'center', bgcolor: 'rgba(0,0,0,0.02)', borderRadius: 2 }}>
                          <Typography variant="h6" fontWeight={800}>{enrolCount ?? '-'}</Typography>
                          <Typography variant="caption" color="text.secondary" fontWeight={600}>Học viên</Typography>
                        </Box>
                      </Grid>
                      <Grid item xs={4}>
                        <Box sx={{ p: 1.5, textAlign: 'center', bgcolor: 'rgba(0,0,0,0.02)', borderRadius: 2 }}>
                          <Typography variant="h6" fontWeight={800}>{cls.maxStudents || '-'}</Typography>
                          <Typography variant="caption" color="text.secondary" fontWeight={600}>Tối đa</Typography>
                        </Box>
                      </Grid>
                    </Grid>

                    <Stack spacing={2} sx={{ mb: 3 }}>
                      <Box>
                        <Stack direction="row" justifyContent="space-between" sx={{ mb: 0.75 }}>
                          <Typography variant="caption" color="text.secondary" fontWeight={700}>TIẾN ĐỘ TRẠNG THÁI</Typography>
                          <Typography variant="caption" fontWeight={800} color="primary">{lifecyclePct}%</Typography>
                        </Stack>
                        <LinearProgress variant="determinate" value={lifecyclePct} sx={{ height: 6, borderRadius: 3, bgcolor: 'rgba(0,0,0,0.05)' }} />
                      </Box>

                      <Box>
                        <Stack direction="row" justifyContent="space-between" sx={{ mb: 0.75 }}>
                          <Typography variant="caption" color="text.secondary" fontWeight={700}>TỶ LỆ LẤP ĐẦY</Typography>
                          <Typography variant="caption" fontWeight={800} color="secondary">{fillRate}%</Typography>
                        </Stack>
                        <LinearProgress variant="determinate" value={fillRate} sx={{ height: 6, borderRadius: 3, bgcolor: 'rgba(0,0,0,0.05)' }} color="secondary" />
                      </Box>
                    </Stack>

                    <Divider sx={{ mb: 2.5 }} />

                    <Stack direction="row" spacing={1} justifyContent="space-between" alignItems="center">
                      <Button
                        size="small"
                        variant="outlined"
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedClass(cls);
                        }}
                        sx={{ borderRadius: 2, fontWeight: 700, textTransform: 'none' }}
                      >
                        Chi tiết
                      </Button>
                      <Box sx={{ display: 'flex', gap: 1 }}>
                        <Button
                          size="small"
                          variant="contained"
                          onClick={(e) => {
                            e.stopPropagation();
                            setTargetClassForStatus(cls);
                            setSelectedNewStatus(cls.status || 'UPCOMING');
                            setStatusDialogOpen(true);
                          }}
                          sx={{ borderRadius: 2, fontWeight: 700, textTransform: 'none' }}
                        >
                          Cập nhật trạng thái
                        </Button>
                        <IconButton
                          color="error"
                          size="small"
                          onClick={(e) => {
                            e.stopPropagation();
                            if (window.confirm('Bạn có chắc chắn muốn xóa lớp học này?')) {
                              void handleDelete(cls.id);
                            }
                          }}
                          sx={{ bgcolor: 'rgba(211, 47, 47, 0.05)', '&:hover': { bgcolor: 'rgba(211, 47, 47, 0.1)' } }}
                        >
                          <DeleteIcon fontSize="small" />
                        </IconButton>
                      </Box>
                    </Stack>
                  </CardContent>
                </Card>
              </Grid>
            );
          })}
        </Grid>
      )}

      {/* Class Details Dialog */}
      <Dialog open={!!selectedClass} onClose={() => setSelectedClass(null)} maxWidth="lg" fullWidth PaperProps={{ sx: { borderRadius: 4 } }}>
        <DialogTitle sx={{ p: 3, bgcolor: 'rgba(0,0,0,0.02)' }}>
          <Stack direction={{ xs: 'column', sm: 'row' }} justifyContent="space-between" spacing={2} alignItems={isMobile ? 'flex-start' : 'center'}>
            <Box>
              <Typography variant="h5" fontWeight={900} color="primary.main">
                {activeClass?.name || 'Chi tiết lớp học'}
              </Typography>
              <Typography variant="body2" color="text.secondary" fontWeight={600}>
                {activeClass?.courseName || 'Khóa học chưa xác định'}
                {activeClass?.roomName ? ` • Phòng ${activeClass.roomName}` : ''}
                {activeClass?.teacherName ? ` • GV: ${activeClass.teacherName}` : ''}
              </Typography>
            </Box>
            <Stack direction="row" spacing={1}>
              <Chip label={getStatusLabel(activeClass?.status)} color={getStatusColor(activeClass?.status)} sx={{ fontWeight: 800 }} />
              <Button variant="outlined" size="small" onClick={() => setSelectedClass(null)} sx={{ borderRadius: 2 }}>Đóng</Button>
            </Stack>
          </Stack>
        </DialogTitle>
        <DialogContent dividers sx={{ p: 0 }}>
          <Box sx={{ p: 3 }}>
            <Grid container spacing={3} sx={{ mb: 4 }}>
              <Grid item xs={12} md={4}>
                <Paper variant="outlined" sx={{ p: 2.5, borderRadius: 3, textAlign: 'center' }}>
                  <Typography variant="caption" color="text.secondary" fontWeight={700} display="block" gutterBottom>HỌC VIÊN HIỆN TẠI</Typography>
                  <Typography variant="h4" fontWeight={900}>{enrollments.length} / {activeClass?.maxStudents || '-'}</Typography>
                  <LinearProgress
                    value={activeClass?.maxStudents ? (enrollments.length / activeClass.maxStudents) * 100 : 0}
                    variant="determinate"
                    sx={{ mt: 2, height: 8, borderRadius: 4 }}
                  />
                </Paper>
              </Grid>
              <Grid item xs={12} md={4}>
                <Paper variant="outlined" sx={{ p: 2.5, borderRadius: 3, textAlign: 'center' }}>
                  <Typography variant="caption" color="text.secondary" fontWeight={700} display="block" gutterBottom>TỔNG BUỔI HỌC</Typography>
                  <Typography variant="h4" fontWeight={900}>{scheduleSessionRows.length}</Typography>
                  <Typography variant="body2" color="primary" fontWeight={700} sx={{ mt: 1 }}>Buổi học</Typography>
                </Paper>
              </Grid>
              <Grid item xs={12} md={4}>
                <Paper variant="outlined" sx={{ p: 2.5, borderRadius: 3, textAlign: 'center' }}>
                  <Typography variant="caption" color="text.secondary" fontWeight={700} display="block" gutterBottom>THỜI GIAN KHÓA HỌC</Typography>
                  <Typography variant="h6" fontWeight={800}>
                    {formatDateToDDMMYYYY(activeClass?.startDate)}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">đến</Typography>
                  <Typography variant="h6" fontWeight={800}>
                    {formatDateToDDMMYYYY(activeClass?.endDate)}
                  </Typography>
                </Paper>
              </Grid>
            </Grid>

            <Tabs
              value={detailTab}
              onChange={(_, value) => setDetailTab(value)}
              sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}
            >
              <Tab label="Lịch học chi tiết" sx={{ fontWeight: 700 }} />
              <Tab label="Danh sách học viên" sx={{ fontWeight: 700 }} />
              <Tab label="Điểm danh hôm nay" sx={{ fontWeight: 700 }} />
            </Tabs>

            {detailLoading ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', py: 10 }}>
                <CircularProgress />
              </Box>
            ) : detailTab === 0 ? (
              <Grid container spacing={3}>
                <Grid item xs={12} md={3}>
                  <Paper variant="outlined" sx={{ p: 3, borderRadius: 3, bgcolor: 'rgba(0,0,0,0.01)' }}>
                    <Typography variant="subtitle1" fontWeight={800} sx={{ mb: 2.5 }}>
                      {scheduleMode === 'edit' ? 'Cập nhật lịch học' : 'Thêm lịch học mới'}
                    </Typography>
                    <Box
                      sx={{
                        display: 'flex',
                        flexDirection: { xs: 'column', md: 'row' },
                        gap: 1.5,
                        alignItems: { xs: 'stretch', md: 'flex-end' },
                        p: 1.5,
                        borderRadius: 3,
                        bgcolor: 'rgba(25, 118, 210, 0.03)',
                        border: '1px solid rgba(25, 118, 210, 0.10)',
                      }}
                    >
                      <TextField
                        select
                        fullWidth
                        label="Ngày trong tuần"
                        value={scheduleForm.dayOfWeek}
                        onChange={(e) => setScheduleForm((prev) => ({ ...prev, dayOfWeek: e.target.value }))}
                        sx={{ flex: { md: '1.2 1 0%' }, minWidth: { md: 220 } }}
                      >
                        <MenuItem value="MONDAY">Thứ Hai</MenuItem>
                        <MenuItem value="TUESDAY">Thứ Ba</MenuItem>
                        <MenuItem value="WEDNESDAY">Thứ Tư</MenuItem>
                        <MenuItem value="THURSDAY">Thứ Năm</MenuItem>
                        <MenuItem value="FRIDAY">Thứ Sáu</MenuItem>
                        <MenuItem value="SATURDAY">Thứ Bảy</MenuItem>
                        <MenuItem value="SUNDAY">Chủ Nhật</MenuItem>
                      </TextField>
                      <TextField
                        type="time"
                        fullWidth
                        label="Giờ bắt đầu"
                        value={scheduleForm.startTime}
                        onChange={(e) => setScheduleForm((prev) => ({ ...prev, startTime: e.target.value }))}
                        InputLabelProps={{ shrink: true }}
                        sx={{ flex: { md: '0.9 1 0%' }, minWidth: { md: 170 } }}
                      />
                      <TextField
                        type="time"
                        fullWidth
                        label="Giờ kết thúc"
                        value={scheduleForm.endTime}
                        onChange={(e) => setScheduleForm((prev) => ({ ...prev, endTime: e.target.value }))}
                        InputLabelProps={{ shrink: true }}
                        sx={{ flex: { md: '0.9 1 0%' }, minWidth: { md: 170 } }}
                      />
                      <Button
                        variant="contained"
                        fullWidth
                        onClick={() => void handleSaveSchedule()}
                        sx={{
                          borderRadius: 2,
                          py: 1.2,
                          fontWeight: 800,
                          minHeight: 56,
                          whiteSpace: 'nowrap',
                          px: 3,
                          flex: { md: '0 0 180px' },
                        }}
                      >
                        {scheduleMode === 'edit' ? 'Lưu thay đổi' : 'Thêm vào lịch'}
                      </Button>
                    </Box>
                  </Paper>
                </Grid>
                <Grid item xs={12} md={9}>
                  <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
                    <Typography variant="subtitle1" fontWeight={800}>Lịch học chi tiết theo từng buổi</Typography>
                    <Typography variant="body2" color="text.secondary" fontWeight={600}>
                      Tổng số: {scheduleSessionRows.length}
                    </Typography>
                  </Stack>
                  {scheduleSessionRows.length ? (
                    <TableContainer component={Paper} variant="outlined" sx={{ borderRadius: 3, maxHeight: 560 }}>
                      <Table size="small" stickyHeader>
                        <TableHead sx={{ bgcolor: 'rgba(0,0,0,0.02)' }}>
                          <TableRow>
                            <TableCell sx={{ fontWeight: 800, whiteSpace: 'nowrap' }}>TT</TableCell>
                            <TableCell sx={{ fontWeight: 800, whiteSpace: 'nowrap' }}>Ngày học</TableCell>
                            <TableCell sx={{ fontWeight: 800, whiteSpace: 'nowrap' }}>Tiết học</TableCell>
                            <TableCell sx={{ fontWeight: 800, whiteSpace: 'nowrap' }}>Phòng học</TableCell>
                            <TableCell sx={{ fontWeight: 800, whiteSpace: 'nowrap' }}>Hình thức</TableCell>
                            <TableCell sx={{ fontWeight: 800, whiteSpace: 'nowrap' }}>Điểm danh</TableCell>
                            <TableCell sx={{ fontWeight: 800, whiteSpace: 'nowrap' }}>Giảng viên</TableCell>
                            <TableCell sx={{ fontWeight: 800, whiteSpace: 'nowrap' }}>Tiêu đề</TableCell>
                            <TableCell sx={{ fontWeight: 800, whiteSpace: 'nowrap' }}>Học liệu</TableCell>
                          </TableRow>
                        </TableHead>
                        <TableBody>
                                  {scheduleSessionRows.map((session, index) => (
                                      <TableRow key={session.key} hover>
                                        <TableCell sx={{ whiteSpace: 'nowrap' }}>{index + 1}</TableCell>
                                        <TableCell sx={{ whiteSpace: 'nowrap' }}>{session.dateLabel}</TableCell>
                                        <TableCell sx={{ whiteSpace: 'nowrap' }}>{session.timeLabel}</TableCell>
                                        <TableCell sx={{ whiteSpace: 'nowrap' }}>{session.roomLabel}</TableCell>
                                        <TableCell sx={{ whiteSpace: 'nowrap' }}>
                                          <Chip
                                            size="small"
                                            label={session.formatLabel}
                                            color={session.formatLabel === 'Trực tiếp' ? 'success' : 'info'}
                                            variant="outlined"
                                            sx={{ fontWeight: 700 }}
                                          />
                                        </TableCell>
                                        <TableCell sx={{ whiteSpace: 'nowrap' }}>
                                          <Chip
                                            size="small"
                                            label={session.attendanceLabel}
                                            color="error"
                                            variant="outlined"
                                            sx={{ fontWeight: 700 }}
                                          />
                                        </TableCell>
                                        <TableCell sx={{ whiteSpace: 'nowrap' }}>{session.teacherLabel}</TableCell>
                                        <TableCell sx={{ whiteSpace: 'nowrap' }}>{session.titleLabel}</TableCell>
                                        <TableCell sx={{ whiteSpace: 'nowrap' }}>{session.materialLabel}</TableCell>
                                        <TableCell align="center">
                                          <Stack direction="row" spacing={1} justifyContent="center">
                                            <IconButton
                                              size="small"
                                              color="primary"
                                              onClick={(e) => {
                                                e.stopPropagation();
                                                openScheduleDialog(selectedClassId || activeClass?.id || '', {
                                                  id: session.scheduleId,
                                                  dayOfWeek: session.dayOfWeek || 'MONDAY',
                                                  startTime: session.startTime || '18:00',
                                                  endTime: session.endTime || '20:00',
                                                });
                                              }}
                                            >
                                              <EditIcon fontSize="small" />
                                            </IconButton>
                                            <IconButton
                                              size="small"
                                              color="error"
                                              onClick={(e) => {
                                                e.stopPropagation();
                                                const idToDelete = session.scheduleId || String(session.key).split('-')[0];
                                                if (!idToDelete) return;
                                                if (window.confirm('Bạn có chắc chắn muốn xóa buổi học này?')) {
                                                  void handleDeleteSchedule(idToDelete);
                                                }
                                              }}
                                            >
                                              <DeleteIcon fontSize="small" />
                                            </IconButton>
                                          </Stack>
                                        </TableCell>
                                      </TableRow>
                                    ))}
                        </TableBody>
                      </Table>
                    </TableContainer>
                  ) : (
                    <Alert severity="info" sx={{ borderRadius: 2 }}>Lớp học này chưa được xếp lịch.</Alert>
                  )}
                </Grid>
              </Grid>
            ) : detailTab === 1 ? (
              <Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                  <Typography variant="h6" fontWeight={800}>Học viên đang theo học ({enrollments.length})</Typography>
                  <Button variant="outlined" startIcon={<PeopleIcon />} sx={{ borderRadius: 2 }}>Thêm học viên</Button>
                </Box>
                {enrollments.length === 0 ? (
                  <Alert severity="info" sx={{ borderRadius: 2 }}>Chưa có học viên nào tham gia lớp học này.</Alert>
                ) : (
                  <TableContainer component={Paper} variant="outlined" sx={{ borderRadius: 3 }}>
                    <Table size="small">
                      <TableHead sx={{ bgcolor: 'rgba(0,0,0,0.02)' }}>
                        <TableRow>
                          <TableCell sx={{ fontWeight: 800 }}>Họ và tên</TableCell>
                          <TableCell sx={{ fontWeight: 800 }}>Mã học viên</TableCell>
                          <TableCell sx={{ fontWeight: 800 }}>Ngày đăng ký</TableCell>
                          <TableCell sx={{ fontWeight: 800 }}>Trạng thái</TableCell>
                          <TableCell align="right" sx={{ fontWeight: 800 }}>Hành động</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {enrollments.map((item) => (
                          <TableRow key={item.id} hover>
                            <TableCell sx={{ fontWeight: 700 }}>{item.studentName}</TableCell>
                            <TableCell sx={{ color: 'text.secondary' }}>{item.studentId}</TableCell>
                            <TableCell>{formatDateToDDMMYYYY(item.enrollmentDate)}</TableCell>
                            <TableCell>
                              <Chip size="small" label={item.status === 'ACTIVE' ? 'Đang học' : 'Dừng học'} color={item.status === 'ACTIVE' ? 'success' : 'default'} sx={{ fontWeight: 700 }} />
                            </TableCell>
                            <TableCell align="right">
                              <Button size="small" variant="text" onClick={() => void handleOpenStudent(item)} sx={{ fontWeight: 700 }}>
                                Xem kết quả
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                )}
              </Box>
            ) : (
              <Box>
                <Typography variant="h6" fontWeight={800} sx={{ mb: 3 }}>Tình hình điểm danh ngày {formatDateToDDMMYYYY(todayIso)}</Typography>
                {attendance.length === 0 ? (
                  <Alert severity="warning" sx={{ borderRadius: 2 }}>Dữ liệu điểm danh ngày hôm nay chưa được cập nhật hoặc không có lịch học.</Alert>
                ) : (
                  <TableContainer component={Paper} variant="outlined" sx={{ borderRadius: 3 }}>
                    <Table size="small">
                      <TableHead sx={{ bgcolor: 'rgba(0,0,0,0.02)' }}>
                        <TableRow>
                          <TableCell sx={{ fontWeight: 800 }}>Học viên</TableCell>
                          <TableCell sx={{ fontWeight: 800 }}>Trạng thái</TableCell>
                          <TableCell sx={{ fontWeight: 800 }}>Ghi chú</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {attendance.map((row) => (
                          <TableRow key={row.id}>
                            <TableCell sx={{ fontWeight: 700 }}>{row.studentName}</TableCell>
                            <TableCell>
                              <Chip
                                size="small"
                                label={row.status === 'PRESENT' ? 'Có mặt' : row.status === 'ABSENT' ? 'Vắng mặt' : row.status === 'LATE' ? 'Đi muộn' : 'Có phép'}
                                color={row.status === 'PRESENT' ? 'success' : row.status === 'ABSENT' ? 'error' : 'warning'}
                                sx={{ fontWeight: 700 }}
                              />
                            </TableCell>
                            <TableCell sx={{ color: 'text.secondary' }}>{row.notes || '-'}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                )}
              </Box>
            )}
          </Box>
        </DialogContent>
      </Dialog>

      {/* Create Class Dialog */}
      <Dialog open={openDialog} onClose={() => setOpenDialog(false)} maxWidth="sm" fullWidth PaperProps={{ sx: { borderRadius: 4 } }}>
        <DialogTitle sx={{ fontWeight: 900, pb: 1 }}>Tạo lớp học mới</DialogTitle>
        <DialogContent sx={{ pt: 2 }}>
          <Stack spacing={2.5} sx={{ mt: 1 }}>
            <TextField
              fullWidth
              label="Tên lớp học"
              placeholder="VD: IELTS-F-01"
              value={form.name}
              onChange={(e) => setForm((prev) => ({ ...prev, name: e.target.value }))}
            />
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  select
                  label="Khóa học"
                  value={form.courseId}
                  onChange={(e) => setForm((prev) => ({ ...prev, courseId: e.target.value }))}
                >
                  {courses.map((course) => (
                    <MenuItem value={course.id} key={course.id}>{course.name}</MenuItem>
                  ))}
                </TextField>
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  select
                  label="Giảng viên"
                  value={form.teacherId}
                  onChange={(e) => setForm((prev) => ({ ...prev, teacherId: e.target.value }))}
                >
                  {teachers.map((teacher) => (
                    <MenuItem value={teacher.id} key={teacher.id}>{teacher.fullName || teacher.email}</MenuItem>
                  ))}
                </TextField>
              </Grid>
            </Grid>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  select
                  label="Phòng học"
                  value={form.roomId}
                  onChange={(e) => setForm((prev) => ({ ...prev, roomId: e.target.value }))}
                >
                  {rooms.map((room) => (
                    <MenuItem value={room.id} key={room.id}>{room.name} ({room.capacity} chỗ)</MenuItem>
                  ))}
                </TextField>
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  select
                  label="Chi nhánh"
                  value={form.branchId}
                  onChange={(e) => setForm((prev) => ({ ...prev, branchId: e.target.value }))}
                >
                  {branches.map((branch) => (
                    <MenuItem value={branch.id} key={branch.id}>{branch.name}</MenuItem>
                  ))}
                </TextField>
              </Grid>
            </Grid>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  type="date"
                  label="Ngày khai giảng"
                  InputLabelProps={{ shrink: true }}
                  value={form.startDate}
                  onChange={(e) => setForm((prev) => ({ ...prev, startDate: e.target.value }))}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  type="date"
                  label="Ngày kết thúc (dự kiến)"
                  InputLabelProps={{ shrink: true }}
                  value={form.endDate}
                  onChange={(e) => setForm((prev) => ({ ...prev, endDate: e.target.value }))}
                />
              </Grid>
            </Grid>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  type="number"
                  label="Sĩ số tối đa"
                  value={form.maxStudents}
                  onChange={(e) => setForm((prev) => ({ ...prev, maxStudents: e.target.value }))}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  select
                  label="Trạng thái khởi tạo"
                  value={form.status}
                  onChange={(e) => setForm((prev) => ({ ...prev, status: e.target.value }))}
                >
                  <MenuItem value="UPCOMING">Chờ khai giảng</MenuItem>
                  <MenuItem value="ACCEPTING">Đang tuyển sinh</MenuItem>
                </TextField>
              </Grid>
            </Grid>
          </Stack>
        </DialogContent>
        <DialogActions sx={{ p: 3 }}>
          <Button onClick={() => setOpenDialog(false)} color="inherit" sx={{ fontWeight: 700 }}>Hủy</Button>
          <Button variant="contained" disabled={submitting} onClick={() => void handleCreate()} sx={{ px: 4, borderRadius: 2, fontWeight: 700 }}>
            {submitting ? 'Đang xử lý...' : 'Xác nhận tạo lớp'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Update Status Dialog */}
      <Dialog open={statusDialogOpen} onClose={() => setStatusDialogOpen(false)} maxWidth="xs" fullWidth PaperProps={{ sx: { borderRadius: 4 } }}>
        <DialogTitle sx={{ p: 3, bgcolor: 'rgba(0,0,0,0.02)' }}>
          <Typography variant="h6" fontWeight={800} color="primary.main">
            Cập nhật trạng thái lớp học
          </Typography>
        </DialogTitle>
        <DialogContent sx={{ p: 3 }}>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Chọn trạng thái mới cho lớp <strong>{targetClassForStatus?.name || targetClassForStatus?.id}</strong>:
          </Typography>
          <TextField
            select
            fullWidth
            label="Trạng thái"
            value={selectedNewStatus}
            onChange={(e) => setSelectedNewStatus(e.target.value)}
            sx={{ borderRadius: 2 }}
          >
            <MenuItem value="UPCOMING">Chờ khai giảng</MenuItem>
            <MenuItem value="ACCEPTING">Đang tuyển sinh</MenuItem>
            <MenuItem value="ONGOING">Đang diễn ra</MenuItem>
            <MenuItem value="COMPLETED">Đã hoàn thành</MenuItem>
            <MenuItem value="CANCELLED">Đã hủy</MenuItem>
          </TextField>
        </DialogContent>
        <DialogActions sx={{ p: 2, pt: 0 }}>
          <Button onClick={() => setStatusDialogOpen(false)} sx={{ borderRadius: 2 }}>
            Hủy
          </Button>
          <Button
            variant="contained"
            onClick={() => {
              if (targetClassForStatus) {
                void handleUpdateStatus(targetClassForStatus.id, selectedNewStatus);
              }
              setStatusDialogOpen(false);
            }}
            sx={{ borderRadius: 2, fontWeight: 700 }}
          >
            Lưu
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={() => setSnackbar((prev) => ({ ...prev, open: false }))}
      >
        <Alert severity={snackbar.severity} variant="filled" sx={{ borderRadius: 2, fontWeight: 600 }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}
