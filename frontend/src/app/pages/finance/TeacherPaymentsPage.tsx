import { useEffect, useMemo, useState } from 'react';
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  CircularProgress,
  Grid,
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
      setSubmitting(true);
      await expenseApi.create({
        category: 'Lương giáo viên',
        amount: numericAmount,
        expenseDate,
        vendor: selectedTeacher.name,
        notes: notes || `Thanh toán lương cho ${selectedTeacher.name}`,
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
    <Box>
      <Typography variant="h4" gutterBottom fontWeight={700}>
        Thanh toán giáo viên
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Stack direction="row" justifyContent="space-between" alignItems="center">
                <Box>
                  <Typography variant="body2" color="text.secondary">
                    Tổng đã thanh toán
                  </Typography>
                  <Typography variant="h5" fontWeight={700}>
                    {formatCurrency(totalPaid)}
                  </Typography>
                </Box>
                <AttachMoneyIcon color="success" sx={{ fontSize: 40 }} />
              </Stack>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Stack direction="row" justifyContent="space-between" alignItems="center">
                <Box>
                  <Typography variant="body2" color="text.secondary">
                    Số giáo viên
                  </Typography>
                  <Typography variant="h5" fontWeight={700}>
                    {teachers.length}
                  </Typography>
                </Box>
                <ReceiptLongIcon color="primary" sx={{ fontSize: 40 }} />
              </Stack>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Paper sx={{ p: 3, mb: 3 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} md={3}>
            <TextField
              select
              fullWidth
              label="Giáo viên"
              value={teacherId}
              onChange={(event) => setTeacherId(event.target.value)}
            >
              {teachers.map((teacher) => (
                <MenuItem key={teacher.id} value={teacher.id}>
                  {teacher.name}
                </MenuItem>
              ))}
            </TextField>
          </Grid>
          <Grid item xs={12} md={2}>
            <TextField
              fullWidth
              type="number"
              label="Số tiền"
              value={amount}
              onChange={(event) => setAmount(event.target.value)}
            />
          </Grid>
          <Grid item xs={12} md={2}>
            <TextField
              fullWidth
              type="date"
              label="Ngày thanh toán"
              value={expenseDate}
              onChange={(event) => setExpenseDate(event.target.value)}
              InputLabelProps={{ shrink: true }}
            />
          </Grid>
          <Grid item xs={12} md={3}>
            <TextField
              fullWidth
              label="Ghi chú"
              value={notes}
              onChange={(event) => setNotes(event.target.value)}
            />
          </Grid>
          <Grid item xs={12} md={2}>
            <Button
              fullWidth
              variant="contained"
              startIcon={<AttachMoneyIcon />}
              onClick={handleSubmit}
              disabled={submitting || teachers.length === 0}
              sx={{ minHeight: 56 }}
            >
              Ghi nhận
            </Button>
          </Grid>
        </Grid>
      </Paper>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Ngày</TableCell>
              <TableCell>Giáo viên</TableCell>
              <TableCell align="right">Số tiền</TableCell>
              <TableCell>Người duyệt</TableCell>
              <TableCell>Ghi chú</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {teacherSalaryExpenses.map((expense) => (
              <TableRow key={expense.id}>
                <TableCell>{expense.expenseDate || '-'}</TableCell>
                <TableCell>{expense.vendor || '-'}</TableCell>
                <TableCell align="right">{formatCurrency(Number(expense.amount))}</TableCell>
                <TableCell>{expense.approvedByName || '-'}</TableCell>
                <TableCell>{expense.notes || '-'}</TableCell>
              </TableRow>
            ))}
            {teacherSalaryExpenses.length === 0 && (
              <TableRow>
                <TableCell colSpan={5} align="center">
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
