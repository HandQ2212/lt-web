import { useEffect, useState } from 'react';
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  Grid,
  Paper,
  Snackbar,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from '@mui/material';
import { Payment as PaymentIcon, Warning as WarningIcon } from '@mui/icons-material';
import { invoiceApi, paymentApi } from '../../../services/api';

type StudentInvoice = {
  id: string;
  courseName: string;
  amount: number;
  dueDate: string;
  paidDate: string | null;
  status: string;
};

const normalizeInvoice = (invoice: any): StudentInvoice => {
  const rawStatus = invoice.status || 'PENDING';
  const status = rawStatus === 'UNPAID' || rawStatus === 'PARTIAL' ? 'PENDING' : rawStatus;

  return {
    id: invoice.id,
    courseName: invoice.courseName || invoice.className || 'Khóa học',
    amount: Number(invoice.amount ?? invoice.finalAmount ?? invoice.totalAmount ?? 0),
    dueDate: invoice.dueDate || '-',
    paidDate: invoice.paidDate || (status === 'PAID' ? invoice.updatedAt || invoice.createdAt || null : null),
    status,
  };
};

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

const formatDate = (value: string | null) => {
  if (!value || value === '-') {
    return '-';
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return date.toLocaleDateString('vi-VN');
};

export default function PaymentPage() {
  const [invoices, setInvoices] = useState<StudentInvoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [payingId, setPayingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [snackbar, setSnackbar] = useState<{ open: boolean; message: string; severity: 'success' | 'error' }>({
    open: false,
    message: '',
    severity: 'success',
  });

  useEffect(() => {
    void fetchInvoices();
  }, []);

  const fetchInvoices = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await invoiceApi.getAll();
      setInvoices(Array.isArray(response?.data) ? response.data.map(normalizeInvoice) : []);
    } catch (err: any) {
      console.error('Failed to fetch invoices:', err);
      setError('Không thể tải dữ liệu học phí');
    } finally {
      setLoading(false);
    }
  };

  const handlePay = async (invoice: StudentInvoice) => {
    try {
      setPayingId(invoice.id);
      await paymentApi.create({
        invoiceId: invoice.id,
        amount: invoice.amount,
        paymentMethod: 'BANK_TRANSFER',
        notes: 'Student clicked payment button in portal',
      });

      const today = new Date().toISOString();
      setInvoices((prev) =>
        prev.map((item) => (item.id === invoice.id ? { ...item, status: 'PAID', paidDate: today } : item))
      );
      setSnackbar({ open: true, message: 'Đã ghi nhận thanh toán', severity: 'success' });
    } catch (err: any) {
      setSnackbar({
        open: true,
        message: err?.response?.data?.message || 'Không ghi nhận được thanh toán',
        severity: 'error',
      });
    } finally {
      setPayingId(null);
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
              {invoices.length === 0 && (
                <TableRow>
                  <TableCell colSpan={6} align="center">
                    Chưa có hóa đơn học phí.
                  </TableCell>
                </TableRow>
              )}
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
                  <TableCell>{formatDate(invoice.dueDate)}</TableCell>
                  <TableCell>{formatDate(invoice.paidDate)}</TableCell>
                  <TableCell>
                    <Chip label={getStatusText(invoice.status)} color={getStatusColor(invoice.status)} size="small" />
                  </TableCell>
                  <TableCell align="right">
                    {invoice.status === 'PENDING' && (
                      <Button
                        variant="contained"
                        size="small"
                        onClick={() => void handlePay(invoice)}
                        disabled={payingId === invoice.id}
                      >
                        {payingId === invoice.id ? 'Đang ghi nhận...' : 'Thanh toán'}
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

      <Snackbar
        open={snackbar.open}
        autoHideDuration={3000}
        onClose={() => setSnackbar((prev) => ({ ...prev, open: false }))}
      >
        <Alert severity={snackbar.severity} variant="filled">
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}
