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
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import PeopleIcon from '@mui/icons-material/People';
import { courseApi } from '../../../services/api';

export default function CourseDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [course, setCourse] = useState<any>(null);

  useEffect(() => {
    fetchCourse();
  }, [id]);

  const fetchCourse = async () => {
    try {
      const data = await courseApi.getById(id!);
      setCourse({
        ...mockCourse,
        ...data,
      });
    } catch (error) {
      setCourse(mockCourse);
    }
  };

  const mockCourse = {
    id: id,
    name: 'IELTS Preparation',
    level: 'ADVANCED',
    price: 4500000,
    duration: '3 tháng',
    description:
      'Khóa học luyện thi IELTS toàn diện, giúp học viên đạt điểm 7.0+ trong kỳ thi IELTS. Phương pháp giảng dạy hiện đại, tập trung vào 4 kỹ năng: Listening, Reading, Writing, Speaking.',
    imageUrl: 'https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=800',
    syllabus: [
      {
        module: 'Module 1: IELTS Listening',
        topics: [
          'Kỹ thuật nghe hiểu cơ bản',
          'Chiến lược làm bài Listening',
          'Thực hành với các đề thi thực tế',
        ],
      },
      {
        module: 'Module 2: IELTS Reading',
        topics: [
          'Skimming và Scanning',
          'Các dạng câu hỏi Reading',
          'Luyện tập tốc độ đọc',
        ],
      },
      {
        module: 'Module 3: IELTS Writing',
        topics: [
          'Task 1: Graphs, Charts, Tables',
          'Task 2: Essay Writing',
          'Cấu trúc bài viết và từ vựng học thuật',
        ],
      },
      {
        module: 'Module 4: IELTS Speaking',
        topics: [
          'Part 1: Introduction',
          'Part 2: Long Turn',
          'Part 3: Discussion',
        ],
      },
    ],
    upcomingClasses: [
      { id: '1', startDate: '2026-06-01', schedule: 'T2, T4, T6: 18:00-20:00', status: 'ACCEPTING' },
      { id: '2', startDate: '2026-06-15', schedule: 'T3, T5, T7: 19:00-21:00', status: 'ACCEPTING' },
    ],
  };

  if (!course) return null;

  return (
    <Container maxWidth="lg" sx={{ py: 6 }}>
      <Grid container spacing={4}>
        <Grid item xs={12} md={8}>
          <Box
            component="img"
            src={course.imageUrl || mockCourse.imageUrl}
            alt={course.name}
            sx={{ width: '100%', borderRadius: 2, mb: 3 }}
          />

          <Typography variant="h3" gutterBottom fontWeight={700}>
            {course.name}
          </Typography>

          <Box sx={{ mb: 3 }}>
            <Chip label={course.level} color="error" sx={{ mr: 1 }} />
            <Chip label={course.duration || mockCourse.duration} icon={<AccessTimeIcon />} />
          </Box>

          <Typography variant="h6" gutterBottom fontWeight={600}>
            Mô tả khóa học
          </Typography>
          <Typography variant="body1" paragraph color="text.secondary">
            {course.description}
          </Typography>

          <Typography variant="h6" gutterBottom fontWeight={600} sx={{ mt: 4 }}>
            Lộ trình học
          </Typography>
          {(course.syllabus || mockCourse.syllabus).map((item: any, index: number) => (
            <Accordion key={index}>
              <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                <Typography fontWeight={600}>{item.module}</Typography>
              </AccordionSummary>
              <AccordionDetails>
                <Box component="ul" sx={{ pl: 2 }}>
                  {item.topics.map((topic: string, idx: number) => (
                    <Typography component="li" key={idx} variant="body2" sx={{ mb: 1 }}>
                      {topic}
                    </Typography>
                  ))}
                </Box>
              </AccordionDetails>
            </Accordion>
          ))}

          <Typography variant="h6" gutterBottom fontWeight={600} sx={{ mt: 4 }}>
            Lớp sắp khai giảng
          </Typography>
          <Grid container spacing={2}>
            {(course.upcomingClasses || mockCourse.upcomingClasses).map((cls: any) => (
              <Grid item xs={12} md={6} key={cls.id}>
                <Card>
                  <CardContent>
                    <Typography variant="subtitle1" fontWeight={600}>
                      Khai giảng: {cls.startDate}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {cls.schedule}
                    </Typography>
                    <Chip
                      label={cls.status === 'ACCEPTING' ? 'Còn chỗ' : 'Đầy'}
                      color="success"
                      size="small"
                      sx={{ mt: 1 }}
                    />
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Grid>

        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 3, position: 'sticky', top: 20 }}>
            <Typography variant="h4" color="primary" fontWeight={700} gutterBottom>
              {Number(course.price || 0).toLocaleString('vi-VN')}đ
            </Typography>
            <Divider sx={{ my: 2 }} />
            <Box sx={{ mb: 2 }}>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                <AccessTimeIcon fontSize="small" sx={{ mr: 1, verticalAlign: 'middle' }} />
                Thời lượng: {course.duration || mockCourse.duration}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                <PeopleIcon fontSize="small" sx={{ mr: 1, verticalAlign: 'middle' }} />
                Lớp nhỏ: Tối đa 15 học viên
              </Typography>
            </Box>
            <Button variant="contained" fullWidth size="large" onClick={() => navigate('/register')}>
              Đăng ký ngay
            </Button>
            <Button variant="outlined" fullWidth size="large" sx={{ mt: 2 }}>
              Tư vấn miễn phí
            </Button>
          </Paper>
        </Grid>
      </Grid>
    </Container>
  );
}
