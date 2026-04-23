import { Box, Button, Typography, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Chip } from '@mui/material';

const mockExpenses = [
  { id: 'EXP-001', category: 'Rent', description: 'Office Rent May', amount: 50000000, date: '2026-05-01', status: 'PAID' },
  { id: 'EXP-002', category: 'Utilities', description: 'Electricity', amount: 2500000, date: '2026-05-15', status: 'PENDING' },
];

const Expenses = () => {
  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4" sx={{ fontWeight: 'bold' }}>Operational Expenses</Typography>
        <Button variant="contained" color="primary">Add Expense</Button>
      </Box>

      <TableContainer component={Paper} elevation={2}>
        <Table>
          <TableHead sx={{ backgroundColor: '#f5f5f5' }}>
            <TableRow>
              <TableCell><strong>ID</strong></TableCell>
              <TableCell><strong>Category</strong></TableCell>
              <TableCell><strong>Description</strong></TableCell>
              <TableCell><strong>Amount (VND)</strong></TableCell>
              <TableCell><strong>Date</strong></TableCell>
              <TableCell><strong>Status</strong></TableCell>
              <TableCell align="right"><strong>Action</strong></TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {mockExpenses.map((exp) => (
              <TableRow key={exp.id} hover>
                <TableCell>{exp.id}</TableCell>
                <TableCell>{exp.category}</TableCell>
                <TableCell>{exp.description}</TableCell>
                <TableCell>{exp.amount.toLocaleString()}</TableCell>
                <TableCell>{exp.date}</TableCell>
                <TableCell>
                  <Chip 
                    label={exp.status} 
                    size="small" 
                    color={exp.status === 'PAID' ? 'success' : 'warning'} 
                  />
                </TableCell>
                <TableCell align="right">
                  {exp.status === 'PENDING' && (
                    <Button size="small" variant="contained" color="success">Approve</Button>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
};

export default Expenses;
