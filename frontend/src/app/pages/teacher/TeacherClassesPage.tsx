import { useEffect, useMemo, useState } from 'react';
import { useSelector } from 'react-redux';
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  Dialog,
  DialogContent,
  DialogTitle,
  Divider,
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
  useMediaQuery,
  useTheme,
} from '@mui/material';
import {
  Check as CheckIcon,
  Close as CloseIcon,
  EventBusy as EventBusyIcon,
  People as PeopleIcon,
  SchoolOutlined as SchoolOutlinedIcon,
} from '@mui/icons-material';
import { attendanceApi, classApi, enrollmentApi } from '../../../services/api';
import { RootState } from '../../../store';
import { formatDateToDDMMYYYY, formatTimeToHHMM } from '../../utils/dateFormatter';

type ClassItem = {
  id: string;
  name?: string;
  courseName?: string;
  roomName?: string;
  teacherId?: string;
  maxStudents?: number;
  status?: string;
  startDate?: string;
  endDate?: string;
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

type ScheduleSessionRow = {
  key: string;
  sortTime: number;
  attendanceDate: string;
  dateLabel: string;
  timeLabel: string;
  startTime: string;
  endTime: string;
  dayOfWeek: string;
  roomLabel: string;
  formatLabel: string;
};

type AttendanceAvailability = {
  allowed: boolean;
  reason?: string;
};

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

const toLocalDateKey = (date: Date) =>
  [
    date.getFullYear(),
    String(date.getMonth() + 1).padStart(2, '0'),
    String(date.getDate()).padStart(2, '0'),
  ].join('-');

const parseTimeToMinutes = (value?: string) => {
  if (!value) return null;
  const [hourRaw, minuteRaw] = value.split(':');
  const hour = Number(hourRaw);
  const minute = Number(minuteRaw);

  if (Number.isNaN(hour) || Number.isNaN(minute)) {
    return null;
  }

  return hour * 60 + minute;
};

const getTodayAttendanceAvailability = (classItem: ClassItem | null, now: Date): AttendanceAvailability => {
  if (!classItem) {
    return { allowed: false, reason: 'Chưa chọn lớp học để điểm danh.' };
  }

  if (!classItem.schedules?.length) {
    return { allowed: false, reason: 'Lớp này chưa được xếp lịch học nên chưa thể điểm danh.' };
  }

  const todayKey = toLocalDateKey(now);
  const todayStart = new Date(`${todayKey}T00:00:00`);
  const todayEnd = new Date(`${todayKey}T23:59:59`);

  if (classItem.startDate) {
    const classStart = new Date(`${classItem.startDate}T00:00:00`);
    if (!Number.isNaN(classStart.getTime()) && todayStart < classStart) {
      return { allowed: false, reason: `Lớp chưa bắt đầu. Ngày khai giảng là ${formatDateToDDMMYYYY(classItem.startDate)}.` };
    }
  }

  if (classItem.endDate) {
    const classEnd = new Date(`${classItem.endDate}T23:59:59`);
    if (!Number.isNaN(classEnd.getTime()) && todayEnd > classEnd) {
      return { allowed: false, reason: `Lớp đã kết thúc từ ${formatDateToDDMMYYYY(classItem.endDate)} nên không thể điểm danh hôm nay.` };
    }
  }

  if (classItem.status === 'CANCELLED') {
    return { allowed: false, reason: 'Lớp đã bị hủy nên không thể điểm danh.' };
  }

  if (classItem.status === 'COMPLETED') {
    return { allowed: false, reason: 'Lớp đã hoàn thành nên không thể điểm danh thêm.' };
  }

  const todaySchedules = classItem.schedules.filter(
    (schedule) => dayOfWeekIndexMap[schedule.dayOfWeek.toUpperCase()] === now.getDay()
  );

  if (!todaySchedules.length) {
    return { allowed: false, reason: 'Hôm nay lớp không có buổi học theo lịch.' };
  }

  const currentMinutes = now.getHours() * 60 + now.getMinutes();
  const startedSchedules = todaySchedules.filter((schedule) => {
    const startMinutes = parseTimeToMinutes(schedule.startTime);
    return startMinutes != null && currentMinutes >= startMinutes;
  });

  if (!startedSchedules.length) {
    const nearestSchedule = [...todaySchedules]
      .sort((left, right) => (parseTimeToMinutes(left.startTime) ?? 0) - (parseTimeToMinutes(right.startTime) ?? 0))[0];
    return {
      allowed: false,
      reason: `Hôm nay có buổi học nhưng chưa tới giờ. Có thể điểm danh từ ${formatTimeToHHMM(nearestSchedule.startTime)}.`,
    };
  }

  return { allowed: true };
};

const getSessionAttendanceAvailability = (session: ScheduleSessionRow | null, now: Date): AttendanceAvailability => {
  if (!session) {
    return { allowed: false, reason: 'Chưa chọn buổi học để điểm danh.' };
  }

  const todayKey = toLocalDateKey(now);
  if (session.attendanceDate !== todayKey) {
    return { allowed: false, reason: 'Chỉ có thể điểm danh cho buổi học diễn ra hôm nay.' };
  }

  const startMinutes = parseTimeToMinutes(session.startTime);
  const currentMinutes = now.getHours() * 60 + now.getMinutes();
  if (startMinutes != null && currentMinutes < startMinutes) {
    return {
      allowed: false,
      reason: `Buổi học này chưa tới giờ. Có thể điểm danh từ ${formatTimeToHHMM(session.startTime)}.`,
    };
  }

  return { allowed: true };
};

const getEnrollmentStatusDisplay = (status?: string) => {
  if (status === 'ACTIVE' || status === 'APPROVED' || status === 'PENDING') {
    return { label: 'Đang học', color: 'success' as const };
  }

  return { label: 'Dừng học', color: 'default' as const };
};

export default function TeacherClassesPage() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const user = useSelector((state: RootState) => state.auth.user);
  const [classes, setClasses] = useState<ClassItem[]>([]);
  const [selectedClass, setSelectedClass] = useState<ClassItem | null>(null);
  const [enrollments, setEnrollments] = useState<EnrollmentItem[]>([]);
  const [attendance, setAttendance] = useState<Record<string, AttendanceItem[]>>({});
  const [attendanceLoading, setAttendanceLoading] = useState(false);
  const [loading, setLoading] = useState(true);
  const [detailTab, setDetailTab] = useState(0);
  const [detailLoading, setDetailLoading] = useState(false);
  const [snackbar, setSnackbar] = useState<{ open: boolean; message: string; severity: 'success' | 'error' }>({
    open: false,
    message: '',
    severity: 'success',
  });
  const [attendanceForm, setAttendanceForm] = useState<Record<string, string>>({});
  const [sessionAttendanceDialog, setSessionAttendanceDialog] = useState<{ open: boolean; session: ScheduleSessionRow | null }>({
    open: false,
    session: null,
  });

  const selectedClassId = selectedClass?.id;
  const todayIso = toLocalDateKey(new Date());
  const todayAttendanceAvailability = getTodayAttendanceAvailability(selectedClass, new Date());
  const selectedSessionAttendanceAvailability = getSessionAttendanceAvailability(sessionAttendanceDialog.session, new Date());

  useEffect(() => {
    void fetchClasses();
  }, [user?.id]);

  useEffect(() => {
    if (selectedClassId) {
      void fetchClassDetails(selectedClassId);
    }
  }, [selectedClassId]);

  const fetchClasses = async () => {
    try {
      setLoading(true);
      const data = await classApi.getAll();
      const mine = (data || []).filter((cls: ClassItem) => !user?.id || cls.teacherId === user.id);
      setClasses(mine);
      if (mine.length > 0 && !selectedClass) {
        setSelectedClass(mine[0]);
      }
    } catch (err: any) {
      setSnackbar({
        open: true,
        message: err?.response?.data?.message || 'Không thể tải danh sách lớp',
        severity: 'error',
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchClassDetails = async (classId: string) => {
    try {
      setDetailLoading(true);
      const [enrollmentResponse, attendanceResponse] = await Promise.all([
        enrollmentApi.getByClass(classId),
        attendanceApi.getByClass(classId),
      ]);

      setEnrollments(Array.isArray(enrollmentResponse.data) ? enrollmentResponse.data : []);

      // Group attendance by date for easier access
      const attendanceByDate: Record<string, AttendanceItem[]> = {};
      const attendanceList = Array.isArray(attendanceResponse.data) ? attendanceResponse.data : [];
      attendanceList.forEach((item: AttendanceItem) => {
        const date = item.attendanceDate || todayIso;
        if (!attendanceByDate[date]) {
          attendanceByDate[date] = [];
        }
        attendanceByDate[date].push(item);
      });
      setAttendance(attendanceByDate);
    } catch (err: any) {
      setSnackbar({
        open: true,
        message: err?.response?.data?.message || 'Không thể tải chi tiết lớp học',
        severity: 'error',
      });
    } finally {
      setDetailLoading(false);
    }
  };

  const handleMarkAttendance = async (enrollmentId: string, status: string, attendanceDate: string) => {
    try {
      setAttendanceLoading(true);
      await attendanceApi.submit({
        enrollmentId,
        status,
        attendanceDate: attendanceDate || todayIso,
      });
      setSnackbar({ open: true, message: 'Cập nhật điểm danh thành công', severity: 'success' });
      if (selectedClassId) {
        await fetchClassDetails(selectedClassId);
      }
    } catch (err: any) {
      setSnackbar({
        open: true,
        message: err?.response?.data?.message || 'Không thể cập nhật điểm danh',
        severity: 'error',
      });
    } finally {
      setAttendanceLoading(false);
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

  const scheduleSessionRows = useMemo<ScheduleSessionRow[]>(() => {
    if (!selectedClass?.schedules?.length) {
      return [];
    }

    const rows: ScheduleSessionRow[] = [];
    const startDate = selectedClass.startDate ? new Date(`${selectedClass.startDate}T00:00:00`) : null;
    const endDate = selectedClass.endDate ? new Date(`${selectedClass.endDate}T23:59:59`) : null;
    const validRange = startDate && endDate && !Number.isNaN(startDate.getTime()) && !Number.isNaN(endDate.getTime()) && startDate <= endDate;

    if (validRange) {
      selectedClass.schedules.forEach((schedule) => {
        const targetDay = dayOfWeekIndexMap[schedule.dayOfWeek.toUpperCase()];
        if (targetDay === undefined) return;

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
            attendanceDate: occurrenceDateKey,
            dateLabel: formatSessionDateLabel(new Date(occurrence)),
            timeLabel: `${formatTimeToHHMM(schedule.startTime)} - ${formatTimeToHHMM(schedule.endTime)}`,
            startTime: schedule.startTime,
            endTime: schedule.endTime,
            dayOfWeek: schedule.dayOfWeek,
            roomLabel: selectedClass.roomName || '-',
            formatLabel: selectedClass.roomName ? 'Trực tiếp' : 'Online',
          });
        }
      });

      return rows.sort((left, right) => left.sortTime - right.sortTime);
    }

    // Fallback: show weekly schedule
    selectedClass.schedules.forEach((schedule) => {
      const labelDay = dayOfWeekLabelMap[schedule.dayOfWeek.toUpperCase()] || schedule.dayOfWeek;
      rows.push({
        key: schedule.id || `${schedule.dayOfWeek}-${schedule.startTime}`,
        sortTime: dayOfWeekIndexMap[schedule.dayOfWeek.toUpperCase()] || 0,
        attendanceDate: todayIso,
        dateLabel: labelDay,
        timeLabel: `${formatTimeToHHMM(schedule.startTime)} - ${formatTimeToHHMM(schedule.endTime)}`,
        startTime: schedule.startTime,
        endTime: schedule.endTime,
        dayOfWeek: schedule.dayOfWeek,
        roomLabel: selectedClass.roomName || '-',
        formatLabel: selectedClass.roomName ? 'Trực tiếp' : 'Online',
      });
    });

    return rows.sort((l, r) => l.sortTime - r.sortTime);
  }, [selectedClass]);

  return (
    <Box sx={{ pb: 4 }}>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" fontWeight={800} color="primary.main" sx={{ mb: 1 }}>
          Lớp học của tôi
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Quản lý lớp học, xem danh sách học viên và điểm danh từng buổi học.
        </Typography>
      </Box>

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 10 }}>
          <CircularProgress />
        </Box>
      ) : classes.length === 0 ? (
        <Paper sx={{ p: 6, textAlign: 'center', borderRadius: 4, bgcolor: 'rgba(0,0,0,0.02)' }}>
          <Typography color="text.secondary" variant="h6">
            Bạn không phụ trách lớp nào trong hệ thống
          </Typography>
        </Paper>
      ) : (
        <>
          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: {
                xs: '1fr',
                md: classes.length === 1 ? '1fr' : 'repeat(2, minmax(0, 1fr))',
              },
              gap: 3,
              mb: 4,
              alignItems: 'stretch',
            }}
          >
            {classes.map((cls) => {
              const scheduleCount = cls.schedules?.length || 0;
              return (
                <Box key={cls.id} sx={{ minWidth: 0, display: 'flex' }}>
                  <Card
                    onClick={() => {
                      setSelectedClass(cls);
                      setDetailTab(0);
                    }}
                    sx={{
                      cursor: 'pointer',
                      width: '100%',
                      height: '100%',
                      minHeight: 286,
                      display: 'flex',
                      flexDirection: 'column',
                      borderRadius: 4,
                      border: '2px solid #1E293B',
                      borderColor: selectedClassId === cls.id ? 'primary.main' : '#1E293B',
                      boxShadow: selectedClassId === cls.id ? '6px 6px 0 #1E293B' : '4px 4px 0 #1E293B',
                      bgcolor: selectedClassId === cls.id ? 'rgba(139, 92, 246, 0.06)' : '#FFFFFF',
                      transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                      '&:hover': { transform: 'translateY(-4px)', boxShadow: '7px 7px 0 #1E293B' },
                    }}
                  >
                    <CardContent sx={{ p: 3, height: '100%', display: 'flex', flexDirection: 'column' }}>
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

                      <Box
                        sx={{
                          display: 'grid',
                          gridTemplateColumns: 'minmax(96px, 0.85fr) minmax(0, 1.15fr)',
                          gap: 2,
                          mb: 3,
                          alignItems: 'stretch',
                        }}
                      >
                          <Box sx={{ p: 1.5, minHeight: 84, textAlign: 'center', bgcolor: '#FFF7DF', border: '1px solid rgba(30,41,59,0.2)', borderRadius: 2, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                            <Typography variant="h6" fontWeight={800}>{scheduleCount}</Typography>
                            <Typography variant="caption" color="text.secondary" fontWeight={600}>Buổi/Tuần</Typography>
                          </Box>
                          <Box sx={{ p: 1.5, minHeight: 84, textAlign: 'center', bgcolor: '#F7E9FF', border: '1px solid rgba(30,41,59,0.2)', borderRadius: 2, display: 'flex', flexDirection: 'column', justifyContent: 'center', minWidth: 0 }}>
                            <Typography variant="h6" fontWeight={800} sx={{ fontSize: '1rem', overflowWrap: 'anywhere' }}>{cls.courseName || '-'}</Typography>
                            <Typography variant="caption" color="text.secondary" fontWeight={600}>Khóa học</Typography>
                          </Box>
                      </Box>

                      <Button
                        fullWidth
                        variant="contained"
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedClass(cls);
                          setDetailTab(0);
                        }}
                        sx={{ mt: 'auto', borderRadius: 2, fontWeight: 800, textTransform: 'none' }}
                      >
                        Xem chi tiết
                      </Button>
                    </CardContent>
                  </Card>
                </Box>
              );
            })}
          </Box>

          {/* Class Details Dialog */}
          <Dialog open={!!selectedClass} onClose={() => setSelectedClass(null)} maxWidth="lg" fullWidth PaperProps={{ sx: { borderRadius: 4 } }}>
            <DialogTitle sx={{ p: 3, bgcolor: 'rgba(0,0,0,0.02)' }}>
              <Stack direction={{ xs: 'column', sm: 'row' }} justifyContent="space-between" spacing={2} alignItems={isMobile ? 'flex-start' : 'center'}>
                <Box>
                  <Typography variant="h5" fontWeight={900} color="primary.main">
                    {selectedClass?.name || 'Chi tiết lớp học'}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" fontWeight={600}>
                    {selectedClass?.courseName || 'Khóa học chưa xác định'}
                    {selectedClass?.roomName ? ` • Phòng ${selectedClass.roomName}` : ''}
                  </Typography>
                </Box>
                <Stack direction="row" spacing={1}>
                  <Chip label={getStatusLabel(selectedClass?.status)} color={getStatusColor(selectedClass?.status)} sx={{ fontWeight: 800 }} />
                  <Button variant="outlined" size="small" onClick={() => setSelectedClass(null)} sx={{ borderRadius: 2 }}>Đóng</Button>
                </Stack>
              </Stack>
            </DialogTitle>
            <DialogContent dividers sx={{ p: 0 }}>
              <Box sx={{ p: 3 }}>
                <Box
                  sx={{
                    display: 'grid',
                    gridTemplateColumns: { xs: '1fr', md: 'repeat(3, minmax(0, 1fr))' },
                    gap: 3,
                    mb: 4,
                    alignItems: 'stretch',
                  }}
                >
                  <Box sx={{ minWidth: 0, display: 'flex' }}>
                    <Paper variant="outlined" sx={{ p: 2.5, borderRadius: 3, textAlign: 'center', width: '100%', minHeight: 150, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                      <Typography variant="caption" color="text.secondary" fontWeight={700} display="block" gutterBottom>HỌC VIÊN HIỆN TẠI</Typography>
                      <Typography variant="h4" fontWeight={900}>{enrollments.length} / {selectedClass?.maxStudents || '-'}</Typography>
                      <LinearProgress
                        value={selectedClass?.maxStudents ? (enrollments.length / selectedClass.maxStudents) * 100 : 0}
                        variant="determinate"
                        sx={{ mt: 2, height: 8, borderRadius: 4 }}
                      />
                    </Paper>
                  </Box>
                  <Box sx={{ minWidth: 0, display: 'flex' }}>
                    <Paper variant="outlined" sx={{ p: 2.5, borderRadius: 3, textAlign: 'center', width: '100%', minHeight: 150, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                      <Typography variant="caption" color="text.secondary" fontWeight={700} display="block" gutterBottom>TỔNG BUỔI HỌC</Typography>
                      <Typography variant="h4" fontWeight={900}>{scheduleSessionRows.length}</Typography>
                      <Typography variant="body2" color="primary" fontWeight={700} sx={{ mt: 1 }}>Buổi học</Typography>
                    </Paper>
                  </Box>
                  <Box sx={{ minWidth: 0, display: 'flex' }}>
                    <Paper variant="outlined" sx={{ p: 2.5, borderRadius: 3, textAlign: 'center', width: '100%', minHeight: 150, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                      <Typography variant="caption" color="text.secondary" fontWeight={700} display="block" gutterBottom>THỜI GIAN KHÓA HỌC</Typography>
                      <Typography variant="h6" fontWeight={800}>
                        {formatDateToDDMMYYYY(selectedClass?.startDate)}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">đến</Typography>
                      <Typography variant="h6" fontWeight={800}>
                        {formatDateToDDMMYYYY(selectedClass?.endDate)}
                      </Typography>
                    </Paper>
                  </Box>
                </Box>

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
                  <Box>
                    <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
                      <Typography variant="subtitle1" fontWeight={800}>Lịch học chi tiết theo từng buổi</Typography>
                      <Typography variant="body2" color="text.secondary" fontWeight={600}>
                        Tổng số: {scheduleSessionRows.length}
                      </Typography>
                    </Stack>
                    {!todayAttendanceAvailability.allowed && (
                      <Alert severity="warning" sx={{ mb: 2, borderRadius: 2 }}>
                        {todayAttendanceAvailability.reason}
                      </Alert>
                    )}
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
                              <TableCell sx={{ fontWeight: 800, whiteSpace: 'nowrap', textAlign: 'center' }}>Hành động</TableCell>
                            </TableRow>
                          </TableHead>
                          <TableBody>
                            {scheduleSessionRows.map((session, index) => {
                              const sessionAvailability = getSessionAttendanceAvailability(session, new Date());
                              return (
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
                                <TableCell sx={{ textAlign: 'center' }}>
                                  <Stack spacing={0.75} alignItems="center">
                                  <Button
                                    size="small"
                                    variant="outlined"
                                    onClick={() => setSessionAttendanceDialog({ open: true, session })}
                                    disabled={!sessionAvailability.allowed}
                                    sx={{ fontWeight: 700, textTransform: 'none', borderRadius: 2 }}
                                  >
                                    Điểm danh
                                  </Button>
                                    {!sessionAvailability.allowed && (
                                      <Typography variant="caption" color="text.secondary" sx={{ maxWidth: 180, whiteSpace: 'normal', lineHeight: 1.35 }}>
                                        {sessionAvailability.reason}
                                      </Typography>
                                    )}
                                  </Stack>
                                </TableCell>
                              </TableRow>
                            )})}
                          </TableBody>
                        </Table>
                      </TableContainer>
                    ) : (
                      <Alert severity="info" sx={{ borderRadius: 2 }}>Lớp học này chưa được xếp lịch.</Alert>
                    )}
                  </Box>
                ) : detailTab === 1 ? (
                  <Box>
                    <Typography variant="h6" fontWeight={800} sx={{ mb: 3 }}>Danh sách học viên ({enrollments.length})</Typography>
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
                            </TableRow>
                          </TableHead>
                          <TableBody>
                            {enrollments.map((item) => {
                              const enrollmentStatusDisplay = getEnrollmentStatusDisplay(item.status);
                              return (
                              <TableRow key={item.id} hover>
                                <TableCell sx={{ fontWeight: 700 }}>{item.studentName}</TableCell>
                                <TableCell sx={{ color: 'text.secondary' }}>{item.studentId}</TableCell>
                                <TableCell>{formatDateToDDMMYYYY(item.enrollmentDate)}</TableCell>
                                <TableCell>
                                  <Chip size="small" label={enrollmentStatusDisplay.label} color={enrollmentStatusDisplay.color} sx={{ fontWeight: 700 }} />
                                </TableCell>
                              </TableRow>
                            )})}
                          </TableBody>
                        </Table>
                      </TableContainer>
                    )}
                  </Box>
                ) : (
                  <Box>
                    <Typography variant="h6" fontWeight={800} sx={{ mb: 3 }}>
                      Điểm danh hôm nay - {formatDateToDDMMYYYY(todayIso)}
                    </Typography>
                    {!todayAttendanceAvailability.allowed && (
                      <Alert severity="warning" sx={{ mb: 2, borderRadius: 2 }}>
                        {todayAttendanceAvailability.reason}
                      </Alert>
                    )}
                    {enrollments.length === 0 ? (
                      <Alert severity="info" sx={{ borderRadius: 2 }}>Chưa có học viên trong lớp.</Alert>
                    ) : (
                      <TableContainer component={Paper} variant="outlined" sx={{ borderRadius: 3 }}>
                        <Table size="small">
                          <TableHead sx={{ bgcolor: 'rgba(0,0,0,0.02)' }}>
                            <TableRow>
                              <TableCell sx={{ fontWeight: 800 }}>Học viên</TableCell>
                              <TableCell align="center" sx={{ fontWeight: 800, whiteSpace: 'nowrap' }}>Có mặt</TableCell>
                              <TableCell align="center" sx={{ fontWeight: 800, whiteSpace: 'nowrap' }}>Vắng mặt</TableCell>
                              <TableCell align="center" sx={{ fontWeight: 800, whiteSpace: 'nowrap' }}>Đi muộn</TableCell>
                              <TableCell align="center" sx={{ fontWeight: 800, whiteSpace: 'nowrap' }}>Có phép</TableCell>
                            </TableRow>
                          </TableHead>
                          <TableBody>
                            {enrollments.map((enrollment) => {
                              const todayAttendance = attendance[todayIso]?.find((a) => a.enrollmentId === enrollment.id);
                              return (
                                <TableRow key={enrollment.id} hover>
                                  <TableCell sx={{ fontWeight: 700 }}>{enrollment.studentName}</TableCell>
                                  <TableCell align="center">
                                    <IconButton
                                      size="small"
                                      color={todayAttendance?.status === 'PRESENT' ? 'success' : 'inherit'}
                                      onClick={() => handleMarkAttendance(enrollment.id, 'PRESENT', todayIso)}
                                      disabled={attendanceLoading || !todayAttendanceAvailability.allowed}
                                      sx={{ fontWeight: 700 }}
                                    >
                                      <CheckIcon fontSize="small" />
                                    </IconButton>
                                  </TableCell>
                                  <TableCell align="center">
                                    <IconButton
                                      size="small"
                                      color={todayAttendance?.status === 'ABSENT' ? 'error' : 'inherit'}
                                      onClick={() => handleMarkAttendance(enrollment.id, 'ABSENT', todayIso)}
                                      disabled={attendanceLoading || !todayAttendanceAvailability.allowed}
                                    >
                                      <CloseIcon fontSize="small" />
                                    </IconButton>
                                  </TableCell>
                                  <TableCell align="center">
                                    <IconButton
                                      size="small"
                                      color={todayAttendance?.status === 'LATE' ? 'warning' : 'inherit'}
                                      onClick={() => handleMarkAttendance(enrollment.id, 'LATE', todayIso)}
                                      disabled={attendanceLoading || !todayAttendanceAvailability.allowed}
                                    >
                                      <SchoolOutlinedIcon fontSize="small" />
                                    </IconButton>
                                  </TableCell>
                                  <TableCell align="center">
                                    <IconButton
                                      size="small"
                                      color={todayAttendance?.status === 'EXCUSED' ? 'info' : 'inherit'}
                                      onClick={() => handleMarkAttendance(enrollment.id, 'EXCUSED', todayIso)}
                                      disabled={attendanceLoading || !todayAttendanceAvailability.allowed}
                                    >
                                      <SchoolOutlinedIcon fontSize="small" />
                                    </IconButton>
                                  </TableCell>
                                </TableRow>
                              );
                            })}
                          </TableBody>
                        </Table>
                      </TableContainer>
                    )}
                  </Box>
                )}
              </Box>
            </DialogContent>
          </Dialog>

          {/* Session Attendance Dialog */}
          <Dialog open={sessionAttendanceDialog.open} onClose={() => setSessionAttendanceDialog({ open: false, session: null })} maxWidth="sm" fullWidth PaperProps={{ sx: { borderRadius: 4 } }}>
            <DialogTitle sx={{ p: 3, bgcolor: 'rgba(0,0,0,0.02)' }}>
              <Typography variant="h6" fontWeight={900} color="primary.main">
                Điểm danh buổi học
              </Typography>
              <Typography variant="body2" color="text.secondary" fontWeight={600} sx={{ mt: 1 }}>
                {sessionAttendanceDialog.session?.dateLabel} - {sessionAttendanceDialog.session?.timeLabel}
              </Typography>
            </DialogTitle>
            <DialogContent dividers sx={{ p: 3 }}>
              {!selectedSessionAttendanceAvailability.allowed && (
                <Alert severity="warning" sx={{ mb: 2 }}>
                  {selectedSessionAttendanceAvailability.reason}
                </Alert>
              )}
              {enrollments.length === 0 ? (
                <Alert severity="info">Chưa có học viên trong lớp.</Alert>
              ) : (
                <TableContainer component={Paper} variant="outlined" sx={{ borderRadius: 2 }}>
                  <Table size="small">
                    <TableHead sx={{ bgcolor: 'rgba(0,0,0,0.02)' }}>
                      <TableRow>
                        <TableCell sx={{ fontWeight: 800 }}>Học viên</TableCell>
                        <TableCell align="center" sx={{ fontWeight: 800 }}>Trạng thái</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {enrollments.map((enrollment) => {
                        const attendanceKey = `${sessionAttendanceDialog.session?.key}-${enrollment.id}`;
                        const currentStatus = attendanceForm[attendanceKey] || 'PRESENT';
                        return (
                          <TableRow key={enrollment.id} hover>
                            <TableCell sx={{ fontWeight: 700 }}>{enrollment.studentName}</TableCell>
                            <TableCell align="center">
                              <TextField
                                select
                                size="small"
                                value={currentStatus}
                                disabled={!selectedSessionAttendanceAvailability.allowed || attendanceLoading}
                                onChange={(e) => {
                                  const newStatus = e.target.value;
                                  setAttendanceForm((prev) => ({ ...prev, [attendanceKey]: newStatus }));
                                  // Auto save
                                  if (selectedSessionAttendanceAvailability.allowed) {
                                    handleMarkAttendance(enrollment.id, newStatus, sessionAttendanceDialog.session?.attendanceDate || todayIso);
                                  }
                                }}
                                sx={{ width: 120 }}
                              >
                                <MenuItem value="PRESENT">Có mặt</MenuItem>
                                <MenuItem value="ABSENT">Vắng</MenuItem>
                                <MenuItem value="LATE">Đi muộn</MenuItem>
                                <MenuItem value="EXCUSED">Có phép</MenuItem>
                              </TextField>
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </TableContainer>
              )}
            </DialogContent>
          </Dialog>
        </>
      )}

      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        message={snackbar.message}
      >
        <Alert severity={snackbar.severity} sx={{ width: '100%' }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}
