import { Box, Button, Typography, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Chip, IconButton } from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import { useState } from 'react';

const mockAssignments = [
  { id: '1', title: 'Writing Task 1', class: 'IELTS Weekend', dueDate: '2026-05-01', submissions: 10, total: 12 },
  { id: '2', title: 'Reading Mock Test', class: 'TOEIC Evening', dueDate: '2026-05-05', submissions: 5, total: 20 },
];

const AssignmentManager = () => {
  const [assignments] = useState(mockAssignments);

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4" sx={{ fontWeight: 'bold' }}>Assignment Manager</Typography>
        <Button variant="contained" color="primary">Create Assignment</Button>
      </Box>

      <TableContainer component={Paper} elevation={2}>
        <Table>
          <TableHead sx={{ backgroundColor: '#f5f5f5' }}>
            <TableRow>
              <TableCell><strong>Title</strong></TableCell>
              <TableCell><strong>Target Class</strong></TableCell>
              <TableCell><strong>Due Date</strong></TableCell>
              <TableCell><strong>Submissions</strong></TableCell>
              <TableCell align="right"><strong>Actions</strong></TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {assignments.map((asm) => (
              <TableRow key={asm.id} hover>
                <TableCell>{asm.title}</TableCell>
                <TableCell>{asm.class}</TableCell>
                <TableCell>{asm.dueDate}</TableCell>
                <TableCell>
                  <Chip 
                    label={`${asm.submissions} / ${asm.total}`} 
                    size="small" 
                    color={asm.submissions === asm.total ? 'success' : 'warning'} 
                  />
                </TableCell>
                <TableCell align="right">
                  <Button size="small" variant="outlined" sx={{ mr: 1 }}>Grade</Button>
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

export default AssignmentManager;
