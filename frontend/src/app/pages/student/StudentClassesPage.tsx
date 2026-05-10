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
  Grid,
  LinearProgress,
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
import { EventBusy as EventBusyIcon, Send as SendIcon } from '@mui/icons-material';
import { attendanceApi, classApi, enrollmentApi } from '../../../services/api';
import { RootState } from '../../../store';
import { formatDateToDDMMYYYY, formatTimeToHHMM } from '../../utils/dateFormatter';

type ClassItem = {
  id: string;
  name?: string;
  courseName?: string;
  roomName?: string;
  teacherName?: string;
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

type ScheduleSessionRow = {
  key: string;
  sortTime: number;
  dateLabel: string;
  timeLabel: string;
  dayOfWeek: string;
  roomLabel: string;
  formatLabel: string;
  dateIso: string;
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

export default function StudentClassesPage() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const user = useSelector((state: RootState) => state.auth.user);
  const [enrollments, setEnrollments] = useState<EnrollmentItem[]>([]);
  const [classesMap, setClassesMap] = useState<Record<string, ClassItem>>({});
  const [selectedEnrollment, setSelectedEnrollment] = useState<EnrollmentItem | null>(null);
  const [detailTab, setDetailTab] = useState(0);
  const [loading, setLoading] = useState(true);
  const [detailLoading, setDetailLoading] = useState(false);
  const [snackbar, setSnackbar] = useState<{ open: boolean; message: string; severity: 'success' | 'error' }>({
    open: false,
    message: '',
    severity: 'success',
  });
  const [leaveDialog, setLeaveDialog] = useState<{ open: boolean; sessionDate: string }>({
    open: false,
    sessionDate: '',
  });
  const [leaveReason, setLeaveReason] = useState('');
  const [leaveSubmitting, setLeaveSubmitting] = useState(false);

  const selectedClass = selectedEnrollment ? classesMap[selectedEnrollment.classId] : null;

  useEffect(() => {
    void fetchEnrollments();
  }, [user?.id]);

  useEffect(() => {
    if (selectedEnrollment?.classId) {
      void fetchClassDetails(selectedEnrollment.classId);
    }
  }, [selectedEnrollment?.classId]);

  const fetchEnrollments = async () => {
    try {
      setLoading(true);
      const userId = user?.id || localStorage.getItem('userId') || '';
      if (!userId) {
        setSnackbar({ open: true, message: 'Không tìm thấy ID người dùng', severity: 'error' });
        return;
      }

      const response = await enrollmentApi.getByStudent(userId);
      const enrollmentsList = Array.isArray(response.data) ? response.data : [];
      setEnrollments(enrollmentsList);

      if (enrollmentsList.length > 0) {
        setSelectedEnrollment(enrollmentsList[0]);
        // Fetch all classes
        const allClasses = await classApi.getAll();
        const classMapData: Record<string, ClassItem> = {};
        (allClasses || []).forEach((cls: ClassItem) => {
          classMapData[cls.id] = cls;
        });
        setClassesMap(classMapData);
      }
    } catch (err: any) {
      setSnackbar({
        open: true,
        message: err?.response?.data?.message || 'Không thể tải danh sách lớp học',
        severity: 'error',
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchClassDetails = async (classId: string) => {
    try {
      setDetailLoading(true);
      const response = await classApi.getById(classId);
      setClassesMap((prev) => ({ ...prev, [classId]: response.data }));
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

  const handleRequestLeave = async () => {
    if (!selectedClass || !selectedEnrollment || !leaveDialog.sessionDate) {
      setSnackbar({ open: true, message: 'Thông tin không đủ để xin phép', severity: 'error' });
      return;
    }

    try {
      setLeaveSubmitting(true);
      await attendanceApi.submit({
        enrollmentId: selectedEnrollment.id,
        status: 'EXCUSED',
        attendanceDate: leaveDialog.sessionDate,
        notes: leaveReason || 'Xin phép nghỉ học',
      });
      setSnackbar({ open: true, message: 'Đã gửi đơn xin phép thành công', severity: 'success' });
      setLeaveDialog({ open: false, sessionDate: '' });
      setLeaveReason('');
    } catch (err: any) {
      setSnackbar({
        open: true,
        message: err?.response?.data?.message || 'Không thể gửi đơn xin phép',
        severity: 'error',
      });
    } finally {
      setLeaveSubmitting(false);
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
          const dateIso = [
            occurrence.getFullYear(),
            String(occurrence.getMonth() + 1).padStart(2, '0'),
            String(occurrence.getDate()).padStart(2, '0'),
          ].join('-');

          rows.push({
            key: `${schedule.id || `${schedule.dayOfWeek}-${schedule.startTime}`}-${dateIso}`,
            sortTime: occurrence.getTime(),
            dateLabel: formatSessionDateLabel(new Date(occurrence)),
            timeLabel: `${formatTimeToHHMM(schedule.startTime)} - ${formatTimeToHHMM(schedule.endTime)}`,
            dayOfWeek: schedule.dayOfWeek,
            roomLabel: selectedClass.roomName || '-',
            formatLabel: selectedClass.roomName ? 'Trực tiếp' : 'Online',
            dateIso,
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
        dateLabel: labelDay,
        timeLabel: `${formatTimeToHHMM(schedule.startTime)} - ${formatTimeToHHMM(schedule.endTime)}`,
        dayOfWeek: schedule.dayOfWeek,
        roomLabel: selectedClass.roomName || '-',
        formatLabel: selectedClass.roomName ? 'Trực tiếp' : 'Online',
        dateIso: '',
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
          Xem chi tiết lớp học, lịch học và xin phép nghỉ học.
        </Typography>
      </Box>

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 10 }}>
          <CircularProgress />
        </Box>
      ) : enrollments.length === 0 ? (
        <Paper sx={{ p: 6, textAlign: 'center', borderRadius: 4, bgcolor: 'rgba(0,0,0,0.02)' }}>
          <Typography color="text.secondary" variant="h6">
            Bạn chưa đăng ký lớp học nào
          </Typography>
        </Paper>
      ) : (
        <>
          <Grid container spacing={3} sx={{ mb: 4 }}>
            {enrollments.map((enrollment) => {
              const cls = classesMap[enrollment.classId];
              if (!cls) return null;
              const scheduleCount = cls.schedules?.length || 0;
              return (
                <Grid key={enrollment.id} item xs={12} sm={6} lg={4}>
                  <Card
                    onClick={() => {
                      setSelectedEnrollment(enrollment);
                      setDetailTab(0);
                    }}
                    sx={{
                      cursor: 'pointer',
                      height: '100%',
                      borderRadius: 4,
                      border: selectedEnrollment?.id === enrollment.id ? '2px solid' : '1px solid transparent',
                      borderColor: selectedEnrollment?.id === enrollment.id ? 'primary.main' : 'transparent',
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
                        <Grid item xs={8}>
                          <Box sx={{ p: 1.5, textAlign: 'center', bgcolor: 'rgba(0,0,0,0.02)', borderRadius: 2 }}>
                            <Typography variant="h6" fontWeight={800}>{cls.courseName}</Typography>
                            <Typography variant="caption" color="text.secondary" fontWeight={600}>Khóa học</Typography>
                          </Box>
                        </Grid>
                      </Grid>

                      <Button
                        fullWidth
                        variant="contained"
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedEnrollment(enrollment);
                          setDetailTab(0);
                        }}
                        sx={{ borderRadius: 2, fontWeight: 700, textTransform: 'none' }}
                      >
                        Xem chi tiết
                      </Button>
                    </CardContent>
                  </Card>
                </Grid>
              );
            })}
          </Grid>

          {/* Class Details Dialog */}
          <Dialog open={!!selectedEnrollment} onClose={() => setSelectedEnrollment(null)} maxWidth="lg" fullWidth PaperProps={{ sx: { borderRadius: 4 } }}>
            <DialogTitle sx={{ p: 3, bgcolor: 'rgba(0,0,0,0.02)' }}>
              <Stack direction={{ xs: 'column', sm: 'row' }} justifyContent="space-between" spacing={2} alignItems={isMobile ? 'flex-start' : 'center'}>
                <Box>
                  <Typography variant="h5" fontWeight={900} color="primary.main">
                    {selectedClass?.name || 'Chi tiết lớp học'}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" fontWeight={600}>
                    {selectedClass?.courseName || 'Khóa học chưa xác định'}
                    {selectedClass?.roomName ? ` • Phòng ${selectedClass.roomName}` : ''}
                    {selectedClass?.teacherName ? ` • GV: ${selectedClass.teacherName}` : ''}
                  </Typography>
                </Box>
                <Stack direction="row" spacing={1}>
                  <Chip label={getStatusLabel(selectedClass?.status)} color={getStatusColor(selectedClass?.status)} sx={{ fontWeight: 800 }} />
                  <Button variant="outlined" size="small" onClick={() => setSelectedEnrollment(null)} sx={{ borderRadius: 2 }}>Đóng</Button>
                </Stack>
              </Stack>
            </DialogTitle>
            <DialogContent dividers sx={{ p: 0 }}>
              <Box sx={{ p: 3 }}>
                <Grid container spacing={3} sx={{ mb: 4 }}>
                  <Grid item xs={12} md={6}>
                    <Paper variant="outlined" sx={{ p: 2.5, borderRadius: 3, textAlign: 'center' }}>
                      <Typography variant="caption" color="text.secondary" fontWeight={700} display="block" gutterBottom>TỔNG BUỔI HỌC</Typography>
                      <Typography variant="h4" fontWeight={900}>{scheduleSessionRows.length}</Typography>
                      <Typography variant="body2" color="primary" fontWeight={700} sx={{ mt: 1 }}>Buổi học</Typography>
                    </Paper>
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <Paper variant="outlined" sx={{ p: 2.5, borderRadius: 3, textAlign: 'center' }}>
                      <Typography variant="caption" color="text.secondary" fontWeight={700} display="block" gutterBottom>THỜI GIAN KHÓA HỌC</Typography>
                      <Typography variant="h6" fontWeight={800}>
                        {formatDateToDDMMYYYY(selectedClass?.startDate)}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">đến</Typography>
                      <Typography variant="h6" fontWeight={800}>
                        {formatDateToDDMMYYYY(selectedClass?.endDate)}
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
                  <Tab label="Xin phép nghỉ học" sx={{ fontWeight: 700 }} />
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
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </TableContainer>
                    ) : (
                      <Alert severity="info" sx={{ borderRadius: 2 }}>Lớp học này chưa được xếp lịch.</Alert>
                    )}
                  </Box>
                ) : (
                  <Box>
                    <Typography variant="h6" fontWeight={800} sx={{ mb: 3 }}>Xin phép nghỉ học</Typography>
                    {scheduleSessionRows.length === 0 ? (
                      <Alert severity="info" sx={{ borderRadius: 2 }}>Chưa có buổi học để xin phép.</Alert>
                    ) : (
                      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                        <Typography variant="body2" color="text.secondary">
                          Chọn buổi học bạn muốn xin phép:
                        </Typography>
                        <Stack spacing={1.5}>
                          {scheduleSessionRows.map((session) => (
                            <Paper
                              key={session.key}
                              variant="outlined"
                              sx={{
                                p: 2,
                                borderRadius: 2,
                                cursor: 'pointer',
                                transition: 'all 0.2s',
                                '&:hover': { bgcolor: 'rgba(0,0,0,0.02)', borderColor: 'primary.main' },
                              }}
                              onClick={() => {
                                setLeaveDialog({ open: true, sessionDate: session.dateIso });
                                setLeaveReason('');
                              }}
                            >
                              <Stack direction="row" justifyContent="space-between" alignItems="center">
                                <Box>
                                  <Typography variant="body2" fontWeight={700}>
                                    {session.dateLabel}
                                  </Typography>
                                  <Typography variant="caption" color="text.secondary">
                                    {session.timeLabel} • {session.roomLabel}
                                  </Typography>
                                </Box>
                                <Button variant="outlined" size="small" sx={{ borderRadius: 2 }}>
                                  Xin phép
                                </Button>
                              </Stack>
                            </Paper>
                          ))}
                        </Stack>
                      </Box>
                    )}
                  </Box>
                )}
              </Box>
            </DialogContent>
          </Dialog>

          {/* Leave Request Dialog */}
          <Dialog open={leaveDialog.open} onClose={() => setLeaveDialog({ open: false, sessionDate: '' })} maxWidth="sm" fullWidth PaperProps={{ sx: { borderRadius: 4 } }}>
            <DialogTitle sx={{ p: 3, bgcolor: 'rgba(0,0,0,0.02)' }}>
              <Typography variant="h6" fontWeight={900} color="primary.main">
                Xin phép nghỉ học
              </Typography>
            </DialogTitle>
            <DialogContent dividers sx={{ p: 3 }}>
              <Stack spacing={2.5}>
                <Box>
                  <Typography variant="body2" color="text.secondary" fontWeight={600} sx={{ mb: 1 }}>
                    Buổi học: {leaveDialog.sessionDate}
                  </Typography>
                </Box>
                <TextField
                  fullWidth
                  multiline
                  rows={4}
                  label="Lý do xin phép"
                  placeholder="Nhập lý do xin phép nghỉ học (tuỳ chọn)"
                  value={leaveReason}
                  onChange={(e) => setLeaveReason(e.target.value)}
                  variant="outlined"
                  disabled={leaveSubmitting}
                />
              </Stack>
            </DialogContent>
            <Box sx={{ p: 2, display: 'flex', gap: 1, justifyContent: 'flex-end' }}>
              <Button
                variant="outlined"
                onClick={() => setLeaveDialog({ open: false, sessionDate: '' })}
                disabled={leaveSubmitting}
                sx={{ borderRadius: 2 }}
              >
                Huỷ
              </Button>
              <Button
                variant="contained"
                startIcon={<SendIcon />}
                onClick={() => void handleRequestLeave()}
                disabled={leaveSubmitting}
                sx={{ borderRadius: 2, fontWeight: 700 }}
              >
                {leaveSubmitting ? 'Đang gửi...' : 'Gửi đơn xin phép'}
              </Button>
            </Box>
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
