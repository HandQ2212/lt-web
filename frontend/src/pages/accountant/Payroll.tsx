import { Box, Button, Typography, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Chip } from '@mui/material';

const mockPayroll = [
  { id: 'PR-001', teacher: 'Bob Teacher', month: 'May 2026', hours: 45, rate: 200000, total: 9000000, status: 'DRAFT' },
  { id: 'PR-002', teacher: 'Jane Smith', month: 'May 2026', hours: 60, rate: 250000, total: 15000000, status: 'PAID' },
];

const Payroll = () => {
  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4" sx={{ fontWeight: 'bold' }}>Payroll Generator</Typography>
        <Button variant="contained" color="primary">Generate Payroll</Button>
      </Box>

      <TableContainer component={Paper} elevation={2}>
        <Table>
          <TableHead sx={{ backgroundColor: '#f5f5f5' }}>
            <TableRow>
              <TableCell><strong>Teacher</strong></TableCell>
              <TableCell><strong>Month</strong></TableCell>
              <TableCell><strong>Total Hours</strong></TableCell>
              <TableCell><strong>Hourly Rate</strong></TableCell>
              <TableCell><strong>Total Payout (VND)</strong></TableCell>
              <TableCell><strong>Status</strong></TableCell>
              <TableCell align="right"><strong>Action</strong></TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {mockPayroll.map((pr) => (
              <TableRow key={pr.id} hover>
                <TableCell>{pr.teacher}</TableCell>
                <TableCell>{pr.month}</TableCell>
                <TableCell>{pr.hours}</TableCell>
                <TableCell>{pr.rate.toLocaleString()}</TableCell>
                <TableCell><strong>{pr.total.toLocaleString()}</strong></TableCell>
                <TableCell>
                  <Chip 
                    label={pr.status} 
                    size="small" 
                    color={pr.status === 'PAID' ? 'success' : 'default'} 
                  />
                </TableCell>
                <TableCell align="right">
                  {pr.status === 'DRAFT' && (
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

export default Payroll;
