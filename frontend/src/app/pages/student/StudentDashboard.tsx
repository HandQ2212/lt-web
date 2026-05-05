import { useEffect, useState } from 'react';
import { Box, Typography, Grid, Card, CardContent, LinearProgress, Paper, Chip, CircularProgress, Alert } from '@mui/material';
import { School as SchoolIcon, Event as EventIcon, Grade as GradeIcon } from '@mui/icons-material';
import { enrollmentApi } from '../../../services/api';

const defaultGrades = [
  { assignment: 'Assignment 1: Reading Practice', score: 8.5, maxScore: 10, date: '2026-04-15' },
  { assignment: 'Assignment 2: Writing Task 1', score: 7.0, maxScore: 10, date: '2026-04-22' },
  { assignment: 'Midterm Test', score: 8.0, maxScore: 10, date: '2026-04-29' },
];

const defaultUpcomingAssignments = [
  { name: 'Writing Task 2 Practice', deadline: '2026-05-10', subject: 'IELTS Writing' },
  { name: 'Speaking Part 2 Recording', deadline: '2026-05-12', subject: 'IELTS Speaking' },
];

interface StudentCourse {
  name?: string;
  progress?: number;
  nextClass?: {
    date: string;
    time: string;
    room: string;
    teacher: string;
  };
}

interface StudentDashboardState {
  currentCourse?: StudentCourse;
  grades?: any[];
  upcomingAssignments?: any[];
  averageScore?: number;
}

export default function StudentDashboard() {
  const [dashboardData, setDashboardData] = useState<StudentDashboardState>({
    currentCourse: {
      name: 'IELTS Preparation',
      progress: 65,
      nextClass: {
        date: '2026-05-04',
        time: '18:00-20:00',
        room: 'P301',
        teacher: 'Ms. Sarah Johnson',
      },
    },
    grades: defaultGrades,
    upcomingAssignments: defaultUpcomingAssignments,
    averageScore: 7.8,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    void fetchEnrollmentData();
  }, []);

  const fetchEnrollmentData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Get current user's ID from context or localStorage
      // For now, using placeholder - would need proper user context
      const userId = localStorage.getItem('userId') || '';
      
      if (userId) {
        const enrollments = await enrollmentApi.getByStudent(userId);
        if (enrollments?.data && Array.isArray(enrollments.data) && enrollments.data.length > 0) {
          const firstEnrollment = enrollments.data[0];
          setDashboardData((prev) => ({
            ...prev,
            currentCourse: {
              name: firstEnrollment.className || 'Unknown Course',
              progress: 65,
              nextClass: {
                date: '2026-05-04',
                time: '18:00-20:00',
                room: 'P301',
                teacher: 'Teacher Name',
              },
            },
          }));
        }
      }
    } catch (err: any) {
      console.error('Failed to fetch enrollment data:', err);
      setError('Không thể tải dữ liệu khóa học');
    } finally {
      setLoading(false);
    }
  };

  if (error) {
    return (
      <Box>
        <Typography variant="h4" gutterBottom fontWeight={700}>
          Chào mừng trở lại!
        </Typography>
        <Alert severity="error">{error}</Alert>
      </Box>
    );
  }

  const currentCourse = dashboardData.currentCourse || {
    name: 'IELTS Preparation',
    progress: 65,
    nextClass: {
      date: '2026-05-04',
      time: '18:00-20:00',
      room: 'P301',
      teacher: 'Ms. Sarah Johnson',
    },
  };

  return (
    <Box>
      <Typography variant="h4" gutterBottom fontWeight={700}>
        Chào mừng trở lại!
      </Typography>

      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                <Typography variant="h6" fontWeight={600}>
                  Khóa học hiện tại
                </Typography>
                <SchoolIcon sx={{ color: 'primary.main' }} />
              </Box>
              <Typography variant="body1" gutterBottom>
                {currentCourse.name}
              </Typography>
              <Box sx={{ mt: 2 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                  <Typography variant="body2" color="text.secondary">
                    Tiến độ
                  </Typography>
                  <Typography variant="body2" fontWeight={600}>
                    {currentCourse.progress}%
                  </Typography>
                </Box>
                <LinearProgress variant="determinate" value={currentCourse.progress} />
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                <Typography variant="h6" fontWeight={600}>
                  Lớp học tiếp theo
                </Typography>
                <EventIcon sx={{ color: 'success.main' }} />
              </Box>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                {currentCourse.nextClass.date}
              </Typography>
              <Typography variant="body1" fontWeight={600}>
                {currentCourse.nextClass.time}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Phòng: {currentCourse.nextClass.room}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                GV: {currentCourse.nextClass.teacher}
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                <Typography variant="h6" fontWeight={600}>
                  Điểm trung bình
                </Typography>
                <GradeIcon sx={{ color: 'warning.main' }} />
              </Box>
              <Typography variant="h3" fontWeight={700} color="primary">
                {loading ? '...' : dashboardData.averageScore || 7.8}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                / 10
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom fontWeight={600}>
              Bảng điểm gần đây
            </Typography>
            {loading ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', py: 3 }}>
                <CircularProgress />
              </Box>
            ) : (
              (dashboardData.grades || defaultGrades).map((grade, index) => (
                <Box
                  key={index}
                  sx={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    p: 2,
                    mb: 1,
                    bgcolor: '#f5f5f5',
                    borderRadius: 1,
                  }}
                >
                  <Box>
                    <Typography variant="body2" fontWeight={600}>
                      {grade.assignment}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {grade.date}
                    </Typography>
                  </Box>
                  <Chip
                    label={`${grade.score}/${grade.maxScore}`}
                    color={grade.score >= 8 ? 'success' : grade.score >= 6 ? 'warning' : 'error'}
                  />
                </Box>
              ))
            )}
          </Paper>
        </Grid>

        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom fontWeight={600}>
              Bài tập sắp đến hạn
            </Typography>
            {loading ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', py: 3 }}>
                <CircularProgress />
              </Box>
            ) : (
              (dashboardData.upcomingAssignments || defaultUpcomingAssignments).map((assignment, index) => (
                <Box
                  key={index}
                  sx={{
                    p: 2,
                    mb: 1,
                    bgcolor: '#fff3e0',
                    borderRadius: 1,
                    borderLeft: '4px solid #ff9800',
                  }}
                >
                  <Typography variant="body2" fontWeight={600}>
                    {assignment.name}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {assignment.subject}
                  </Typography>
                  <Typography variant="caption" display="block" color="warning.main">
                    Hạn nộp: {assignment.deadline}
                  </Typography>
                </Box>
              ))
            )}
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
}
