import { Box, Button, Typography, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Chip, IconButton } from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import { useState } from 'react';

const mockCourses = [
  { id: '1', code: 'IELTS-01', name: 'IELTS Foundation', level: 'BEGINNER', price: 4000000, status: 'ACTIVE' },
  { id: '2', code: 'TOEIC-02', name: 'TOEIC Masterclass', level: 'INTERMEDIATE', price: 3500000, status: 'ACTIVE' },
  { id: '3', code: 'COM-01', name: 'Business Communication', level: 'ADVANCED', price: 5000000, status: 'INACTIVE' },
];

const CourseManagement = () => {
  const [courses] = useState(mockCourses);

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4" sx={{ fontWeight: "bold" }}>Course Management</Typography>
        <Button variant="contained" color="primary">Create New Course</Button>
      </Box>

      <TableContainer component={Paper} elevation={2}>
        <Table>
          <TableHead sx={{ backgroundColor: '#f5f5f5' }}>
            <TableRow>
              <TableCell><strong>Code</strong></TableCell>
              <TableCell><strong>Course Name</strong></TableCell>
              <TableCell><strong>Level</strong></TableCell>
              <TableCell><strong>Price (VND)</strong></TableCell>
              <TableCell><strong>Status</strong></TableCell>
              <TableCell align="right"><strong>Actions</strong></TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {courses.map((course) => (
              <TableRow key={course.id} hover>
                <TableCell>{course.code}</TableCell>
                <TableCell>{course.name}</TableCell>
                <TableCell>{course.level}</TableCell>
                <TableCell>{course.price.toLocaleString()}</TableCell>
                <TableCell>
                  <Chip 
                    label={course.status} 
                    size="small" 
                    color={course.status === 'ACTIVE' ? 'success' : 'default'} 
                  />
                </TableCell>
                <TableCell align="right">
                  <IconButton size="small" color="primary"><EditIcon /></IconButton>
                  <IconButton size="small" color="error"><DeleteIcon /></IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
};

export default CourseManagement;
