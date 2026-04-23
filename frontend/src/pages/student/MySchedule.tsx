import { Box, Typography, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Chip } from '@mui/material';

const scheduleData = [
  { day: 'Monday', time: '18:00 - 20:00', course: 'IELTS Foundation', room: 'Room 101', teacher: 'Bob' },
  { day: 'Wednesday', time: '18:00 - 20:00', course: 'IELTS Foundation', room: 'Room 101', teacher: 'Bob' },
  { day: 'Saturday', time: '09:00 - 11:00', course: 'Business Comm', room: 'Room 205', teacher: 'Alice' },
];

const MySchedule = () => {
  return (
    <Box>
      <Typography variant="h4" sx={{ fontWeight: "bold" }} mb={3}>My Weekly Schedule</Typography>
      
      <TableContainer component={Paper} elevation={2}>
        <Table>
          <TableHead sx={{ backgroundColor: '#f5f5f5' }}>
            <TableRow>
              <TableCell><strong>Day</strong></TableCell>
              <TableCell><strong>Time</strong></TableCell>
              <TableCell><strong>Course</strong></TableCell>
              <TableCell><strong>Room</strong></TableCell>
              <TableCell><strong>Teacher</strong></TableCell>
              <TableCell><strong>Status</strong></TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {scheduleData.map((slot, index) => (
              <TableRow key={index} hover>
                <TableCell>{slot.day}</TableCell>
                <TableCell>{slot.time}</TableCell>
                <TableCell>{slot.course}</TableCell>
                <TableCell>{slot.room}</TableCell>
                <TableCell>{slot.teacher}</TableCell>
                <TableCell><Chip label="UPCOMING" size="small" color="primary" variant="outlined" /></TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
};

export default MySchedule;
