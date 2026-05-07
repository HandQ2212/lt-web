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
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Divider,
} from '@mui/material';
import { Payment as PaymentIcon, Warning as WarningIcon, LocalAtm as LocalAtmIcon, Info as InfoIcon } from '@mui/icons-material';
import { invoiceApi, paymentApi } from '../../../services/api';
import { useSelector } from 'react-redux';
import { RootState } from '../../../store';

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
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
  const [currentInvoice, setCurrentInvoice] = useState<StudentInvoice | null>(null);
  const [cashInstructionOpen, setCashInstructionOpen] = useState(false);

  const user = useSelector((state: RootState) => state.auth.user);

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
      
      const response = await paymentApi.createPayosLink({ 
        amount: invoice.amount, 
        invoiceId: invoice.id,
        returnUrl: window.location.href,
        cancelUrl: window.location.href
      });
      
      if (response.data && response.data.checkoutUrl) {
        window.open(response.data.checkoutUrl, '_blank');
        setCurrentInvoice(invoice);
        setConfirmDialogOpen(true);
      }
    } catch (err: any) {
      setSnackbar({
        open: true,
        message: err?.response?.data?.message || 'Không thể tạo link thanh toán PayOS',
        severity: 'error',
      });
    } finally {
      setPayingId(null);
    }
  };

  const handleConfirmPayment = async () => {
    if (!currentInvoice) return;
    try {
      setConfirmDialogOpen(false);
      setLoading(true);
      
      // Instead of creating a mock payment, we re-fetch invoices to see if the Webhook has updated the status
      await fetchInvoices();
      setSnackbar({ open: true, message: 'Đã cập nhật trạng thái thanh toán!', severity: 'success' });
    } catch (err: any) {
      setSnackbar({
        open: true,
        message: err?.response?.data?.message || 'Lỗi khi cập nhật dữ liệu',
        severity: 'error',
      });
    } finally {
      setLoading(false);
    }
  };

  const totalPaid = invoices.filter((inv) => inv.status === 'PAID').reduce((sum, inv) => sum + inv.amount, 0);
  const totalPending = invoices.filter((inv) => inv.status === 'PENDING').reduce((sum, inv) => sum + inv.amount, 0);

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" fontWeight={700}>
          Học phí & Thanh toán
        </Typography>
        {user?.role === 'LEAD' && totalPending > 0 && (
          <Button 
            variant="outlined" 
            startIcon={<LocalAtmIcon />} 
            onClick={() => setCashInstructionOpen(true)}
          >
            Thanh toán tiền mặt
          </Button>
        )}
      </Box>

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
          <Card sx={{ borderRadius: 3, boxShadow: 2 }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                <Typography variant="h6" fontWeight={600} color="text.secondary">
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
          <Card sx={{ borderRadius: 3, boxShadow: 2 }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                <Typography variant="h6" fontWeight={600} color="text.secondary">
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
        <TableContainer component={Paper} sx={{ borderRadius: 3, boxShadow: 1 }}>
          <Table>
            <TableHead sx={{ bgcolor: 'grey.50' }}>
              <TableRow>
                <TableCell sx={{ fontWeight: 700 }}>Thông tin hóa đơn</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Số tiền</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Hạn thanh toán</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Ngày thanh toán</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Trạng thái</TableCell>
                <TableCell align="right" sx={{ fontWeight: 700 }}>Thao tác</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {invoices.length === 0 && (
                <TableRow>
                  <TableCell colSpan={6} align="center" sx={{ py: 4 }}>
                    <Typography variant="body1" color="text.secondary">Chưa có hóa đơn học phí.</Typography>
                  </TableCell>
                </TableRow>
              )}
              {invoices.map((invoice) => (
                <TableRow key={invoice.id} hover>
                  <TableCell>
                    <Typography variant="body2" fontWeight={600}>
                      {invoice.courseName}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2" fontWeight={700} color="primary">
                      {invoice.amount.toLocaleString('vi-VN')}đ
                    </Typography>
                  </TableCell>
                  <TableCell>{formatDate(invoice.dueDate)}</TableCell>
                  <TableCell>{formatDate(invoice.paidDate)}</TableCell>
                  <TableCell>
                    <Chip label={getStatusText(invoice.status)} color={getStatusColor(invoice.status)} size="small" sx={{ fontWeight: 600 }} />
                  </TableCell>
                  <TableCell align="right">
                    {invoice.status === 'PENDING' && (
                      <Box sx={{ display: 'flex', gap: 1, justifyContent: 'flex-end' }}>
                        <Button
                          variant="contained"
                          size="small"
                          onClick={() => void handlePay(invoice)}
                          disabled={payingId === invoice.id}
                        >
                          Quét QR
                        </Button>
                      </Box>
                    )}
                    {invoice.status === 'PAID' && (
                      <Button variant="outlined" size="small">
                        Hóa đơn điện tử
                      </Button>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      {/* Dialog Hướng dẫn tiền mặt */}
      <Dialog open={cashInstructionOpen} onClose={() => setCashInstructionOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <LocalAtmIcon color="primary" />
          Hướng dẫn thanh toán tiền mặt
        </DialogTitle>
        <DialogContent dividers>
          <Box sx={{ py: 1 }}>
            <Typography variant="body1" gutterBottom>
              Bạn có thể đến trực tiếp trung tâm để thực hiện đóng học phí bằng tiền mặt:
            </Typography>
            <Box sx={{ mt: 2, p: 2, bgcolor: 'grey.50', borderRadius: 2, border: '1px dashed grey.400' }}>
              <Typography variant="subtitle2" color="primary">Địa chỉ trung tâm:</Typography>
              <Typography variant="body1" fontWeight={600}>123 Đường ABC, Quận X, TP. Hồ Chí Minh</Typography>
              
              <Typography variant="subtitle2" color="primary" sx={{ mt: 2 }}>Số điện thoại hỗ trợ (Kế toán):</Typography>
              <Typography variant="body1" fontWeight={600}>0123.456.789</Typography>
            </Box>
            <Alert severity="info" icon={<InfoIcon />} sx={{ mt: 3 }}>
              Sau khi nộp tiền mặt, vui lòng yêu cầu nhân viên kế toán cập nhật trạng thái hóa đơn trên hệ thống cho bạn.
            </Alert>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCashInstructionOpen(false)} variant="contained">Đã hiểu</Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={3000}
        onClose={() => setSnackbar((prev) => ({ ...prev, open: false }))}
      >
        <Alert severity={snackbar.severity} variant="filled">
          {snackbar.message}
        </Alert>
      </Snackbar>

      <Dialog open={confirmDialogOpen} onClose={() => setConfirmDialogOpen(false)}>
        <DialogTitle>Xác nhận thanh toán</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Hệ thống đã mở trang quét mã QR của PayOS trong một tab mới. 
            <br/><br/>
            Bạn đã quét mã và thực hiện (hoặc mô phỏng) chuyển khoản thành công chưa?
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirmDialogOpen(false)} color="inherit">
            Chưa, tôi đã hủy
          </Button>
          <Button onClick={handleConfirmPayment} variant="contained" color="success">
            Rồi, tôi đã chuyển
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
