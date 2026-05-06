import { useEffect, useMemo, useState } from 'react';
import { useSelector } from 'react-redux';
import { Alert, Box, Card, CardContent, Chip, CircularProgress, Grid, Paper, Typography } from '@mui/material';
import { CalendarMonth as CalendarIcon } from '@mui/icons-material';
import { classApi } from '../../../services/api';
import { RootState } from '../../../store';

const dayLabels: Record<string, string> = {
  MONDAY: 'Thứ Hai',
  TUESDAY: 'Thứ Ba',
  WEDNESDAY: 'Thứ Tư',
  THURSDAY: 'Thứ Năm',
  FRIDAY: 'Thứ Sáu',
  SATURDAY: 'Thứ Bảy',
  SUNDAY: 'Chủ Nhật',
};

const dayOrder = ['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY', 'SUNDAY'];

export default function TeacherSchedulePage() {
  const user = useSelector((state: RootState) => state.auth.user);
  const [classes, setClasses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    void fetchSchedule();
  }, [user?.id]);

  const fetchSchedule = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await classApi.getAll();
      setClasses((data || []).filter((cls: any) => !user?.id || cls.teacherId === user.id));
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Không thể tải lịch dạy');
    } finally {
      setLoading(false);
    }
  };

  const grouped = useMemo(() => {
    const result: Record<string, any[]> = {};
    classes.forEach((cls) => {
      (cls.schedules || []).forEach((schedule: any) => {
        const day = schedule.dayOfWeek || 'UNKNOWN';
        result[day] = result[day] || [];
        result[day].push({ ...schedule, className: cls.name, roomName: cls.roomName, status: cls.status });
      });
    });
    return result;
  }, [classes]);

  return (
    <Box>
      <Typography variant="h4" gutterBottom fontWeight={700}>
        Lịch dạy của tôi
      </Typography>

      {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
          <CircularProgress />
        </Box>
      ) : (
        <Grid container spacing={3}>
          {dayOrder.map((day) => (
            <Grid item xs={12} key={day}>
              <Paper sx={{ p: 2 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <CalendarIcon sx={{ mr: 1, color: 'primary.main' }} />
                  <Typography variant="h6" fontWeight={600}>{dayLabels[day]}</Typography>
                </Box>

                <Grid container spacing={2}>
                  {(grouped[day] || []).length === 0 && (
                    <Grid item xs={12}>
                      <Typography variant="body2" color="text.secondary">Không có lịch dạy</Typography>
                    </Grid>
                  )}
                  {(grouped[day] || []).map((item, index) => (
                    <Grid item xs={12} md={4} key={`${day}-${index}`}>
                      <Card variant="outlined">
                        <CardContent>
                          <Typography variant="h6" color="primary" gutterBottom>
                            {item.startTime}-{item.endTime}
                          </Typography>
                          <Typography variant="subtitle1" fontWeight={600}>{item.className || 'Lớp học'}</Typography>
                          <Typography variant="body2" color="text.secondary" gutterBottom>
                            Phòng: {item.roomName || '-'}
                          </Typography>
                          <Chip label={item.status || 'UNKNOWN'} size="small" color={item.status === 'ONGOING' ? 'success' : 'default'} />
                        </CardContent>
                      </Card>
                    </Grid>
                  ))}
                </Grid>
              </Paper>
            </Grid>
          ))}
        </Grid>
      )}
    </Box>
  );
}
