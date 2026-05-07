import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  Chip,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Alert,
  CircularProgress,
  Divider,
} from '@mui/material';
import {
  Receipt as ReceiptIcon,
  Payment as PaymentIcon,
  Download as DownloadIcon,
  Info as InfoIcon,
} from '@mui/icons-material';
import { invoiceApi } from '../../../services/api';
import { RootState } from '../../../store';
import { Link as RouterLink } from 'react-router-dom';

export default function StudentInvoicesPage() {
  const user = useSelector((state: RootState) => state.auth.user);
  const [invoices, setInvoices] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    void fetchInvoices();
  }, [user?.id]);

  const fetchInvoices = async () => {
    try {
      setLoading(true);
      setError(null);
      // Assuming the backend filters by student when fetching /api/invoices if the user has role STUDENT
      // Or we might need to pass studentId
      const response = await invoiceApi.getAll({ studentId: user?.id });
      const data = Array.isArray(response.data) ? response.data : response.data?.content || [];
      setInvoices(data);
    } catch (err: any) {
      console.error('Failed to fetch invoices', err);
      setError('Không thể tải danh sách hóa đơn học phí');
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

  const totalDebt = invoices.reduce((sum, inv) => sum + (inv.amount - (inv.paidAmount || 0)), 0);

  return (
    <Box>
      <Typography variant="h4" gutterBottom fontWeight={700}>
        Hóa đơn & Học phí
      </Typography>

      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} md={6}>
          <Card sx={{ bgcolor: 'primary.main', color: 'white', borderRadius: 3 }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <ReceiptIcon sx={{ mr: 1 }} />
                <Typography variant="h6">Tổng số hóa đơn</Typography>
              </Box>
              <Typography variant="h3" fontWeight={800}>{invoices.length}</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={6}>
          <Card sx={{ bgcolor: totalDebt > 0 ? 'error.main' : 'success.main', color: 'white', borderRadius: 3 }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <PaymentIcon sx={{ mr: 1 }} />
                <Typography variant="h6">Học phí còn nợ</Typography>
              </Box>
              <Typography variant="h3" fontWeight={800}>
                {totalDebt.toLocaleString('vi-VN')}đ
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 10 }}>
          <CircularProgress />
        </Box>
      ) : (
        <TableContainer component={Paper} sx={{ borderRadius: 3, boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}>
          <Table>
            <TableHead sx={{ bgcolor: 'grey.50' }}>
              <TableRow>
                <TableCell sx={{ fontWeight: 700 }}>Mã hóa đơn</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Ngày tạo</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Khóa học/Mô tả</TableCell>
                <TableCell sx={{ fontWeight: 700 }} align="right">Tổng tiền</TableCell>
                <TableCell sx={{ fontWeight: 700 }} align="right">Đã nộp</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Trạng thái</TableCell>
                <TableCell align="center" sx={{ fontWeight: 700 }}>Thao tác</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {invoices.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} align="center" sx={{ py: 4 }}>
                    <InfoIcon sx={{ color: 'text.secondary', fontSize: 40, mb: 1, display: 'block', mx: 'auto' }} />
                    <Typography color="text.secondary">Bạn chưa có hóa đơn nào.</Typography>
                  </TableCell>
                </TableRow>
              ) : (
                invoices.map((invoice) => (
                  <TableRow key={invoice.id} hover>
                    <TableCell sx={{ fontWeight: 600 }}>#{invoice.id.substring(0, 8)}</TableCell>
                    <TableCell>{new Date(invoice.createdAt || invoice.issueDate).toLocaleDateString('vi-VN')}</TableCell>
                    <TableCell>
                      <Typography variant="body2" fontWeight={600}>{invoice.className || 'Học phí khóa học'}</Typography>
                      <Typography variant="caption" color="text.secondary">{invoice.description}</Typography>
                    </TableCell>
                    <TableCell align="right" sx={{ fontWeight: 700 }}>{invoice.amount?.toLocaleString('vi-VN')}đ</TableCell>
                    <TableCell align="right" color="success.main">{invoice.paidAmount?.toLocaleString('vi-VN')}đ</TableCell>
                    <TableCell>
                      <Chip
                        label={getStatusLabel(invoice.status)}
                        color={getStatusColor(invoice.status)}
                        size="small"
                        sx={{ fontWeight: 700 }}
                      />
                    </TableCell>
                    <TableCell align="center">
                      <Box sx={{ display: 'flex', gap: 1, justifyContent: 'center' }}>
                        <Button
                          variant="outlined"
                          size="small"
                          startIcon={<DownloadIcon />}
                          sx={{ borderRadius: 2 }}
                        >
                          Tải PDF
                        </Button>
                        {invoice.status !== 'PAID' && (
                          <Button
                            variant="contained"
                            size="small"
                            component={RouterLink}
                            to="/student/payments"
                            sx={{ borderRadius: 2 }}
                          >
                            Thanh toán
                          </Button>
                        )}
                      </Box>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      <Box sx={{ mt: 4, p: 3, bgcolor: 'grey.50', borderRadius: 3 }}>
        <Typography variant="subtitle1" fontWeight={700} gutterBottom>
          Thông tin thanh toán chuyển khoản
        </Typography>
        <Divider sx={{ mb: 2 }} />
        <Grid container spacing={2}>
          <Grid item xs={12} md={6}>
            <Typography variant="body2"><strong>Ngân hàng:</strong> MB Bank (Ngân hàng Quân đội)</Typography>
            <Typography variant="body2"><strong>Số tài khoản:</strong> 0964114381</Typography>
            <Typography variant="body2"><strong>Chủ tài khoản:</strong> Nguyễn Nam Hải</Typography>
          </Grid>
          <Grid item xs={12} md={6}>
            <Typography variant="body2"><strong>Nội dung chuyển khoản:</strong> [Ma_Hoa_Don]</Typography>
            <Typography variant="caption" color="text.secondary">
              * Sau khi chuyển khoản, vui lòng chụp lại biên lai và gửi cho nhân viên tư vấn hoặc cập nhật trong phần thanh toán.
            </Typography>
          </Grid>
        </Grid>
      </Box>
    </Box>
  );
}
