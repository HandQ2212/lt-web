import { useEffect, useMemo, useState } from 'react';
import {
  Alert,
  Box,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
  Avatar,
  Stack,
  Divider,
} from '@mui/material';
import {
  AccountBalanceWallet as DebtIcon,
  MonetizationOn as TotalIcon,
  Paid as PaidIcon,
  PeopleAlt as StudentIcon,
  AssignmentLate as LateIcon,
  Search as SearchIcon,
} from '@mui/icons-material';
import { invoiceApi } from '../../../services/api';

interface InvoiceRecord {
  id: string;
  studentName?: string;
  className?: string;
  totalAmount?: number;
  finalAmount?: number;
  paidAmount?: number;
  outstandingAmount?: number;
  dueDate?: string;
  status?: string;
}

interface StudentDebtRow {
  studentName: string;
  classes: Set<string>;
  totalAmount: number;
  paidAmount: number;
  debtAmount: number;
  invoices: number;
}

const debtStatuses = new Set(['UNPAID', 'PARTIAL', 'PENDING']);

const formatCurrency = (value: number) => `${Number(value || 0).toLocaleString('vi-VN')}đ`;

const getStatusLabel = (status?: string) => {
  switch (status) {
    case 'PAID':
      return 'Đã thanh toán';
    case 'PARTIAL':
      return 'Thanh toán một phần';
    case 'PENDING':
      return 'Chờ thanh toán';
    case 'REFUNDED':
      return 'Đã hoàn tiền';
    default:
      return 'Chưa thanh toán';
  }
};

export default function StudentDebtPage() {
  const [invoices, setInvoices] = useState<InvoiceRecord[]>([]);
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
      setInvoices(Array.isArray(response.data) ? response.data : []);
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Không tải được dữ liệu công nợ học viên');
    } finally {
      setLoading(false);
    }
  };

  const debtInvoices = useMemo(
    () =>
      invoices.filter((invoice) => {
        const outstandingAmount = Number(invoice.outstandingAmount ?? invoice.finalAmount ?? 0);
        return outstandingAmount > 0 && debtStatuses.has(invoice.status || 'UNPAID');
      }),
    [invoices]
  );

  const totals = useMemo(() => {
    return invoices.reduce(
      (summary, invoice) => {
        summary.totalAmount += Number(invoice.finalAmount ?? invoice.totalAmount ?? 0);
        summary.paidAmount += Number(invoice.paidAmount ?? 0);
        return summary;
      },
      { totalAmount: 0, paidAmount: 0 }
    );
  }, [invoices]);

  const totalDebt = useMemo(
    () => debtInvoices.reduce((sum, invoice) => sum + Number(invoice.outstandingAmount ?? invoice.finalAmount ?? 0), 0),
    [debtInvoices]
  );

  const studentDebts = useMemo(() => {
    const rows = new Map<string, StudentDebtRow>();

    debtInvoices.forEach((invoice) => {
      const studentName = invoice.studentName || 'Chưa rõ học sinh';
      const row =
        rows.get(studentName) ||
        ({
          studentName,
          classes: new Set<string>(),
          totalAmount: 0,
          paidAmount: 0,
          debtAmount: 0,
          invoices: 0,
        } as StudentDebtRow);

      row.classes.add(invoice.className || 'Chưa rõ lớp');
      row.totalAmount += Number(invoice.finalAmount ?? invoice.totalAmount ?? 0);
      row.paidAmount += Number(invoice.paidAmount ?? 0);
      row.debtAmount += Number(invoice.outstandingAmount ?? invoice.finalAmount ?? 0);
      row.invoices += 1;
      rows.set(studentName, row);
    });

    return Array.from(rows.values()).sort((a, b) => b.debtAmount - a.debtAmount);
  }, [debtInvoices]);

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ pb: 6, maxWidth: 1240, mx: 'auto', px: { xs: 1, sm: 2, xl: 0 } }}>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" fontWeight={800} color="primary.main" gutterBottom>
          Theo dõi Công nợ Học viên
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Chi tiết các khoản học phí còn nợ và tình trạng thanh toán của từng học viên.
        </Typography>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3, borderRadius: 3 }}>
          {error}
        </Alert>
      )}

      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: {
            xs: '1fr',
            sm: 'repeat(2, minmax(0, 1fr))',
            lg: 'repeat(4, minmax(0, 1fr))',
          },
          gap: 2.5,
          mb: 4,
        }}
      >
        <SummaryCard 
          title="Tổng học phí hệ thống" 
          value={formatCurrency(totals.totalAmount)} 
          icon={<TotalIcon sx={{ color: 'primary.main' }} />} 
          color="#e3f2fd"
        />
        <SummaryCard 
          title="Tổng số tiền đã thu" 
          value={formatCurrency(totals.paidAmount)} 
          icon={<PaidIcon sx={{ color: 'success.main' }} />} 
          color="#e8f5e9"
        />
        <SummaryCard 
          title="Công nợ cần thu hồi" 
          value={formatCurrency(totalDebt)} 
          icon={<DebtIcon sx={{ color: 'error.main' }} />} 
          color="#ffebee"
        />
        <SummaryCard 
          title="Học viên đang nợ" 
          value={studentDebts.length.toString()} 
          icon={<StudentIcon sx={{ color: 'warning.main' }} />} 
          color="#fff8e1"
        />
      </Box>

      <Typography variant="h6" fontWeight={800} sx={{ mb: 3, display: 'flex', alignItems: 'center' }}>
        <LateIcon sx={{ mr: 1, color: 'error.main' }} /> Danh sách học viên còn nợ học phí
      </Typography>

      <TableContainer component={Paper} sx={{ borderRadius: 1.25, boxShadow: '0 8px 32px rgba(0,0,0,0.05)', mb: 5 }}>
        <Table>
          <TableHead sx={{ bgcolor: 'rgba(0,0,0,0.02)' }}>
            <TableRow>
              <TableCell sx={{ fontWeight: 800 }}>Học viên</TableCell>
              <TableCell sx={{ fontWeight: 800 }}>Lớp đang tham gia</TableCell>
              <TableCell align="right" sx={{ fontWeight: 800 }}>Tổng phải thu</TableCell>
              <TableCell align="right" sx={{ fontWeight: 800 }}>Đã đóng</TableCell>
              <TableCell align="right" sx={{ fontWeight: 800, color: 'error.main' }}>Còn nợ</TableCell>
              <TableCell align="center" sx={{ fontWeight: 800 }}>Số hóa đơn</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {studentDebts.map((row) => (
              <TableRow key={row.studentName} hover>
                <TableCell sx={{ fontWeight: 700 }}>{row.studentName}</TableCell>
                <TableCell>
                  {Array.from(row.classes).map((c, i) => (
                    <Chip key={i} label={c} size="small" variant="outlined" sx={{ mr: 0.5, borderRadius: 1.5, fontWeight: 600 }} />
                  ))}
                </TableCell>
                <TableCell align="right" sx={{ fontWeight: 600 }}>{formatCurrency(row.totalAmount)}</TableCell>
                <TableCell align="right" sx={{ fontWeight: 600, color: 'success.main' }}>{formatCurrency(row.paidAmount)}</TableCell>
                <TableCell align="right" sx={{ fontWeight: 900, color: 'error.main' }}>{formatCurrency(row.debtAmount)}</TableCell>
                <TableCell align="center">
                  <Chip label={row.invoices} size="small" sx={{ fontWeight: 800, bgcolor: 'rgba(0,0,0,0.05)' }} />
                </TableCell>
              </TableRow>
            ))}
            {studentDebts.length === 0 && (
              <TableRow>
                <TableCell colSpan={6} align="center" sx={{ py: 4, opacity: 0.5 }}>
                  Không có dữ liệu công nợ học viên
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>

      <Typography variant="h6" fontWeight={800} sx={{ mb: 3, display: 'flex', alignItems: 'center' }}>
        <SearchIcon sx={{ mr: 1, color: 'primary.main' }} /> Chi tiết các hóa đơn chưa hoàn tất
      </Typography>

      <TableContainer component={Paper} sx={{ borderRadius: 1.25, boxShadow: '0 8px 32px rgba(0,0,0,0.05)' }}>
        <Table>
          <TableHead sx={{ bgcolor: 'rgba(0,0,0,0.02)' }}>
            <TableRow>
              <TableCell sx={{ fontWeight: 800 }}>Mã hóa đơn</TableCell>
              <TableCell sx={{ fontWeight: 800 }}>Học viên</TableCell>
              <TableCell sx={{ fontWeight: 800 }}>Hạn nộp</TableCell>
              <TableCell sx={{ fontWeight: 800 }}>Trạng thái</TableCell>
              <TableCell align="right" sx={{ fontWeight: 800 }}>Phải thu</TableCell>
              <TableCell align="right" sx={{ fontWeight: 800, color: 'error.main' }}>Còn nợ</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {debtInvoices.map((invoice) => (
              <TableRow key={invoice.id} hover>
                <TableCell sx={{ fontWeight: 700, color: 'primary.main' }}>#{invoice.id.substring(0, 8).toUpperCase()}</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>{invoice.studentName || '-'}</TableCell>
                <TableCell sx={{ color: 'text.secondary' }}>{invoice.dueDate || '-'}</TableCell>
                <TableCell>
                  <Chip 
                    label={getStatusLabel(invoice.status)} 
                    color={invoice.status === 'PARTIAL' ? 'warning' : 'error'} 
                    size="small" 
                    sx={{ fontWeight: 800, borderRadius: 1.5 }}
                  />
                </TableCell>
                <TableCell align="right" sx={{ fontWeight: 600 }}>{formatCurrency(Number(invoice.finalAmount ?? invoice.totalAmount ?? 0))}</TableCell>
                <TableCell align="right" sx={{ fontWeight: 800, color: 'error.main' }}>{formatCurrency(Number(invoice.outstandingAmount ?? invoice.finalAmount ?? 0))}</TableCell>
              </TableRow>
            ))}
            {debtInvoices.length === 0 && (
              <TableRow>
                <TableCell colSpan={6} align="center" sx={{ py: 4, opacity: 0.5 }}>
                  Không có hóa đơn còn nợ
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
}

function SummaryCard({ title, value, icon, color }: { title: string; value: string; icon: React.ReactNode; color: string }) {
  return (
    <Card
      sx={{
        height: '100%',
        minHeight: 132,
        borderRadius: 1.25,
        border: '2px solid #1E293B',
        boxShadow: '6px 6px 0 #1E293B',
        bgcolor: '#FFFFFF',
        overflow: 'hidden',
      }}
    >
      <CardContent sx={{ height: '100%', p: { xs: 2.5, md: 3 } }}>
        <Stack direction="row" justifyContent="space-between" alignItems="center" spacing={2} sx={{ height: '100%' }}>
          <Box sx={{ minWidth: 0 }}>
            <Typography variant="body2" color="text.secondary" fontWeight={800} gutterBottom>
              {title}
            </Typography>
            <Typography
              variant="h5"
              fontWeight={900}
              color="text.primary"
              sx={{ lineHeight: 1.15, wordBreak: 'break-word' }}
            >
              {value}
            </Typography>
          </Box>
          <Avatar
            sx={{
              flex: '0 0 auto',
              bgcolor: color,
              border: '2px solid #1E293B',
              width: 58,
              height: 58,
            }}
          >
            {icon}
          </Avatar>
        </Stack>
      </CardContent>
    </Card>
  );
}
