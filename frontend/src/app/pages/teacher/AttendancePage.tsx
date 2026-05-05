import { useState } from 'react';
import {
  Box,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Button,
  MenuItem,
  TextField,
  RadioGroup,
  FormControlLabel,
  Radio,
  Grid,
} from '@mui/material';
import { Save as SaveIcon } from '@mui/icons-material';

const mockStudents = [
  { id: '1', name: 'Nguyễn Văn A', email: 'nva@example.com' },
  { id: '2', name: 'Trần Thị B', email: 'ttb@example.com' },
  { id: '3', name: 'Lê Văn C', email: 'lvc@example.com' },
  { id: '4', name: 'Phạm Thị D', email: 'ptd@example.com' },
  { id: '5', name: 'Hoàng Văn E', email: 'hve@example.com' },
];

export default function AttendancePage() {
  const [selectedClass, setSelectedClass] = useState('1');
  const [attendanceDate, setAttendanceDate] = useState('2026-05-04');
  const [attendance, setAttendance] = useState<Record<string, string>>(
    Object.fromEntries(mockStudents.map((s) => [s.id, 'PRESENT']))
  );

  const handleAttendanceChange = (studentId: string, status: string) => {
    setAttendance({ ...attendance, [studentId]: status });
  };

  const handleSave = () => {
    alert('Điểm danh đã được lưu!');
  };

  return (
    <Box>
      <Typography variant="h4" gutterBottom fontWeight={700}>
        Điểm danh
      </Typography>

      <Paper sx={{ p: 3, mb: 3 }}>
        <Grid container spacing={2}>
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              select
              label="Chọn lớp"
              value={selectedClass}
              onChange={(e) => setSelectedClass(e.target.value)}
            >
              <MenuItem value="1">IELTS Advanced - A1</MenuItem>
              <MenuItem value="2">Business English - B1</MenuItem>
            </TextField>
          </Grid>
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              type="date"
              label="Ngày điểm danh"
              value={attendanceDate}
              onChange={(e) => setAttendanceDate(e.target.value)}
              InputLabelProps={{ shrink: true }}
            />
          </Grid>
        </Grid>
      </Paper>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell width="40%">Học viên</TableCell>
              <TableCell width="20%">Email</TableCell>
              <TableCell width="40%">Trạng thái</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {mockStudents.map((student) => (
              <TableRow key={student.id}>
                <TableCell>
                  <Typography variant="body2" fontWeight={600}>
                    {student.name}
                  </Typography>
                </TableCell>
                <TableCell>
                  <Typography variant="body2" color="text.secondary">
                    {student.email}
                  </Typography>
                </TableCell>
                <TableCell>
                  <RadioGroup
                    row
                    value={attendance[student.id]}
                    onChange={(e) => handleAttendanceChange(student.id, e.target.value)}
                  >
                    <FormControlLabel value="PRESENT" control={<Radio />} label="Có mặt" />
                    <FormControlLabel value="ABSENT" control={<Radio />} label="Vắng" />
                    <FormControlLabel value="LATE" control={<Radio />} label="Muộn" />
                  </RadioGroup>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <Box sx={{ mt: 3, display: 'flex', justifyContent: 'flex-end' }}>
        <Button variant="contained" size="large" startIcon={<SaveIcon />} onClick={handleSave}>
          Lưu điểm danh
        </Button>
      </Box>
    </Box>
  );
}
