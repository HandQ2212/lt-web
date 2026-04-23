import { Box, Typography, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Chip } from '@mui/material';

const mockGrades = [
  { id: '1', course: 'IELTS Foundation', assignment: 'Writing Task 1', score: 7.5, maxScore: 9.0, feedback: 'Good vocabulary, need better coherence.' },
  { id: '2', course: 'IELTS Foundation', assignment: 'Reading Mock Test', score: 8.0, maxScore: 9.0, feedback: 'Excellent time management.' },
  { id: '3', course: 'Business Comm', assignment: 'Email Writing', score: 85, maxScore: 100, feedback: 'Professional tone.' },
];

const Gradebook = () => {
  return (
    <Box>
      <Typography variant="h4" sx={{ fontWeight: 'bold' }} mb={3}>My Gradebook</Typography>
      
      <TableContainer component={Paper} elevation={2}>
        <Table>
          <TableHead sx={{ backgroundColor: '#f5f5f5' }}>
            <TableRow>
              <TableCell><strong>Course</strong></TableCell>
              <TableCell><strong>Assignment</strong></TableCell>
              <TableCell><strong>Score</strong></TableCell>
              <TableCell><strong>Teacher Feedback</strong></TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {mockGrades.map((grade) => (
              <TableRow key={grade.id} hover>
                <TableCell>{grade.course}</TableCell>
                <TableCell>{grade.assignment}</TableCell>
                <TableCell>
                  <Chip 
                    label={`${grade.score} / ${grade.maxScore}`} 
                    color="primary" 
                    variant="outlined"
                    sx={{ fontWeight: 'bold' }}
                  />
                </TableCell>
                <TableCell sx={{ fontStyle: 'italic', color: 'text.secondary' }}>"{grade.feedback}"</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
};

export default Gradebook;
