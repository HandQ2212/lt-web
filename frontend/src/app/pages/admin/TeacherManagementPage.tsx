import { useEffect, useState, useMemo } from 'react';
import {
  Alert,
  Avatar,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  LinearProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  IconButton,
  List,
  ListItem,
  ListItemText,
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
  Add as AddIcon,
  Delete as DeleteIcon,
  Edit as EditIcon,
  Search as SearchIcon,
  Email as EmailIcon,
  Phone as PhoneIcon,
  School as SchoolIcon,
  People as PeopleIcon,
  ArrowBack as ArrowBackIcon,
  Class as ClassIcon,
} from '@mui/icons-material';
import { AppUser, UserRole, classApi, userApi, enrollmentApi, attendanceApi } from '../../../services/api';
import { formatDateToDDMMYYYY, formatTimeToHHMM } from '../../utils/dateFormatter';
import PersonalResumeCard from '../../components/common/PersonalResumeCard';

type ClassItem = {
  id: string;
  name?: string;
  status?: string;
  startDate?: string;
  endDate?: string;
  maxStudents?: number;
  currentStudents?: number;
  courseName?: string;
  branchId?: string;
  branchName?: string;
  roomId?: string;
  roomName?: string;
  teacherId?: string;
  teacherName?: string;
  teacherEmail?: string;
  teacher?: {
    id?: string;
    name?: string;
    fullName?: string;
    email?: string;
  };
  schedules?: Array<{ id?: string; scheduleDate?: string; dayOfWeek?: string; startTime: string; endTime: string }>;
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
  scheduleDate?: string;
  dayOfWeek?: string;
  startTime?: string;
  endTime?: string;
};

type ScheduleForm = {
  scheduleDate: string;
  startTime: string;
  endTime: string;
};

type TeacherForm = {
  fullName: string;
  email: string;
  phone: string;
  password: string;
};

const defaultForm: TeacherForm = { fullName: '', email: '', phone: '', password: '' };

const normalizeMatchValue = (value?: string | null) => (value || '').trim().toLowerCase();

const getClassRoomName = (cls: ClassItem) => cls.roomName || (cls as any).room_name || '';
const getClassBranchName = (cls: ClassItem) => cls.branchName || (cls as any).branch_name || '';

const isClassAssignedToTeacher = (cls: ClassItem, teacher: AppUser | null) => {
  if (!teacher) return false;
  return normalizeMatchValue(cls.teacherId) === normalizeMatchValue(teacher.id);
};

const getStatusColor = (status?: string): 'default' | 'info' | 'success' | 'warning' | 'error' => {
  switch (status) {
    case 'UPCOMING': return 'warning';
    case 'ACCEPTING': return 'info';
    case 'ONGOING': return 'success';
    case 'COMPLETED': return 'default';
    default: return 'default';
  }
};

const getStatusLabel = (status?: string) => {
  switch (status) {
    case 'UPCOMING': return 'Mới tạo';
    case 'ACCEPTING': return 'Đang tuyển sinh';
    case 'ONGOING': return 'Đang diễn ra';
    case 'COMPLETED': return 'Hoàn thành';
    default: return status || '';
  }
};

const getEnrollmentStatusDisplay = (status?: string) => {
  if (status === 'ACTIVE' || status === 'APPROVED' || status === 'PENDING') {
    return { label: 'Đang học', color: 'success' as const };
  }

  return { label: 'Dừng học', color: 'default' as const };
};

const dayOfWeekIndexMap: Record<string, number> = {
  SUNDAY: 0, MONDAY: 1, TUESDAY: 2, WEDNESDAY: 3, THURSDAY: 4, FRIDAY: 5, SATURDAY: 6,
};

const dayOfWeekLabelMap: Record<string, string> = {
  SUNDAY: 'Chủ Nhật', MONDAY: 'Thứ Hai', TUESDAY: 'Thứ Ba', WEDNESDAY: 'Thứ Tư', THURSDAY: 'Thứ Năm', FRIDAY: 'Thứ Sáu', SATURDAY: 'Thứ Bảy',
};

const getDateInputValue = (date = new Date()) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const getDayOfWeekFromDate = (dateValue: string) => {
  const date = new Date(`${dateValue}T00:00:00`);
  const values = ['SUNDAY', 'MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY'];
  return values[date.getDay()] || 'MONDAY';
};

const getScheduleSortTime = (scheduleDate: string | undefined, dayOfWeek: string | undefined, startTime: string) => {
  const [hour = 0, minute = 0] = String(startTime).split(':').map((part) => Number(part));
  if (scheduleDate) {
    const date = new Date(`${scheduleDate}T00:00:00`);
    return date.getTime() + hour * 60 * 60 * 1000 + minute * 60 * 1000;
  }

  const dayIndex = dayOfWeekIndexMap[(dayOfWeek || 'MONDAY').toUpperCase()] ?? 0;
  return dayIndex * 24 * 60 + hour * 60 + minute;
};

const getScheduleDateLabel = (scheduleDate?: string, dayOfWeek?: string) => {
  if (scheduleDate) {
    const weekday = dayOfWeekLabelMap[getDayOfWeekFromDate(scheduleDate)] || '';
    return `${formatDateToDDMMYYYY(scheduleDate)}${weekday ? ` (${weekday})` : ''}`;
  }

  return dayOfWeekLabelMap[(dayOfWeek || '').toUpperCase()] || dayOfWeek || '-';
};

export default function TeacherManagementPage() {
  const [teachers, setTeachers] = useState<AppUser[]>([]);
  const [filteredTeachers, setFilteredTeachers] = useState<AppUser[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [openDialog, setOpenDialog] = useState(false);
  const [editingTeacher, setEditingTeacher] = useState<AppUser | null>(null);
  const [form, setForm] = useState<TeacherForm>(defaultForm);
  const [selectedTeacher, setSelectedTeacher] = useState<AppUser | null>(null);
  const [teacherClasses, setTeacherClasses] = useState<ClassItem[]>([]);
  const [detailLoading, setDetailLoading] = useState(false);
  const [snackbar, setSnackbar] = useState<{ open: boolean; message: string; severity: 'success' | 'error' }>({
    open: false, message: '', severity: 'success',
  });

  const [selectedClassDetail, setSelectedClassDetail] = useState<ClassItem | null>(null);
  const [classDetailTab, setClassDetailTab] = useState(0);
  const [classEnrollments, setClassEnrollments] = useState<any[]>([]);
  const [classAttendance, setClassAttendance] = useState<any[]>([]);
  const [classDetailLoading, setClassDetailLoading] = useState(false);

  const [scheduleForm, setScheduleForm] = useState<ScheduleForm>({ scheduleDate: getDateInputValue(), startTime: '18:00', endTime: '20:00' });
  const [editingScheduleId, setEditingScheduleId] = useState<string | null>(null);
  const [scheduleSubmitting, setScheduleSubmitting] = useState(false);

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const todayIso = new Date().toISOString().slice(0, 10);

  useEffect(() => { void fetchTeachers(); }, []);

  const fetchTeachers = async () => {
    try {
      setLoading(true);
      const page = await userApi.getAll({ size: 200, sort: 'fullName,asc' });
      const list = (page.content || []).filter((u: AppUser) => u.role === 'TEACHER');
      setTeachers(list);
      setFilteredTeachers(list);
    } catch (err: any) {
      setSnackbar({ open: true, message: err?.response?.data?.message || 'Không thể tải danh sách giáo viên', severity: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const handleSaveSchedule = async () => {
    if (!selectedClassDetail) return;
    if (!scheduleForm.scheduleDate) {
      setSnackbar({ open: true, message: 'Vui lòng chọn ngày học', severity: 'error' });
      return;
    }

    const payload = {
      ...scheduleForm,
      dayOfWeek: getDayOfWeekFromDate(scheduleForm.scheduleDate),
    };

    try {
      setScheduleSubmitting(true);
      if (editingScheduleId) {
        await classApi.updateSchedule(selectedClassDetail.id, editingScheduleId, payload);
        setSnackbar({ open: true, message: 'Cập nhật lịch học thành công', severity: 'success' });
      } else {
        await classApi.addSchedule(selectedClassDetail.id, payload);
        setSnackbar({ open: true, message: 'Thêm lịch học thành công', severity: 'success' });
      }
      // Refresh teacher classes and detailed class
      await fetchTeacherClasses(selectedTeacher?.id || '');
      const updatedClass = (await classApi.getAll()).find((c: ClassItem) => c.id === selectedClassDetail.id);
      if (updatedClass) setSelectedClassDetail(updatedClass);
      setEditingScheduleId(null);
      setScheduleForm({ scheduleDate: getDateInputValue(), startTime: '18:00', endTime: '20:00' });
    } catch (err: any) {
      setSnackbar({ open: true, message: err?.response?.data?.message || 'Không thể lưu lịch học', severity: 'error' });
    } finally {
      setScheduleSubmitting(false);
    }
  };

  const handleEditSchedule = (row: ScheduleSessionRow) => {
    if (!row.scheduleId) return;
    setEditingScheduleId(row.scheduleId);
    setScheduleForm({
      scheduleDate: row.scheduleDate || getDateInputValue(),
      startTime: formatTimeToHHMM(row.startTime || '18:00'),
      endTime: formatTimeToHHMM(row.endTime || '20:00'),
    });
  };

  const handleCancelEditSchedule = () => {
    setEditingScheduleId(null);
    setScheduleForm({ scheduleDate: getDateInputValue(), startTime: '18:00', endTime: '20:00' });
  };

  const handleDeleteSchedule = async (scheduleId: string) => {
    if (!selectedClassDetail) return;
    if (!window.confirm('Bạn có chắc chắn muốn xóa lịch học này?')) return;
    try {
      await classApi.deleteSchedule(selectedClassDetail.id, scheduleId);
      setSnackbar({ open: true, message: 'Xóa lịch học thành công', severity: 'success' });
      await fetchTeacherClasses(selectedTeacher?.id || '');
      const updatedClass = (await classApi.getAll()).find((c: ClassItem) => c.id === selectedClassDetail.id);
      if (updatedClass) setSelectedClassDetail(updatedClass);
      if (editingScheduleId === scheduleId) {
        handleCancelEditSchedule();
      }
    } catch (err: any) {
      setSnackbar({ open: true, message: 'Không thể xóa lịch học', severity: 'error' });
    }
  };

  const scheduleSessionRows = useMemo<ScheduleSessionRow[]>(() => {
    if (!selectedClassDetail?.schedules?.length) return [];

    return selectedClassDetail.schedules.map((schedule) => ({
        key: schedule.id || `${schedule.scheduleDate || schedule.dayOfWeek}-${schedule.startTime}`,
        sortTime: getScheduleSortTime(schedule.scheduleDate, schedule.dayOfWeek, schedule.startTime),
        dateLabel: getScheduleDateLabel(schedule.scheduleDate, schedule.dayOfWeek),
        timeLabel: `${formatTimeToHHMM(schedule.startTime)} - ${formatTimeToHHMM(schedule.endTime)}`,
        roomLabel: getClassRoomName(selectedClassDetail) || '-',
        formatLabel: getClassRoomName(selectedClassDetail) ? 'Trực tiếp' : 'Online',
        attendanceLabel: 'Chưa điểm danh',
        teacherLabel: selectedTeacher?.fullName || '-',
        titleLabel: selectedClassDetail.name || '-',
        materialLabel: '-',
        scheduleId: schedule.id,
        scheduleDate: schedule.scheduleDate,
        dayOfWeek: schedule.dayOfWeek,
        startTime: schedule.startTime,
        endTime: schedule.endTime,
      })).sort((a, b) => a.sortTime - b.sortTime);
  }, [selectedClassDetail, selectedTeacher]);

  const fetchTeacherClasses = async (teacherId: string) => {
    try {
      setDetailLoading(true);
      const allClasses = await classApi.getAll();
      const clsList = Array.isArray(allClasses) ? allClasses : [];
      const currentTeacher = selectedTeacher && selectedTeacher.id === teacherId ? selectedTeacher : null;
      const filtered = clsList.filter((cls: ClassItem) => isClassAssignedToTeacher(cls, currentTeacher));
      setTeacherClasses(filtered);
    } catch (err: any) {
      setTeacherClasses([]);
    } finally {
      setDetailLoading(false);
    }
  };

  const fetchClassDetailData = async (classId: string) => {
    try {
      setClassDetailLoading(true);
      const [enrollmentResponse, attendanceResponse] = await Promise.all([
        enrollmentApi.getByClass(classId),
        attendanceApi.getByClass(classId, todayIso),
      ]);
      setClassEnrollments(Array.isArray(enrollmentResponse.data) ? enrollmentResponse.data : []);
      setClassAttendance(Array.isArray(attendanceResponse.data) ? attendanceResponse.data : []);
    } catch (err: any) {
      setSnackbar({ open: true, message: 'Không thể tải chi tiết lớp học', severity: 'error' });
    } finally {
      setClassDetailLoading(false);
    }
  };

  useEffect(() => {
    if (selectedClassDetail) {
      void fetchClassDetailData(selectedClassDetail.id);
    }
  }, [selectedClassDetail]);

  useEffect(() => {
    if (selectedTeacher) {
      void fetchTeacherClasses(selectedTeacher.id);
    }
  }, [selectedTeacher]);

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    if (!query.trim()) {
      setFilteredTeachers(teachers);
    } else {
      const q = query.toLowerCase();
      setFilteredTeachers(teachers.filter((t: AppUser) =>
        t.fullName?.toLowerCase().includes(q) || t.email?.toLowerCase().includes(q) || t.phone?.includes(q)
      ));
    }
  };

  const handleOpenCreate = () => {
    setEditingTeacher(null);
    setForm(defaultForm);
    setOpenDialog(true);
  };

  const handleOpenEdit = (teacher: AppUser) => {
    setEditingTeacher(teacher);
    setForm({ fullName: teacher.fullName, email: teacher.email, phone: teacher.phone || '', password: '' });
    setOpenDialog(true);
  };

  const handleSubmit = async () => {
    try {
      setSubmitting(true);
      if (editingTeacher) {
        await userApi.update(editingTeacher.id, { fullName: form.fullName, phone: form.phone });
      } else {
        await userApi.create({ email: form.email, password: form.password, fullName: form.fullName, phone: form.phone, role: 'TEACHER' as UserRole });
      }
      setSnackbar({ open: true, message: editingTeacher ? 'Cập nhật giáo viên thành công' : 'Thêm giáo viên thành công', severity: 'success' });
      setOpenDialog(false);
      await fetchTeachers();
    } catch (err: any) {
      setSnackbar({ open: true, message: err?.response?.data?.message || 'Thao tác thất bại', severity: 'error' });
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await userApi.deactivate(id);
      setSnackbar({ open: true, message: 'Đã vô hiệu hóa giáo viên', severity: 'success' });
      if (selectedTeacher?.id === id) setSelectedTeacher(null);
      await fetchTeachers();
    } catch (err: any) {
      setSnackbar({ open: true, message: err?.response?.data?.message || 'Không thể vô hiệu hóa', severity: 'error' });
    }
  };

  // Detail View
  if (selectedTeacher) {
    const teacherStatusLabel = selectedTeacher.status === 'ACTIVE' ? 'Hoạt động' : 'Không hoạt động';
    const teacherGenderLabel = selectedTeacher.gender === 'MALE'
      ? 'Nam'
      : selectedTeacher.gender === 'FEMALE'
        ? 'Nữ'
        : selectedTeacher.gender === 'OTHER'
          ? 'Khác'
          : 'Chưa cập nhật';

    return (
      <Box>
        <Button
          startIcon={<ArrowBackIcon />}
          onClick={() => {
            setSelectedTeacher(null);
            setSelectedClassDetail(null);
            handleCancelEditSchedule();
          }}
          sx={{ mb: 2 }}
        >
          Quay lại danh sách
        </Button>

        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 3 }}>
          <Box sx={{ flex: { xs: '0 0 100%', md: '0 0 calc(33.333% - 20px)' } }}>
            <PersonalResumeCard
              compact
              name={selectedTeacher.fullName || 'Giảng viên'}
              avatarUrl={selectedTeacher.avatarUrl}
              avatarFallback={selectedTeacher.fullName?.charAt(0)?.toUpperCase()}
              statusLabel={teacherStatusLabel}
              statusColor={selectedTeacher.status === 'ACTIVE' ? 'success' : 'default'}
              fields={[
                { number: 1, label: 'Mã giảng viên', value: selectedTeacher.id.slice(0, 8).toUpperCase() },
                { number: 2, label: 'Họ và tên', value: selectedTeacher.fullName || '-' },
                { number: 3, label: 'Giới tính', value: teacherGenderLabel },
                { number: 4, label: 'Ngày sinh', value: selectedTeacher.dateOfBirth ? formatDateToDDMMYYYY(selectedTeacher.dateOfBirth) : 'Chưa cập nhật' },
                { number: 5, label: 'Trạng thái', value: teacherStatusLabel },
                { number: 6, label: 'Email', value: selectedTeacher.email },
                { number: 7, label: 'Số điện thoại', value: selectedTeacher.phone || 'Chưa cập nhật' },
                { number: 8, label: 'Vai trò', value: 'Giáo viên' },
                { number: 9, label: 'Số lớp đang dạy', value: teacherClasses.length },
                { number: 10, label: 'Địa chỉ', value: selectedTeacher.address || 'Chưa cập nhật', fullWidth: true },
              ]}
              actions={
                <Stack direction="row" spacing={1} flexWrap="wrap">
                  <Button variant="outlined" startIcon={<EditIcon />} onClick={() => handleOpenEdit(selectedTeacher)} sx={{ borderRadius: 2 }}>
                    Sửa
                  </Button>
                  <Button variant="outlined" color="error" startIcon={<DeleteIcon />} onClick={() => void handleDelete(selectedTeacher.id)} sx={{ borderRadius: 2 }}>
                    Xóa
                  </Button>
                </Stack>
              }
            />
          </Box>

          {/* Teacher Classes */}
          <Box sx={{ flex: { xs: '0 0 100%', md: '0 0 calc(66.667% - 20px)' } }}>
            <Paper sx={{ p: 3 }}>
              <Typography variant="h6" fontWeight={700} sx={{ mb: 2 }}>
                Danh sách lớp đang dạy
              </Typography>
              {detailLoading ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}><CircularProgress /></Box>
              ) : teacherClasses.length === 0 ? (
                <Alert severity="info">Giáo viên chưa được phân công lớp nào.</Alert>
              ) : (
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
                  {teacherClasses.map((cls) => (
                    <Box key={cls.id} sx={{ flex: { xs: '0 0 100%', sm: '0 0 calc(50% - 8px)' } }}>
                      <Card
                        variant="outlined"
                        sx={{
                          cursor: 'pointer',
                          '&:hover': { boxShadow: 3, borderColor: 'primary.main' },
                          transition: 'all 0.2s'
                        }}
                        onClick={() => {
                          setSelectedClassDetail(cls);
                          setClassDetailTab(0);
                          handleCancelEditSchedule();
                        }}
                      >
                        <CardContent>
                          <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
                            <Box>
                              <Typography variant="subtitle1" fontWeight={700}>{cls.name || cls.id}</Typography>
                              <Typography variant="body2" color="text.secondary">{cls.courseName || ''}</Typography>
                            </Box>
                            <Chip size="small" label={getStatusLabel(cls.status)} color={getStatusColor(cls.status)} />
                          </Stack>
                          <Divider sx={{ my: 1.5 }} />
                          <Stack spacing={0.5}>
                            <Typography variant="body2">
                              <strong>Thời gian:</strong> {formatDateToDDMMYYYY(cls.startDate)} - {formatDateToDDMMYYYY(cls.endDate)}
                            </Typography>
                            <Typography variant="body2">
                              <strong>Phòng:</strong> {getClassRoomName(cls) || 'Chưa xếp'}
                            </Typography>
                            <Typography variant="body2">
                              <strong>Cơ sở:</strong> {getClassBranchName(cls) || 'Chưa xếp'}
                            </Typography>
                            <Typography variant="body2">
                              <strong>Sĩ số:</strong> {cls.currentStudents ?? 0} / {cls.maxStudents || 'N/A'}
                            </Typography>
                          </Stack>
                        </CardContent>
                      </Card>
                    </Box>
                  ))}  
                </Box>
              )}
            </Paper>
          </Box>
        </Box>

        {/* Class Detail Dialog - Manager Style */}
        <Dialog
          open={!!selectedClassDetail}
          onClose={() => {
            setSelectedClassDetail(null);
            handleCancelEditSchedule();
          }}
          maxWidth="lg"
          fullWidth
          PaperProps={{ sx: { borderRadius: 4 } }}
        >
          <DialogTitle sx={{ p: 3, bgcolor: 'rgba(0,0,0,0.02)' }}>
            <Stack direction="row" justifyContent="space-between" alignItems="center">
              <Box>
                <Typography variant="h5" fontWeight={900} color="primary.main">
                  {selectedClassDetail?.name || 'Chi tiết lớp học'}
                </Typography>
                <Typography variant="body2" color="text.secondary" fontWeight={600}>
                  {selectedClassDetail?.courseName} • GV: {selectedTeacher?.fullName}
                </Typography>
              </Box>
              <Stack direction="row" spacing={1}>
                <Chip label={getStatusLabel(selectedClassDetail?.status)} color={getStatusColor(selectedClassDetail?.status)} sx={{ fontWeight: 800 }} />
                <Button
                  variant="outlined"
                  size="small"
                  onClick={() => {
                    setSelectedClassDetail(null);
                    handleCancelEditSchedule();
                  }}
                  sx={{ borderRadius: 2 }}
                >
                  Đóng
                </Button>
              </Stack>
            </Stack>
          </DialogTitle>
          <DialogContent dividers sx={{ p: 0 }}>
            <Box sx={{ p: 3 }}>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 3, mb: 4 }}>
                <Box sx={{ flex: { xs: '0 0 100%', md: '0 0 calc(33.333% - 20px)' }, display: 'flex' }}>
                  <Paper
                    variant="outlined"
                    sx={{ p: 2, borderRadius: 3, textAlign: 'center', width: '100%', height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}
                  >
                    <Typography variant="caption" color="text.secondary" fontWeight={700} display="block">HỌC VIÊN</Typography>
                    <Typography variant="h4" fontWeight={900}>{classEnrollments.length} / {selectedClassDetail?.maxStudents || '-'}</Typography>
                    <LinearProgress
                      variant="determinate"
                      value={selectedClassDetail?.maxStudents ? (classEnrollments.length / selectedClassDetail.maxStudents) * 100 : 0}
                      sx={{ mt: 1, borderRadius: 2, height: 6 }}
                    />
                  </Paper>
                </Box>
                <Box sx={{ flex: { xs: '0 0 100%', md: '0 0 calc(33.333% - 20px)' }, display: 'flex' }}>
                  <Paper
                    variant="outlined"
                    sx={{ p: 2, borderRadius: 3, textAlign: 'center', width: '100%', height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}
                  >
                    <Typography variant="caption" color="text.secondary" fontWeight={700} display="block">PHÒNG HỌC</Typography>
                    <Typography variant="h4" fontWeight={900}>{selectedClassDetail ? getClassRoomName(selectedClassDetail) || 'N/A' : 'N/A'}</Typography>
                    <Typography variant="body2" color="primary" fontWeight={700}>Trực tiếp</Typography>
                  </Paper>
                </Box>
                <Box sx={{ flex: { xs: '0 0 100%', md: '0 0 calc(33.333% - 20px)' }, display: 'flex' }}>
                  <Paper
                    variant="outlined"
                    sx={{ p: 2, borderRadius: 3, textAlign: 'center', width: '100%', height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}
                  >
                    <Typography variant="caption" color="text.secondary" fontWeight={700} display="block">THỜI GIAN</Typography>
                    <Typography variant="h6" fontWeight={800}>{formatDateToDDMMYYYY(selectedClassDetail?.startDate)}</Typography>
                    <Typography variant="caption" color="text.secondary">đến</Typography>
                    <Typography variant="h6" fontWeight={800}>{formatDateToDDMMYYYY(selectedClassDetail?.endDate)}</Typography>
                  </Paper>
                </Box>
              </Box>

              <Tabs
                value={classDetailTab}
                onChange={(_, v) => setClassDetailTab(v)}
                sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}
              >
                <Tab label="Lịch học" sx={{ fontWeight: 700 }} />
                <Tab label="Danh sách học viên" sx={{ fontWeight: 700 }} />
                <Tab label="Điểm danh hôm nay" sx={{ fontWeight: 700 }} />
              </Tabs>

              {classDetailLoading ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}><CircularProgress /></Box>
              ) : classDetailTab === 0 ? (
                <Box>
                  <Paper variant="outlined" sx={{ p: 2, mb: 3, borderRadius: 3, bgcolor: 'rgba(25, 118, 210, 0.02)' }}>
                    <Typography variant="subtitle1" fontWeight={800} sx={{ mb: 2 }}>
                      {editingScheduleId ? 'Cập nhật lịch học' : 'Thêm lịch học mới'}
                    </Typography>
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, alignItems: 'center' }}>
                      <Box sx={{ flex: { xs: '0 0 100%', sm: '0 0 calc(33.333% - 13px)' } }}>
                        <TextField
                          type="date"
                          fullWidth
                          label="Ngày học"
                          value={scheduleForm.scheduleDate}
                          onChange={(e) => setScheduleForm(prev => ({ ...prev, scheduleDate: e.target.value }))}
                          InputLabelProps={{ shrink: true }}
                        />
                      </Box>
                      <Box sx={{ flex: { xs: '0 0 calc(50% - 8px)', sm: '0 0 calc(25% - 15px)' } }}>
                        <TextField
                          fullWidth
                          label="Giờ bắt đầu"
                          type="time"
                          value={scheduleForm.startTime}
                          onChange={(e) => setScheduleForm(prev => ({ ...prev, startTime: e.target.value }))}
                          InputLabelProps={{ shrink: true }}
                        />
                      </Box>
                      <Box sx={{ flex: { xs: '0 0 calc(50% - 8px)', sm: '0 0 calc(25% - 15px)' } }}>
                        <TextField
                          fullWidth
                          label="Giờ kết thúc"
                          type="time"
                          value={scheduleForm.endTime}
                          onChange={(e) => setScheduleForm(prev => ({ ...prev, endTime: e.target.value }))}
                          InputLabelProps={{ shrink: true }}
                        />
                      </Box>
                      <Box sx={{ flex: { xs: '0 0 100%', sm: '0 0 calc(16.667% - 14px)' } }}>
                        <Button
                          fullWidth
                          variant="contained"
                          disabled={scheduleSubmitting}
                          onClick={() => void handleSaveSchedule()}
                          sx={{ height: 56, borderRadius: 2, fontWeight: 700, whiteSpace: 'nowrap' }}
                        >
                          {scheduleSubmitting ? 'ĐANG LƯU...' : editingScheduleId ? 'LƯU THAY ĐỔI' : 'THÊM VÀO LỊCH'}
                        </Button>
                      </Box>
                      {editingScheduleId && (
                        <Box sx={{ flex: { xs: '0 0 100%', sm: '0 0 auto' } }}>
                          <Button
                            variant="outlined"
                            onClick={handleCancelEditSchedule}
                            sx={{ height: 56, borderRadius: 2, fontWeight: 700 }}
                          >
                            Hủy sửa
                          </Button>
                        </Box>
                      )}
                    </Box>
                  </Paper>

                  <Typography variant="subtitle1" fontWeight={800} gutterBottom sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    Khung lịch học trong tuần
                    <Typography variant="caption" color="text.secondary" fontWeight={600}>Tổng số: {scheduleSessionRows.length}</Typography>
                  </Typography>

                  <TableContainer component={Paper} variant="outlined" sx={{ borderRadius: 3, maxHeight: 400 }}>
                    <Table size="small" stickyHeader>
                      <TableHead>
                        <TableRow>
                          <TableCell sx={{ fontWeight: 800, bgcolor: '#f8f9fa', zIndex: 10 }}>TT</TableCell>
                          <TableCell sx={{ fontWeight: 800, bgcolor: '#f8f9fa', zIndex: 10 }}>Ngày học</TableCell>
                          <TableCell sx={{ fontWeight: 800, bgcolor: '#f8f9fa', zIndex: 10 }}>Tiết học</TableCell>
                          <TableCell sx={{ fontWeight: 800, bgcolor: '#f8f9fa', zIndex: 10 }}>Phòng học</TableCell>
                          <TableCell sx={{ fontWeight: 800, bgcolor: '#f8f9fa', zIndex: 10 }}>Hình thức</TableCell>
                          <TableCell sx={{ fontWeight: 800, bgcolor: '#f8f9fa', zIndex: 10 }}>Điểm danh</TableCell>
                          <TableCell sx={{ fontWeight: 800, bgcolor: '#f8f9fa', zIndex: 10 }}>Giảng viên</TableCell>
                          <TableCell sx={{ fontWeight: 800, bgcolor: '#f8f9fa', zIndex: 10 }}>Tiêu đề</TableCell>
                          <TableCell sx={{ fontWeight: 800, bgcolor: '#f8f9fa', zIndex: 10 }}>Học liệu</TableCell>
                          <TableCell sx={{ fontWeight: 800, bgcolor: '#f8f9fa', zIndex: 10 }} align="center">Thao tác</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {scheduleSessionRows.length === 0 ? (
                          <TableRow>
                            <TableCell colSpan={10} align="center" sx={{ py: 4, color: 'text.secondary' }}>Chưa có lịch học nào được thiết lập.</TableCell>
                          </TableRow>
                        ) : (
                          scheduleSessionRows.map((row, idx) => (
                            <TableRow key={row.key} hover>
                              <TableCell>{idx + 1}</TableCell>
                              <TableCell sx={{ fontWeight: 600 }}>{row.dateLabel}</TableCell>
                              <TableCell>{row.timeLabel}</TableCell>
                              <TableCell>{row.roomLabel}</TableCell>
                              <TableCell>
                                <Chip size="small" label={row.formatLabel} color="success" variant="outlined" sx={{ fontWeight: 700 }} />
                              </TableCell>
                              <TableCell>
                                <Chip size="small" label={row.attendanceLabel} color="error" variant="outlined" sx={{ fontWeight: 700 }} />
                              </TableCell>
                              <TableCell>{row.teacherLabel}</TableCell>
                              <TableCell>{row.titleLabel}</TableCell>
                              <TableCell>{row.materialLabel}</TableCell>
                              <TableCell align="center">
                                <Stack direction="row" spacing={1} justifyContent="center">
                                  <IconButton size="small" color="primary" onClick={() => handleEditSchedule(row)} disabled={!row.scheduleId}>
                                    <EditIcon fontSize="small" />
                                  </IconButton>
                                  <IconButton size="small" color="error" onClick={() => {
                                    if (row.scheduleId) void handleDeleteSchedule(row.scheduleId);
                                  }} disabled={!row.scheduleId}>
                                    <DeleteIcon fontSize="small" />
                                  </IconButton>
                                </Stack>
                              </TableCell>
                            </TableRow>
                          ))
                        )}
                      </TableBody>
                    </Table>
                  </TableContainer>
                </Box>
              ) : classDetailTab === 1 ? (
                <TableContainer component={Paper} variant="outlined" sx={{ borderRadius: 3 }}>
                  <Table size="small">
                    <TableHead sx={{ bgcolor: '#f8f9fa' }}>
                      <TableRow>
                        <TableCell sx={{ fontWeight: 800 }}>Họ tên</TableCell>
                        <TableCell sx={{ fontWeight: 800 }}>Mã học viên</TableCell>
                        <TableCell sx={{ fontWeight: 800 }}>Trạng thái</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {classEnrollments.map((en) => {
                        const enrollmentStatusDisplay = getEnrollmentStatusDisplay(en.status);
                        return (
                        <TableRow key={en.id} hover>
                          <TableCell sx={{ fontWeight: 700 }}>{en.studentName}</TableCell>
                          <TableCell>{en.studentId}</TableCell>
                          <TableCell>
                            <Chip size="small" label={enrollmentStatusDisplay.label} color={enrollmentStatusDisplay.color} sx={{ fontWeight: 700 }} />
                          </TableCell>
                        </TableRow>
                      )})}
                    </TableBody>
                  </Table>
                </TableContainer>
              ) : (
                <Box>
                  <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
                    <Typography variant="subtitle1" fontWeight={800}>Tình hình điểm danh ngày {formatDateToDDMMYYYY(todayIso)}</Typography>
                    <Chip label={`${classAttendance.length} lượt điểm danh`} variant="outlined" color="primary" sx={{ fontWeight: 700 }} />
                  </Stack>
                  <TableContainer component={Paper} variant="outlined" sx={{ borderRadius: 3 }}>
                    <Table size="small">
                      <TableHead sx={{ bgcolor: '#f8f9fa' }}>
                        <TableRow>
                          <TableCell sx={{ fontWeight: 800 }}>Học viên</TableCell>
                          <TableCell sx={{ fontWeight: 800 }} align="center">Trạng thái</TableCell>
                          <TableCell sx={{ fontWeight: 800 }}>Ghi chú</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {classAttendance.length === 0 ? (
                          <TableRow><TableCell colSpan={3} align="center" sx={{ py: 3, color: 'text.secondary' }}>Chưa có dữ liệu điểm danh hôm nay</TableCell></TableRow>
                        ) : (
                          classAttendance.map((att) => (
                            <TableRow key={att.id} hover>
                              <TableCell sx={{ fontWeight: 700 }}>{att.studentName}</TableCell>
                              <TableCell align="center">
                                <Chip
                                  size="small"
                                  label={att.status}
                                  color={att.status === 'PRESENT' ? 'success' : att.status === 'ABSENT' ? 'error' : 'warning'}
                                  sx={{ fontWeight: 700 }}
                                />
                              </TableCell>
                              <TableCell>{att.notes || '-'}</TableCell>
                            </TableRow>
                          ))
                        )}
                      </TableBody>
                    </Table>
                  </TableContainer>
                </Box>
              )}
            </Box>
          </DialogContent>
        </Dialog>

        {/* Reuse dialog */}
        <Dialog open={openDialog} onClose={() => setOpenDialog(false)} maxWidth="sm" fullWidth>
          <DialogTitle>{editingTeacher ? 'Chỉnh sửa giáo viên' : 'Thêm giáo viên mới'}</DialogTitle>
          <DialogContent>
            <TextField fullWidth label="Họ tên" margin="normal" value={form.fullName} onChange={(e) => setForm((p) => ({ ...p, fullName: e.target.value }))} />
            <TextField fullWidth label="Email" type="email" margin="normal" disabled={!!editingTeacher} value={form.email} onChange={(e) => setForm((p) => ({ ...p, email: e.target.value }))} />
            {!editingTeacher && <TextField fullWidth label="Mật khẩu" type="password" margin="normal" value={form.password} onChange={(e) => setForm((p) => ({ ...p, password: e.target.value }))} />}
            <TextField fullWidth label="Số điện thoại" margin="normal" value={form.phone} onChange={(e) => setForm((p) => ({ ...p, phone: e.target.value }))} />
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setOpenDialog(false)}>Hủy</Button>
            <Button variant="contained" disabled={submitting} onClick={() => void handleSubmit()}>
              {submitting ? 'Đang lưu...' : 'Lưu'}
            </Button>
          </DialogActions>
        </Dialog>

        <Snackbar open={snackbar.open} autoHideDuration={3000} onClose={() => setSnackbar((p) => ({ ...p, open: false }))}>
          <Alert severity={snackbar.severity} variant="filled">{snackbar.message}</Alert>
        </Snackbar>
      </Box>
    );
  }

  // List View
  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box>
          <Typography variant="h4" fontWeight={700}>Quản lý Giáo viên</Typography>
          <Typography color="text.secondary">Xem thông tin chi tiết từng giáo viên, các lớp đang dạy.</Typography>
        </Box>
        <Button variant="contained" startIcon={<AddIcon />} onClick={handleOpenCreate}>Thêm giáo viên</Button>
      </Box>

      <Box sx={{ mb: 3 }}>
        <TextField fullWidth placeholder="Tìm kiếm giáo viên (tên, email, SĐT...)" value={searchQuery} onChange={(e) => handleSearch(e.target.value)} InputProps={{ startAdornment: <SearchIcon sx={{ mr: 1, color: 'text.secondary' }} /> }} variant="outlined" size="small" />
      </Box>

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}><CircularProgress /></Box>
      ) : filteredTeachers.length === 0 ? (
        <Paper sx={{ p: 3, textAlign: 'center' }}>
          <Typography color="text.secondary">{searchQuery ? 'Không tìm thấy giáo viên phù hợp' : 'Chưa có giáo viên nào'}</Typography>
        </Paper>
      ) : (
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
          {filteredTeachers.map((teacher) => (
            <Box key={teacher.id} sx={{ flex: { xs: '0 0 100%', sm: '0 0 calc(50% - 8px)', md: '0 0 calc(33.333% - 13px)' } }}>
              <Card sx={{ cursor: 'pointer', transition: 'all 0.2s', '&:hover': { transform: 'translateY(-3px)', boxShadow: 4 } }} onClick={() => setSelectedTeacher(teacher)}>
                <CardContent>
                  <Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 2 }}>
                    <Avatar sx={{ bgcolor: 'primary.main', width: 48, height: 48 }}>{teacher.fullName?.charAt(0)?.toUpperCase()}</Avatar>
                    <Box sx={{ minWidth: 0 }}>
                      <Typography variant="subtitle1" fontWeight={700} noWrap>{teacher.fullName}</Typography>
                      <Typography variant="body2" color="text.secondary" noWrap>{teacher.email}</Typography>
                    </Box>
                  </Stack>
                  <Stack direction="row" spacing={1} sx={{ mb: 1 }}>
                    <Chip size="small" label="Giáo viên" color="primary" />
                    <Chip size="small" label={teacher.status === 'ACTIVE' ? 'Hoạt động' : 'Ngừng'} color={teacher.status === 'ACTIVE' ? 'success' : 'default'} />
                  </Stack>
                  <Typography variant="body2" color="text.secondary">SĐT: {teacher.phone || 'Chưa cập nhật'}</Typography>
                </CardContent>
              </Card>
            </Box>
          ))}  
        </Box>
      )}

      <Dialog open={openDialog} onClose={() => setOpenDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>{editingTeacher ? 'Chỉnh sửa giáo viên' : 'Thêm giáo viên mới'}</DialogTitle>
        <DialogContent>
          <TextField fullWidth label="Họ tên" margin="normal" value={form.fullName} onChange={(e) => setForm((p) => ({ ...p, fullName: e.target.value }))} />
          <TextField fullWidth label="Email" type="email" margin="normal" disabled={!!editingTeacher} value={form.email} onChange={(e) => setForm((p) => ({ ...p, email: e.target.value }))} />
          {!editingTeacher && <TextField fullWidth label="Mật khẩu" type="password" margin="normal" value={form.password} onChange={(e) => setForm((p) => ({ ...p, password: e.target.value }))} />}
          <TextField fullWidth label="Số điện thoại" margin="normal" value={form.phone} onChange={(e) => setForm((p) => ({ ...p, phone: e.target.value }))} />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)}>Hủy</Button>
          <Button variant="contained" disabled={submitting} onClick={() => void handleSubmit()}>
            {submitting ? 'Đang lưu...' : 'Lưu'}
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar open={snackbar.open} autoHideDuration={3000} onClose={() => setSnackbar((p) => ({ ...p, open: false }))}>
        <Alert severity={snackbar.severity} variant="filled">{snackbar.message}</Alert>
      </Snackbar>
    </Box>
  );
}
