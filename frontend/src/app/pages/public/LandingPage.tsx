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
    <Box sx={{ bgcolor: 'white', overflowX: 'hidden' }}>
      {/* Hero Section */}
      <Box
        sx={{
          background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
          color: 'white',
          py: { xs: 10, md: 20 },
          position: 'relative',
          overflow: 'hidden'
        }}
      >
        <Box
          sx={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            opacity: 0.1,
            backgroundImage: 'url("https://www.transparenttextures.com/patterns/cubes.png")',
          }}
        />
        
        <Container maxWidth="xl">
          <Grid container spacing={8} alignItems="center">
            <Grid item xs={12} md={7}>
              <Box sx={{ position: 'relative', zIndex: 1 }}>
                <Typography 
                  variant="h1" 
                  fontWeight={900} 
                  sx={{ 
                    fontSize: { xs: '2.8rem', md: '4rem', lg: '5rem' },
                    lineHeight: 1.1,
                    mb: 3,
                    color: '#f8fafc'
                  }}
                >
                  Học Tiếng Anh <br />
                  <span style={{ color: '#38bdf8' }}>Hiệu Quả</span> Cùng ELC
                </Typography>
                <Typography variant="h5" sx={{ mb: 6, opacity: 0.8, maxWidth: 650, fontWeight: 300, lineHeight: 1.6 }}>
                  Hệ thống đào tạo Anh ngữ chuẩn quốc tế với phương pháp cá nhân hóa, 
                  giúp bạn chinh phục mọi mục tiêu ngôn ngữ trong tầm tay.
                </Typography>
                <Box sx={{ display: 'flex', gap: 2.5, flexWrap: 'wrap' }}>
                  <Button
                    variant="contained"
                    size="large"
                    onClick={() => navigate('/register')}
                    sx={{ 
                      px: 6, 
                      py: 2, 
                      borderRadius: 4,
                      fontSize: '1.1rem',
                      fontWeight: 700,
                      bgcolor: '#38bdf8',
                      '&:hover': { bgcolor: '#0ea5e9' }
                    }}
                  >
                    Bắt đầu ngay
                  </Button>
                  <Button
                    variant="outlined"
                    size="large"
                    onClick={() => navigate('/courses')}
                    sx={{ 
                      px: 6, 
                      py: 2, 
                      borderRadius: 4,
                      fontSize: '1.1rem',
                      fontWeight: 700,
                      borderColor: 'rgba(255,255,255,0.3)',
                      color: 'white',
                      '&:hover': { borderColor: 'white', bgcolor: 'rgba(255,255,255,0.05)' }
                    }}
                  >
                    Xem khóa học
                  </Button>
                </Box>
              </Box>
            </Grid>
            <Grid item xs={12} md={5}>
              <Box 
                component="img"
                src="https://images.unsplash.com/photo-1523240795612-9a054b0db644?w=800&q=80"
                sx={{ 
                  width: '100%', 
                  borderRadius: 10,
                  boxShadow: '0 40px 80px rgba(0,0,0,0.5)',
                  display: { xs: 'none', md: 'block' },
                  transform: 'perspective(1000px) rotateY(-5deg)',
                }}
              />
            </Grid>
          </Grid>
        </Container>
      </Box>

      {/* Stats Section */}
      <Box sx={{ py: 10, bgcolor: '#f8fafc' }}>
        <Container maxWidth="xl">
          <Grid container spacing={4}>
            {[
              { icon: <SchoolIcon />, value: '50+', label: 'Khóa học chất lượng', color: '#38bdf8' },
              { icon: <PeopleIcon />, value: '10,000+', label: 'Học viên tin tưởng', color: '#10b981' },
              { icon: <EmojiEventsIcon />, value: '95%', label: 'Đạt mục tiêu đầu ra', color: '#f59e0b' }
            ].map((stat, idx) => (
              <Grid item xs={12} md={4} key={idx}>
                <Paper sx={{ 
                  p: 6, 
                  textAlign: 'center', 
                  borderRadius: 8,
                  border: '1px solid rgba(0,0,0,0.05)',
                  transition: '0.3s',
                  '&:hover': { transform: 'translateY(-10px)', boxShadow: '0 20px 40px rgba(0,0,0,0.05)' }
                }}>
                  <Box sx={{ color: stat.color, mb: 2, '& svg': { fontSize: 48 } }}>{stat.icon}</Box>
                  <Typography variant="h3" fontWeight={900}>{stat.value}</Typography>
                  <Typography color="text.secondary" fontWeight={500}>{stat.label}</Typography>
                </Paper>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>

      {/* Course List Section */}
      <Box sx={{ py: 15 }}>
        <Container maxWidth="xl">
          <Box sx={{ textAlign: 'center', mb: 10 }}>
            <Typography variant="overline" color="primary" fontWeight={800} sx={{ letterSpacing: 2 }}>CHƯƠNG TRÌNH ĐÀO TẠO</Typography>
            <Typography variant="h2" fontWeight={900} sx={{ mt: 1 }}>Khóa học nổi bật</Typography>
          </Box>
          <Grid container spacing={4}>
            {courses.map((course) => (
              <Grid item xs={12} sm={6} md={4} key={course.id}>
                <Card sx={{ 
                  borderRadius: 6, 
                  boxShadow: '0 10px 30px rgba(0,0,0,0.05)',
                  overflow: 'hidden',
                  transition: '0.3s',
                  '&:hover': { transform: 'translateY(-10px)' }
                }}>
                  <CardMedia component="img" height="250" image={course.image} />
                  <CardContent sx={{ p: 4 }}>
                    <Typography variant="h5" fontWeight={800} gutterBottom>{course.name}</Typography>
                    <Typography variant="h4" color="primary" fontWeight={900} sx={{ mb: 3 }}>{course.price}</Typography>
                    <Button 
                      variant="contained" 
                      fullWidth 
                      size="large" 
                      sx={{ borderRadius: 3, py: 1.5 }}
                      onClick={() => navigate(`/courses/${course.id}`)}
                    >
                      Xem chi tiết
                    </Button>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>

      {/* Teachers Section */}
      <Box sx={{ py: 15, bgcolor: '#f8fafc' }}>
        <Container maxWidth="xl">
          <Box sx={{ textAlign: 'center', mb: 10 }}>
            <Typography variant="overline" color="primary" fontWeight={800} sx={{ letterSpacing: 2 }}>CHUYÊN GIA GIẢNG DẠY</Typography>
            <Typography variant="h2" fontWeight={900} sx={{ mt: 1 }}>Đội ngũ giảng viên</Typography>
          </Box>
          <Grid container spacing={4}>
            {teachers.map((teacher, idx) => (
              <Grid item xs={12} sm={6} md={4} key={idx}>
                <Paper sx={{ 
                  p: 5, 
                  textAlign: 'center', 
                  borderRadius: 6,
                  bgcolor: '#ffffff',
                  border: '1px solid rgba(0,0,0,0.05)'
                }}>
                  <Avatar 
                    src={teacher.avatar} 
                    sx={{ 
                      width: 140, 
                      height: 140, 
                      mx: 'auto', 
                      mb: 3, 
                      border: '4px solid white',
                      boxShadow: '0 10px 20px rgba(0,0,0,0.1)'
                    }} 
                  />
                  <Typography variant="h5" fontWeight={800}>{teacher.name}</Typography>
                  <Typography color="primary" fontWeight={600} sx={{ mb: 2 }}>{teacher.specialty}</Typography>
                  <Rating value={teacher.rating} precision={0.1} readOnly sx={{ color: '#f59e0b' }} />
                </Paper>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>

      {/* Testimonials */}
      <Box sx={{ py: 15, bgcolor: '#0f172a', color: 'white' }}>
        <Container maxWidth="xl">
          <Typography variant="h2" fontWeight={900} align="center" sx={{ mb: 10 }}>Cảm nhận học viên</Typography>
          <Grid container spacing={4}>
            {testimonials.map((item, idx) => (
              <Grid item xs={12} md={6} key={idx}>
                <Paper sx={{ 
                  p: 6, 
                  borderRadius: 6, 
                  bgcolor: 'rgba(255,255,255,0.05)', 
                  color: 'white',
                  border: '1px solid rgba(255,255,255,0.1)'
                }}>
                  <Rating value={item.rating} readOnly sx={{ mb: 3, color: '#f59e0b' }} />
                  <Typography variant="h5" sx={{ fontStyle: 'italic', mb: 4, fontWeight: 300, lineHeight: 1.6 }}>
                    "{item.comment}"
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <Avatar sx={{ bgcolor: 'primary.main', mr: 2 }}>{item.name[0]}</Avatar>
                    <Box>
                      <Typography variant="h6" fontWeight={700}>{item.name}</Typography>
                      <Typography variant="body2" sx={{ opacity: 0.6 }}>{item.role}</Typography>
                    </Box>
                  </Box>
                </Paper>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>
    </Box>
  );
}
