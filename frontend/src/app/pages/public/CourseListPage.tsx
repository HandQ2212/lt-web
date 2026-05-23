import { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Typography,
  Card,
  CardContent,
  CardMedia,
  Button,
  TextField,
  MenuItem,
  Chip,
  CircularProgress,
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { courseApi } from '../../../services/api';
import { Course } from '../../../types';

export default function CourseListPage() {
  const navigate = useNavigate();
  const [courses, setCourses] = useState<Course[]>([]);
  const [filteredCourses, setFilteredCourses] = useState<Course[]>([]);
  const [search, setSearch] = useState('');
  const [levelFilter, setLevelFilter] = useState('ALL');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCourses();
  }, []);

  useEffect(() => {
    filterCourses();
  }, [search, levelFilter, courses]);

  const fetchCourses = async () => {
    try {
      const data = await courseApi.getAll();
      setCourses(data);
    } catch (error) {
      console.error('Error fetching courses:', error);
      setCourses(mockCourses);
    } finally {
      setLoading(false);
    }
  };

  const filterCourses = () => {
    let filtered = courses;

    if (search) {
      filtered = filtered.filter((course) =>
        course.name.toLowerCase().includes(search.toLowerCase())
      );
    }

    if (levelFilter !== 'ALL') {
      filtered = filtered.filter((course) =>
        course.level === levelFilter ||
        (course.levels || []).some((level) => level.code === levelFilter || level.name === levelFilter)
      );
    }

    setFilteredCourses(filtered);
  };

  const mockCourses: Course[] = [
    {
      id: '1',
      name: 'English for Beginners',
      level: 'BEGINNER',
      price: 2500000,
      status: 'ACTIVE',
      description: 'Khóa học dành cho người mới bắt đầu học tiếng Anh',
      imageUrl: 'https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=400',
    },
    {
      id: '2',
      name: 'Business English',
      level: 'INTERMEDIATE',
      price: 3500000,
      status: 'ACTIVE',
      description: 'Tiếng Anh giao tiếp trong môi trường kinh doanh',
      imageUrl: 'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=400',
    },
    {
      id: '3',
      name: 'IELTS Preparation',
      level: 'ADVANCED',
      price: 4500000,
      status: 'ACTIVE',
      description: 'Luyện thi IELTS đạt 7.0+',
      imageUrl: 'https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=400',
    },
    {
      id: '4',
      name: 'Conversational English',
      level: 'INTERMEDIATE',
      price: 3000000,
      status: 'ACTIVE',
      description: 'Nâng cao kỹ năng giao tiếp tiếng Anh',
      imageUrl: 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=400',
    },
    {
      id: '5',
      name: 'TOEIC Intensive',
      level: 'INTERMEDIATE',
      price: 3200000,
      status: 'ACTIVE',
      description: 'Luyện thi TOEIC đạt 800+',
      imageUrl: 'https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?w=400',
    },
    {
      id: '6',
      name: 'English for Kids',
      level: 'BEGINNER',
      price: 2000000,
      status: 'ACTIVE',
      description: 'Tiếng Anh cho trẻ em 6-12 tuổi',
      imageUrl: 'https://images.unsplash.com/photo-1503676382389-4809596d5290?w=400',
    },
  ];

  const getLevelColor = (level: string) => {
    switch (level) {
      case 'BEGINNER':
        return 'success';
      case 'INTERMEDIATE':
        return 'warning';
      case 'ADVANCED':
        return 'error';
      default:
        return 'default';
    }
  };

  const getLevelText = (level: string) => {
    switch (level) {
      case 'BEGINNER':
        return 'Sơ cấp';
      case 'INTERMEDIATE':
        return 'Trung cấp';
      case 'ADVANCED':
        return 'Nâng cao';
      default:
        return level;
    }
  };

  const getPrimaryLevel = (course: Course) => course.levels?.[0] || null;
  const getDisplayLevel = (course: Course) => {
    const level = getPrimaryLevel(course);
    return level?.name || level?.code || course.level || 'Chưa phân cấp';
  };
  const getDisplayPrice = (course: Course) => Number(getPrimaryLevel(course)?.basePrice || course.price || 0);

  return (
    <Container maxWidth="xl" sx={{ py: 8, position: 'relative' }}>
      <Typography variant="h3" gutterBottom fontWeight={800} align="center" sx={{ mb: 2, color: '#1E293B' }}>
        Khóa học
      </Typography>
      <Typography variant="body1" align="center" color="text.secondary" sx={{ mb: 6, fontWeight: 600 }}>
        Khám phá các khóa học tiếng Anh phù hợp với trình độ của bạn
      </Typography>

      <Box
        sx={{
          mb: 5,
          display: 'flex',
          gap: 2,
          flexDirection: { xs: 'column', sm: 'row' },
          p: 2,
          bgcolor: '#FFFFFF',
          border: '2px solid #1E293B',
          borderRadius: 4,
          boxShadow: '5px 5px 0 #1E293B',
        }}
      >
        <TextField
          fullWidth
          placeholder="Tìm kiếm khóa học..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          size="small"
        />
        <TextField
          select
          value={levelFilter}
          onChange={(e) => setLevelFilter(e.target.value)}
          size="small"
          sx={{ minWidth: 200 }}
        >
          <MenuItem value="ALL">Tất cả trình độ</MenuItem>
          <MenuItem value="BEGINNER">Sơ cấp</MenuItem>
          <MenuItem value="INTERMEDIATE">Trung cấp</MenuItem>
          <MenuItem value="ADVANCED">Nâng cao</MenuItem>
        </TextField>
      </Box>

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
          <CircularProgress />
        </Box>
      ) : filteredCourses.length === 0 ? (
        <Typography align="center" color="text.secondary" sx={{ py: 6, fontWeight: 700 }}>
          Không tìm thấy khóa học phù hợp.
        </Typography>
      ) : (
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: {
            xs: '1fr',
            sm: 'repeat(2, minmax(0, 1fr))',
            md: 'repeat(3, minmax(0, 1fr))',
          },
          gap: 3,
          alignItems: 'stretch',
        }}
      >
        {filteredCourses.map((course) => (
          <Box key={course.id}>
            <Card
              sx={{
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                cursor: 'pointer',
                border: '2px solid #1E293B',
                borderRadius: 4,
                boxShadow: '4px 4px 0 #1E293B',
                transition: 'all 260ms cubic-bezier(0.34, 1.56, 0.64, 1)',
                '&:hover': { transform: 'translate(-2px, -2px)', boxShadow: '6px 6px 0 #1E293B' },
              }}
              onClick={() => navigate(`/courses/${course.id}`)}
            >
              <CardMedia
                component="img"
                image={course.imageUrl || 'https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=800'}
                alt={course.name}
                sx={{
                  height: { xs: 180, md: 150 },
                  objectFit: 'cover',
                }}
              />
              <CardContent sx={{ flexGrow: 1, p: 2.5 }}>
                <Box sx={{ mb: 1.5 }}>
                  <Chip
                    label={getLevelText(getDisplayLevel(course))}
                    color={getLevelColor(getPrimaryLevel(course)?.code || course.level || '')}
                    size="small"
                    sx={{ border: '2px solid #1E293B', fontWeight: 800 }}
                  />
                </Box>
                <Typography variant="h6" gutterBottom fontWeight={800} sx={{ fontSize: '1rem', lineHeight: 1.35 }}>
                  {course.name}
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 1.5, minHeight: 40 }}>
                  {course.description}
                </Typography>
                <Typography variant="h6" color="primary" fontWeight={800} sx={{ fontSize: '1.05rem' }}>
                  {getDisplayPrice(course).toLocaleString('vi-VN')}đ
                </Typography>
              </CardContent>
              <Box sx={{ p: 2.5, pt: 0 }}>
                <Button variant="contained" fullWidth size="small" sx={{ py: 1 }}>
                  Xem chi tiết
                </Button>
              </Box>
            </Card>
          </Box>
        ))}
      </Box>
      )}
    </Container>
  );
}
