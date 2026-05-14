import { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Typography,
  Grid,
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
    <Container maxWidth="xl" sx={{ py: 8 }}>
      <Typography variant="h3" gutterBottom fontWeight={700} align="center" sx={{ mb: 2 }}>
        Khóa học
      </Typography>
      <Typography variant="body1" align="center" color="text.secondary" sx={{ mb: 6 }}>
        Khám phá các khóa học tiếng Anh phù hợp với trình độ của bạn
      </Typography>

      <Box sx={{ mb: 4, display: 'flex', gap: 2 }}>
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
        <Typography align="center" color="text.secondary" sx={{ py: 6 }}>
          Không tìm thấy khóa học phù hợp.
        </Typography>
      ) : (
      <Grid container spacing={3}>
        {filteredCourses.map((course) => (
          <Grid item xs={12} md={4} key={course.id}>
            <Card
              sx={{
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                cursor: 'pointer',
                transition: 'transform 0.2s',
                '&:hover': { transform: 'translateY(-8px)' },
              }}
              onClick={() => navigate(`/courses/${course.id}`)}
            >
              <CardMedia
                component="img"
                height="200"
                image={course.imageUrl || 'https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=800'}
                alt={course.name}
              />
              <CardContent sx={{ flexGrow: 1 }}>
                <Box sx={{ mb: 2 }}>
                  <Chip
                    label={getLevelText(getDisplayLevel(course))}
                    color={getLevelColor(getPrimaryLevel(course)?.code || course.level || '')}
                    size="small"
                  />
                </Box>
                <Typography variant="h6" gutterBottom fontWeight={600}>
                  {course.name}
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                  {course.description}
                </Typography>
                <Typography variant="h6" color="primary" fontWeight={700}>
                  {getDisplayPrice(course).toLocaleString('vi-VN')}đ
                </Typography>
              </CardContent>
              <Box sx={{ p: 2 }}>
                <Button variant="contained" fullWidth>
                  Xem chi tiết
                </Button>
              </Box>
            </Card>
          </Grid>
        ))}
      </Grid>
      )}
    </Container>
  );
}
