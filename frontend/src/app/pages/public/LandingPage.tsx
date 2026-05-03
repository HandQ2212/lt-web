import { Box, Container, Typography, Button, Grid, Card, CardContent, CardMedia, Avatar, Rating, Paper } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import SchoolIcon from '@mui/icons-material/School';
import PeopleIcon from '@mui/icons-material/People';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';

const courses = [
  {
    id: '1',
    name: 'English for Beginners',
    level: 'Sơ cấp',
    price: '2,500,000đ',
    image: 'https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=400',
  },
  {
    id: '2',
    name: 'Business English',
    level: 'Trung cấp',
    price: '3,500,000đ',
    image: 'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=400',
  },
  {
    id: '3',
    name: 'IELTS Preparation',
    level: 'Nâng cao',
    price: '4,500,000đ',
    image: 'https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=400',
  },
];

const teachers = [
  {
    name: 'Ms. Sarah Johnson',
    specialty: 'IELTS Expert',
    rating: 4.9,
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200',
  },
  {
    name: 'Mr. David Brown',
    specialty: 'Business English',
    rating: 4.8,
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200',
  },
  {
    name: 'Ms. Emma Wilson',
    specialty: 'Communication Skills',
    rating: 5.0,
    avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=200',
  },
];

const testimonials = [
  {
    name: 'Nguyễn Văn A',
    role: 'Học viên IELTS',
    comment: 'Tôi đã đạt 7.5 IELTS sau 6 tháng học tại ELC. Giáo viên rất tận tâm!',
    rating: 5,
  },
  {
    name: 'Trần Thị B',
    role: 'Học viên Business English',
    comment: 'Chương trình Business English đã giúp tôi tự tin giao tiếp với đối tác nước ngoài.',
    rating: 5,
  },
];

export default function LandingPage() {
  const navigate = useNavigate();

  return (
    <Box>
      <Box
        sx={{
          bgcolor: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          background: 'linear-gradient(135deg, #1976d2 0%, #4caf50 100%)',
          color: 'white',
          py: 12,
        }}
      >
        <Container maxWidth="lg">
          <Grid container spacing={4} alignItems="center">
            <Grid item xs={12} md={6}>
              <Typography variant="h2" gutterBottom fontWeight={700}>
                Học Tiếng Anh Hiệu Quả Cùng ELC
              </Typography>
              <Typography variant="h6" sx={{ mb: 4 }}>
                Phương pháp giảng dạy hiện đại, đội ngũ giảng viên chuyên nghiệp, cam kết đầu ra
              </Typography>
              <Button
                variant="contained"
                size="large"
                sx={{ bgcolor: 'white', color: 'primary.main', '&:hover': { bgcolor: '#f5f5f5' } }}
                onClick={() => navigate('/register')}
              >
                Đăng ký tư vấn miễn phí
              </Button>
            </Grid>
            <Grid item xs={12} md={6}>
              <Box
                component="img"
                src="https://images.unsplash.com/photo-1524178232363-1fb2b075b655?w=600"
                alt="Learning"
                sx={{ width: '100%', borderRadius: 2, boxShadow: 3 }}
              />
            </Grid>
          </Grid>
        </Container>
      </Box>

      <Container maxWidth="lg" sx={{ my: 8 }}>
        <Grid container spacing={4} sx={{ mb: 8 }}>
          <Grid item xs={12} md={4}>
            <Paper sx={{ p: 4, textAlign: 'center', height: '100%' }}>
              <SchoolIcon sx={{ fontSize: 60, color: 'primary.main', mb: 2 }} />
              <Typography variant="h4" gutterBottom fontWeight={700}>
                50+
              </Typography>
              <Typography variant="body1" color="text.secondary">
                Khóa học chất lượng
              </Typography>
            </Paper>
          </Grid>
          <Grid item xs={12} md={4}>
            <Paper sx={{ p: 4, textAlign: 'center', height: '100%' }}>
              <PeopleIcon sx={{ fontSize: 60, color: 'primary.main', mb: 2 }} />
              <Typography variant="h4" gutterBottom fontWeight={700}>
                10,000+
              </Typography>
              <Typography variant="body1" color="text.secondary">
                Học viên đã tin tưởng
              </Typography>
            </Paper>
          </Grid>
          <Grid item xs={12} md={4}>
            <Paper sx={{ p: 4, textAlign: 'center', height: '100%' }}>
              <EmojiEventsIcon sx={{ fontSize: 60, color: 'primary.main', mb: 2 }} />
              <Typography variant="h4" gutterBottom fontWeight={700}>
                95%
              </Typography>
              <Typography variant="body1" color="text.secondary">
                Học viên đạt mục tiêu
              </Typography>
            </Paper>
          </Grid>
        </Grid>

        <Typography variant="h4" gutterBottom fontWeight={700} align="center" sx={{ mb: 4 }}>
          Khóa học nổi bật
        </Typography>
        <Grid container spacing={3} sx={{ mb: 8 }}>
          {courses.map((course) => (
            <Grid item xs={12} md={4} key={course.id}>
              <Card
                sx={{ cursor: 'pointer', transition: 'transform 0.2s', '&:hover': { transform: 'translateY(-8px)' } }}
                onClick={() => navigate(`/courses/${course.id}`)}
              >
                <CardMedia component="img" height="200" image={course.image} alt={course.name} />
                <CardContent>
                  <Typography variant="h6" gutterBottom fontWeight={600}>
                    {course.name}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    Trình độ: {course.level}
                  </Typography>
                  <Typography variant="h6" color="primary" fontWeight={700}>
                    {course.price}
                  </Typography>
                  <Button variant="contained" fullWidth sx={{ mt: 2 }}>
                    Xem chi tiết
                  </Button>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>

        <Typography variant="h4" gutterBottom fontWeight={700} align="center" sx={{ mb: 4 }}>
          Đội ngũ giảng viên
        </Typography>
        <Grid container spacing={3} sx={{ mb: 8 }}>
          {teachers.map((teacher, index) => (
            <Grid item xs={12} md={4} key={index}>
              <Paper sx={{ p: 3, textAlign: 'center' }}>
                <Avatar src={teacher.avatar} sx={{ width: 120, height: 120, mx: 'auto', mb: 2 }} />
                <Typography variant="h6" fontWeight={600}>
                  {teacher.name}
                </Typography>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  {teacher.specialty}
                </Typography>
                <Rating value={teacher.rating} precision={0.1} readOnly />
              </Paper>
            </Grid>
          ))}
        </Grid>

        <Typography variant="h4" gutterBottom fontWeight={700} align="center" sx={{ mb: 4 }}>
          Học viên nói gì về chúng tôi
        </Typography>
        <Grid container spacing={3}>
          {testimonials.map((testimonial, index) => (
            <Grid item xs={12} md={6} key={index}>
              <Paper sx={{ p: 3 }}>
                <Rating value={testimonial.rating} readOnly sx={{ mb: 2 }} />
                <Typography variant="body1" paragraph>
                  "{testimonial.comment}"
                </Typography>
                <Typography variant="subtitle2" fontWeight={600}>
                  {testimonial.name}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {testimonial.role}
                </Typography>
              </Paper>
            </Grid>
          ))}
        </Grid>
      </Container>
    </Box>
  );
}
