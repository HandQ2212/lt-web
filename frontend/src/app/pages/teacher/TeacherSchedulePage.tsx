import { Box, Typography, Paper, Card, CardContent, Grid, Chip } from '@mui/material';
import { CalendarMonth as CalendarIcon } from '@mui/icons-material';

const schedule = [
  {
    day: 'Thứ Hai',
    date: '2026-05-04',
    classes: [
      { time: '18:00-20:00', className: 'IELTS Advanced', room: 'P301', students: 12 },
    ],
  },
  {
    day: 'Thứ Ba',
    date: '2026-05-05',
    classes: [
      { time: '19:00-21:00', className: 'Business English', room: 'P205', students: 15 },
    ],
  },
  {
    day: 'Thứ Tư',
    date: '2026-05-06',
    classes: [
      { time: '18:00-20:00', className: 'IELTS Advanced', room: 'P301', students: 12 },
    ],
  },
  {
    day: 'Thứ Năm',
    date: '2026-05-07',
    classes: [
      { time: '19:00-21:00', className: 'Business English', room: 'P205', students: 15 },
    ],
  },
  {
    day: 'Thứ Sáu',
    date: '2026-05-08',
    classes: [
      { time: '18:00-20:00', className: 'IELTS Advanced', room: 'P301', students: 12 },
    ],
  },
];

export default function TeacherSchedulePage() {
  return (
    <Box>
      <Typography variant="h4" gutterBottom fontWeight={700}>
        Lịch dạy của tôi
      </Typography>

      <Grid container spacing={3}>
        {schedule.map((day, index) => (
          <Grid item xs={12} key={index}>
            <Paper sx={{ p: 2 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <CalendarIcon sx={{ mr: 1, color: 'primary.main' }} />
                <Typography variant="h6" fontWeight={600}>
                  {day.day} - {day.date}
                </Typography>
              </Box>

              <Grid container spacing={2}>
                {day.classes.map((cls, idx) => (
                  <Grid item xs={12} md={4} key={idx}>
                    <Card variant="outlined">
                      <CardContent>
                        <Typography variant="h6" color="primary" gutterBottom>
                          {cls.time}
                        </Typography>
                        <Typography variant="subtitle1" fontWeight={600}>
                          {cls.className}
                        </Typography>
                        <Typography variant="body2" color="text.secondary" gutterBottom>
                          Phòng: {cls.room}
                        </Typography>
                        <Chip label={`${cls.students} học viên`} size="small" color="success" />
                      </CardContent>
                    </Card>
                  </Grid>
                ))}
              </Grid>
            </Paper>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
}
