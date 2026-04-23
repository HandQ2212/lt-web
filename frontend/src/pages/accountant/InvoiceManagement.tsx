import { Box, Button, Typography, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Chip, IconButton } from '@mui/material';
import CheckCircleOutlinedIcon from '@mui/icons-material/CheckCircleOutlined';
import VisibilityIcon from '@mui/icons-material/Visibility';
import { useState } from 'react';

const mockInvoices = [
  { id: 'INV-001', student: 'John Doe', amount: 5000000, date: '2024-05-01', status: 'PAID' },
  { id: 'INV-002', student: 'Jane Smith', amount: 3500000, date: '2024-05-02', status: 'PENDING' },
  { id: 'INV-003', student: 'Mike Ross', amount: 4000000, date: '2024-05-05', status: 'OVERDUE' },
];

const InvoiceManagement = () => {
  const [invoices] = useState(mockInvoices);

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4" sx={{ fontWeight: "bold" }}>Invoice Management</Typography>
        <Button variant="contained" color="primary">Create Invoice</Button>
      </Box>

      <TableContainer component={Paper} elevation={2}>
        <Table>
          <TableHead sx={{ backgroundColor: '#f5f5f5' }}>
            <TableRow>
              <TableCell><strong>Invoice ID</strong></TableCell>
              <TableCell><strong>Student</strong></TableCell>
              <TableCell><strong>Amount (VND)</strong></TableCell>
              <TableCell><strong>Date</strong></TableCell>
              <TableCell><strong>Status</strong></TableCell>
              <TableCell align="right"><strong>Actions</strong></TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {invoices.map((inv) => (
              <TableRow key={inv.id} hover>
                <TableCell>{inv.id}</TableCell>
                <TableCell>{inv.student}</TableCell>
                <TableCell>{inv.amount.toLocaleString()}</TableCell>
                <TableCell>{inv.date}</TableCell>
                <TableCell>
                  <Chip 
                    label={inv.status} 
                    size="small" 
                    color={inv.status === 'PAID' ? 'success' : inv.status === 'PENDING' ? 'warning' : 'error'} 
                  />
                </TableCell>
                <TableCell align="right">
                  {inv.status === 'PENDING' && (
                    <IconButton size="small" color="success" title="Verify Payment"><CheckCircleOutlinedIcon /></IconButton>
                  )}
                  <IconButton size="small" color="primary" title="View"><VisibilityIcon /></IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
};

export default InvoiceManagement;
