import { useEffect, useMemo, useState } from 'react';
import {
  Alert,
  Box,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  Grid,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from '@mui/material';
import {
  AccountBalanceWallet as DebtIcon,
  MonetizationOn as TotalIcon,
  Paid as PaidIcon,
  PeopleAlt as StudentIcon,
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
      setError(err?.response?.data?.message || 'Không tải được dữ liệu công nợ');
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
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      <Typography variant="h4" gutterBottom fontWeight={700}>
        Công nợ học viên
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Box>
                  <Typography variant="body2" color="text.secondary">
                    Tổng tiền hệ thống
                  </Typography>
                  <Typography variant="h5" fontWeight={700}>
                    {formatCurrency(totals.totalAmount)}
                  </Typography>
                </Box>
                <TotalIcon color="primary" sx={{ fontSize: 40 }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Box>
                  <Typography variant="body2" color="text.secondary">
                    Đã thu
                  </Typography>
                  <Typography variant="h5" fontWeight={700}>
                    {formatCurrency(totals.paidAmount)}
                  </Typography>
                </Box>
                <PaidIcon color="success" sx={{ fontSize: 40 }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Box>
                  <Typography variant="body2" color="text.secondary">
                    Công nợ còn lại
                  </Typography>
                  <Typography variant="h5" fontWeight={700}>
                    {formatCurrency(totalDebt)}
                  </Typography>
                </Box>
                <DebtIcon color="warning" sx={{ fontSize: 40 }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Box>
                  <Typography variant="body2" color="text.secondary">
                    Học sinh còn nợ
                  </Typography>
                  <Typography variant="h5" fontWeight={700}>
                    {studentDebts.length}
                  </Typography>
                </Box>
                <StudentIcon color="error" sx={{ fontSize: 40 }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <TableContainer component={Paper} sx={{ mb: 3 }}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Học sinh</TableCell>
              <TableCell>Lớp</TableCell>
              <TableCell align="right">Tổng phải thu</TableCell>
              <TableCell align="right">Đã thu</TableCell>
              <TableCell align="right">Còn nợ</TableCell>
              <TableCell align="right">Số hóa đơn</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {studentDebts.map((row) => (
              <TableRow key={row.studentName}>
                <TableCell>{row.studentName}</TableCell>
                <TableCell>{Array.from(row.classes).join(', ')}</TableCell>
                <TableCell align="right">{formatCurrency(row.totalAmount)}</TableCell>
                <TableCell align="right">{formatCurrency(row.paidAmount)}</TableCell>
                <TableCell align="right">{formatCurrency(row.debtAmount)}</TableCell>
                <TableCell align="right">{row.invoices}</TableCell>
              </TableRow>
            ))}
            {studentDebts.length === 0 && (
              <TableRow>
                <TableCell colSpan={6} align="center">
                  Không có công nợ học viên
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>

      <Typography variant="h6" gutterBottom fontWeight={600}>
        Chi tiết hóa đơn còn nợ
      </Typography>
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Học sinh</TableCell>
              <TableCell>Lớp</TableCell>
              <TableCell>Hạn thanh toán</TableCell>
              <TableCell>Trạng thái</TableCell>
              <TableCell align="right">Phải thu</TableCell>
              <TableCell align="right">Đã thu</TableCell>
              <TableCell align="right">Còn nợ</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {debtInvoices.map((invoice) => (
              <TableRow key={invoice.id}>
                <TableCell>{invoice.studentName || '-'}</TableCell>
                <TableCell>{invoice.className || '-'}</TableCell>
                <TableCell>{invoice.dueDate || '-'}</TableCell>
                <TableCell>
                  <Chip label={getStatusLabel(invoice.status)} color={invoice.status === 'PARTIAL' ? 'warning' : 'error'} size="small" />
                </TableCell>
                <TableCell align="right">{formatCurrency(Number(invoice.finalAmount ?? invoice.totalAmount ?? 0))}</TableCell>
                <TableCell align="right">{formatCurrency(Number(invoice.paidAmount ?? 0))}</TableCell>
                <TableCell align="right">{formatCurrency(Number(invoice.outstandingAmount ?? invoice.finalAmount ?? 0))}</TableCell>
              </TableRow>
            ))}
            {debtInvoices.length === 0 && (
              <TableRow>
                <TableCell colSpan={7} align="center">
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
