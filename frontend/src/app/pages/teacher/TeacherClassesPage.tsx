import { Box, Typography, Grid, Card, CardContent, Chip, Button, List, ListItem, ListItemText, Divider } from '@mui/material';
import { People as PeopleIcon, Event as EventIcon, Room as RoomIcon } from '@mui/icons-material';

const classes = [
  {
    id: '1',
    name: 'IELTS Advanced - A1',
    courseLevel: 'Nâng cao',
    studentCount: 12,
    maxStudents: 15,
    room: 'P301',
    schedule: 'T2, T4, T6: 18:00-20:00',
    status: 'ACCEPTING',
  },
  {
    id: '2',
    name: 'Business English - B1',
    courseLevel: 'Trung cấp',
    studentCount: 15,
    maxStudents: 15,
    room: 'P205',
    schedule: 'T3, T5, T7: 19:00-21:00',
    status: 'FULL',
  },
];

const students = [
  { id: '1', name: 'Nguyễn Văn A', email: 'nva@example.com', attendance: '95%' },
  { id: '2', name: 'Trần Thị B', email: 'ttb@example.com', attendance: '90%' },
  { id: '3', name: 'Lê Văn C', email: 'lvc@example.com', attendance: '88%' },
  { id: '4', name: 'Phạm Thị D', email: 'ptd@example.com', attendance: '92%' },
  { id: '5', name: 'Hoàng Văn E', email: 'hve@example.com', attendance: '85%' },
];

export default function TeacherClassesPage() {
  return (
    <Box>
      <Typography variant="h4" gutterBottom fontWeight={700}>
        Lớp học của tôi
      </Typography>

      <Grid container spacing={3} sx={{ mb: 4 }}>
        {classes.map((cls) => (
          <Grid item xs={12} md={6} key={cls.id}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                  <Box>
                    <Typography variant="h6" fontWeight={600}>
                      {cls.name}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {cls.courseLevel}
                    </Typography>
                  </Box>
                  <Chip
                    label={cls.status === 'FULL' ? 'Đầy' : 'Còn chỗ'}
                    color={cls.status === 'FULL' ? 'warning' : 'success'}
                    size="small"
                  />
                </Box>

                <Box sx={{ mb: 2 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    <PeopleIcon fontSize="small" sx={{ mr: 1, color: 'text.secondary' }} />
                    <Typography variant="body2">
                      Sĩ số: {cls.studentCount}/{cls.maxStudents}
                    </Typography>
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    <RoomIcon fontSize="small" sx={{ mr: 1, color: 'text.secondary' }} />
                    <Typography variant="body2">Phòng: {cls.room}</Typography>
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <EventIcon fontSize="small" sx={{ mr: 1, color: 'text.secondary' }} />
                    <Typography variant="body2">{cls.schedule}</Typography>
                  </Box>
                </Box>

                <Grid container spacing={1}>
                  <Grid item xs={6}>
                    <Button variant="outlined" fullWidth size="small">
                      Điểm danh
                    </Button>
                  </Grid>
                  <Grid item xs={6}>
                    <Button variant="outlined" fullWidth size="small">
                      Xem chi tiết
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
            Danh sách học viên - IELTS Advanced - A1
          </Typography>
          <List>
            {students.map((student, index) => (
              <Box key={student.id}>
                <ListItem sx={{ px: 0 }}>
                  <ListItemText
                    primary={student.name}
                    secondary={student.email}
                  />
                  <Chip label={`Điểm danh: ${student.attendance}`} color="primary" size="small" />
                </ListItem>
                {index < students.length - 1 && <Divider />}
              </Box>
            ))}
          </List>
        </CardContent>
      </Card>
    </Box>
  );
}
