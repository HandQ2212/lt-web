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
  Dialog,
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
    <Box sx={{ pb: 6, width: '100%', maxWidth: 1180, mx: 'auto' }}>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" fontWeight={800} color="primary.main" gutterBottom>
          Hóa đơn & Học phí
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Theo dõi lịch sử thanh toán và quản lý các hóa đơn học phí của bạn.
        </Typography>
      </Box>

      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: { xs: '1fr', md: 'repeat(2, minmax(0, 1fr))' },
          gap: 3,
          mb: 4,
          maxWidth: 860,
          mx: 'auto',
        }}
      >
        <Box sx={{ minWidth: 0 }}>
          <Card sx={{ 
            height: '100%',
            minHeight: 180,
            borderRadius: 4,
            bgcolor: '#DBEAFE',
            color: '#1E293B',
            borderColor: '#2563EB',
            boxShadow: '5px 5px 0 #1E293B',
          }}>
            <CardContent sx={{ p: 3, height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <Avatar sx={{ bgcolor: '#2563EB', color: '#FFFFFF', border: '2px solid #1E293B', mr: 2 }}>
                  <ReceiptIcon />
                </Avatar>
                <Typography variant="h6" fontWeight={900}>Hóa đơn của tôi</Typography>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'baseline' }}>
                <Typography variant="h3" fontWeight={900} color="#1D4ED8">{invoices.length}</Typography>
                <Typography variant="subtitle1" sx={{ ml: 1, color: 'text.secondary', fontWeight: 800 }}>Hóa đơn tổng cộng</Typography>
              </Box>
            </CardContent>
          </Card>
        </Box>
        <Box sx={{ minWidth: 0 }}>
          <Card sx={{ 
            height: '100%',
            minHeight: 180,
            borderRadius: 4,
            bgcolor: totalDebt > 0 ? '#FFE4E6' : '#DCFCE7',
            color: '#1E293B',
            borderColor: totalDebt > 0 ? '#E11D48' : '#16A34A',
            boxShadow: '5px 5px 0 #1E293B',
          }}>
            <CardContent sx={{ p: 3, height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <Avatar sx={{ bgcolor: totalDebt > 0 ? '#E11D48' : '#16A34A', color: '#FFFFFF', border: '2px solid #1E293B', mr: 2 }}>
                  <PaymentIcon />
                </Avatar>
                <Typography variant="h6" fontWeight={900}>Số dư học phí cần nộp</Typography>
              </Box>
              <Typography variant="h3" fontWeight={900} sx={{ color: totalDebt > 0 ? '#BE123C' : '#15803D', wordBreak: 'break-word' }}>
                {formatCurrency(totalDebt)}
              </Typography>
            </CardContent>
          </Card>
        </Box>
      </Box>

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
        PaperProps={{
          sx: {
            borderRadius: 4,
            p: 0,
            overflow: 'hidden',
            maxHeight: 'calc(100vh - 48px)',
            display: 'flex',
            flexDirection: 'column',
          },
        }}
      >
        <Box id="printable-invoice" sx={{ bgcolor: '#FFFFFF', color: '#1E293B', overflowY: 'auto', flex: '1 1 auto' }}>
          <Box sx={{ bgcolor: '#8B5CF6', color: '#FFFFFF', px: { xs: 3, md: 4 }, py: 3 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: { xs: 'flex-start', sm: 'center' }, gap: 2, flexDirection: { xs: 'column', sm: 'row' } }}>
              <Box>
                <Typography variant="overline" sx={{ color: '#FEF3C7', fontWeight: 900, letterSpacing: 1.2 }}>
                  ELC System
                </Typography>
                <Typography variant="h4" fontWeight={900} sx={{ lineHeight: 1.1 }}>
                  Biên lai học phí
                </Typography>
              </Box>
              <Box sx={{ textAlign: { xs: 'left', sm: 'right' } }}>
                <Typography variant="caption" sx={{ display: 'block', color: 'rgba(255,255,255,0.78)', fontWeight: 700 }}>
                  Mã hóa đơn
                </Typography>
                <Typography variant="h6" fontWeight={900}>
                  #{selectedInvoice?.id?.substring(0, 8)?.toUpperCase() || 'N/A'}
                </Typography>
                {selectedInvoice?.status && (
                  <Chip
                    size="small"
                    label={getStatusLabel(selectedInvoice.status)}
                    color={getStatusColor(selectedInvoice.status)}
                    sx={{ mt: 1, fontWeight: 900, border: '2px solid #1E293B' }}
                  />
                )}
              </Box>
            </Box>
          </Box>

          <DialogContent sx={{ p: { xs: 3, md: 4 } }}>
            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, minmax(0, 1fr))' }, gap: 2, mb: 3 }}>
              <Box sx={{ p: 2, borderRadius: 3, bgcolor: '#F8FAFC', border: '2px solid #E2E8F0' }}>
                <Typography variant="caption" color="text.secondary" fontWeight={800}>Học viên</Typography>
                <Typography variant="h6" fontWeight={900}>{user?.fullName || user?.name || 'Học viên'}</Typography>
              </Box>
              <Box sx={{ p: 2, borderRadius: 3, bgcolor: '#FFF7DF', border: '2px solid #FBBF24' }}>
                <Typography variant="caption" color="text.secondary" fontWeight={800}>Ngày xuất hóa đơn</Typography>
                <Typography variant="h6" fontWeight={900}>{formatDate(selectedInvoice?.createdAt || selectedInvoice?.issueDate)}</Typography>
              </Box>
            </Box>

            <Box sx={{ border: '2px solid #1E293B', borderRadius: 3, overflow: 'hidden', mb: 3 }}>
              <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'minmax(0, 1fr) 180px' }, bgcolor: '#F8FAFC' }}>
                <Box sx={{ p: 2.5 }}>
                  <Typography variant="caption" color="text.secondary" fontWeight={800}>Nội dung học phí</Typography>
                  <Typography variant="h6" fontWeight={900} sx={{ mt: 0.5 }}>
                    {selectedInvoice?.className || 'Học phí lớp học'}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" fontWeight={600}>
                    {selectedInvoice?.description || 'Thanh toán học phí định kỳ'}
                  </Typography>
                </Box>
                <Box sx={{ p: 2.5, bgcolor: '#EEF2FF', borderLeft: { sm: '2px solid #1E293B' }, textAlign: { xs: 'left', sm: 'right' } }}>
                  <Typography variant="caption" color="text.secondary" fontWeight={800}>Số tiền</Typography>
                  <Typography variant="h6" fontWeight={900} color="primary.main" sx={{ mt: 0.5 }}>
                    {formatCurrency(selectedInvoice?.finalAmount || selectedInvoice?.totalAmount || 0)}
                  </Typography>
                </Box>
              </Box>
            </Box>

            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: 'minmax(0, 1fr) 340px' }, gap: 3, alignItems: 'start' }}>
              <Box sx={{ p: 2.5, borderRadius: 3, bgcolor: '#F8FAFC', border: '2px dashed #CBD5E1' }}>
                <Typography variant="subtitle2" fontWeight={900} sx={{ mb: 1 }}>Ghi chú</Typography>
                <Typography variant="body2" color="text.secondary" fontWeight={600}>
                  Biên lai điện tử được trích xuất từ hệ thống ELC System. Vui lòng kiểm tra thông tin học phí và mã hóa đơn khi đối chiếu thanh toán.
                </Typography>
              </Box>

              <Box sx={{ p: 2.5, borderRadius: 3, bgcolor: '#FFF7DF', border: '2px solid #1E293B', boxShadow: '4px 4px 0 #1E293B' }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', gap: 2, mb: 1 }}>
                  <Typography variant="body2" color="text.secondary" fontWeight={800}>Tổng cộng</Typography>
                  <Typography variant="body2" fontWeight={900}>{formatCurrency(selectedInvoice?.totalAmount || 0)}</Typography>
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', gap: 2, mb: 1.5 }}>
                  <Typography variant="body2" color="text.secondary" fontWeight={800}>Giảm giá</Typography>
                  <Typography variant="body2" fontWeight={900}>-{formatCurrency(selectedInvoice?.discountAmount || 0)}</Typography>
                </Box>
                <Divider sx={{ my: 1.5, borderColor: '#1E293B' }} />
                <Box sx={{ display: 'flex', justifyContent: 'space-between', gap: 2, alignItems: 'baseline' }}>
                  <Typography variant="subtitle1" fontWeight={900}>Thành tiền</Typography>
                  <Typography variant="h5" fontWeight={900} color="primary.main">
                    {formatCurrency(selectedInvoice?.finalAmount || selectedInvoice?.totalAmount || 0)}
                  </Typography>
                </Box>
              </Box>
            </Box>
          </DialogContent>
        </Box>
        <DialogActions
          sx={{
            p: 2.5,
            display: 'flex',
            gap: 2,
            justifyContent: 'flex-end',
            flexShrink: 0,
            bgcolor: '#FFFFFF',
            borderTop: '2px solid #1E293B',
            boxShadow: '0 -4px 0 rgba(30,41,59,0.08)',
            '@media print': { display: 'none' },
          }}
        >
          <Button onClick={() => setDetailOpen(false)} color="inherit" sx={{ fontWeight: 900, borderRadius: 2 }}>Đóng</Button>
          <Button variant="contained" startIcon={<DownloadIcon />} onClick={handlePrint} sx={{ borderRadius: 1, fontWeight: 900 }}>
            Tải về / In
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
