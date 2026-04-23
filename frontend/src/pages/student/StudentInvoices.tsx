import { Box, Typography, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Chip, Button } from '@mui/material';

const mockInvoices = [
  { id: 'INV-001', title: 'Tuition Fee - IELTS Foundation', amount: 5000000, date: '2024-05-01', status: 'PAID' },
  { id: 'INV-002', title: 'Material Fee', amount: 500000, date: '2024-06-01', status: 'PENDING' },
];

const StudentInvoices = () => {
  return (
    <Box>
      <Typography variant="h4" sx={{ fontWeight: 'bold' }} mb={3}>My Invoices</Typography>
      
      <TableContainer component={Paper} elevation={2}>
        <Table>
          <TableHead sx={{ backgroundColor: '#f5f5f5' }}>
            <TableRow>
              <TableCell><strong>Invoice ID</strong></TableCell>
              <TableCell><strong>Description</strong></TableCell>
              <TableCell><strong>Amount (VND)</strong></TableCell>
              <TableCell><strong>Date</strong></TableCell>
              <TableCell><strong>Status</strong></TableCell>
              <TableCell align="right"><strong>Action</strong></TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {mockInvoices.map((inv) => (
              <TableRow key={inv.id} hover>
                <TableCell>{inv.id}</TableCell>
                <TableCell>{inv.title}</TableCell>
                <TableCell>{inv.amount.toLocaleString()}</TableCell>
                <TableCell>{inv.date}</TableCell>
                <TableCell>
                  <Chip 
                    label={inv.status} 
                    size="small" 
                    color={inv.status === 'PAID' ? 'success' : 'warning'} 
                  />
                </TableCell>
                <TableCell align="right">
                  {inv.status === 'PENDING' ? (
                    <Button size="small" variant="contained" color="primary">Pay Now</Button>
                  ) : (
                    <Button size="small" variant="outlined">Receipt</Button>
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

export default StudentInvoices;
