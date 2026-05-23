import { useEffect, useState } from 'react';
import { Box, Container, Typography, Button, Card, CardContent, CardMedia, Avatar, Rating, Paper, Chip, CircularProgress } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import SchoolIcon from '@mui/icons-material/School';
import PeopleIcon from '@mui/icons-material/People';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import { PublicTeacher, publicTeacherApi } from '../../../services/api';

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
  const [teachers, setTeachers] = useState<PublicTeacher[]>([]);
  const [teachersLoading, setTeachersLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    const fetchTeachers = async () => {
      try {
        const data = await publicTeacherApi.getAll();
        if (mounted) setTeachers(data.slice(0, 3));
      } catch {
        if (mounted) setTeachers([]);
      } finally {
        if (mounted) setTeachersLoading(false);
      }
    };

    void fetchTeachers();

    return () => {
      mounted = false;
    };
  }, []);

  return (
    <Box sx={{ bgcolor: '#FFFDF5', overflowX: 'hidden', color: '#1E293B' }}>
      {/* Hero Section */}
      <Box
        sx={{
          background:
            'radial-gradient(circle at 18% 22%, rgba(251,191,36,0.46), transparent 18rem), radial-gradient(circle at 80% 18%, rgba(244,114,182,0.22), transparent 20rem), linear-gradient(180deg, #FFFDF5 0%, #FFF7DF 100%)',
          color: '#1E293B',
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
            opacity: 0.32,
            backgroundImage: 'radial-gradient(circle, rgba(30,41,59,0.18) 1px, transparent 1px)',
            backgroundSize: '24px 24px',
          }}
        />
        
        <Container maxWidth="lg" sx={{ position: 'relative', zIndex: 1 }}>
          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: { xs: '1fr', md: 'minmax(0, 1.05fr) minmax(320px, 0.95fr)' },
              gap: { xs: 6, md: 8 },
              alignItems: 'center',
            }}
          >
            <Box>
              <Box sx={{ position: 'relative', textAlign: { xs: 'center', md: 'left' }, maxWidth: { xs: 760, md: 'none' }, mx: { xs: 'auto', md: 0 } }}>
                <Typography 
                  variant="h1" 
                  fontWeight={800} 
                  sx={{ 
                    fontSize: { xs: '2.5rem', sm: '3.2rem', md: '4rem', lg: '4.5rem' },
                    lineHeight: 1.1,
                    mb: 3,
                    color: '#1E293B'
                  }}
                >
                  Học Tiếng Anh <br />
                  <span style={{ color: '#8B5CF6' }}>Hiệu Quả</span> Cùng ELC
                </Typography>
                <Typography variant="h5" sx={{ mb: 6, color: '#475569', maxWidth: 650, mx: { xs: 'auto', md: 0 }, fontWeight: 600, lineHeight: 1.6 }}>
                  Hệ thống đào tạo Anh ngữ chuẩn quốc tế với phương pháp cá nhân hóa, 
                  giúp bạn chinh phục mọi mục tiêu ngôn ngữ trong tầm tay.
                </Typography>
                <Box sx={{ display: 'flex', gap: 2.5, flexWrap: 'wrap', justifyContent: { xs: 'center', md: 'flex-start' } }}>
                  <Button
                    variant="contained"
                    size="large"
                    onClick={() => navigate('/register')}
                    sx={{ 
                      px: 6, 
                      py: 2, 
                      borderRadius: 1,
                      fontSize: '1.1rem',
                      fontWeight: 800,
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
                      borderRadius: 1,
                      fontSize: '1.1rem',
                      fontWeight: 800,
                      bgcolor: '#FFFFFF',
                    }}
                  >
                    Xem khóa học
                  </Button>
                </Box>
              </Box>
            </Box>
            <Box sx={{ display: 'flex', justifyContent: 'center' }}>
              <Box 
                component="img"
                src="https://images.unsplash.com/photo-1523240795612-9a054b0db644?w=800&q=80"
                sx={{ 
                  width: '100%', 
                  maxWidth: 560,
                  borderRadius: '48px 48px 48px 8px',
                  border: '2px solid #1E293B',
                  boxShadow: '8px 8px 0 #1E293B',
                  display: 'block',
                  transform: 'rotate(2deg)',
                }}
              />
            </Box>
          </Box>
        </Container>
      </Box>

      {/* Stats Section */}
      <Box sx={{ py: 10, bgcolor: '#FFF7DF' }}>
        <Container maxWidth="lg">
          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: { xs: '1fr', md: 'repeat(3, minmax(0, 1fr))' },
              gap: 4,
            }}
          >
            {[
              { icon: <SchoolIcon />, value: '50+', label: 'Khóa học chất lượng', color: '#38bdf8' },
              { icon: <PeopleIcon />, value: '10,000+', label: 'Học viên tin tưởng', color: '#10b981' },
              { icon: <EmojiEventsIcon />, value: '95%', label: 'Đạt mục tiêu đầu ra', color: '#f59e0b' }
            ].map((stat, idx) => (
              <Box key={idx}>
                <Paper sx={{ 
                  p: 6, 
                  textAlign: 'center', 
                  borderRadius: 5,
                  border: '2px solid #1E293B',
                  boxShadow: '5px 5px 0 #1E293B',
                  transition: '0.3s',
                  '&:hover': { transform: 'translate(-2px, -2px)', boxShadow: '7px 7px 0 #1E293B' }
                }}>
                  <Box sx={{ color: stat.color, mb: 2, '& svg': { fontSize: 48 } }}>{stat.icon}</Box>
                  <Typography variant="h3" fontWeight={800}>{stat.value}</Typography>
                  <Typography color="text.secondary" fontWeight={500}>{stat.label}</Typography>
                </Paper>
              </Box>
            ))}
          </Box>
        </Container>
      </Box>

      {/* Course List Section */}
      <Box sx={{ py: 15 }}>
        <Container maxWidth="lg">
          <Box sx={{ textAlign: 'center', mb: 10 }}>
            <Typography variant="overline" color="primary" fontWeight={800} sx={{ letterSpacing: 2 }}>CHƯƠNG TRÌNH ĐÀO TẠO</Typography>
            <Typography variant="h2" fontWeight={800} sx={{ mt: 1 }}>Khóa học nổi bật</Typography>
          </Box>
          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, minmax(0, 1fr))', md: 'repeat(3, minmax(0, 1fr))' },
              gap: 4,
            }}
          >
            {courses.map((course) => (
              <Box key={course.id}>
                <Card sx={{ 
                  borderRadius: 5, 
                  border: '2px solid #1E293B',
                  boxShadow: '5px 5px 0 #1E293B',
                  overflow: 'hidden',
                  transition: '0.3s',
                  '&:hover': { transform: 'translate(-2px, -2px)', boxShadow: '7px 7px 0 #1E293B' }
                }}>
                  <CardMedia component="img" height="250" image={course.image} />
                  <CardContent sx={{ p: 4 }}>
                    <Typography variant="h5" fontWeight={800} gutterBottom>{course.name}</Typography>
                    <Typography variant="h4" color="primary" fontWeight={800} sx={{ mb: 3 }}>{course.price}</Typography>
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
              </Box>
            ))}
          </Box>
        </Container>
      </Box>

      {/* Teachers Section */}
      <Box sx={{ py: 15, bgcolor: '#FFF7DF' }}>
        <Container maxWidth="lg">
          <Box sx={{ textAlign: 'center', mb: 10 }}>
            <Typography variant="overline" color="primary" fontWeight={800} sx={{ letterSpacing: 2 }}>CHUYÊN GIA GIẢNG DẠY</Typography>
            <Typography variant="h2" fontWeight={800} sx={{ mt: 1 }}>Đội ngũ giảng viên</Typography>
          </Box>
          {teachersLoading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}>
              <CircularProgress />
            </Box>
          ) : teachers.length === 0 ? (
            <Typography align="center" color="text.secondary" fontWeight={700}>
              Chưa có giảng viên đang hoạt động.
            </Typography>
          ) : (
            <Box
              sx={{
                display: 'grid',
                gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, minmax(0, 1fr))', md: 'repeat(3, minmax(0, 1fr))' },
                gap: 4,
              }}
            >
              {teachers.map((teacher) => {
                const primarySpecialty = teacher.specialties[0] || 'Giảng viên ELC';
                const classLabel = teacher.activeClassCount > 0
                  ? `${teacher.activeClassCount} lớp đang phụ trách`
                  : 'Chưa có lớp đang phụ trách';

                return (
                  <Box key={teacher.id}>
                    <Paper sx={{
                      p: 5,
                      textAlign: 'center',
                      borderRadius: 5,
                      bgcolor: '#ffffff',
                      border: '2px solid #1E293B',
                      boxShadow: '5px 5px 0 #1E293B',
                      height: '100%',
                    }}>
                      <Avatar
                        src={teacher.avatarUrl || undefined}
                        sx={{
                          width: 140,
                          height: 140,
                          mx: 'auto',
                          mb: 3,
                          border: '4px solid white',
                          boxShadow: '4px 4px 0 #1E293B',
                          bgcolor: 'primary.main',
                          fontSize: 42,
                          fontWeight: 800,
                        }}
                      >
                        {teacher.fullName.trim().charAt(0).toUpperCase() || 'G'}
                      </Avatar>
                      <Typography variant="h5" fontWeight={800}>{teacher.fullName}</Typography>
                      <Typography color="primary" fontWeight={600} sx={{ mb: 2 }}>{primarySpecialty}</Typography>
                      <Chip label={classLabel} size="small" color={teacher.activeClassCount > 0 ? 'primary' : 'default'} />
                    </Paper>
                  </Box>
                );
              })}
            </Box>
          )}
        </Container>
      </Box>

      {/* Testimonials */}
      <Box sx={{ py: 15, bgcolor: '#1E293B', color: 'white', position: 'relative', overflow: 'hidden' }}>
        <Container maxWidth="lg">
          <Typography variant="h2" fontWeight={800} align="center" sx={{ mb: 10 }}>Cảm nhận học viên</Typography>
          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: { xs: '1fr', md: 'repeat(2, minmax(0, 1fr))' },
              gap: 4,
            }}
          >
            {testimonials.map((item, idx) => (
              <Box key={idx}>
                <Paper sx={{ 
                  p: 6, 
                  borderRadius: 5, 
                  bgcolor: '#FFFFFF', 
                  color: '#1E293B',
                  border: '2px solid #1E293B',
                  boxShadow: '6px 6px 0 #FBBF24',
                  '& .MuiTypography-root': {
                    fontFamily: 'var(--font-vietnamese)',
                  },
                }}>
                  <Rating value={item.rating} readOnly sx={{ mb: 3, color: '#f59e0b' }} />
                  <Typography
                    variant="h5"
                    sx={{
                      fontFamily: 'var(--font-vietnamese)',
                      fontStyle: 'italic',
                      mb: 4,
                      fontWeight: 700,
                      lineHeight: 1.65,
                      letterSpacing: 0,
                    }}
                  >
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
              </Box>
            ))}
          </Box>
        </Container>
      </Box>
    </Box>
  );
}
