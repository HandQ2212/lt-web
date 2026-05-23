import { useEffect, useMemo, useState } from 'react';
import {
  Alert,
  Avatar,
  Box,
  Button,
  Card,
  CardContent,
  CircularProgress,
  MenuItem,
  Paper,
  Snackbar,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Typography,
} from '@mui/material';
import { AttachMoney as AttachMoneyIcon, ReceiptLong as ReceiptLongIcon } from '@mui/icons-material';
import { AppUser, expenseApi, userApi } from '../../../services/api';
import { getUserDisplayName } from './financeUtils';

interface ExpenseRecord {
  id: string;
  category: string;
  amount: number;
  expenseDate?: string;
  vendor?: string;
  notes?: string;
  approvedByName?: string;
}

const formatCurrency = (value: number) => `${Number(value || 0).toLocaleString('vi-VN')}đ`;

const today = new Date().toISOString().slice(0, 10);

const panelSx = {
  borderRadius: 4,
  border: '2px solid #1E293B',
  boxShadow: '6px 6px 0 #1E293B',
  bgcolor: '#FFFFFF',
  overflow: 'hidden',
};

export default function TeacherPaymentsPage() {
  const [teachers, setTeachers] = useState<AppUser[]>([]);
  const [expenses, setExpenses] = useState<ExpenseRecord[]>([]);
  const [teacherId, setTeacherId] = useState('');
  const [amount, setAmount] = useState('');
  const [expenseDate, setExpenseDate] = useState(today);
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' as 'success' | 'error' });

  const teacherSalaryExpenses = useMemo(
    () => expenses.filter((expense) => expense.category === 'Lương giáo viên'),
    [expenses]
  );

  const totalPaid = useMemo(
    () => teacherSalaryExpenses.reduce((total, expense) => total + Number(expense.amount || 0), 0),
    [teacherSalaryExpenses]
  );

  useEffect(() => {
    void fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      const [teacherList, expenseResponse] = await Promise.all([userApi.getTeachers(), expenseApi.getAll()]);
      setTeachers(teacherList);
      setExpenses(Array.isArray(expenseResponse.data) ? expenseResponse.data : []);
      if (!teacherId && teacherList.length > 0) {
        setTeacherId(teacherList[0].id);
      }
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Không tải được dữ liệu thanh toán giáo viên');
    } finally {
      setLoading(false);
    }
  };

  const selectedTeacher = teachers.find((teacher) => teacher.id === teacherId);

  const handleSubmit = async () => {
    const numericAmount = Number(amount);
    if (!selectedTeacher || !numericAmount || numericAmount <= 0) {
      setSnackbar({ open: true, message: 'Chọn giáo viên và nhập số tiền hợp lệ', severity: 'error' });
      return;
    }

    try {
      const teacherName = getUserDisplayName(selectedTeacher, 'Giáo viên');
      setSubmitting(true);
      await expenseApi.create({
        category: 'Lương giáo viên',
        amount: numericAmount,
        expenseDate,
        vendor: teacherName,
        notes: notes || `Thanh toán lương cho ${teacherName}`,
      });
      setAmount('');
      setNotes('');
      await fetchData();
      setSnackbar({ open: true, message: 'Đã ghi nhận thanh toán giáo viên', severity: 'success' });
    } catch (err: any) {
      setSnackbar({
        open: true,
        message: err?.response?.data?.message || 'Không ghi nhận được thanh toán',
        severity: 'error',
      });
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ pb: 6, maxWidth: 1240, mx: 'auto', px: { xs: 1, sm: 2, xl: 0 } }}>
      <Box sx={{ mb: 3.5 }}>
        <Typography variant="h4" gutterBottom fontWeight={800} color="text.primary">
          Thanh toán giáo viên
        </Typography>
        <Typography color="text.secondary">
          Ghi nhận lương giáo viên và theo dõi lịch sử các khoản đã thanh toán.
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
          gridTemplateColumns: { xs: '1fr', md: 'repeat(2, minmax(0, 1fr))' },
          gap: 2.5,
          mb: 3.5,
        }}
      >
        <SummaryCard
          title="Tổng đã thanh toán"
          value={formatCurrency(totalPaid)}
          icon={<AttachMoneyIcon sx={{ color: 'success.main' }} />}
          color="#DCFCE7"
        />
        <SummaryCard
          title="Số giáo viên"
          value={teachers.length.toString()}
          icon={<ReceiptLongIcon sx={{ color: 'primary.main' }} />}
          color="#EDE9FE"
        />
      </Box>

      <Paper sx={{ ...panelSx, p: { xs: 2.5, md: 3 }, mb: 3.5 }}>
        <Typography variant="h6" fontWeight={850} sx={{ mb: 2.5 }}>
          Ghi nhận thanh toán
        </Typography>
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: {
              xs: '1fr',
              md: 'minmax(220px, 1.15fr) minmax(160px, 0.85fr) minmax(180px, 0.85fr) minmax(220px, 1fr) auto',
            },
            gap: 2,
            alignItems: 'center',
          }}
        >
          <TextField
            select
            fullWidth
            label="Giáo viên"
            value={teacherId}
            onChange={(event) => setTeacherId(event.target.value)}
          >
            {teachers.map((teacher) => (
              <MenuItem key={teacher.id} value={teacher.id}>
                {getUserDisplayName(teacher, 'Giáo viên')}
              </MenuItem>
            ))}
          </TextField>
          <TextField
            fullWidth
            type="number"
            label="Số tiền"
            value={amount}
            onChange={(event) => setAmount(event.target.value)}
          />
          <TextField
            fullWidth
            type="date"
            label="Ngày thanh toán"
            value={expenseDate}
            onChange={(event) => setExpenseDate(event.target.value)}
            InputLabelProps={{ shrink: true }}
          />
          <TextField
            fullWidth
            label="Ghi chú"
            value={notes}
            onChange={(event) => setNotes(event.target.value)}
          />
          <Button
            variant="contained"
            startIcon={<AttachMoneyIcon />}
            onClick={handleSubmit}
            disabled={submitting || teachers.length === 0}
            sx={{
              minHeight: 56,
              px: 3,
              borderRadius: 1,
              border: '2px solid #1E293B',
              boxShadow: '4px 4px 0 #1E293B',
              fontWeight: 850,
              whiteSpace: 'nowrap',
              width: { xs: '100%', md: 'auto' },
            }}
          >
            Ghi nhận
          </Button>
        </Box>
      </Paper>

      <TableContainer component={Paper} sx={panelSx}>
        <Table sx={{ minWidth: 760 }}>
          <TableHead sx={{ bgcolor: '#FEF3C7' }}>
            <TableRow>
              <TableCell sx={{ fontWeight: 850 }}>Ngày</TableCell>
              <TableCell sx={{ fontWeight: 850 }}>Giáo viên</TableCell>
              <TableCell align="right" sx={{ fontWeight: 850 }}>Số tiền</TableCell>
              <TableCell sx={{ fontWeight: 850 }}>Người duyệt</TableCell>
              <TableCell sx={{ fontWeight: 850 }}>Ghi chú</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {teacherSalaryExpenses.map((expense) => (
              <TableRow key={expense.id} hover>
                <TableCell sx={{ color: 'text.secondary' }}>{expense.expenseDate || '-'}</TableCell>
                <TableCell sx={{ fontWeight: 750 }}>{expense.vendor || '-'}</TableCell>
                <TableCell align="right" sx={{ fontWeight: 850 }}>{formatCurrency(Number(expense.amount))}</TableCell>
                <TableCell>{expense.approvedByName || '-'}</TableCell>
                <TableCell>{expense.notes || '-'}</TableCell>
              </TableRow>
            ))}
            {teacherSalaryExpenses.length === 0 && (
              <TableRow>
                <TableCell colSpan={5} align="center" sx={{ py: 4, color: 'text.secondary' }}>
                  Chưa có thanh toán giáo viên
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={3000}
        onClose={() => setSnackbar((prev) => ({ ...prev, open: false }))}
      >
        <Alert severity={snackbar.severity}>{snackbar.message}</Alert>
      </Snackbar>
    </Box>
  );
}

function SummaryCard({ title, value, icon, color }: { title: string; value: string; icon: React.ReactNode; color: string }) {
  return (
    <Card sx={{ ...panelSx, minHeight: 132 }}>
      <CardContent sx={{ height: '100%', p: { xs: 2.5, md: 3 } }}>
        <Stack direction="row" alignItems="center" justifyContent="space-between" spacing={2} sx={{ height: '100%' }}>
          <Box sx={{ minWidth: 0 }}>
            <Typography variant="body2" color="text.secondary" fontWeight={800} gutterBottom>
              {title}
            </Typography>
            <Typography variant="h5" fontWeight={900} sx={{ lineHeight: 1.15, wordBreak: 'break-word' }}>
              {value}
            </Typography>
          </Box>
          <Avatar sx={{ flex: '0 0 auto', width: 58, height: 58, bgcolor: color, border: '2px solid #1E293B' }}>
            {icon}
          </Avatar>
        </Stack>
      </CardContent>
    </Card>
  );
}
