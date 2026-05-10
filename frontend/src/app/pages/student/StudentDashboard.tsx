import { useEffect, useState } from 'react';
import { Box, Typography, Grid, Card, CardContent, LinearProgress, Paper, Chip, CircularProgress, Alert, Avatar, Divider, Button, useTheme, useMediaQuery, Dialog, DialogTitle, DialogContent, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Snackbar } from '@mui/material';
import {
  School as SchoolIcon,
  Event as EventIcon,
  Grade as GradeIcon,
  Assignment as AssignmentIcon,
  Person as PersonIcon,
  Email as EmailIcon,
  Phone as PhoneIcon,
  ArrowForward as ArrowForwardIcon,
  EventBusy as EventBusyIcon
} from '@mui/icons-material';
import { useSelector, useDispatch } from 'react-redux';
import { enrollmentApi, classApi, submissionApi, assignmentApi, attendanceApi } from '../../../services/api';
import { RootState } from '../../../store';
import { Link as RouterLink } from 'react-router-dom';
import { formatDateToDDMMYYYY, formatTimeToHHMM } from '../../utils/dateFormatter';

interface StudentDashboardState {
  currentCourse?: any;
  grades?: any[];
  upcomingAssignments?: any[];
  averageScore?: number;
  lecturer?: any;
  enrollmentId?: string;
  classId?: string;
}

const dayOfWeekIndexMap: Record<string, number> = {
  SUNDAY: 0, MONDAY: 1, TUESDAY: 2, WEDNESDAY: 3, THURSDAY: 4, FRIDAY: 5, SATURDAY: 6,
};

const dayOfWeekLabelMap: Record<string, string> = {
  SUNDAY: 'Chủ Nhật', MONDAY: 'Thứ Hai', TUESDAY: 'Thứ Ba', WEDNESDAY: 'Thứ Tư',
  THURSDAY: 'Thứ Năm', FRIDAY: 'Thứ Sáu', SATURDAY: 'Thứ Bảy',
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

export default function StudentDashboard() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const user = useSelector((state: RootState) => state.auth.user);
  const [dashboardData, setDashboardData] = useState<StudentDashboardState>({
    grades: [],
    upcomingAssignments: [],
    averageScore: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // States for session details
  const [sessionDialogOpen, setSessionDialogOpen] = useState(false);
  const [sessions, setSessions] = useState<any[]>([]);
  const [sessionLoading, setSessionLoading] = useState(false);
  const [snackbar, setSnackbar] = useState<{ open: boolean; message: string; severity: 'success' | 'error' }>({
    open: false, message: '', severity: 'success'
  });

  useEffect(() => {
    void fetchDashboardData();
  }, [user?.id]);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);

      const userId = user?.id || localStorage.getItem('userId') || '';
      if (!userId) return;

      const [enrollmentsResponse, submissionsResponse] = await Promise.all([
        enrollmentApi.getByStudent(userId),
        submissionApi.getMine()
      ]);

      const enrollments = Array.isArray(enrollmentsResponse.data) ? enrollmentsResponse.data : [];
      const submissions = Array.isArray(submissionsResponse.data) ? submissionsResponse.data : [];

      if (enrollments.length > 0) {
        const firstEnrollment = enrollments[0];
        const classId = firstEnrollment.classId;

        let nextClassInfo = {
          date: 'Chưa có lịch học',
          time: '-',
          room: '-',
          teacher: firstEnrollment.teacherName || 'Chưa phân công',
        };

        let upcomingAssignments: any[] = [];

        if (classId) {
          const [scheduleRes, assignmentsRes] = await Promise.all([
            classApi.getSchedule(classId),
            assignmentApi.getByClass(classId)
          ]);

          const schedules = Array.isArray(scheduleRes.data) ? scheduleRes.data : [];
          const now = new Date();

          const getNextDate = (dayOfWeek: string) => {
            const daysMap: Record<string, number> = {
              'SUN': 0, 'MON': 1, 'TUE': 2, 'WED': 3, 'THU': 4, 'FRI': 5, 'SAT': 6,
              'SUNDAY': 0, 'MONDAY': 1, 'TUESDAY': 2, 'WEDNESDAY': 3, 'THURSDAY': 4, 'FRIDAY': 5, 'SATURDAY': 6
            };
            const targetDay = daysMap[dayOfWeek.toUpperCase()];
            if (targetDay === undefined) return null;

            const currentDay = now.getDay();
            let daysUntil = (targetDay - currentDay + 7) % 7;

            const nextDate = new Date(now);
            nextDate.setDate(now.getDate() + daysUntil);
            return nextDate;
          };

          const upcomingSessions = schedules
            .map((s: any) => ({ ...s, fullDate: getNextDate(s.dayOfWeek) }))
            .filter((s: any) => s.fullDate !== null)
            .sort((a: any, b: any) => a.fullDate.getTime() - b.fullDate.getTime());

          if (upcomingSessions.length > 0) {
            const next = upcomingSessions[0];
            nextClassInfo = {
              date: next.fullDate.toLocaleDateString('vi-VN', { weekday: 'long', day: 'numeric', month: 'numeric' }),
              time: `${next.startTime?.substring(0, 5) || ''} - ${next.endTime?.substring(0, 5) || ''}`,
              room: next.roomName || 'Phòng học',
              teacher: firstEnrollment.teacherName || 'Chưa phân công',
            };
          }

          const allAssignments = Array.isArray(assignmentsRes.data) ? assignmentsRes.data : [];
          upcomingAssignments = allAssignments
            .filter(a => new Date(a.dueDate) > now)
            .sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime())
            .slice(0, 3);
        }

        const gradedSubmissions = submissions.filter(s => s.grade != null);
        const avgScore = gradedSubmissions.length > 0
          ? gradedSubmissions.reduce((sum, s) => sum + s.grade, 0) / gradedSubmissions.length
          : 0;

        setDashboardData({
          currentCourse: {
            name: firstEnrollment.className,
            progress: 65,
            nextClass: nextClassInfo,
          },
          grades: submissions.slice(0, 4),
          upcomingAssignments,
          averageScore: Number(avgScore.toFixed(1)),
          lecturer: {
            name: firstEnrollment.teacherName || 'Chưa phân công',
            email: firstEnrollment.teacherEmail,
            phone: firstEnrollment.teacherPhone,
            avatar: '',
            role: 'Giảng viên chính',
          },
          enrollmentId: firstEnrollment.id,
          classId: classId
        });
      }
    } catch (err: any) {
      console.error('Failed to fetch dashboard data:', err);
      setError('Không thể tải dữ liệu tổng quan');
    } finally {
      setLoading(false);
    }
  };

  const fetchSessions = async () => {
    if (!dashboardData.classId || !dashboardData.enrollmentId) return;
    
    try {
      setSessionLoading(true);
      const [classRes, attendanceRes] = await Promise.all([
        classApi.getById(dashboardData.classId),
        attendanceApi.getByEnrollment(dashboardData.enrollmentId)
      ]);
      
      const classData = classRes.data;
      const attendanceList = Array.isArray(attendanceRes.data) ? attendanceRes.data : [];
      
      const rows: any[] = [];
      const startDate = classData.startDate ? new Date(`${classData.startDate}T00:00:00`) : null;
      const endDate = classData.endDate ? new Date(`${classData.endDate}T23:59:59`) : null;
      
      if (startDate && endDate && !isNaN(startDate.getTime()) && !isNaN(endDate.getTime())) {
        classData.schedules?.forEach((schedule: any) => {
          const targetDay = dayOfWeekIndexMap[schedule.dayOfWeek.toUpperCase()];
          if (targetDay === undefined) return;
          
          const firstOccurrence = new Date(startDate);
          const daysUntilFirst = (targetDay - firstOccurrence.getDay() + 7) % 7;
          firstOccurrence.setDate(firstOccurrence.getDate() + daysUntilFirst);
          
          for (let occ = new Date(firstOccurrence); occ <= endDate; occ.setDate(occ.getDate() + 7)) {
            const dateStr = occ.toISOString().split('T')[0];
            const att = attendanceList.find((a: any) => a.attendanceDate === dateStr);
            
            rows.push({
              key: `${schedule.id}-${dateStr}`,
              date: new Date(occ),
              dateStr: dateStr,
              time: `${formatTimeToHHMM(schedule.startTime)} - ${formatTimeToHHMM(schedule.endTime)}`,
              room: classData.roomName || 'Phòng học',
              teacher: classData.teacherName || 'Giảng viên',
              status: att?.status || 'NOT_STARTED',
              notes: att?.notes || '',
            });
          }
        });
      }
      
      setSessions(rows.sort((a, b) => a.date.getTime() - b.date.getTime()));
      setSessionDialogOpen(true);
    } catch (err: any) {
      console.error('Failed to fetch sessions:', err);
      setSnackbar({ open: true, message: 'Không thể tải chi tiết buổi học', severity: 'error' });
    } finally {
      setSessionLoading(false);
    }
  };

  const handleXinNghi = async (session: any) => {
    if (!dashboardData.enrollmentId) return;
    
    if (new Date(session.dateStr) < new Date(new Date().setHours(0,0,0,0))) {
      setSnackbar({ open: true, message: 'Không thể xin nghỉ cho buổi học đã qua', severity: 'error' });
      return;
    }

    if (window.confirm(`Bạn có chắc chắn muốn xin nghỉ buổi học ngày ${formatDateToDDMMYYYY(session.dateStr)}?`)) {
      try {
        await attendanceApi.submit({
          enrollmentId: dashboardData.enrollmentId,
          attendanceDate: session.dateStr,
          status: 'EXCUSED',
          notes: 'Học sinh xin nghỉ qua hệ thống'
        });
        setSnackbar({ open: true, message: 'Gửi yêu cầu xin nghỉ thành công', severity: 'success' });
        await fetchSessions(); // Refresh
      } catch (err: any) {
        setSnackbar({ open: true, message: 'Không thể gửi yêu cầu xin nghỉ', severity: 'error' });
      }
    }
  };

  if (loading && !dashboardData.currentCourse) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 10 }}>
        <CircularProgress />
      </Box>
    );
  }

  const { currentCourse, upcomingAssignments, averageScore, lecturer } = dashboardData;

  return (
    <Box sx={{ pb: 4 }}>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" fontWeight={800} color="primary.main" gutterBottom>
          Bảng điều khiển
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Chào mừng trở lại, <strong>{user?.fullName}</strong>! Chúc bạn một ngày học tập hiệu quả.
        </Typography>
      </Box>

      {error && <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }}>{error}</Alert>}

      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} md={4}>
          <Card 
            onClick={fetchSessions}
            sx={{
              height: '100%',
              borderRadius: 4,
              boxShadow: '0 8px 32px rgba(0,0,0,0.06)',
              background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
              color: 'white',
              cursor: 'pointer',
              transition: 'transform 0.3s ease-in-out',
              '&:hover': {
                transform: 'scale(1.02)',
              }
            }}
          >
            <CardContent sx={{ p: 3 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <Avatar sx={{ bgcolor: 'rgba(255,255,255,0.2)', mr: 1.5 }}><SchoolIcon /></Avatar>
                <Typography variant="h6" fontWeight={700}>Khóa học hiện tại</Typography>
              </Box>
              <Typography variant="h5" fontWeight={800} gutterBottom>
                {currentCourse?.name || 'Chưa tham gia lớp'}
              </Typography>
              <Box sx={{ mt: 3 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                  <Typography variant="body2" sx={{ opacity: 0.9 }}>Tiến độ học tập</Typography>
                  <Typography variant="body2" fontWeight={700}>{currentCourse?.progress || 0}%</Typography>
                </Box>
                <LinearProgress
                  variant="determinate"
                  value={currentCourse?.progress || 0}
                  sx={{
                    height: 8,
                    borderRadius: 4,
                    bgcolor: 'rgba(255,255,255,0.2)',
                    '& .MuiLinearProgress-bar': { bgcolor: 'white' }
                  }}
                />
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={4}>
          <Card sx={{
            height: '100%',
            borderRadius: 4,
            boxShadow: '0 8px 32px rgba(0,0,0,0.06)',
            border: '1px solid rgba(0,0,0,0.05)'
          }}>
            <CardContent sx={{ p: 3 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <Avatar sx={{ bgcolor: 'success.light', color: 'success.main', mr: 1.5 }}><EventIcon /></Avatar>
                  <Typography variant="h6" fontWeight={700}>Lớp học tiếp theo</Typography>
                </Box>
              </Box>
              <Typography variant="h5" fontWeight={800} color="text.primary">
                {currentCourse?.nextClass?.date}
              </Typography>
              <Typography variant="h6" color="success.main" fontWeight={700}>
                {currentCourse?.nextClass?.time}
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                Phòng học: <strong>{currentCourse?.nextClass?.room}</strong>
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={4}>
          <Card sx={{
            height: '100%',
            borderRadius: 4,
            boxShadow: '0 8px 32px rgba(0,0,0,0.06)',
            border: '1px solid rgba(0,0,0,0.05)'
          }}>
            <CardContent sx={{ p: 3 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <Avatar sx={{ bgcolor: 'warning.light', color: 'warning.main', mr: 1.5 }}><GradeIcon /></Avatar>
                <Typography variant="h6" fontWeight={700}>Điểm trung bình</Typography>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'baseline' }}>
                <Typography variant="h2" fontWeight={900} color="warning.main">{averageScore}</Typography>
                <Typography variant="h6" color="text.secondary" sx={{ ml: 1 }}>/ 10</Typography>
              </Box>
              <Typography variant="body2" color="text.secondary">Kết quả dựa trên các bài tập đã nộp</Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Grid container spacing={3}>
        <Grid item xs={12} lg={4}>
          <Paper sx={{ p: 3, borderRadius: 4, height: '100%', boxShadow: '0 8px 32px rgba(0,0,0,0.04)' }}>
            <Typography variant="h6" gutterBottom fontWeight={800} display="flex" alignItems="center">
              <PersonIcon sx={{ mr: 1, color: 'primary.main' }} /> Giảng viên của tôi
            </Typography>
            <Divider sx={{ my: 2 }} />
            <Box sx={{ textAlign: 'center', py: 1 }}>
              <Avatar
                src={lecturer?.avatar}
                sx={{ width: 100, height: 100, mx: 'auto', mb: 2, boxShadow: '0 4px 12px rgba(0,0,0,0.1)', border: '4px solid white' }}
              />
              <Typography variant="h6" fontWeight={800}>{lecturer?.name}</Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>{lecturer?.role}</Typography>

              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, mb: 3 }}>
                {lecturer?.email && (
                  <Chip
                    icon={<EmailIcon sx={{ fontSize: '16px !important' }} />}
                    label={lecturer.email}
                    variant="outlined"
                    size="small"
                    onClick={() => window.location.href = `mailto:${lecturer.email}`}
                  />
                )}
                {lecturer?.phone && (
                  <Chip
                    icon={<PhoneIcon sx={{ fontSize: '16px !important' }} />}
                    label={`SĐT: ${lecturer.phone}`}
                    variant="outlined"
                    size="small"
                    onClick={() => window.location.href = `tel:${lecturer.phone}`}
                  />
                )}
              </Box>

              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                <Button
                  variant="outlined"
                  fullWidth
                  sx={{ borderRadius: 2, py: 1 }}
                  component={RouterLink}
                  to="/profile"
                >
                  Xem hồ sơ giảng viên
                </Button>
                <Button
                  variant="contained"
                  fullWidth
                  sx={{ borderRadius: 2, py: 1 }}
                  onClick={() => window.open(`https://zalo.me/${lecturer?.phone}`, '_blank')}
                >
                  Nhắn tin trao đổi
                </Button>
              </Box>
            </Box>
          </Paper>
        </Grid>

        <Grid item xs={12} lg={8}>
          <Paper sx={{ p: 3, borderRadius: 4, height: '100%', boxShadow: '0 8px 32px rgba(0,0,0,0.04)' }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="h6" fontWeight={800} display="flex" alignItems="center">
                <AssignmentIcon sx={{ mr: 1, color: 'primary.main' }} /> Bài tập sắp đến hạn
              </Typography>
              <Button
                component={RouterLink}
                to="/student/assignments"
                size="small"
                endIcon={<ArrowForwardIcon />}
              >
                Tất cả
              </Button>
            </Box>
            <Divider sx={{ my: 2 }} />

            {upcomingAssignments && upcomingAssignments.length > 0 ? (
              <Grid container spacing={2}>
                {upcomingAssignments.map((a, i) => (
                  <Grid item xs={12} key={i}>
                    <Box sx={{
                      p: 2.5,
                      bgcolor: 'rgba(25, 118, 210, 0.03)',
                      borderRadius: 3,
                      border: '1px solid rgba(25, 118, 210, 0.08)',
                      display: 'flex',
                      flexDirection: { xs: 'column', sm: 'row' },
                      justifyContent: 'space-between',
                      alignItems: { xs: 'flex-start', sm: 'center' },
                      gap: 2
                    }}>
                      <Box>
                        <Typography variant="subtitle1" fontWeight={800} color="primary.dark">
                          {a.title}
                        </Typography>
                        <Box sx={{ display: 'flex', alignItems: 'center', mt: 0.5 }}>
                          <Typography variant="caption" sx={{
                            bgcolor: 'error.light',
                            color: 'error.contrastText',
                            px: 1, py: 0.2, borderRadius: 1, fontWeight: 700, mr: 1
                          }}>
                            Hạn nộp: {new Date(a.dueDate).toLocaleDateString('vi-VN')}
                          </Typography>
                        </Box>
                      </Box>
                      <Button
                        variant="contained"
                        size="small"
                        sx={{ borderRadius: 2, px: 3 }}
                        component={RouterLink}
                        to="/student/assignments"
                      >
                        Nộp bài ngay
                      </Button>
                    </Box>
                  </Grid>
                ))}
              </Grid>
            ) : (
              <Box sx={{ py: 6, textAlign: 'center', opacity: 0.5 }}>
                <AssignmentIcon sx={{ fontSize: 48, mb: 1 }} />
                <Typography>Hiện tại không có bài tập nào sắp đến hạn</Typography>
              </Box>
            )}

            <Typography variant="h6" fontWeight={800} sx={{ mt: 5, mb: 2 }} display="flex" alignItems="center">
              <GradeIcon sx={{ mr: 1, color: 'primary.main' }} /> Kết quả học tập gần đây
            </Typography>
            <Divider sx={{ mb: 2 }} />
            {dashboardData.grades && dashboardData.grades.length > 0 ? (
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                {dashboardData.grades.map((g, i) => (
                  <Box key={i} sx={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    p: 2,
                    bgcolor: 'white',
                    borderRadius: 3,
                    border: '1px solid rgba(0,0,0,0.05)',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.02)'
                  }}>
                    <Box>
                      <Typography variant="subtitle2" fontWeight={700}>{g.assignmentTitle}</Typography>
                      <Typography variant="caption" color="text.secondary">
                        Đã nộp ngày: {new Date(g.submissionDate).toLocaleDateString('vi-VN')}
                      </Typography>
                    </Box>
                    <Chip
                      label={g.grade != null ? `${g.grade} / 10` : 'Đang chấm'}
                      color={g.grade != null ? (g.grade >= 8 ? 'success' : 'warning') : 'default'}
                      size="small"
                      sx={{ fontWeight: 800, borderRadius: 1.5 }}
                    />
                  </Box>
                ))}
              </Box>
            ) : (
              <Box sx={{ py: 4, textAlign: 'center', opacity: 0.5 }}>
                <Typography variant="body2">Chưa có kết quả học tập nào được ghi nhận</Typography>
              </Box>
            )}
          </Paper>
        </Grid>
      </Grid>
      
      {/* Session Details Dialog */}
      <Dialog 
        open={sessionDialogOpen} 
        onClose={() => setSessionDialogOpen(false)}
        maxWidth="lg"
        fullWidth
        PaperProps={{ sx: { borderRadius: 4 } }}
      >
        <DialogTitle sx={{ p: 3, bgcolor: 'rgba(0,0,0,0.02)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Box>
            <Typography variant="h5" fontWeight={900} color="primary.main">
              Chi tiết các buổi học
            </Typography>
            <Typography variant="body2" color="text.secondary" fontWeight={600}>
              {currentCourse?.name} • Danh sách tất cả các buổi học trong khóa
            </Typography>
          </Box>
          <Button onClick={() => setSessionDialogOpen(false)} variant="outlined" sx={{ borderRadius: 2 }}>Đóng</Button>
        </DialogTitle>
        <DialogContent dividers sx={{ p: 0 }}>
          {sessionLoading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 10 }}><CircularProgress /></Box>
          ) : (
            <TableContainer component={Paper} sx={{ boxShadow: 'none', borderRadius: 0 }}>
              <Table stickyHeader>
                <TableHead>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 800, bgcolor: 'rgba(0,0,0,0.01)' }}>STT</TableCell>
                    <TableCell sx={{ fontWeight: 800, bgcolor: 'rgba(0,0,0,0.01)' }}>Ngày học</TableCell>
                    <TableCell sx={{ fontWeight: 800, bgcolor: 'rgba(0,0,0,0.01)' }}>Thời gian</TableCell>
                    <TableCell sx={{ fontWeight: 800, bgcolor: 'rgba(0,0,0,0.01)' }}>Phòng</TableCell>
                    <TableCell sx={{ fontWeight: 800, bgcolor: 'rgba(0,0,0,0.01)' }}>Giảng viên</TableCell>
                    <TableCell sx={{ fontWeight: 800, bgcolor: 'rgba(0,0,0,0.01)' }}>Trạng thái</TableCell>
                    <TableCell align="center" sx={{ fontWeight: 800, bgcolor: 'rgba(0,0,0,0.01)' }}>Thao tác</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {sessions.map((session, index) => {
                    const isFuture = new Date(session.dateStr) >= new Date(new Date().setHours(0,0,0,0));
                    return (
                      <TableRow key={session.key} hover>
                        <TableCell>{index + 1}</TableCell>
                        <TableCell fontWeight={700}>{formatSessionDateLabel(session.date)}</TableCell>
                        <TableCell>{session.time}</TableCell>
                        <TableCell>{session.room}</TableCell>
                        <TableCell>{session.teacher}</TableCell>
                        <TableCell>
                          <Chip 
                            size="small" 
                            label={session.status === 'PRESENT' ? 'Đã tham gia' : 
                                   session.status === 'ABSENT' ? 'Vắng mặt' :
                                   session.status === 'EXCUSED' ? 'Đã xin nghỉ' :
                                   session.status === 'LATE' ? 'Đi muộn' : 'Chưa diễn ra'}
                            color={session.status === 'PRESENT' ? 'success' : 
                                   session.status === 'ABSENT' ? 'error' :
                                   session.status === 'EXCUSED' ? 'warning' :
                                   session.status === 'LATE' ? 'info' : 'default'}
                            sx={{ fontWeight: 700 }}
                          />
                        </TableCell>
                        <TableCell align="center">
                          {isFuture && session.status !== 'EXCUSED' && (
                            <Button 
                              size="small" 
                              variant="text" 
                              color="error"
                              startIcon={<EventBusyIcon />}
                              onClick={() => handleXinNghi(session)}
                              sx={{ fontWeight: 700 }}
                            >
                              Xin nghỉ
                            </Button>
                          )}
                          {session.status === 'EXCUSED' && (
                            <Typography variant="caption" color="warning.main" fontWeight={700}>Đã gửi yêu cầu</Typography>
                          )}
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

      <Snackbar 
        open={snackbar.open} 
        autoHideDuration={4000} 
        onClose={() => setSnackbar({ ...snackbar, open: false })}
      >
        <Alert severity={snackbar.severity} sx={{ borderRadius: 2, boxShadow: 3 }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}
