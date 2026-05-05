import { useEffect, useState } from 'react';
import { Box, Typography, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Chip, Button, Card, CardContent, Grid, Alert, CircularProgress } from '@mui/material';
import { Payment as PaymentIcon, Warning as WarningIcon } from '@mui/icons-material';
import { invoiceApi } from '../../../services/api';

const defaultInvoices = [
  {
    id: '1',
    courseName: 'IELTS Preparation',
    amount: 4500000,
    dueDate: '2026-06-01',
    paidDate: '2026-05-20',
    status: 'PAID',
  },
  {
    id: '2',
    courseName: 'IELTS Preparation - Tháng 2',
    amount: 1500000,
    dueDate: '2026-07-01',
    paidDate: null,
    status: 'PENDING',
  },
  {
    id: '3',
    courseName: 'IELTS Preparation - Tháng 3',
    amount: 1500000,
    dueDate: '2026-08-01',
    paidDate: null,
    status: 'PENDING',
  },
];

const getStatusColor = (status: string) => {
  switch (status) {
    case 'PAID':
      return 'success';
    case 'PENDING':
      return 'warning';
    case 'OVERDUE':
      return 'error';
    default:
      return 'default';
  }
};

const getStatusText = (status: string) => {
  switch (status) {
    case 'PAID':
      return 'Đã thanh toán';
    case 'PENDING':
      return 'Chờ thanh toán';
    case 'OVERDUE':
      return 'Quá hạn';
    default:
      return status;
  }
};

export default function PaymentPage() {
  const [invoices, setInvoices] = useState(defaultInvoices);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    void fetchInvoices();
  }, []);

  const fetchInvoices = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await invoiceApi.getAll();
      if (response?.data && Array.isArray(response.data)) {
        setInvoices(response.data);
      }
    } catch (err: any) {
      console.error('Failed to fetch invoices:', err);
      setError('Không thể tải dữ liệu học phí');
    } finally {
      setLoading(false);
    }
  };

  const totalPaid = invoices.filter((inv) => inv.status === 'PAID').reduce((sum, inv) => sum + inv.amount, 0);
  const totalPending = invoices.filter((inv) => inv.status === 'PENDING').reduce((sum, inv) => sum + inv.amount, 0);

  return (
    <Box>
      <Typography variant="h4" gutterBottom fontWeight={700}>
        Học phí & Thanh toán
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {totalPending > 0 && (
        <Alert severity="warning" icon={<WarningIcon />} sx={{ mb: 3 }}>
          Bạn có {invoices.filter((inv) => inv.status === 'PENDING').length} hóa đơn chưa thanh toán với tổng số tiền{' '}
          {totalPending.toLocaleString('vi-VN')}đ
        </Alert>
      )}

      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                <Typography variant="h6" fontWeight={600}>
                  Đã thanh toán
                </Typography>
                <PaymentIcon color="success" />
              </Box>
              <Typography variant="h4" color="success.main" fontWeight={700}>
                {loading ? '...' : totalPaid.toLocaleString('vi-VN')}đ
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                <Typography variant="h6" fontWeight={600}>
                  Còn phải trả
                </Typography>
                <WarningIcon color="warning" />
              </Box>
              <Typography variant="h4" color="warning.main" fontWeight={700}>
                {loading ? '...' : totalPending.toLocaleString('vi-VN')}đ
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 5 }}>
          <CircularProgress />
        </Box>
      ) : (
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Khóa học</TableCell>
                <TableCell>Số tiền</TableCell>
                <TableCell>Hạn thanh toán</TableCell>
                <TableCell>Ngày thanh toán</TableCell>
                <TableCell>Trạng thái</TableCell>
                <TableCell align="right">Thao tác</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {invoices.map((invoice) => (
                <TableRow key={invoice.id}>
                  <TableCell>
                    <Typography variant="body2" fontWeight={600}>
                      {invoice.courseName}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2" fontWeight={600}>
                      {invoice.amount.toLocaleString('vi-VN')}đ
                    </Typography>
                  </TableCell>
                  <TableCell>{invoice.dueDate}</TableCell>
                  <TableCell>{invoice.paidDate || '-'}</TableCell>
                  <TableCell>
                    <Chip label={getStatusText(invoice.status)} color={getStatusColor(invoice.status)} size="small" />
                  </TableCell>
                  <TableCell align="right">
                    {invoice.status === 'PENDING' && (
                      <Button variant="contained" size="small">
                        Thanh toán
                      </Button>
                    )}
                    {invoice.status === 'PAID' && (
                      <Button variant="outlined" size="small">
                        Xem hóa đơn
                      </Button>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}
    </Box>
  );
}
