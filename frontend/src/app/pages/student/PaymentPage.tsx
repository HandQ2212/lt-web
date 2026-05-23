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
  Avatar,
  Stack,
  useTheme,
  useMediaQuery,
} from '@mui/material';
import { 
  Payment as PaymentIcon, 
  Warning as WarningIcon, 
  LocalAtm as LocalAtmIcon, 
  Info as InfoIcon,
  QrCodeScanner as QrIcon,
  CheckCircle as CheckCircleIcon,
  History as HistoryIcon,
} from '@mui/icons-material';
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
    courseName: invoice.courseName || invoice.className || 'Học phí lớp học',
    amount: Number(invoice.finalAmount ?? invoice.totalAmount ?? invoice.amount ?? 0),
    dueDate: invoice.dueDate || '-',
    paidDate: invoice.paidDate || (status === 'PAID' ? invoice.updatedAt || invoice.createdAt || null : null),
    status,
  };
};

const getStatusColor = (status: string) => {
  switch (status) {
    case 'PAID': return 'success';
    case 'PENDING': return 'warning';
    case 'OVERDUE': return 'error';
    default: return 'default';
  }
};

const getStatusText = (status: string) => {
  switch (status) {
    case 'PAID': return 'Đã thanh toán';
    case 'PENDING': return 'Chờ thanh toán';
    case 'OVERDUE': return 'Quá hạn';
    default: return status;
  }
};

const formatDate = (value: string | null) => {
  if (!value || value === '-') return '-';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleDateString('vi-VN');
};

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
};

export default function PaymentPage() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
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
  const [receiptOpen, setReceiptOpen] = useState(false);
  const [selectedReceipt, setSelectedReceipt] = useState<any | null>(null);

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
      setError('Không thể tải danh sách hóa đơn. Vui lòng thử lại sau.');
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
        returnUrl: window.location.origin + '/student/payments?status=success',
        cancelUrl: window.location.origin + '/student/payments?status=cancelled'
      } as any);
      
      if (response.data && response.data.checkoutUrl) {
        window.open(response.data.checkoutUrl, '_blank');
        setCurrentInvoice(invoice);
        setConfirmDialogOpen(true);
      }
    } catch (err: any) {
      setSnackbar({
        open: true,
        message: err?.response?.data?.message || 'Lỗi khi kết nối với cổng thanh toán PayOS',
        severity: 'error',
      });
    } finally {
      setPayingId(null);
    }
  };

  const totalPaid = invoices.filter((inv) => inv.status === 'PAID').reduce((sum, inv) => sum + inv.amount, 0);
  const totalPending = invoices.filter((inv) => inv.status === 'PENDING').reduce((sum, inv) => sum + inv.amount, 0);

  return (
    <Box sx={{ pb: 6 }}>
      <Box sx={{ display: 'flex', flexDirection: isMobile ? 'column' : 'row', justifyContent: 'space-between', alignItems: isMobile ? 'flex-start' : 'center', mb: 4, gap: 2 }}>
        <Box>
          <Typography variant="h4" fontWeight={800} color="primary.main" gutterBottom>
            Thanh toán học phí
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Quản lý và thực hiện thanh toán các khóa học của bạn một cách an toàn.
          </Typography>
        </Box>
        <Button 
          variant="outlined" 
          startIcon={<LocalAtmIcon />} 
          onClick={() => setCashInstructionOpen(true)}
          sx={{ borderRadius: 2, height: 'fit-content', fontWeight: 700 }}
        >
          Hướng dẫn tiền mặt
        </Button>
      </Box>

      {error && <Alert severity="error" sx={{ mb: 3, borderRadius: 3 }}>{error}</Alert>}

      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} md={6}>
          <Card sx={{ 
            borderRadius: 4, 
            boxShadow: '0 8px 24px rgba(46, 125, 50, 0.1)',
            border: '1px solid rgba(46, 125, 50, 0.1)',
            bgcolor: '#f8fff8'
          }}>
            <CardContent sx={{ p: 3 }}>
              <Stack direction="row" spacing={2} alignItems="center">
                <Avatar sx={{ bgcolor: 'success.main', width: 56, height: 56 }}>
                  <CheckCircleIcon />
                </Avatar>
                <Box>
                  <Typography variant="body2" color="text.secondary" fontWeight={600}>Học phí đã hoàn tất</Typography>
                  <Typography variant="h4" fontWeight={900} color="success.main">
                    {loading ? '...' : formatCurrency(totalPaid)}
                  </Typography>
                </Box>
              </Stack>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={6}>
          <Card sx={{ 
            borderRadius: 4, 
            boxShadow: '0 8px 24px rgba(237, 108, 2, 0.1)',
            border: '1px solid rgba(237, 108, 2, 0.1)',
            bgcolor: '#fffbf8'
          }}>
            <CardContent sx={{ p: 3 }}>
              <Stack direction="row" spacing={2} alignItems="center">
                <Avatar sx={{ bgcolor: 'warning.main', width: 56, height: 56 }}>
                  <WarningIcon />
                </Avatar>
                <Box>
                  <Typography variant="body2" color="text.secondary" fontWeight={600}>Tổng phí chờ thanh toán</Typography>
                  <Typography variant="h4" fontWeight={900} color="warning.main">
                    {loading ? '...' : formatCurrency(totalPending)}
                  </Typography>
                </Box>
              </Stack>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Typography variant="h6" fontWeight={800} sx={{ mb: 2, display: 'flex', alignItems: 'center' }}>
        <HistoryIcon sx={{ mr: 1, color: 'primary.main' }} /> Danh sách hóa đơn
      </Typography>

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
          <CircularProgress />
        </Box>
      ) : (
        <TableContainer component={Paper} sx={{ borderRadius: 4, boxShadow: '0 8px 32px rgba(0,0,0,0.05)', overflow: 'auto' }}>
          <Table sx={{ minWidth: 800 }}>
            <TableHead sx={{ bgcolor: 'rgba(0,0,0,0.02)' }}>
              <TableRow>
                <TableCell sx={{ fontWeight: 800 }}>Hóa đơn</TableCell>
                <TableCell sx={{ fontWeight: 800 }}>Số tiền</TableCell>
                <TableCell sx={{ fontWeight: 800 }}>Hạn nộp</TableCell>
                <TableCell sx={{ fontWeight: 800 }}>Ngày đóng</TableCell>
                <TableCell sx={{ fontWeight: 800 }}>Trạng thái</TableCell>
                <TableCell align="right" sx={{ fontWeight: 800 }}>Thao tác</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {invoices.length === 0 && (
                <TableRow>
                  <TableCell colSpan={6} align="center" sx={{ py: 6, opacity: 0.5 }}>
                    <Typography>Chưa có dữ liệu hóa đơn nào.</Typography>
                  </TableCell>
                </TableRow>
              )}
              {invoices.map((invoice) => (
                <TableRow key={invoice.id} hover>
                  <TableCell>
                    <Typography variant="body2" fontWeight={800}>{invoice.courseName}</Typography>
                    <Typography variant="caption" color="text.secondary">ID: #{invoice.id.substring(0, 8).toUpperCase()}</Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2" fontWeight={900} color="primary.main">
                      {formatCurrency(invoice.amount)}
                    </Typography>
                  </TableCell>
                  <TableCell sx={{ color: 'text.secondary' }}>{formatDate(invoice.dueDate)}</TableCell>
                  <TableCell sx={{ color: 'text.secondary' }}>{formatDate(invoice.paidDate)}</TableCell>
                  <TableCell>
                    <Chip 
                      label={getStatusText(invoice.status)} 
                      color={getStatusColor(invoice.status)} 
                      size="small" 
                      sx={{ fontWeight: 800, borderRadius: 1.5 }} 
                    />
                  </TableCell>
                  <TableCell align="right">
                    {invoice.status === 'PENDING' ? (
                      <Button
                        variant="contained"
                        size="small"
                        startIcon={<QrIcon />}
                        onClick={() => void handlePay(invoice)}
                        disabled={payingId === invoice.id}
                        sx={{ borderRadius: 2, fontWeight: 700, textTransform: 'none' }}
                      >
                        Quét mã QR
                      </Button>
                    ) : invoice.status === 'PAID' ? (
                      <Button 
                        variant="outlined" 
                        size="small" 
                        onClick={() => { setSelectedReceipt(invoice); setReceiptOpen(true); }}
                        sx={{ borderRadius: 2, textTransform: 'none' }}
                      >
                        Xem biên lai
                      </Button>
                    ) : null}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      {/* Cash Instruction Dialog */}
      <Dialog open={cashInstructionOpen} onClose={() => setCashInstructionOpen(false)} maxWidth="sm" fullWidth PaperProps={{ sx: { borderRadius: 4 } }}>
        <DialogTitle sx={{ fontWeight: 800, display: 'flex', alignItems: 'center', gap: 1 }}>
          <LocalAtmIcon color="primary" /> Thanh toán trực tiếp
        </DialogTitle>
        <DialogContent dividers>
          <Typography variant="body1" paragraph>
            Quý học viên vui lòng đến quầy kế toán tại trung tâm để thực hiện đóng học phí:
          </Typography>
          <Paper variant="outlined" sx={{ p: 2, borderRadius: 3, mb: 3, bgcolor: '#fbfbfb' }}>
            <Typography variant="subtitle2" color="primary" fontWeight={700}>Địa chỉ ELC:</Typography>
            <Typography variant="body1" fontWeight={700} sx={{ mb: 2 }}>123 Đường ABC, Quận X, TP. Hồ Chí Minh</Typography>
            
            <Typography variant="subtitle2" color="primary" fontWeight={700}>Giờ làm việc:</Typography>
            <Typography variant="body2">Thứ 2 - Thứ 7: 08:00 - 21:00</Typography>
            <Typography variant="body2">Chủ nhật: 08:00 - 17:00</Typography>
          </Paper>
          <Alert severity="info" icon={<InfoIcon />} sx={{ borderRadius: 3 }}>
            Lưu ý: Vui lòng mang theo CMND/CCCD hoặc Mã hóa đơn để nhân viên kiểm tra nhanh nhất.
          </Alert>
        </DialogContent>
        <DialogActions sx={{ p: 2.5 }}>
          <Button onClick={() => setCashInstructionOpen(false)} variant="contained" sx={{ borderRadius: 2, px: 4 }}>Tôi đã hiểu</Button>
        </DialogActions>
      </Dialog>

      {/* PayOS Confirmation Dialog */}
      <Dialog open={confirmDialogOpen} onClose={() => setConfirmDialogOpen(false)} PaperProps={{ sx: { borderRadius: 4 } }}>
        <DialogTitle sx={{ fontWeight: 800 }}>Xác nhận thanh toán trực tuyến</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Cổng thanh toán PayOS đã được mở trong tab mới. Vui lòng hoàn tất giao dịch tại đó.
            <br/><br/>
            Sau khi chuyển khoản thành công, hãy nhấn <b>"Xác nhận"</b> bên dưới để hệ thống cập nhật trạng thái ngay lập tức.
          </DialogContentText>
        </DialogContent>
        <DialogActions sx={{ p: 2.5 }}>
          <Button onClick={() => setConfirmDialogOpen(false)} color="inherit">Để sau</Button>
          <Button onClick={() => void fetchInvoices().then(() => setConfirmDialogOpen(false))} variant="contained" color="success" sx={{ borderRadius: 2 }}>
            Tôi đã chuyển khoản xong
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={() => setSnackbar((prev) => ({ ...prev, open: false }))}
      >
        <Alert severity={snackbar.severity} variant="filled" sx={{ borderRadius: 2 }}>
          {snackbar.message}
        </Alert>
      </Snackbar>

      {/* Receipt Detail Dialog */}
      <Dialog 
        open={receiptOpen} 
        onClose={() => setReceiptOpen(false)} 
        maxWidth="sm" 
        fullWidth 
        PaperProps={{ sx: { borderRadius: 4, p: 2 } }}
      >
        <Box id="printable-receipt" sx={{ textAlign: 'center', p: 2 }}>
          <CheckCircleIcon color="success" sx={{ fontSize: 64, mb: 2 }} />
          <Typography variant="h5" fontWeight={900} gutterBottom>BIÊN LAI THANH TOÁN</Typography>
          <Typography variant="body2" color="text.secondary" gutterBottom>
            Cảm ơn bạn đã hoàn tất thanh toán học phí tại ELC System.
          </Typography>
          
          <Paper variant="outlined" sx={{ my: 4, p: 3, textAlign: 'left', bgcolor: '#fcfcfc', borderRadius: 3 }}>
            <Stack spacing={2}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <Typography variant="caption" color="text.secondary">Học viên:</Typography>
                <Typography variant="body2" fontWeight={700}>{user?.fullName}</Typography>
              </Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <Typography variant="caption" color="text.secondary">Nội dung:</Typography>
                <Typography variant="body2" fontWeight={700}>{selectedReceipt?.courseName}</Typography>
              </Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <Typography variant="caption" color="text.secondary">Mã giao dịch:</Typography>
                <Typography variant="body2" fontWeight={700}>#{selectedReceipt?.id?.substring(0, 8)?.toUpperCase()}</Typography>
              </Box>
              <Divider />
              <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <Typography variant="subtitle1" fontWeight={800}>Số tiền đã đóng:</Typography>
                <Typography variant="subtitle1" fontWeight={900} color="success.main">{formatCurrency(selectedReceipt?.amount || 0)}</Typography>
              </Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <Typography variant="caption" color="text.secondary">Ngày thanh toán:</Typography>
                <Typography variant="body2" fontWeight={700}>{formatDate(selectedReceipt?.paidDate)}</Typography>
              </Box>
            </Stack>
          </Paper>

          <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 3 }}>
            Mọi thắc mắc vui lòng liên hệ hotline: 0123.456.789
          </Typography>
        </Box>
        <DialogActions sx={{ p: 3, '@media print': { display: 'none' } }}>
          <Button onClick={() => setReceiptOpen(false)} color="inherit">Đóng</Button>
          <Button variant="contained" onClick={() => window.print()} startIcon={<HistoryIcon />}>In biên lai</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
