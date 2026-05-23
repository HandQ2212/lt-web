import { useEffect, useMemo, useState } from 'react';
import { useSelector } from 'react-redux';
import { Alert, Box, Button, CircularProgress, Dialog, DialogContent, DialogTitle, Stack, Typography } from '@mui/material';
import { classApi } from '../../../services/api';
import { RootState } from '../../../store';
import WeeklyTimetable, { WeeklyTimetableSession } from '../../components/schedule/WeeklyTimetable';
import { dayOfWeekIndexMap, getWeekDates, isIsoDateInRange, toIsoDate } from '../../utils/timetable';

export default function TeacherSchedulePage() {
  const user = useSelector((state: RootState) => state.auth.user);
  const [classes, setClasses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedSession, setSelectedSession] = useState<WeeklyTimetableSession | null>(null);
  const [referenceDate, setReferenceDate] = useState<Date | undefined>(undefined);

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

  const sessions = useMemo<WeeklyTimetableSession[]>(() => {
    const weekDates = getWeekDates(referenceDate);
    const items: WeeklyTimetableSession[] = [];

    classes.forEach((cls: any) => {
      const startDateIso = cls.startDate || '';
      const endDateIso = cls.endDate || '';

      (cls.schedules || []).forEach((schedule: any) => {
        const dayIndex = dayOfWeekIndexMap[schedule.dayOfWeek?.toUpperCase?.() || ''];
        if (dayIndex === undefined) {
          return;
        }

        const sessionDate = weekDates[dayIndex];
        const sessionDateIso = toIsoDate(sessionDate);
        if (!isIsoDateInRange(sessionDateIso, startDateIso, endDateIso)) {
          return;
        }

        items.push({
          key: `${cls.id}-${schedule.id || `${schedule.dayOfWeek}-${schedule.startTime}`}-${sessionDateIso}`,
          dayOfWeek: schedule.dayOfWeek,
          startTime: schedule.startTime,
          endTime: schedule.endTime,
          title: cls.name || 'Lớp học',
          subtitle: cls.courseName || cls.roomName || '',
          roomLabel: cls.roomName || '-',
          teacherLabel: cls.teacherName || '',
          statusLabel: cls.status || '',
          dateLabel: `${sessionDate.getDate().toString().padStart(2, '0')}/${(sessionDate.getMonth() + 1).toString().padStart(2, '0')}`,
        });
      });
    });

    return items.sort((left, right) => {
      const leftDay = dayOfWeekIndexMap[left.dayOfWeek.toUpperCase()] ?? 0;
      const rightDay = dayOfWeekIndexMap[right.dayOfWeek.toUpperCase()] ?? 0;
      if (leftDay !== rightDay) {
        return leftDay - rightDay;
      }

      return left.startTime.localeCompare(right.startTime);
    });
  }, [classes, referenceDate]);

  return (
    <Box>
      <Typography variant="h4" gutterBottom fontWeight={800}>
        Lịch dạy của tôi
      </Typography>

      {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
          <CircularProgress />
        </Box>
      ) : (
        <WeeklyTimetable
          title="Thời khóa biểu giảng dạy"
          emptyMessage="Chưa có lịch dạy trong tuần này."
          sessions={sessions}
          referenceDate={referenceDate}
          onWeekChange={(startIso, endIso) => {
            // update referenceDate when timetable week changes
            // derive a Date from startIso (YYYY-MM-DD)
            const parts = startIso.split('-').map(Number);
            if (parts.length === 3) setReferenceDate(new Date(parts[0], parts[1] - 1, parts[2]));
          }}
          onSessionClick={(session) => setSelectedSession(session)}
        />
      )}

      <Dialog
        open={!!selectedSession}
        onClose={() => setSelectedSession(null)}
        maxWidth="sm"
        fullWidth
        PaperProps={{ sx: { borderRadius: 4 } }}
      >
        <DialogTitle sx={{ p: 3, bgcolor: 'rgba(0,0,0,0.02)' }}>
          <Stack direction="row" justifyContent="space-between" alignItems="center" spacing={2}>
            <Box>
              <Typography variant="h6" fontWeight={900} color="primary.main">
                Chi tiết buổi học
              </Typography>
              <Typography variant="body2" color="text.secondary" fontWeight={600} sx={{ mt: 0.5 }}>
                {selectedSession?.dateLabel} • {selectedSession?.startTime} - {selectedSession?.endTime}
              </Typography>
            </Box>
            <Button variant="outlined" size="small" onClick={() => setSelectedSession(null)} sx={{ borderRadius: 2 }}>
              Đóng
            </Button>
          </Stack>
        </DialogTitle>
        <DialogContent dividers sx={{ p: 3 }}>
          {selectedSession && (
            <Stack spacing={1.5}>
              <Typography variant="body1" fontWeight={800}>
                {selectedSession.title}
              </Typography>
              {selectedSession.subtitle && (
                <Typography variant="body2" color="text.secondary">
                  {selectedSession.subtitle}
                </Typography>
              )}
              {selectedSession.teacherLabel && (
                <Typography variant="body2" color="text.secondary">
                  GV: {selectedSession.teacherLabel}
                </Typography>
              )}
              {selectedSession.roomLabel && (
                <Typography variant="body2" color="text.secondary">
                  Phòng: {selectedSession.roomLabel}
                </Typography>
              )}
              {selectedSession.statusLabel && (
                <Typography variant="body2" color="text.secondary">
                  Trạng thái: {selectedSession.statusLabel}
                </Typography>
              )}
            </Stack>
          )}
        </DialogContent>
      </Dialog>
    </Box>
  );
}
