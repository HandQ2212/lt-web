import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Container,
  Typography,
  Grid,
  Paper,
  Button,
  Chip,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Card,
  CardContent,
  Divider,
  Snackbar,
  Alert,
  CircularProgress,
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import PeopleIcon from '@mui/icons-material/People';
import FavoriteIcon from '@mui/icons-material/Favorite';
import { courseApi, leadApi, classApi } from '../../../services/api';
import { useSelector } from 'react-redux';
import { RootState } from '../../../store';

export default function CourseDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [course, setCourse] = useState<any>(null);
  const [classes, setClasses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [snackbar, setSnackbar] = useState<{ open: boolean; message: string; severity: 'success' | 'error' }>({
    open: false,
    message: '',
    severity: 'success',
  });

  const user = useSelector((state: RootState) => state.auth.user);

  useEffect(() => {
    void fetchCourseData();
  }, [id]);

  const fetchCourseData = async () => {
    try {
      setLoading(true);
      const [courseData, classData] = await Promise.all([
        courseApi.getById(id!),
        classApi.getAll()
      ]);
      
      setCourse(courseData);
      // Filter classes for this course
      const upcoming = (Array.isArray(classData) ? classData : classData?.content || [])
        .filter((c: any) => {
          const sameCourse = c.courseId === id || c.course?.id === id || c.courseName === courseData.name;
          return sameCourse && (c.status === 'ACCEPTING' || c.status === 'UPCOMING');
        });
      setClasses(upcoming);
    } catch (error) {
      console.error('Failed to fetch course data', error);
    } finally {
      setLoading(false);
    }
  };

  const handleInterest = async (classId?: string) => {
    if (!user) {
      navigate('/login');
      return;
    }
    
    try {
      setActionLoading(true);
      if (classId) {
        await leadApi.interestClass(classId);
      } else {
        await leadApi.addMyInterests({ courseIds: [course.id] });
      }
      setSnackbar({ 
        open: true, 
        message: 'Đã ghi nhận sự quan tâm của bạn. Nhân viên tư vấn sẽ liên hệ sớm!', 
        severity: 'success' 
      });
    } catch (error: any) {
      setSnackbar({ 
        open: true, 
        message: error?.response?.data?.message || 'Không thể thực hiện yêu cầu', 
        severity: 'error' 
      });
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) return (
    <Box sx={{ display: 'flex', justifyContent: 'center', py: 10 }}>
      <CircularProgress />
    </Box>
  );

  if (!course) return <Container sx={{ py: 10 }}><Alert severity="error">Khóa học không tồn tại</Alert></Container>;

  const primaryLevel = Array.isArray(course.levels) ? course.levels[0] : null;
  const displayPrice = Number(primaryLevel?.basePrice || course.price || 0);
  const displayLevel = primaryLevel?.name || primaryLevel?.code || course.level || 'Chưa phân cấp';
  const displayDuration = primaryLevel?.durationWeeks ? `${primaryLevel.durationWeeks} tuần` : 'Theo lộ trình';

  return (
    <Container maxWidth="lg" sx={{ py: 6 }}>
      <Grid container spacing={4}>
        <Grid item xs={12} md={8}>
          <Box
            component="img"
            src={course.imageUrl || 'https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=800'}
            alt={course.name}
            sx={{
              width: '100%',
              height: 400,
              objectFit: 'cover',
              borderRadius: '40px 40px 40px 8px',
              mb: 3,
              border: '2px solid #1E293B',
              boxShadow: '7px 7px 0 #1E293B',
            }}
          />

          <Typography variant="h3" gutterBottom fontWeight={900} color="primary">
            {course.name}
          </Typography>

          <Box sx={{ mb: 3, display: 'flex', gap: 1 }}>
            <Chip label={displayLevel} color="primary" variant="outlined" sx={{ fontWeight: 900, bgcolor: '#FFFFFF' }} />
            <Chip label={displayDuration} icon={<AccessTimeIcon />} variant="outlined" />
          </Box>

          <Typography variant="h5" gutterBottom fontWeight={900} sx={{ mt: 4 }}>
            Giới thiệu khóa học
          </Typography>
          <Typography variant="body1" paragraph color="text.secondary" sx={{ lineHeight: 1.8 }}>
            {course.description || 'Khóa học chất lượng cao tại ELC System, giúp bạn làm chủ kiến thức và kỹ năng trong thời gian ngắn nhất.'}
          </Typography>

          <Typography variant="h5" gutterBottom fontWeight={900} sx={{ mt: 4 }}>
            Lớp học sắp khai giảng
          </Typography>
          {classes.length === 0 ? (
            <Alert severity="info">Hiện chưa có lớp học mới cho khóa học này. Vui lòng để lại thông tin tư vấn.</Alert>
          ) : (
            <Grid container spacing={2}>
              {classes.map((cls) => (
                <Grid item xs={12} md={6} key={cls.id}>
                  <Card sx={{ borderRadius: 4, border: '2px solid #1E293B', boxShadow: '4px 4px 0 #1E293B', height: '100%' }}>
                    <CardContent>
                      <Typography variant="h6" fontWeight={900} color="primary">{cls.name}</Typography>
                      <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                        <AccessTimeIcon sx={{ fontSize: 16, mr: 1, verticalAlign: 'middle' }} />
                        {cls.startDate}
                      </Typography>
                      <Divider sx={{ my: 1.5 }} />
                      <Button 
                        variant="contained" 
                        fullWidth 
                        startIcon={<FavoriteIcon />}
                        onClick={() => void handleInterest(cls.id)}
                        disabled={actionLoading}
                        sx={{ borderRadius: 999 }}
                      >
                        Quan tâm lớp này
                      </Button>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          )}
        </Grid>

        <Grid item xs={12} md={4}>
          <Paper
            sx={{
              p: 4,
              position: 'sticky',
              top: 100,
              borderRadius: 5,
              border: '2px solid #1E293B',
              boxShadow: '7px 7px 0 #1E293B',
              bgcolor: 'primary.main',
              color: 'white',
            }}
          >
            <Typography variant="h4" fontWeight={800} gutterBottom>
              {displayPrice.toLocaleString('vi-VN')}đ
            </Typography>
            <Typography variant="body2" sx={{ opacity: 0.8, mb: 3 }}>
              Học phí trọn gói, bao gồm giáo trình và lệ phí thi thử.
            </Typography>
            
            <Divider sx={{ my: 2, bgcolor: 'rgba(255,255,255,0.2)' }} />
            
            <Box sx={{ mb: 4 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <AccessTimeIcon sx={{ mr: 2 }} />
                <Typography variant="body1">Thời lượng: {displayDuration}</Typography>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <PeopleIcon sx={{ mr: 2 }} />
                <Typography variant="body1">Sĩ số: Tối đa 15 học viên</Typography>
              </Box>
            </Box>

            <Button 
              variant="contained" 
              fullWidth 
              size="large" 
              sx={{ 
                bgcolor: 'white', 
                color: 'primary.main', 
                fontWeight: 900,
                py: 1.5,
                borderRadius: 999,
                '&:hover': { bgcolor: '#FBBF24', color: '#1E293B' }
              }}
              onClick={() => void handleInterest()}
              disabled={actionLoading}
            >
              Tư vấn ngay
            </Button>
            
            <Typography variant="caption" sx={{ display: 'block', mt: 2, textAlign: 'center', opacity: 0.7 }}>
              Cam kết đầu ra bằng văn bản
            </Typography>
          </Paper>
        </Grid>
      </Grid>

      <Snackbar 
        open={snackbar.open} 
        autoHideDuration={4000} 
        onClose={() => setSnackbar(prev => ({ ...prev, open: false }))}
      >
        <Alert severity={snackbar.severity} variant="filled" sx={{ width: '100%' }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Container>
  );
}
