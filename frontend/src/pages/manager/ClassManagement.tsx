import { Box, Button, Typography, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Chip, IconButton } from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import EventAvailableIcon from '@mui/icons-material/EventAvailable';
import { useState } from 'react';

const mockClasses = [
  { id: '1', name: 'IELTS Weekend', course: 'IELTS Foundation', teacher: 'Bob Teacher', students: 12, maxStudents: 15, status: 'ACCEPTING' },
  { id: '2', name: 'TOEIC Evening', course: 'TOEIC Masterclass', teacher: 'Jane Smith', students: 20, maxStudents: 20, status: 'FULL' },
  { id: '3', name: 'Business Morning', course: 'Business Comm', teacher: 'Alice Johnson', students: 10, maxStudents: 15, status: 'CLOSED' },
];

const ClassManagement = () => {
  const [classes] = useState(mockClasses);

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4" sx={{ fontWeight: "bold" }}>Class Management</Typography>
        <Button variant="contained" color="primary">Open New Class</Button>
      </Box>

      <TableContainer component={Paper} elevation={2}>
        <Table>
          <TableHead sx={{ backgroundColor: '#f5f5f5' }}>
            <TableRow>
              <TableCell><strong>Class Name</strong></TableCell>
              <TableCell><strong>Course</strong></TableCell>
              <TableCell><strong>Teacher</strong></TableCell>
              <TableCell><strong>Enrollment</strong></TableCell>
              <TableCell><strong>Status</strong></TableCell>
              <TableCell align="right"><strong>Actions</strong></TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {classes.map((cls) => (
              <TableRow key={cls.id} hover>
                <TableCell>{cls.name}</TableCell>
                <TableCell>{cls.course}</TableCell>
                <TableCell>{cls.teacher}</TableCell>
                <TableCell>{cls.students} / {cls.maxStudents}</TableCell>
                <TableCell>
                  <Chip 
                    label={cls.status} 
                    size="small" 
                    color={cls.status === 'ACCEPTING' ? 'success' : cls.status === 'FULL' ? 'warning' : 'default'} 
                  />
                </TableCell>
                <TableCell align="right">
                  <IconButton size="small" color="secondary" title="View Schedule"><EventAvailableIcon /></IconButton>
                  <IconButton size="small" color="primary"><EditIcon /></IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
};

export default ClassManagement;
