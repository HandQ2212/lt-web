import { useEffect, useMemo, useState } from 'react';
import {
  Alert,
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
} from '@mui/material';
import {
  Add as AddIcon,
  Delete as DeleteIcon,
  Edit as EditIcon,
  ExpandMore as ExpandMoreIcon,
  Search as SearchIcon,
  EventBusy as EventBusyIcon,
  People as PeopleIcon,
  School as SchoolIcon,
  PlayCircleOutline as PlayCircleOutlineIcon,
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

export default function ClassManagementPage() {
  const [classes, setClasses] = useState<ClassItem[]>([]);
  const [filteredClasses, setFilteredClasses] = useState<ClassItem[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
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
    handleSearch(searchQuery);
  }, [classes]);

  useEffect(() => {
    if (selectedClassId) {
      void fetchClassDetails(selectedClassId);
    }
  }, [selectedClassId]);

  const fetchClasses = async () => {
    try {
      setLoading(true);
      const data = await classApi.getAll();
      setClasses(data || []);
    } catch (error: any) {
      setSnackbar({
        open: true,
        message: error?.response?.data?.message || 'Khong the tai danh sach lop',
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

      setCourses(courseList || []);
      setRooms(roomList || []);
      setBranches(branchList || []);
      setTeachers((userPage?.content || []).filter((user: any) => user.role === 'TEACHER'));
    } catch (error: any) {
      setSnackbar({
        open: true,
        message: error?.response?.data?.message || 'Khong the tai du lieu tao lop',
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
        message: error?.response?.data?.message || 'Khong the tai chi tiet lop',
        severity: 'error',
      });
    } finally {
      setDetailLoading(false);
    }
  };

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    if (!query.trim()) {
      setFilteredClasses(classes);
      return;
    }

    const lowercaseQuery = query.toLowerCase();
    const filtered = classes.filter(
      (cls) =>
        cls.name?.toLowerCase().includes(lowercaseQuery) ||
        cls.id?.toLowerCase().includes(lowercaseQuery) ||
        cls.status?.toLowerCase().includes(lowercaseQuery)
    );
    setFilteredClasses(filtered);
  };

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

      setSnackbar({ open: true, message: 'Tao lop thanh cong', severity: 'success' });
      setOpenDialog(false);
      setForm(defaultForm);
      await fetchClasses();
    } catch (error: any) {
      setSnackbar({
        open: true,
        message: error?.response?.data?.message || 'Khong the tao lop',
        severity: 'error',
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await classApi.delete(id);
      setSnackbar({ open: true, message: 'Xoa lop thanh cong', severity: 'success' });
      if (selectedClassId === id) {
        setSelectedClass(null);
        setEnrollments([]);
        setAttendance([]);
      }
      await fetchClasses();
    } catch (error: any) {
      setSnackbar({
        open: true,
        message: error?.response?.data?.message || 'Khong the xoa lop',
        severity: 'error',
      });
    }
  };

  const handleUpdateStatus = async (id: string, newStatus: string) => {
    try {
      await classApi.updateStatus(id, newStatus);
      setSnackbar({ open: true, message: 'Cap nhat trang thai thanh cong', severity: 'success' });
      await fetchClasses();
      if (selectedClassId === id) {
        setSelectedClass((prev) => (prev ? { ...prev, status: newStatus } : prev));
      }
    } catch (error: any) {
      setSnackbar({
        open: true,
        message: error?.response?.data?.message || 'Khong the cap nhat trang thai',
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
      if (scheduleMode === 'edit' && scheduleDialog.scheduleId) {
        await classApi.updateSchedule(scheduleDialog.classId, scheduleDialog.scheduleId, scheduleForm);
        setSnackbar({ open: true, message: 'Cap nhat buoi hoc thanh cong', severity: 'success' });
      } else {
        await classApi.addSchedule(scheduleDialog.classId, scheduleForm);
        setSnackbar({ open: true, message: 'Them lich hoc thanh cong', severity: 'success' });
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
        message: error?.response?.data?.message || 'Khong the luu buoi hoc',
        severity: 'error',
      });
    } finally {
      setScheduleSubmitting(false);
    }
  };

  const handleDeleteSchedule = async (classId: string, scheduleId: string) => {
    try {
      await classApi.deleteSchedule(classId, scheduleId);
      setSnackbar({ open: true, message: 'Xoa buoi hoc thanh cong', severity: 'success' });
      await fetchClasses();
      if (selectedClassId) {
        await fetchClassDetails(selectedClassId);
      }
    } catch (error: any) {
      setSnackbar({
        open: true,
        message: error?.response?.data?.message || 'Khong the xoa buoi hoc',
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
        message: error?.response?.data?.message || 'Khong the tai ket qua hoc tap',
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
        return 'Vua tao';
      case 'ACCEPTING':
        return 'Dang tuyen sinh';
      case 'ONGOING':
        return 'Dang dien ra';
      case 'COMPLETED':
        return 'Hoan thanh';
      case 'CANCELLED':
        return 'Da huy';
      default:
        return status || 'Khong xac dinh';
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

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3, gap: 2 }}>
        <Box>
          <Typography variant="h4" fontWeight={700}>
            Quan ly lop hoc
          </Typography>
          <Typography color="text.secondary">
            Click vao tung lop de xem chi tiet buoi hoc, hoc vien va dieu chinh lich.
          </Typography>
        </Box>
        <Button variant="contained" startIcon={<AddIcon />} onClick={() => setOpenDialog(true)}>
          Tao lop moi
        </Button>
      </Box>

      <Box sx={{ mb: 3 }}>
        <TextField
          fullWidth
          placeholder="Tim kiem lop hoc theo ten, ma lop, trang thai..."
          value={searchQuery}
          onChange={(e) => handleSearch(e.target.value)}
          InputProps={{
            startAdornment: <SearchIcon sx={{ mr: 1, color: 'text.secondary' }} />,
          }}
          variant="outlined"
          size="small"
        />
      </Box>

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
          <CircularProgress />
        </Box>
      ) : filteredClasses.length === 0 ? (
        <Paper sx={{ p: 3, textAlign: 'center' }}>
          <Typography color="text.secondary">
            {searchQuery ? 'Khong tim thay ket qua phu hop' : 'Chua co lop hoc nao'}
          </Typography>
        </Paper>
      ) : (
        <Grid container spacing={2}>
          {filteredClasses.map((cls) => {
            const scheduleCount = cls.schedules?.length || 0;
            const enrolCount = cls.id === selectedClassId ? enrollments.length : undefined;
            const fillRate = cls.maxStudents ? Math.min(100, Math.round(((enrolCount || 0) / cls.maxStudents) * 100)) : 0;
            const lifecycleIndex = getLifecycleIndex(cls.status);
            const lifecyclePct = Math.min(100, Math.round((lifecycleIndex / 3) * 100));

            return (
              <Grid key={cls.id} size={{ xs: 12, sm: 6, lg: 4 }}>
                <Card
                  onClick={() => setSelectedClass(cls)}
                  sx={{
                    cursor: 'pointer',
                    height: '100%',
                    border: selectedClassId === cls.id ? '2px solid' : '1px solid transparent',
                    borderColor: selectedClassId === cls.id ? 'primary.main' : 'transparent',
                    boxShadow: 2,
                    transition: 'transform 0.2s ease, box-shadow 0.2s ease',
                    '&:hover': { transform: 'translateY(-2px)', boxShadow: 4 },
                  }}
                >
                  <CardContent>
                    <Stack direction="row" justifyContent="space-between" alignItems="flex-start" spacing={2} sx={{ mb: 2 }}>
                      <Box sx={{ minWidth: 0 }}>
                        <Stack direction="row" spacing={1} sx={{ mb: 1, flexWrap: 'wrap' }}>
                          <Chip size="small" label={cls.status || 'UPCOMING'} color={getStatusColor(cls.status)} />
                          <Chip size="small" variant="outlined" label={cls.id.slice(0, 8).toUpperCase()} />
                        </Stack>
                        <Typography variant="h6" fontWeight={700} noWrap>
                          {cls.name || cls.id}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {formatDateToDDMMYYYY(cls.startDate)} - {formatDateToDDMMYYYY(cls.endDate)}
                        </Typography>
                      </Box>
                      <IconButton size="small" onClick={(e) => { e.stopPropagation(); setSelectedClass(cls); }}>
                        <ExpandMoreIcon />
                      </IconButton>
                    </Stack>

                    <Grid container spacing={1.5} sx={{ mb: 2 }}>
                      <Grid size={4}>
                        <Paper sx={{ p: 1.25, textAlign: 'center', bgcolor: 'background.default' }}>
                          <Typography variant="body2" fontWeight={700}>
                            {scheduleCount}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            Buoi
                          </Typography>
                        </Paper>
                      </Grid>
                      <Grid size={4}>
                        <Paper sx={{ p: 1.25, textAlign: 'center', bgcolor: 'background.default' }}>
                          <Typography variant="body2" fontWeight={700}>
                            {cls.id === selectedClassId ? attendanceSummary.present : 0}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            Diem danh
                          </Typography>
                        </Paper>
                      </Grid>
                      <Grid size={4}>
                        <Paper sx={{ p: 1.25, textAlign: 'center', bgcolor: 'background.default' }}>
                          <Typography variant="body2" fontWeight={700}>
                            {enrolCount ?? '...'}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            Hoc vien
                          </Typography>
                        </Paper>
                      </Grid>
                    </Grid>

                    <Stack spacing={1.25}>
                      <Box>
                        <Stack direction="row" justifyContent="space-between" sx={{ mb: 0.5 }}>
                          <Typography variant="caption" color="text.secondary">
                            Tien trinh trang thai
                          </Typography>
                          <Typography variant="caption" fontWeight={600}>
                            {getStatusLabel(cls.status)}
                          </Typography>
                        </Stack>
                        <LinearProgress variant="determinate" value={lifecyclePct} sx={{ height: 8, borderRadius: 999 }} />
                      </Box>

                      <Box>
                        <Stack direction="row" justifyContent="space-between" sx={{ mb: 0.5 }}>
                          <Typography variant="caption" color="text.secondary">
                            Lap day lop
                          </Typography>
                          <Typography variant="caption" fontWeight={600}>
                            {cls.maxStudents ? `${enrolCount || 0}/${cls.maxStudents}` : `${enrolCount || 0}`}
                          </Typography>
                        </Stack>
                        <LinearProgress variant="determinate" value={fillRate} sx={{ height: 8, borderRadius: 999 }} color="secondary" />
                      </Box>
                    </Stack>

                    <Stack direction="row" spacing={1} sx={{ mt: 2, flexWrap: 'wrap' }}>
                      <Button
                        size="small"
                        variant="outlined"
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedClass(cls);
                          setDetailTab(0);
                        }}
                        startIcon={<SchoolIcon />}
                      >
                        Chi tiet
                      </Button>
                      {cls.status && cls.status !== 'COMPLETED' && cls.status !== 'CANCELLED' && (
                        <Button
                          size="small"
                          variant="contained"
                          startIcon={<PlayCircleOutlineIcon />}
                          onClick={(e) => {
                            e.stopPropagation();
                            const idx = statusOrder.indexOf(cls.status || 'UPCOMING');
                            const nextStatus = statusOrder[Math.min(idx + 1, statusOrder.length - 1)] || 'ACCEPTING';
                            void handleUpdateStatus(cls.id, nextStatus);
                          }}
                        >
                          {cls.status === 'UPCOMING' ? 'Sang tuyen sinh' : cls.status === 'ACCEPTING' ? 'Bat dau' : 'Hoan thanh'}
                        </Button>
                      )}
                      <IconButton
                        color="error"
                        size="small"
                        onClick={(e) => {
                          e.stopPropagation();
                          void handleDelete(cls.id);
                        }}
                      >
                        <DeleteIcon />
                      </IconButton>
                    </Stack>
                  </CardContent>
                </Card>
              </Grid>
            );
          })}
        </Grid>
      )}

      <Dialog open={!!selectedClass} onClose={() => setSelectedClass(null)} maxWidth="lg" fullWidth>
        <DialogTitle>
          <Stack direction={{ xs: 'column', sm: 'row' }} justifyContent="space-between" spacing={2}>
            <Box>
              <Typography variant="h6" fontWeight={700}>
                {activeClass?.name || 'Chi tiet lop hoc'}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {activeClass?.courseName || 'Chua co khoa hoc'}
                {activeClass?.roomName ? ` • ${activeClass.roomName}` : ''}
                {activeClass?.teacherName ? ` • ${activeClass.teacherName}` : ''}
              </Typography>
            </Box>
            <Stack direction="row" spacing={1} flexWrap="wrap">
              <Chip label={getStatusLabel(activeClass?.status)} color={getStatusColor(activeClass?.status)} />
              <Chip label={`${formatDateToDDMMYYYY(activeClass?.startDate)} - ${formatDateToDDMMYYYY(activeClass?.endDate)}`} variant="outlined" />
            </Stack>
          </Stack>
        </DialogTitle>
        <DialogContent dividers>
          <Grid container spacing={2} sx={{ mb: 2 }}>
            <Grid size={{ xs: 12, md: 4 }}>
              <Paper sx={{ p: 2 }}>
                <Typography variant="caption" color="text.secondary">
                  So hoc vien hien tai
                </Typography>
                <Typography variant="h5" fontWeight={700}>
                  {enrollments.length}/{activeClass?.maxStudents || '-'}
                </Typography>
                <LinearProgress value={activeClass?.maxStudents ? (enrollments.length / activeClass.maxStudents) * 100 : 0} variant="determinate" sx={{ mt: 1, height: 8, borderRadius: 999 }} />
              </Paper>
            </Grid>
            <Grid size={{ xs: 12, md: 4 }}>
              <Paper sx={{ p: 2 }}>
                <Typography variant="caption" color="text.secondary">
                  Buoi hoc
                </Typography>
                <Typography variant="h5" fontWeight={700}>
                  {activeClass?.schedules?.length || 0}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Dang co {attendanceSummary.present}/{attendanceSummary.total} diem danh hom nay
                </Typography>
              </Paper>
            </Grid>
            <Grid size={{ xs: 12, md: 4 }}>
              <Paper sx={{ p: 2 }}>
                <Typography variant="caption" color="text.secondary">
                  Tien trinh trang thai
                </Typography>
                <Typography variant="h5" fontWeight={700}>
                  {getStatusLabel(activeClass?.status)}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {activeClass?.status === 'ONGOING' ? 'Co the xem danh sach vang mat trong tung buoi' : 'Co the xem thong tin tuyensinh/hoc vien'}
                </Typography>
              </Paper>
            </Grid>
          </Grid>

          <Paper sx={{ mb: 2 }}>
            <Tabs value={detailTab} onChange={(_, value) => setDetailTab(value)} variant="scrollable" scrollButtons="auto">
              <Tab label="Lich hoc" />
              <Tab label="Hoc vien" />
              <Tab label="Diem danh hom nay" />
            </Tabs>
          </Paper>

          {detailLoading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}>
              <CircularProgress />
            </Box>
          ) : detailTab === 0 ? (
            <Grid container spacing={2}>
              <Grid size={{ xs: 12, md: 5 }}>
                <Paper sx={{ p: 2 }}>
                  <Typography variant="subtitle1" fontWeight={700} sx={{ mb: 2 }}>
                    {scheduleMode === 'edit' ? 'Chinh sua buoi hoc' : 'Them buoi hoc'}
                  </Typography>
                  <Stack spacing={2}>
                    <TextField
                      select
                      label="Ngay trong tuan"
                      value={scheduleForm.dayOfWeek}
                      onChange={(e) => setScheduleForm((prev) => ({ ...prev, dayOfWeek: e.target.value }))}
                    >
                      <MenuItem value="MONDAY">Thu Hai</MenuItem>
                      <MenuItem value="TUESDAY">Thu Ba</MenuItem>
                      <MenuItem value="WEDNESDAY">Thu Tu</MenuItem>
                      <MenuItem value="THURSDAY">Thu Nam</MenuItem>
                      <MenuItem value="FRIDAY">Thu Sau</MenuItem>
                      <MenuItem value="SATURDAY">Thu Bay</MenuItem>
                      <MenuItem value="SUNDAY">Chu Nhat</MenuItem>
                    </TextField>
                    <TextField
                      type="time"
                      label="Gio bat dau"
                      value={scheduleForm.startTime}
                      onChange={(e) => setScheduleForm((prev) => ({ ...prev, startTime: e.target.value }))}
                      InputLabelProps={{ shrink: true }}
                    />
                    <TextField
                      type="time"
                      label="Gio ket thuc"
                      value={scheduleForm.endTime}
                      onChange={(e) => setScheduleForm((prev) => ({ ...prev, endTime: e.target.value }))}
                      InputLabelProps={{ shrink: true }}
                    />
                    <Button variant="contained" disabled={scheduleSubmitting} onClick={() => void handleSaveSchedule()}>
                      {scheduleMode === 'edit' ? 'Luu buoi hoc' : 'Them buoi hoc'}
                    </Button>
                  </Stack>
                </Paper>
              </Grid>
              <Grid size={{ xs: 12, md: 7 }}>
                <Paper sx={{ p: 2 }}>
                  <Typography variant="subtitle1" fontWeight={700} sx={{ mb: 2 }}>
                    Danh sach buoi hoc
                  </Typography>
                  {activeClass?.schedules?.length ? (
                    <Stack spacing={1.5}>
                      {activeClass.schedules.map((schedule) => (
                        <Paper key={schedule.id || `${schedule.dayOfWeek}-${schedule.startTime}`} sx={{ p: 1.5, bgcolor: 'background.default' }}>
                          <Stack direction="row" justifyContent="space-between" alignItems="center" spacing={2}>
                            <Box>
                              <Typography fontWeight={700}>{schedule.dayOfWeek}</Typography>
                              <Typography variant="body2" color="text.secondary">
                                {formatTimeToHHMM(schedule.startTime)} - {formatTimeToHHMM(schedule.endTime)}
                              </Typography>
                            </Box>
                            <Stack direction="row" spacing={1}>
                              <IconButton size="small" onClick={() => openScheduleDialog(activeClass.id, schedule)}>
                                <EditIcon fontSize="small" />
                              </IconButton>
                              {schedule.id && (
                                <IconButton size="small" color="error" onClick={() => void handleDeleteSchedule(activeClass.id, schedule.id!)}>
                                  <DeleteIcon fontSize="small" />
                                </IconButton>
                              )}
                            </Stack>
                          </Stack>
                        </Paper>
                      ))}
                    </Stack>
                  ) : (
                    <Alert severity="info">Chua co buoi hoc nao.</Alert>
                  )}
                </Paper>
              </Grid>
            </Grid>
          ) : detailTab === 1 ? (
            <Paper sx={{ p: 2 }}>
              <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
                <Typography variant="subtitle1" fontWeight={700}>
                  Danh sach hoc vien ({enrollments.length})
                </Typography>
                <Button variant="outlined" startIcon={<PeopleIcon />}>
                  Chuyen lop / xem chi tiet
                </Button>
              </Stack>
              {enrollments.length === 0 ? (
                <Alert severity="info">Chua co hoc vien trong lop nay.</Alert>
              ) : (
                <TableContainer>
                  <Table size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell>Hoc vien</TableCell>
                        <TableCell>Ngay dang ky</TableCell>
                        <TableCell>Trang thai</TableCell>
                        <TableCell align="right">Thao tac</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {enrollments.map((item) => (
                        <TableRow key={item.id} hover>
                          <TableCell>
                            <Typography fontWeight={600}>{item.studentName}</Typography>
                            <Typography variant="caption" color="text.secondary">
                              {item.studentId}
                            </Typography>
                          </TableCell>
                          <TableCell>{formatDateToDDMMYYYY(item.enrollmentDate)}</TableCell>
                          <TableCell>
                            <Chip size="small" label={item.status || 'ACTIVE'} color={item.status === 'ACTIVE' ? 'success' : 'default'} />
                          </TableCell>
                          <TableCell align="right">
                            <Button size="small" variant="outlined" onClick={() => void handleOpenStudent(item)}>
                              Xem hoc vien
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              )}
            </Paper>
          ) : (
            <Grid container spacing={2}>
              <Grid size={{ xs: 12, md: 4 }}>
                <Paper sx={{ p: 2 }}>
                  <Typography variant="subtitle1" fontWeight={700} sx={{ mb: 2 }}>
                    Diem danh hom nay
                  </Typography>
                  <Stack spacing={1}>
                    <Typography>
                      Co mat: <strong>{attendanceSummary.present}</strong>
                    </Typography>
                    <Typography>
                      Vang mat: <strong>{attendanceSummary.absent}</strong>
                    </Typography>
                    <Typography>
                      Di muon: <strong>{attendanceSummary.late}</strong>
                    </Typography>
                    <Typography>
                      Co phep: <strong>{attendanceSummary.excused}</strong>
                    </Typography>
                  </Stack>
                </Paper>
              </Grid>
              <Grid size={{ xs: 12, md: 8 }}>
                <Paper sx={{ p: 2 }}>
                  <Typography variant="subtitle1" fontWeight={700} sx={{ mb: 2 }}>
                    Chi tiet diem danh
                  </Typography>
                  {attendance.length === 0 ? (
                    <Alert severity="info">Chua co du lieu diem danh cho ngay hom nay.</Alert>
                  ) : (
                    <TableContainer>
                      <Table size="small">
                        <TableHead>
                          <TableRow>
                            <TableCell>Hoc vien</TableCell>
                            <TableCell>Ngay</TableCell>
                            <TableCell>Trang thai</TableCell>
                            <TableCell>Ghi chu</TableCell>
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {attendance.map((row) => (
                            <TableRow key={row.id}>
                              <TableCell>{row.studentName}</TableCell>
                              <TableCell>{formatDateToDDMMYYYY(row.attendanceDate)}</TableCell>
                              <TableCell>
                                <Chip size="small" label={row.status} />
                              </TableCell>
                              <TableCell>{row.notes || '-'}</TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </TableContainer>
                  )}
                </Paper>
              </Grid>
            </Grid>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setSelectedClass(null)}>Dong</Button>
        </DialogActions>
      </Dialog>

      <Dialog open={openDialog} onClose={() => setOpenDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Tao lop hoc moi</DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            label="Ten lop"
            margin="normal"
            value={form.name}
            onChange={(e) => setForm((prev) => ({ ...prev, name: e.target.value }))}
          />
          <TextField
            fullWidth
            select
            label="Khoa hoc"
            margin="normal"
            value={form.courseId}
            onChange={(e) => setForm((prev) => ({ ...prev, courseId: e.target.value }))}
          >
            {courses.map((course) => (
              <MenuItem value={course.id} key={course.id}>
                {course.name}
              </MenuItem>
            ))}
          </TextField>
          <TextField
            fullWidth
            select
            label="Giao vien"
            margin="normal"
            value={form.teacherId}
            onChange={(e) => setForm((prev) => ({ ...prev, teacherId: e.target.value }))}
          >
            {teachers.map((teacher) => (
              <MenuItem value={teacher.id} key={teacher.id}>
                {teacher.fullName || teacher.name || teacher.email}
              </MenuItem>
            ))}
          </TextField>
          <TextField
            fullWidth
            select
            label="Phong hoc"
            margin="normal"
            value={form.roomId}
            onChange={(e) => setForm((prev) => ({ ...prev, roomId: e.target.value }))}
          >
            {rooms.map((room) => (
              <MenuItem value={room.id} key={room.id}>
                {room.name} ({room.capacity || '-'} cho)
              </MenuItem>
            ))}
          </TextField>
          <TextField
            fullWidth
            select
            label="Chi nhanh"
            margin="normal"
            value={form.branchId}
            onChange={(e) => setForm((prev) => ({ ...prev, branchId: e.target.value }))}
          >
            {branches.map((branch) => (
              <MenuItem value={branch.id} key={branch.id}>
                {branch.name}
              </MenuItem>
            ))}
          </TextField>
          <TextField
            fullWidth
            type="date"
            label="Ngay bat dau"
            margin="normal"
            InputLabelProps={{ shrink: true }}
            value={form.startDate}
            onChange={(e) => setForm((prev) => ({ ...prev, startDate: e.target.value }))}
          />
          <TextField
            fullWidth
            type="date"
            label="Ngay ket thuc"
            margin="normal"
            InputLabelProps={{ shrink: true }}
            value={form.endDate}
            onChange={(e) => setForm((prev) => ({ ...prev, endDate: e.target.value }))}
          />
          <TextField
            fullWidth
            type="number"
            label="Si so toi da"
            margin="normal"
            value={form.maxStudents}
            onChange={(e) => setForm((prev) => ({ ...prev, maxStudents: e.target.value }))}
          />
          <TextField
            fullWidth
            select
            label="Trang thai"
            margin="normal"
            value={form.status}
            onChange={(e) => setForm((prev) => ({ ...prev, status: e.target.value }))}
            helperText="Chon trang thai khoi tao va thay doi lop hoc"
          >
            <MenuItem value="UPCOMING">Vua tao</MenuItem>
            <MenuItem value="ACCEPTING">Dang tuyen sinh</MenuItem>
            <MenuItem value="ONGOING">Dang dien ra</MenuItem>
            <MenuItem value="COMPLETED">Hoan thanh</MenuItem>
          </TextField>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)}>Huy</Button>
          <Button variant="contained" disabled={submitting} onClick={() => void handleCreate()}>
            {submitting ? 'Dang tao...' : 'Tao lop'}
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={scheduleDialog.open} onClose={() => setScheduleDialog({ open: false, classId: '' })} maxWidth="xs" fullWidth>
        <DialogTitle>{scheduleMode === 'edit' ? 'Chinh sua buoi hoc' : 'Them lich hoc'}</DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            select
            label="Ngay trong tuan"
            margin="normal"
            value={scheduleForm.dayOfWeek}
            onChange={(e) => setScheduleForm((prev) => ({ ...prev, dayOfWeek: e.target.value }))}
          >
            <MenuItem value="MONDAY">Thu Hai</MenuItem>
            <MenuItem value="TUESDAY">Thu Ba</MenuItem>
            <MenuItem value="WEDNESDAY">Thu Tu</MenuItem>
            <MenuItem value="THURSDAY">Thu Nam</MenuItem>
            <MenuItem value="FRIDAY">Thu Sau</MenuItem>
            <MenuItem value="SATURDAY">Thu Bay</MenuItem>
            <MenuItem value="SUNDAY">Chu Nhat</MenuItem>
          </TextField>
          <TextField
            fullWidth
            type="time"
            label="Gio bat dau"
            margin="normal"
            InputLabelProps={{ shrink: true }}
            value={scheduleForm.startTime}
            onChange={(e) => setScheduleForm((prev) => ({ ...prev, startTime: e.target.value }))}
          />
          <TextField
            fullWidth
            type="time"
            label="Gio ket thuc"
            margin="normal"
            InputLabelProps={{ shrink: true }}
            value={scheduleForm.endTime}
            onChange={(e) => setScheduleForm((prev) => ({ ...prev, endTime: e.target.value }))}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setScheduleDialog({ open: false, classId: '' })}>Huy</Button>
          <Button variant="contained" disabled={scheduleSubmitting} onClick={() => void handleSaveSchedule()}>
            {scheduleSubmitting ? 'Dang luu...' : 'Luu buoi hoc'}
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={studentDialogOpen} onClose={() => setStudentDialogOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>Thong tin hoc vien</DialogTitle>
        <DialogContent dividers>
          <Grid container spacing={2}>
            <Grid size={{ xs: 12, md: 4 }}>
              <Paper sx={{ p: 2 }}>
                <Typography variant="caption" color="text.secondary">
                  Hoc vien
                </Typography>
                <Typography variant="h6" fontWeight={700}>
                  {selectedStudent?.studentName || '-'}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {selectedStudent?.studentId}
                </Typography>
              </Paper>
            </Grid>
            <Grid size={{ xs: 12, md: 4 }}>
              <Paper sx={{ p: 2 }}>
                <Typography variant="caption" color="text.secondary">
                  Lop dang hoc
                </Typography>
                <Typography variant="h6" fontWeight={700}>
                  {selectedStudent?.className || activeClass?.name || '-'}
                </Typography>
              </Paper>
            </Grid>
            <Grid size={{ xs: 12, md: 4 }}>
              <Paper sx={{ p: 2 }}>
                <Typography variant="caption" color="text.secondary">
                  Ty le chuyen can
                </Typography>
                <Typography variant="h6" fontWeight={700}>
                  {studentReport?.attendanceRate != null ? `${Math.round(studentReport.attendanceRate)}%` : '-'}
                </Typography>
              </Paper>
            </Grid>
          </Grid>

          <Box sx={{ mt: 3 }}>
            <Typography variant="subtitle1" fontWeight={700} sx={{ mb: 1 }}>
              Ket qua hoc tap
            </Typography>
            {studentReport ? (
              <Grid container spacing={2}>
                <Grid size={{ xs: 6, sm: 4, md: 2 }}>
                  <Paper sx={{ p: 2, textAlign: 'center' }}>
                    <Typography variant="h6" fontWeight={700}>
                      {studentReport.totalSessions ?? 0}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      Tong buoi
                    </Typography>
                  </Paper>
                </Grid>
                <Grid size={{ xs: 6, sm: 4, md: 2 }}>
                  <Paper sx={{ p: 2, textAlign: 'center' }}>
                    <Typography variant="h6" fontWeight={700}>
                      {studentReport.presentCount ?? 0}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      Co mat
                    </Typography>
                  </Paper>
                </Grid>
                <Grid size={{ xs: 6, sm: 4, md: 2 }}>
                  <Paper sx={{ p: 2, textAlign: 'center' }}>
                    <Typography variant="h6" fontWeight={700}>
                      {studentReport.absentCount ?? 0}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      Vang
                    </Typography>
                  </Paper>
                </Grid>
                <Grid size={{ xs: 6, sm: 4, md: 2 }}>
                  <Paper sx={{ p: 2, textAlign: 'center' }}>
                    <Typography variant="h6" fontWeight={700}>
                      {studentReport.excusedCount ?? 0}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      Co phep
                    </Typography>
                  </Paper>
                </Grid>
                <Grid size={{ xs: 6, sm: 4, md: 2 }}>
                  <Paper sx={{ p: 2, textAlign: 'center' }}>
                    <Typography variant="h6" fontWeight={700}>
                      {studentReport.lateCount ?? 0}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      Di muon
                    </Typography>
                  </Paper>
                </Grid>
              </Grid>
            ) : (
              <Alert severity="info">Chua co du lieu ket qua hoc tap.</Alert>
            )}
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setStudentDialogOpen(false)}>Dong</Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={3000}
        onClose={() => setSnackbar((prev) => ({ ...prev, open: false }))}
      >
        <Alert severity={snackbar.severity} variant="filled">
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}
