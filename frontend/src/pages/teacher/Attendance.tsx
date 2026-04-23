import { Box, Button, Typography, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Radio, RadioGroup, FormControlLabel } from '@mui/material';
import { useState } from 'react';

const mockStudents = [
  { id: '1', name: 'John Doe', code: 'STU001', status: 'PRESENT' },
  { id: '2', name: 'Jane Smith', code: 'STU002', status: 'LATE' },
  { id: '3', name: 'Mike Ross', code: 'STU003', status: 'ABSENT' },
];

const Attendance = () => {
  const [students] = useState(mockStudents);

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 'bold' }}>Digital Attendance</Typography>
          <Typography variant="subtitle1" color="text.secondary">Class: IELTS Weekend | Date: Today</Typography>
        </Box>
        <Button variant="contained" color="primary">Submit Attendance</Button>
      </Box>

      <TableContainer component={Paper} elevation={2}>
        <Table>
          <TableHead sx={{ backgroundColor: '#f5f5f5' }}>
            <TableRow>
              <TableCell><strong>Student Code</strong></TableCell>
              <TableCell><strong>Name</strong></TableCell>
              <TableCell align="center"><strong>Attendance Status</strong></TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {students.map((stu) => (
              <TableRow key={stu.id} hover>
                <TableCell>{stu.code}</TableCell>
                <TableCell>{stu.name}</TableCell>
                <TableCell align="center">
                  <RadioGroup row defaultValue={stu.status} sx={{ justifyContent: 'center' }}>
                    <FormControlLabel value="PRESENT" control={<Radio color="success" />} label="Present" />
                    <FormControlLabel value="LATE" control={<Radio color="warning" />} label="Late" />
                    <FormControlLabel value="ABSENT" control={<Radio color="error" />} label="Absent" />
                  </RadioGroup>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
};

export default Attendance;
