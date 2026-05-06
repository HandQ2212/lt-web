import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  Divider,
  Grid,
  List,
  ListItem,
  ListItemText,
  Typography,
} from '@mui/material';
import { Event as EventIcon, People as PeopleIcon, Room as RoomIcon } from '@mui/icons-material';
import { classApi, enrollmentApi } from '../../../services/api';
import { RootState } from '../../../store';

type ClassItem = {
  id: string;
  name?: string;
  courseName?: string;
  roomName?: string;
  teacherId?: string;
  maxStudents?: number;
  status?: string;
  schedules?: Array<{ dayOfWeek: string; startTime: string; endTime: string }>;
};

export default function TeacherClassesPage() {
  const navigate = useNavigate();
  const user = useSelector((state: RootState) => state.auth.user);
  const [classes, setClasses] = useState<ClassItem[]>([]);
  const [selectedClassId, setSelectedClassId] = useState<string>('');
  const [students, setStudents] = useState<any[]>([]);
  const [counts, setCounts] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    void fetchClasses();
  }, [user?.id]);

  useEffect(() => {
    if (selectedClassId) {
      void fetchStudents(selectedClassId);
    } else {
      setStudents([]);
    }
  }, [selectedClassId]);

  const fetchClasses = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await classApi.getAll();
      const mine = (data || []).filter((cls: ClassItem) => !user?.id || cls.teacherId === user.id);
      setClasses(mine);
      setSelectedClassId((current) => current || mine[0]?.id || '');

      const enrollmentCounts = await Promise.all(
        mine.map(async (cls: ClassItem) => {
          try {
            const response = await enrollmentApi.getByClass(cls.id);
            return [cls.id, Array.isArray(response.data) ? response.data.length : 0] as const;
          } catch {
            return [cls.id, 0] as const;
          }
        })
      );
      setCounts(Object.fromEntries(enrollmentCounts));
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Không thể tải danh sách lớp');
    } finally {
      setLoading(false);
    }
  };

  const fetchStudents = async (classId: string) => {
    try {
      const response = await enrollmentApi.getByClass(classId);
      setStudents(Array.isArray(response.data) ? response.data : []);
    } catch {
      setStudents([]);
    }
  };

  const formatSchedule = (schedules?: ClassItem['schedules']) => {
    if (!schedules?.length) return 'Chưa có lịch';
    return schedules.map((sch) => `${sch.dayOfWeek}: ${sch.startTime}-${sch.endTime}`).join(', ');
  };

  const selectedClass = classes.find((cls) => cls.id === selectedClassId);

  return (
    <Box>
      <Typography variant="h4" gutterBottom fontWeight={700}>
        Lớp học của tôi
      </Typography>

      {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
          <CircularProgress />
        </Box>
      ) : (
        <>
          <Grid container spacing={3} sx={{ mb: 4 }}>
            {classes.map((cls) => (
              <Grid item xs={12} md={6} key={cls.id}>
                <Card variant={selectedClassId === cls.id ? 'elevation' : 'outlined'}>
                  <CardContent>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                      <Box>
                        <Typography variant="h6" fontWeight={600}>{cls.name || cls.id}</Typography>
                        <Typography variant="body2" color="text.secondary">{cls.courseName || 'Khóa học'}</Typography>
                      </Box>
                      <Chip label={cls.status || 'UNKNOWN'} color={cls.status === 'ONGOING' ? 'primary' : 'default'} size="small" />
                    </Box>

                    <Box sx={{ mb: 2 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                        <PeopleIcon fontSize="small" sx={{ mr: 1, color: 'text.secondary' }} />
                        <Typography variant="body2">Sĩ số: {counts[cls.id] || 0}/{cls.maxStudents || '-'}</Typography>
                      </Box>
                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                        <RoomIcon fontSize="small" sx={{ mr: 1, color: 'text.secondary' }} />
                        <Typography variant="body2">Phòng: {cls.roomName || '-'}</Typography>
                      </Box>
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <EventIcon fontSize="small" sx={{ mr: 1, color: 'text.secondary' }} />
                        <Typography variant="body2">{formatSchedule(cls.schedules)}</Typography>
                      </Box>
                    </Box>

                    <Grid container spacing={1}>
                      <Grid item xs={6}>
                        <Button variant="outlined" fullWidth size="small" onClick={() => navigate('/teacher/attendance')}>
                          Điểm danh
                        </Button>
                      </Grid>
                      <Grid item xs={6}>
                        <Button variant="outlined" fullWidth size="small" onClick={() => setSelectedClassId(cls.id)}>
                          Xem học viên
                        </Button>
                      </Grid>
                    </Grid>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>

          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom fontWeight={600}>
                Danh sách học viên{selectedClass ? ` - ${selectedClass.name || selectedClass.id}` : ''}
              </Typography>
              <List>
                {students.length === 0 && (
                  <ListItem sx={{ px: 0 }}>
                    <ListItemText primary="Chưa có học viên trong lớp này" />
                  </ListItem>
                )}
                {students.map((enrollment, index) => (
                  <Box key={enrollment.id}>
                    <ListItem sx={{ px: 0 }}>
                      <ListItemText
                        primary={enrollment.studentName || enrollment.studentId}
                        secondary={`Trạng thái: ${enrollment.status || '-'}`}
                      />
                      <Chip label={enrollment.enrollmentDate || 'Đang học'} color="primary" size="small" />
                    </ListItem>
                    {index < students.length - 1 && <Divider />}
                  </Box>
                ))}
              </List>
            </CardContent>
          </Card>
        </>
      )}
    </Box>
  );
}
