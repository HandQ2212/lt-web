import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import {
  Alert,
  Avatar,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  Divider,
  Grid,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
  useTheme,
  useMediaQuery,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material';
import {
  Receipt as ReceiptIcon,
  Payment as PaymentIcon,
  Download as DownloadIcon,
  Info as InfoIcon,
  CheckCircle as CheckCircleIcon,
  AccountBalance as BankIcon,
} from '@mui/icons-material';
import { invoiceApi } from '../../../services/api';
import { RootState } from '../../../store';
import { Link as RouterLink } from 'react-router-dom';

export default function StudentInvoicesPage() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const user = useSelector((state: RootState) => state.auth.user);
  
  const [invoices, setInvoices] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedInvoice, setSelectedInvoice] = useState<any | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);

  useEffect(() => {
    void fetchInvoices();
  }, [user?.id]);

  const fetchInvoices = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await invoiceApi.getAll();
      console.log('Invoices response:', response.data);
      const data = Array.isArray(response?.data) ? response.data : [];
      setInvoices(data);
    } catch (err: any) {
      console.error('Failed to fetch invoices', err);
      setError('Không thể tải danh sách hóa đơn học phí. Vui lòng thử lại sau.');
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PAID': return 'success';
      case 'PARTIALLY_PAID': return 'warning';
      case 'UNPAID': return 'error';
      case 'CANCELLED': return 'default';
      default: return 'default';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'PAID': return 'Đã thanh toán';
      case 'PARTIALLY_PAID': return 'Thanh toán một phần';
      case 'UNPAID': return 'Chưa thanh toán';
      case 'CANCELLED': return 'Đã hủy';
      default: return status;
    }
  };

  const totalDebt = invoices.reduce((sum, inv) => {
    const final = inv.finalAmount || inv.totalAmount || 0;
    const paid = inv.paidAmount || 0;
    return sum + (final - paid);
  }, 0);

  const formatDate = (value: string | null) => {
    if (!value || value === '-') return '-';
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return value;
    return date.toLocaleDateString('vi-VN');
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
  };

  const handleView = (invoice: any) => {
    setSelectedInvoice(invoice);
    setDetailOpen(true);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <Box sx={{ pb: 6 }}>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" fontWeight={800} color="primary.main" gutterBottom>
          Hóa đơn & Học phí
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Theo dõi lịch sử thanh toán và quản lý các hóa đơn học phí của bạn.
        </Typography>
      </Box>

      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} md={6}>
          <Card sx={{ 
            borderRadius: 4, 
            background: 'linear-gradient(135deg, #1976d2 0%, #1565c0 100%)', 
            color: 'white',
            boxShadow: '0 8px 32px rgba(25, 118, 210, 0.2)'
          }}>
            <CardContent sx={{ p: 3 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <Avatar sx={{ bgcolor: 'rgba(255,255,255,0.2)', mr: 2 }}>
                  <ReceiptIcon />
                </Avatar>
                <Typography variant="h6" fontWeight={600}>Hóa đơn của tôi</Typography>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'baseline' }}>
                <Typography variant="h3" fontWeight={900}>{invoices.length}</Typography>
                <Typography variant="subtitle1" sx={{ ml: 1, opacity: 0.8 }}>Hóa đơn tổng cộng</Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={6}>
          <Card sx={{ 
            borderRadius: 4, 
            background: totalDebt > 0 
              ? 'linear-gradient(135deg, #d32f2f 0%, #c62828 100%)' 
              : 'linear-gradient(135deg, #2e7d32 0%, #1b5e20 100%)', 
            color: 'white',
            boxShadow: totalDebt > 0 ? '0 8px 32px rgba(211, 47, 47, 0.2)' : '0 8px 32px rgba(46, 125, 50, 0.2)'
          }}>
            <CardContent sx={{ p: 3 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <Avatar sx={{ bgcolor: 'rgba(255,255,255,0.2)', mr: 2 }}>
                  <PaymentIcon />
                </Avatar>
                <Typography variant="h6" fontWeight={600}>Số dư học phí cần nộp</Typography>
              </Box>
              <Typography variant="h3" fontWeight={900}>
                {formatCurrency(totalDebt)}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {error && <Alert severity="error" sx={{ mb: 3, borderRadius: 3 }}>{error}</Alert>}

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 10 }}>
          <CircularProgress />
        </Box>
      ) : (
        <TableContainer component={Paper} sx={{ borderRadius: 4, boxShadow: '0 8px 32px rgba(0,0,0,0.05)', overflow: 'auto' }}>
          <Table sx={{ minWidth: 900 }}>
            <TableHead sx={{ bgcolor: 'rgba(0,0,0,0.02)' }}>
              <TableRow>
                <TableCell sx={{ fontWeight: 800 }}>Mã hóa đơn</TableCell>
                <TableCell sx={{ fontWeight: 800 }}>Ngày phát hành</TableCell>
                <TableCell sx={{ fontWeight: 800 }}>Nội dung học phí</TableCell>
                <TableCell sx={{ fontWeight: 800 }} align="right">Tổng số tiền</TableCell>
                <TableCell sx={{ fontWeight: 800 }} align="right">Đã thanh toán</TableCell>
                <TableCell sx={{ fontWeight: 800 }}>Trạng thái</TableCell>
                <TableCell align="center" sx={{ fontWeight: 800 }}>Hành động</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {invoices.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} align="center" sx={{ py: 8, opacity: 0.5 }}>
                    <InfoIcon sx={{ fontSize: 48, mb: 1 }} />
                    <Typography>Bạn hiện không có hóa đơn học phí nào.</Typography>
                  </TableCell>
                </TableRow>
              ) : (
                invoices.map((invoice) => {
                  const finalAmount = invoice.finalAmount || invoice.totalAmount || 0;
                  const paidAmount = invoice.paidAmount || 0;
                  
                  return (
                    <TableRow key={invoice.id} hover>
                      <TableCell sx={{ fontWeight: 700, color: 'primary.main' }}>
                        #{invoice.id ? invoice.id.substring(0, 8).toUpperCase() : 'N/A'}
                      </TableCell>
                      <TableCell sx={{ color: 'text.secondary' }}>
                        {(invoice.createdAt || invoice.issueDate) 
                          ? new Date(invoice.createdAt || invoice.issueDate).toLocaleDateString('vi-VN')
                          : 'Chưa có ngày'}
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" fontWeight={700}>{invoice.className || 'Học phí lớp học'}</Typography>
                        {invoice.description && <Typography variant="caption" color="text.secondary">{invoice.description}</Typography>}
                      </TableCell>
                      <TableCell align="right" sx={{ fontWeight: 800 }}>{formatCurrency(finalAmount)}</TableCell>
                      <TableCell align="right" sx={{ fontWeight: 700, color: 'success.main' }}>{formatCurrency(paidAmount)}</TableCell>
                      <TableCell>
                        <Chip
                          label={getStatusLabel(invoice.status)}
                          color={getStatusColor(invoice.status)}
                          size="small"
                          sx={{ fontWeight: 800, borderRadius: 1.5 }}
                        />
                      </TableCell>
                      <TableCell align="center">
                        <Box sx={{ display: 'flex', gap: 1, justifyContent: 'center' }}>
                          <Button
                            variant="outlined"
                            size="small"
                            startIcon={<DownloadIcon />}
                            onClick={() => handleView(invoice)}
                            sx={{ borderRadius: 2, textTransform: 'none' }}
                          >
                            Tải về
                          </Button>
                          {invoice.status !== 'PAID' && (
                            <Button
                              variant="contained"
                              size="small"
                              component={RouterLink}
                              to="/student/payments"
                              sx={{ borderRadius: 2, textTransform: 'none', px: 2 }}
                            >
                              Thanh toán
                            </Button>
                          )}
                        </Box>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      {/* Payment Guide Section */}
      <Box sx={{ mt: 5, p: 4, bgcolor: 'white', borderRadius: 4, boxShadow: '0 8px 32px rgba(0,0,0,0.03)', border: '1px solid rgba(0,0,0,0.05)' }}>
        <Typography variant="h6" fontWeight={800} gutterBottom display="flex" alignItems="center">
          <BankIcon sx={{ mr: 1, color: 'primary.main' }} /> Hướng dẫn thanh toán học phí
        </Typography>
        <Divider sx={{ my: 2 }} />
        <Grid container spacing={4}>
          <Grid item xs={12} md={7}>
            <Typography variant="subtitle2" color="primary" fontWeight={700} gutterBottom>
              Chuyển khoản ngân hàng (Ưu tiên)
            </Typography>
            <Paper variant="outlined" sx={{ p: 2.5, borderRadius: 3, bgcolor: '#fbfbfb' }}>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <Typography variant="caption" color="text.secondary" display="block">Ngân hàng</Typography>
                  <Typography variant="body2" fontWeight={700}>MB Bank (Ngân hàng Quân đội)</Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="caption" color="text.secondary" display="block">Số tài khoản</Typography>
                  <Typography variant="body2" fontWeight={800} color="primary.main">0964114381</Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="caption" color="text.secondary" display="block">Chủ tài khoản</Typography>
                  <Typography variant="body2" fontWeight={700}>NGUYEN NAM HAI</Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="caption" color="text.secondary" display="block">Nội dung chuyển khoản</Typography>
                  <Typography variant="body2" fontWeight={700} sx={{ bgcolor: 'warning.light', px: 1, borderRadius: 1 }}>[Ma_Hoa_Don]</Typography>
                </Grid>
              </Grid>
            </Paper>
            <Box sx={{ mt: 2, display: 'flex', alignItems: 'flex-start', gap: 1 }}>
              <CheckCircleIcon color="success" sx={{ fontSize: 18, mt: 0.3 }} />
              <Typography variant="caption" color="text.secondary">
                Hệ thống sẽ tự động cập nhật trạng thái sau 5-10 phút khi nhận được thanh toán.
              </Typography>
            </Box>
          </Grid>
          <Grid item xs={12} md={5}>
            <Typography variant="subtitle2" color="primary" fontWeight={700} gutterBottom>
              Thanh toán trực tiếp
            </Typography>
            <Typography variant="body2" paragraph>
              Quý học viên có thể đến trực tiếp các cơ sở của ELC System để đóng học phí bằng tiền mặt hoặc quẹt thẻ.
            </Typography>
            <Typography variant="body2" color="text.secondary">
              <strong>Văn phòng:</strong> 123 Đường ABC, Quận X, TP. Hồ Chí Minh<br />
              <strong>Hotline kế toán:</strong> 0123.456.789
            </Typography>
          </Grid>
        </Grid>
      </Box>

      {/* Invoice Detail Dialog */}
      <Dialog 
        open={detailOpen} 
        onClose={() => setDetailOpen(false)} 
        maxWidth="md" 
        fullWidth 
        PaperProps={{ sx: { borderRadius: 4, p: 2 } }}
      >
        <Box id="printable-invoice">
          <DialogTitle sx={{ textAlign: 'center', pb: 0 }}>
            <Typography variant="h5" fontWeight={900} color="primary">BIÊN LAI HỌC PHÍ</Typography>
            <Typography variant="caption" color="text.secondary">Mã hóa đơn: #{selectedInvoice?.id?.substring(0, 8)?.toUpperCase()}</Typography>
          </DialogTitle>
          <DialogContent>
            <Box sx={{ my: 3 }}>
              <Grid container spacing={2}>
                <Grid item xs={6}>
                  <Typography variant="caption" color="text.secondary">Họ tên học viên:</Typography>
                  <Typography variant="body1" fontWeight={700}>{user?.fullName}</Typography>
                </Grid>
                <Grid item xs={6} textAlign="right">
                  <Typography variant="caption" color="text.secondary">Ngày xuất hóa đơn:</Typography>
                  <Typography variant="body1" fontWeight={700}>{formatDate(selectedInvoice?.createdAt || selectedInvoice?.issueDate)}</Typography>
                </Grid>
                <Grid item xs={12}>
                  <Divider sx={{ my: 2 }} />
                </Grid>
                <Grid item xs={8}>
                  <Typography variant="subtitle1" fontWeight={800}>{selectedInvoice?.className || 'Học phí lớp học'}</Typography>
                  <Typography variant="body2" color="text.secondary">{selectedInvoice?.description || 'Thanh toán học phí định kỳ'}</Typography>
                </Grid>
                <Grid item xs={4} textAlign="right">
                  <Typography variant="subtitle1" fontWeight={800}>{formatCurrency(selectedInvoice?.finalAmount || selectedInvoice?.totalAmount || 0)}</Typography>
                </Grid>
                <Grid item xs={12}>
                  <Box sx={{ mt: 4, p: 2, bgcolor: 'rgba(0,0,0,0.02)', borderRadius: 2 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                      <Typography variant="body2">Tổng cộng:</Typography>
                      <Typography variant="body2" fontWeight={700}>{formatCurrency(selectedInvoice?.totalAmount || 0)}</Typography>
                    </Box>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                      <Typography variant="body2">Giảm giá:</Typography>
                      <Typography variant="body2" fontWeight={700}>-{formatCurrency(selectedInvoice?.discountAmount || 0)}</Typography>
                    </Box>
                    <Divider sx={{ my: 1 }} />
                    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                      <Typography variant="h6" fontWeight={800}>Thành tiền:</Typography>
                      <Typography variant="h6" fontWeight={900} color="primary">{formatCurrency(selectedInvoice?.finalAmount || 0)}</Typography>
                    </Box>
                  </Box>
                </Grid>
                <Grid item xs={12} sx={{ mt: 2 }}>
                  <Typography variant="caption" color="text.secondary" fontStyle="italic">
                    * Đây là hóa đơn điện tử được trích xuất từ hệ thống ELC System.
                  </Typography>
                </Grid>
              </Grid>
            </Box>
          </DialogContent>
        </Box>
        <DialogActions sx={{ p: 3, display: 'flex', gap: 2, '@media print': { display: 'none' } }}>
          <Button onClick={() => setDetailOpen(false)} color="inherit">Đóng</Button>
          <Button variant="contained" startIcon={<DownloadIcon />} onClick={handlePrint}>Tải về / In</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
