import { useEffect, useState } from 'react';
import { Box, Typography, Grid, Card, CardContent, LinearProgress, Paper, Chip, CircularProgress, Alert, Avatar, Divider, Button } from '@mui/material';
import { School as SchoolIcon, Event as EventIcon, Grade as GradeIcon, Assignment as AssignmentIcon, Person as PersonIcon } from '@mui/icons-material';
import { useSelector } from 'react-redux';
import { enrollmentApi, classApi, submissionApi, assignmentApi } from '../../../services/api';
import { RootState } from '../../../store';
import { Link as RouterLink } from 'react-router-dom';

interface StudentDashboardState {
  currentCourse?: any;
  grades?: any[];
  upcomingAssignments?: any[];
  averageScore?: number;
  lecturer?: any;
}

export default function StudentDashboard() {
  const user = useSelector((state: RootState) => state.auth.user);
  const [dashboardData, setDashboardData] = useState<StudentDashboardState>({
    grades: [],
    upcomingAssignments: [],
    averageScore: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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
          date: 'Chưa có lịch',
          time: '-',
          room: '-',
          teacher: firstEnrollment.teacherName || 'Đang cập nhật',
        };

        let upcomingAssignments: any[] = [];

        if (classId) {
          const [scheduleRes, assignmentsRes] = await Promise.all([
            classApi.getSchedule(classId),
            assignmentApi.getByClass(classId)
          ]);

          // Schedule logic
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
            
            // If it's today, we'll assume it's the next session unless we want to check time.
            // But for simplicity in this dashboard, if it's today we show it.
            
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
              date: next.fullDate.toLocaleDateString('vi-VN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }),
              time: `${next.startTime?.substring(0, 5) || ''} - ${next.endTime?.substring(0, 5) || ''}`,
              room: next.roomName || 'Phòng học',
              teacher: firstEnrollment.teacherName || 'Giảng viên',
            };
          }

          // Assignments logic
          const allAssignments = Array.isArray(assignmentsRes.data) ? assignmentsRes.data : [];
          upcomingAssignments = allAssignments
            .filter(a => !submissions.find(s => s.assignmentId === a.id))
            .filter(a => new Date(a.dueDate) >= now)
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
            name: firstEnrollment.teacherName || 'Giảng viên',
            email: firstEnrollment.teacherEmail,
            phone: firstEnrollment.teacherPhone,
            avatar: '',
            role: 'Giảng viên chính',
          }
        });
      }
    } catch (err: any) {
      console.error('Failed to fetch dashboard data:', err);
      setError('Không thể tải dữ liệu dashboard');
    } finally {
      setLoading(false);
    }
  };

  if (loading && !dashboardData.currentCourse) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 10 }}>
        <CircularProgress />
      </Box>
    );
  }

  const { currentCourse, grades, upcomingAssignments, averageScore, lecturer } = dashboardData;

  return (
    <Box>
      <Typography variant="h4" gutterBottom fontWeight={700}>
        Chào mừng trở lại, {user?.fullName}!
      </Typography>

      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} md={4}>
          <Card sx={{ height: '100%', borderRadius: 4, boxShadow: '0 4px 20px rgba(0,0,0,0.08)', border: '1px solid rgba(0,0,0,0.05)' }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                <Typography variant="h6" fontWeight={700}>Khóa học hiện tại</Typography>
                <Avatar sx={{ bgcolor: 'primary.light', color: 'primary.main' }}><SchoolIcon /></Avatar>
              </Box>
              <Typography variant="h6" color="primary.main" gutterBottom fontWeight={800}>
                {currentCourse?.name || 'Chưa tham gia khóa học'}
              </Typography>
              <Box sx={{ mt: 3 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                  <Typography variant="body2" color="text.secondary">Tiến độ</Typography>
                  <Typography variant="body2" fontWeight={700}>{currentCourse?.progress || 0}%</Typography>
                </Box>
                <LinearProgress variant="determinate" value={currentCourse?.progress || 0} sx={{ height: 8, borderRadius: 4 }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={4}>
          <Card sx={{ height: '100%', borderRadius: 4, boxShadow: '0 4px 20px rgba(0,0,0,0.08)', border: '1px solid rgba(0,0,0,0.05)' }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                <Typography variant="h6" fontWeight={700}>Lớp học tiếp theo</Typography>
                <Avatar sx={{ bgcolor: 'success.light', color: 'success.main' }}><EventIcon /></Avatar>
              </Box>
              <Typography variant="h5" fontWeight={800} gutterBottom>{currentCourse?.nextClass?.date}</Typography>
              <Typography variant="h6" color="success.main" fontWeight={700}>{currentCourse?.nextClass?.time}</Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                Phòng: <strong>{currentCourse?.nextClass?.room}</strong>
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={4}>
          <Card sx={{ height: '100%', borderRadius: 4, boxShadow: '0 4px 20px rgba(0,0,0,0.08)', border: '1px solid rgba(0,0,0,0.05)' }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                <Typography variant="h6" fontWeight={700}>Điểm trung bình</Typography>
                <Avatar sx={{ bgcolor: 'warning.light', color: 'warning.main' }}><GradeIcon /></Avatar>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'baseline' }}>
                <Typography variant="h2" fontWeight={900} color="warning.main">{averageScore}</Typography>
                <Typography variant="h6" color="text.secondary" sx={{ ml: 1 }}>/ 10</Typography>
              </Box>
              <Typography variant="body2" color="text.secondary">Dựa trên kết quả bài tập</Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Grid container spacing={3}>
        {/* Lecturer Info */}
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 3, borderRadius: 4, height: '100%', boxShadow: '0 4px 20px rgba(0,0,0,0.05)' }}>
            <Typography variant="h6" gutterBottom fontWeight={700}>Giảng viên của tôi</Typography>
            <Divider sx={{ mb: 3 }} />
            <Box sx={{ textAlign: 'center', py: 2 }}>
              <Avatar 
                src={lecturer?.avatar} 
                sx={{ width: 100, height: 100, mx: 'auto', mb: 2, boxShadow: 3, border: '4px solid white' }} 
              />
              <Typography variant="h6" fontWeight={700}>{lecturer?.name}</Typography>
              <Typography variant="body2" color="text.secondary" gutterBottom>{lecturer?.role}</Typography>
              {lecturer?.email && (
                <Typography variant="caption" display="block" color="primary">
                  {lecturer.email}
                </Typography>
              )}
              {lecturer?.phone && (
                <Typography variant="caption" display="block" color="text.secondary">
                  SĐT: {lecturer.phone}
                </Typography>
              )}
              <Chip label="IELTS 8.5" size="small" color="primary" sx={{ mt: 1 }} />
              <Box sx={{ mt: 3 }}>
                <Button 
                  variant="outlined" 
                  fullWidth 
                  sx={{ borderRadius: 2, mb: 1 }}
                  href={lecturer?.email ? `mailto:${lecturer.email}` : '#'}
                >
                  Gửi Email
                </Button>
                <Button 
                  variant="contained" 
                  fullWidth 
                  sx={{ borderRadius: 2 }}
                  href={lecturer?.phone ? `tel:${lecturer.phone}` : '#'}
                >
                  Gọi điện / Zalo
                </Button>
              </Box>
            </Box>
          </Paper>
        </Grid>

        {/* Assignments */}
        <Grid item xs={12} md={8}>
          <Paper sx={{ p: 3, borderRadius: 4, height: '100%', boxShadow: '0 4px 20px rgba(0,0,0,0.05)' }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="h6" fontWeight={700}>Bài tập sắp đến hạn</Typography>
              <Button component={RouterLink} to="/student/assignments" size="small">Xem tất cả</Button>
            </Box>
            <Divider sx={{ mb: 2 }} />
            {upcomingAssignments && upcomingAssignments.length > 0 ? (
              upcomingAssignments.map((a, i) => (
                <Box key={i} sx={{ p: 2, mb: 2, bgcolor: 'rgba(255, 152, 0, 0.05)', borderRadius: 3, borderLeft: '6px solid #ff9800', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Box>
                    <Typography variant="subtitle2" fontWeight={700}>{a.title}</Typography>
                    <Typography variant="caption" color="error.main" fontWeight={700}>Hạn nộp: {new Date(a.dueDate).toLocaleDateString('vi-VN')}</Typography>
                  </Box>
                  <Button variant="contained" size="small" sx={{ borderRadius: 2 }} component={RouterLink} to="/student/assignments">Nộp bài</Button>
                </Box>
              ))
            ) : (
              <Box sx={{ py: 4, textAlign: 'center' }}>
                <AssignmentIcon sx={{ fontSize: 40, color: 'text.disabled', mb: 1 }} />
                <Typography color="text.secondary">Tuyệt vời! Không có bài tập nào sắp đến hạn.</Typography>
              </Box>
            )}

            <Typography variant="h6" fontWeight={700} sx={{ mt: 4, mb: 2 }}>Kết quả gần đây</Typography>
            <Divider sx={{ mb: 2 }} />
            {grades && grades.length > 0 ? (
              grades.map((g, i) => (
                <Box key={i} sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', p: 2, mb: 1, bgcolor: '#f8f9fa', borderRadius: 2 }}>
                  <Typography variant="body2" fontWeight={600}>{g.assignmentTitle}</Typography>
                  <Chip label={g.grade != null ? `${g.grade}/10` : 'Đang chấm'} color={g.grade != null ? 'success' : 'warning'} size="small" sx={{ fontWeight: 700 }} />
                </Box>
              ))
            ) : (
              <Typography color="text.secondary" variant="body2" align="center" sx={{ py: 2 }}>Chưa có kết quả học tập.</Typography>
            )}
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
}
