import { useEffect, useMemo, useState } from 'react';
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  Divider,
  Grid,
  MenuItem,
  Paper,
  Snackbar,
  Stack,
  Tab,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Tabs,
  TextField,
  Typography,
} from '@mui/material';
import {
  AccountBalanceWallet,
  AssignmentTurnedIn,
  FactCheck,
  Paid,
  ReceiptLong,
  Savings,
  Search,
  WorkHistory,
} from '@mui/icons-material';
import { expenseApi, invoiceApi, paymentApi, userApi, AppUser } from '../../../services/api';
import {
  debtStatuses,
  ExpenseRecord,
  formatCurrency,
  formatDate,
  getInvoiceAmount,
  getOutstandingAmount,
  getPaymentMethodLabel,
  getStatusLabel,
  InvoiceRecord,
  manualPaymentMethods,
  operatingCategories,
  PaymentRecord,
} from './financeUtils';

const today = new Date().toISOString().slice(0, 10);

type SnackbarState = { open: boolean; message: string; severity: 'success' | 'error' };

export default function FinanceOperationsPage() {
  const [activeTab, setActiveTab] = useState(0);
  const [invoices, setInvoices] = useState<InvoiceRecord[]>([]);
  const [expenses, setExpenses] = useState<ExpenseRecord[]>([]);
  const [payments, setPayments] = useState<PaymentRecord[]>([]);
  const [teachers, setTeachers] = useState<AppUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [snackbar, setSnackbar] = useState<SnackbarState>({ open: false, message: '', severity: 'success' });

  const [paymentForm, setPaymentForm] = useState({
    invoiceId: '',
    amount: '',
    paymentMethod: 'CASH',
    paymentDate: today,
    transactionId: '',
    notes: '',
  });

  const [expenseForm, setExpenseForm] = useState({
    category: 'Mặt bằng',
    amount: '',
    expenseDate: today,
    vendor: '',
    receiptUrl: '',
    notes: '',
  });

  const [refundForm, setRefundForm] = useState({
    invoiceId: '',
    amount: '',
    reason: '',
  });

  const [payrollForm, setPayrollForm] = useState({
    teacherId: '',
    month: today.slice(0, 7),
    sessions: '12',
    hoursPerSession: '1.5',
    hourlyRate: '250000',
    bonus: '0',
    deduction: '0',
    notes: '',
  });

  useEffect(() => {
    void fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      const [invoiceResponse, expenseResponse, paymentResponse, teacherList] = await Promise.all([
        invoiceApi.getAll(),
        expenseApi.getAll(),
        paymentApi.getAll(),
        userApi.getTeachers(),
      ]);

      const nextInvoices = Array.isArray(invoiceResponse.data) ? invoiceResponse.data : [];
      const nextExpenses = Array.isArray(expenseResponse.data) ? expenseResponse.data : [];
      const nextPayments = Array.isArray(paymentResponse.data) ? paymentResponse.data : [];

      setInvoices(nextInvoices);
      setExpenses(nextExpenses);
      setPayments(nextPayments);
      setTeachers(teacherList);

      setPaymentForm((prev) => ({
        ...prev,
        invoiceId: prev.invoiceId || nextInvoices.find((invoice: InvoiceRecord) => getOutstandingAmount(invoice) > 0)?.id || '',
      }));
      setRefundForm((prev) => ({ ...prev, invoiceId: prev.invoiceId || nextInvoices[0]?.id || '' }));
      setPayrollForm((prev) => ({ ...prev, teacherId: prev.teacherId || teacherList[0]?.id || '' }));
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Không thể tải dữ liệu kế toán');
    } finally {
      setLoading(false);
    }
  };

  const debtInvoices = useMemo(
    () => invoices.filter((invoice) => debtStatuses.has(invoice.status || 'UNPAID') && getOutstandingAmount(invoice) > 0),
    [invoices]
  );

  const selectedInvoice = invoices.find((invoice) => invoice.id === paymentForm.invoiceId);
  const refundableInvoice = invoices.find((invoice) => invoice.id === refundForm.invoiceId);
  const selectedTeacher = teachers.find((teacher) => teacher.id === payrollForm.teacherId);

  const payrollAmount = useMemo(() => {
    const hours = Number(payrollForm.sessions || 0) * Number(payrollForm.hoursPerSession || 0);
    return Math.max(
      0,
      hours * Number(payrollForm.hourlyRate || 0) + Number(payrollForm.bonus || 0) - Number(payrollForm.deduction || 0)
    );
  }, [payrollForm]);

  const totals = useMemo(() => {
    const revenue = payments.reduce((sum, payment) => sum + Number(payment.amount || 0), 0);
    const expense = expenses.reduce((sum, item) => sum + Number(item.amount || 0), 0);
    const debt = debtInvoices.reduce((sum, invoice) => sum + getOutstandingAmount(invoice), 0);
    const refund = expenses
      .filter((item) => item.category === 'Refund' || item.category === 'Hoàn phí')
      .reduce((sum, item) => sum + Number(item.amount || 0), 0);

    return { revenue, expense, debt, refund, profit: revenue - expense };
  }, [payments, expenses, debtInvoices]);

  const unusualExpenses = useMemo(() => {
    const average = expenses.length
      ? expenses.reduce((sum, expense) => sum + Number(expense.amount || 0), 0) / expenses.length
      : 0;
    return expenses.filter((expense) => average > 0 && Number(expense.amount || 0) >= average * 1.5);
  }, [expenses]);

  const auditRows = useMemo(() => {
    const invoiceRows = invoices.map((invoice) => ({
      time: invoice.createdAt || invoice.dueDate || '',
      actor: 'Hệ thống',
      action: `Tạo/Cập nhật hóa đơn: ${getStatusLabel(invoice.status)}`,
      object: `${invoice.studentName || '-'} - ${invoice.className || '-'}`,
      amount: getInvoiceAmount(invoice),
    }));
    const paymentRows = payments.map((payment) => ({
      time: payment.paymentDate || '',
      actor: 'Kế toán',
      action: `Ghi nhận phiếu thu: ${getPaymentMethodLabel(payment.paymentMethod)}`,
      object: `HĐ: ${payment.invoiceId?.slice(0, 8)}`,
      amount: Number(payment.amount || 0),
    }));
    const expenseRows = expenses.map((expense) => ({
      time: expense.expenseDate || '',
      actor: expense.approvedByName || 'Kế toán',
      action: `Ghi nhận phiếu chi: ${expense.category}`,
      object: expense.vendor || expense.notes || '-',
      amount: Number(expense.amount || 0),
    }));

    return [...invoiceRows, ...paymentRows, ...expenseRows].sort((a, b) => `${b.time}`.localeCompare(`${a.time}`));
  }, [invoices, payments, expenses]);

  const showMessage = (message: string, severity: SnackbarState['severity'] = 'success') => {
    setSnackbar({ open: true, message, severity });
  };

  const handleCreatePayment = async () => {
    const amount = Number(paymentForm.amount || 0);
    if (!paymentForm.invoiceId || amount <= 0) {
      showMessage('Vui lòng chọn hóa đơn và nhập số tiền hợp lệ', 'error');
      return;
    }

    try {
      setSubmitting(true);
      await paymentApi.create({
        invoiceId: paymentForm.invoiceId,
        amount,
        paymentMethod: paymentForm.paymentMethod as 'CASH' | 'BANK_TRANSFER',
        paymentDate: `${paymentForm.paymentDate}T00:00:00+07:00`,
        transactionId: paymentForm.transactionId || undefined,
        notes: paymentForm.notes || undefined,
      });
      setPaymentForm((prev) => ({ ...prev, amount: '', transactionId: '', notes: '' }));
      await fetchData();
      showMessage('Đã ghi nhận phiếu thu thành công');
    } catch (err: any) {
      showMessage(err?.response?.data?.message || 'Không thể ghi nhận phiếu thu', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleCreateExpense = async () => {
    const amount = Number(expenseForm.amount || 0);
    if (!expenseForm.category || amount <= 0) {
      showMessage('Vui lòng nhập danh mục và số tiền chi hợp lệ', 'error');
      return;
    }

    try {
      setSubmitting(true);
      await expenseApi.create({ ...expenseForm, amount });
      setExpenseForm((prev) => ({ ...prev, amount: '', vendor: '', receiptUrl: '', notes: '' }));
      await fetchData();
      showMessage('Đã ghi nhận phiếu chi thành công');
    } catch (err: any) {
      showMessage(err?.response?.data?.message || 'Không thể ghi nhận phiếu chi', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleRefund = async () => {
    const amount = Number(refundForm.amount || 0);
    if (!refundForm.invoiceId || amount <= 0) {
      showMessage('Vui lòng chọn hóa đơn và nhập số tiền hoàn hợp lệ', 'error');
      return;
    }

    try {
      setSubmitting(true);
      await invoiceApi.refund(refundForm.invoiceId, { amount, reason: refundForm.reason || 'Hoàn phí học vụ' });
      setRefundForm((prev) => ({ ...prev, amount: '', reason: '' }));
      await fetchData();
      showMessage('Đã xử lý hoàn phí thành công');
    } catch (err: any) {
      showMessage(err?.response?.data?.message || 'Không thể xử lý hoàn phí', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleCreatePayroll = async () => {
    if (!selectedTeacher || payrollAmount <= 0) {
      showMessage('Vui lòng chọn giáo viên và điền đầy đủ thông tin tính lương', 'error');
      return;
    }

    try {
      setSubmitting(true);
      await expenseApi.create({
        category: 'Lương giáo viên',
        amount: payrollAmount,
        expenseDate: `${payrollForm.month}-28`,
        vendor: selectedTeacher.name,
        notes:
          payrollForm.notes ||
          `Chốt công ${payrollForm.sessions} buổi, ${payrollForm.hoursPerSession} giờ/buổi, đơn giá ${formatCurrency(
            Number(payrollForm.hourlyRate || 0)
          )}`,
      });
      await fetchData();
      showMessage('Đã chốt công và ghi nhận lương giáo viên thành công');
    } catch (err: any) {
      showMessage(err?.response?.data?.message || 'Không thể chốt lương giáo viên', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 10 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ pb: 4 }}>
      <Stack direction={{ xs: 'column', md: 'row' }} justifyContent="space-between" spacing={2} sx={{ mb: 4 }}>
        <Box>
          <Typography variant="h4" fontWeight={800} color="primary.main">
            Nghiệp vụ Kế toán
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Quản lý phiếu thu, phiếu chi, chốt lương giáo viên và theo dõi lịch sử giao dịch.
          </Typography>
        </Box>
        <Button variant="outlined" startIcon={<Search />} onClick={fetchData} sx={{ borderRadius: 2, fontWeight: 700 }}>
          Tải lại dữ liệu
        </Button>
      </Stack>

      {error && (
        <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }}>
          {error}
        </Alert>
      )}

      <Grid container spacing={3} sx={{ mb: 4 }}>
        <SummaryCard title="Tổng thu" value={formatCurrency(totals.revenue)} icon={<Paid sx={{ color: 'success.main' }} />} />
        <SummaryCard title="Tổng chi" value={formatCurrency(totals.expense)} icon={<ReceiptLong sx={{ color: 'error.main' }} />} />
        <SummaryCard title="Công nợ học viên" value={formatCurrency(totals.debt)} icon={<AccountBalanceWallet sx={{ color: 'warning.main' }} />} />
        <SummaryCard title="Lợi nhuận tạm tính" value={formatCurrency(totals.profit)} icon={<Savings sx={{ color: 'primary.main' }} />} />
      </Grid>

      <Paper sx={{ mb: 4, borderRadius: 3, overflow: 'hidden', boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}>
        <Tabs value={activeTab} onChange={(_, value) => setActiveTab(value)} variant="scrollable" scrollButtons="auto" sx={{ px: 1 }}>
          <Tab label="Phiếu thu" sx={{ fontWeight: 700 }} />
          <Tab label="Công nợ học phí" sx={{ fontWeight: 700 }} />
          <Tab label="Hoàn phí & Học vụ" sx={{ fontWeight: 700 }} />
          <Tab label="Lương giáo viên" sx={{ fontWeight: 700 }} />
          <Tab label="Chi phí vận hành" sx={{ fontWeight: 700 }} />
          <Tab label="Nhật ký giao dịch" sx={{ fontWeight: 700 }} />
        </Tabs>
      </Paper>

      {activeTab === 0 && (
        <Grid container spacing={3}>
          <Grid item xs={12} md={5}>
            <Paper sx={{ p: 3, borderRadius: 4 }}>
              <Typography variant="h6" fontWeight={800} gutterBottom sx={{ mb: 3 }}>
                Tạo phiếu thu mới
              </Typography>
              <Stack spacing={2.5}>
                <TextField
                  select
                  fullWidth
                  label="Chọn hóa đơn cần thu"
                  value={paymentForm.invoiceId}
                  onChange={(event) => setPaymentForm((prev) => ({ ...prev, invoiceId: event.target.value }))}
                >
                  {debtInvoices.map((invoice) => (
                    <MenuItem key={invoice.id} value={invoice.id}>
                      {invoice.studentName} - {invoice.className} (Còn {formatCurrency(getOutstandingAmount(invoice))})
                    </MenuItem>
                  ))}
                </TextField>
                {selectedInvoice && (
                  <Alert severity="info" sx={{ borderRadius: 2 }}>
                    Cần thu: {formatCurrency(getInvoiceAmount(selectedInvoice))} • Đã nộp: {formatCurrency(Number(selectedInvoice.paidAmount || 0))} • <strong>Còn thiếu: {formatCurrency(getOutstandingAmount(selectedInvoice))}</strong>
                  </Alert>
                )}
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      type="number"
                      label="Số tiền thu"
                      value={paymentForm.amount}
                      onChange={(event) => setPaymentForm((prev) => ({ ...prev, amount: event.target.value }))}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      select
                      fullWidth
                      label="Phương thức"
                      value={paymentForm.paymentMethod}
                      onChange={(event) => setPaymentForm((prev) => ({ ...prev, paymentMethod: event.target.value }))}
                    >
                      {manualPaymentMethods.map((method) => (
                        <MenuItem key={method.value} value={method.value}>
                          {method.label}
                        </MenuItem>
                      ))}
                    </TextField>
                  </Grid>
                </Grid>
                <TextField
                  type="date"
                  fullWidth
                  label="Ngày thu tiền"
                  value={paymentForm.paymentDate}
                  onChange={(event) => setPaymentForm((prev) => ({ ...prev, paymentDate: event.target.value }))}
                  InputLabelProps={{ shrink: true }}
                />
                <TextField
                  fullWidth
                  label="Mã giao dịch / Ghi chú"
                  value={paymentForm.transactionId}
                  onChange={(event) => setPaymentForm((prev) => ({ ...prev, transactionId: event.target.value }))}
                />
                <Button variant="contained" size="large" startIcon={<AssignmentTurnedIn />} disabled={submitting} onClick={handleCreatePayment} sx={{ borderRadius: 2, py: 1.5, fontWeight: 700 }}>
                  Xác nhận thu tiền
                </Button>
              </Stack>
            </Paper>
          </Grid>
          <Grid item xs={12} md={7}>
            <FinanceTable
              title="Phiếu thu gần đây"
              columns={['Ngày', 'Nội dung', 'Phương thức', 'Số tiền', 'Ghi chú']}
              rows={payments.slice(0, 10).map((payment) => [
                formatDate(payment.paymentDate),
                `HĐ: ${payment.invoiceId?.slice(0, 8)}`,
                getPaymentMethodLabel(payment.paymentMethod),
                <Typography fontWeight={700} color="success.main">{formatCurrency(payment.amount)}</Typography>,
                payment.notes || '-',
              ])}
              emptyText="Chưa có dữ liệu phiếu thu"
            />
          </Grid>
        </Grid>
      )}

      {activeTab === 1 && (
        <FinanceTable
          title="Chi tiết công nợ học phí"
          columns={['Học viên', 'Lớp học', 'Hạn thanh toán', 'Trạng thái', 'Tổng học phí', 'Đã nộp', 'Còn nợ']}
          rows={debtInvoices.map((invoice) => [
            <Typography fontWeight={700}>{invoice.studentName}</Typography>,
            invoice.className || '-',
            formatDate(invoice.dueDate),
            getStatusLabel(invoice.status),
            formatCurrency(getInvoiceAmount(invoice)),
            formatCurrency(invoice.paidAmount),
            <Typography fontWeight={800} color="error.main">{formatCurrency(getOutstandingAmount(invoice))}</Typography>,
          ])}
          emptyText="Hiện không có học viên nào nợ phí"
        />
      )}

      {activeTab === 2 && (
        <Grid container spacing={3}>
          <Grid item xs={12} md={5}>
            <Paper sx={{ p: 3, borderRadius: 4 }}>
              <Typography variant="h6" fontWeight={800} gutterBottom sx={{ mb: 3 }}>
                Xử lý hoàn phí & Điều chỉnh
              </Typography>
              <Stack spacing={2.5}>
                <TextField
                  select
                  fullWidth
                  label="Chọn hóa đơn học viên"
                  value={refundForm.invoiceId}
                  onChange={(event) => setRefundForm((prev) => ({ ...prev, invoiceId: event.target.value }))}
                >
                  {invoices.map((invoice) => (
                    <MenuItem key={invoice.id} value={invoice.id}>
                      {invoice.studentName} - {invoice.className}
                    </MenuItem>
                  ))}
                </TextField>
                {refundableInvoice && (
                  <Alert severity="warning" sx={{ borderRadius: 2 }}>
                    Đã thu thực tế: {formatCurrency(refundableInvoice.paidAmount)}. Khoản hoàn phí sẽ được ghi nhận vào chi phí của trung tâm.
                  </Alert>
                )}
                <TextField
                  fullWidth
                  type="number"
                  label="Số tiền hoàn lại"
                  value={refundForm.amount}
                  onChange={(event) => setRefundForm((prev) => ({ ...prev, amount: event.target.value }))}
                />
                <TextField
                  fullWidth
                  multiline
                  rows={3}
                  label="Lý do hoàn phí"
                  placeholder="VD: Học viên bảo lưu, rút hồ sơ, hoặc chuyển khóa thừa tiền..."
                  value={refundForm.reason}
                  onChange={(event) => setRefundForm((prev) => ({ ...prev, reason: event.target.value }))}
                />
                <Button variant="contained" color="warning" size="large" disabled={submitting} onClick={handleRefund} sx={{ borderRadius: 2, py: 1.5, fontWeight: 700 }}>
                  Thực hiện hoàn phí
                </Button>
              </Stack>
            </Paper>
          </Grid>
          <Grid item xs={12} md={7}>
            <FinanceTable
              title="Lịch sử hoàn phí / Điều chỉnh"
              columns={['Ngày', 'Loại nghiệp vụ', 'Số tiền', 'Đối tượng', 'Lý do']}
              rows={expenses
                .filter((expense) => ['Refund', 'Hoàn phí'].includes(expense.category))
                .map((expense) => [
                  formatDate(expense.expenseDate),
                  <Chip label={expense.category} size="small" color="warning" variant="outlined" sx={{ fontWeight: 700 }} />,
                  <Typography fontWeight={700} color="error.main">{formatCurrency(expense.amount)}</Typography>,
                  expense.vendor || '-',
                  expense.notes || '-',
                ])}
              emptyText="Chưa có dữ liệu hoàn phí"
            />
          </Grid>
        </Grid>
      )}

      {activeTab === 3 && (
        <Grid container spacing={3}>
          <Grid item xs={12} md={5}>
            <Paper sx={{ p: 3, borderRadius: 4 }}>
              <Typography variant="h6" fontWeight={800} gutterBottom sx={{ mb: 3 }}>
                Chốt công & Tính lương giáo viên
              </Typography>
              <Stack spacing={2.5}>
                <TextField
                  select
                  fullWidth
                  label="Chọn giáo viên"
                  value={payrollForm.teacherId}
                  onChange={(event) => setPayrollForm((prev) => ({ ...prev, teacherId: event.target.value }))}
                >
                  {teachers.map((teacher) => (
                    <MenuItem key={teacher.id} value={teacher.id}>
                      {teacher.name}
                    </MenuItem>
                  ))}
                </TextField>
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      type="month"
                      label="Tháng tính lương"
                      value={payrollForm.month}
                      onChange={(event) => setPayrollForm((prev) => ({ ...prev, month: event.target.value }))}
                      InputLabelProps={{ shrink: true }}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      type="number"
                      label="Tổng số buổi dạy"
                      value={payrollForm.sessions}
                      onChange={(event) => setPayrollForm((prev) => ({ ...prev, sessions: event.target.value }))}
                    />
                  </Grid>
                </Grid>
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      type="number"
                      label="Số giờ/buổi"
                      value={payrollForm.hoursPerSession}
                      onChange={(event) => setPayrollForm((prev) => ({ ...prev, hoursPerSession: event.target.value }))}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      type="number"
                      label="Đơn giá/giờ"
                      value={payrollForm.hourlyRate}
                      onChange={(event) => setPayrollForm((prev) => ({ ...prev, hourlyRate: event.target.value }))}
                    />
                  </Grid>
                </Grid>
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      type="number"
                      label="Thưởng thêm"
                      value={payrollForm.bonus}
                      onChange={(event) => setPayrollForm((prev) => ({ ...prev, bonus: event.target.value }))}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      type="number"
                      label="Khấu trừ / Phạt"
                      value={payrollForm.deduction}
                      onChange={(event) => setPayrollForm((prev) => ({ ...prev, deduction: event.target.value }))}
                    />
                  </Grid>
                </Grid>
                <Alert icon={<WorkHistory />} severity="info" sx={{ borderRadius: 2 }}>
                  Tổng lương tạm tính: <strong>{formatCurrency(payrollAmount)}</strong>
                </Alert>
                <TextField
                  fullWidth
                  label="Ghi chú chi tiết"
                  value={payrollForm.notes}
                  onChange={(event) => setPayrollForm((prev) => ({ ...prev, notes: event.target.value }))}
                />
                <Button variant="contained" size="large" disabled={submitting} onClick={handleCreatePayroll} sx={{ borderRadius: 2, py: 1.5, fontWeight: 700 }}>
                  Xác nhận chốt lương
                </Button>
              </Stack>
            </Paper>
          </Grid>
          <Grid item xs={12} md={7}>
            <FinanceTable
              title="Lịch sử lương đã chốt"
              columns={['Ngày chốt', 'Giáo viên', 'Tổng tiền', 'Người duyệt', 'Chi tiết']}
              rows={expenses
                .filter((expense) => expense.category === 'Lương giáo viên')
                .map((expense) => [
                  formatDate(expense.expenseDate),
                  <Typography fontWeight={700}>{expense.vendor}</Typography>,
                  <Typography fontWeight={800} color="primary.main">{formatCurrency(expense.amount)}</Typography>,
                  expense.approvedByName || '-',
                  expense.notes || '-',
                ])}
              emptyText="Chưa có dữ liệu lương giáo viên"
            />
          </Grid>
        </Grid>
      )}

      {activeTab === 4 && (
        <Grid container spacing={3}>
          <Grid item xs={12} md={5}>
            <Paper sx={{ p: 3, borderRadius: 4 }}>
              <Typography variant="h6" fontWeight={800} gutterBottom sx={{ mb: 3 }}>
                Ghi nhận chi phí vận hành
              </Typography>
              <Stack spacing={2.5}>
                <TextField
                  select
                  fullWidth
                  label="Danh mục chi phí"
                  value={expenseForm.category}
                  onChange={(event) => setExpenseForm((prev) => ({ ...prev, category: event.target.value }))}
                >
                  {operatingCategories.map((category) => (
                    <MenuItem key={category} value={category}>
                      {category}
                    </MenuItem>
                  ))}
                </TextField>
                <TextField
                  fullWidth
                  type="number"
                  label="Số tiền chi"
                  value={expenseForm.amount}
                  onChange={(event) => setExpenseForm((prev) => ({ ...prev, amount: event.target.value }))}
                />
                <TextField
                  fullWidth
                  type="date"
                  label="Ngày thực hiện chi"
                  value={expenseForm.expenseDate}
                  onChange={(event) => setExpenseForm((prev) => ({ ...prev, expenseDate: event.target.value }))}
                  InputLabelProps={{ shrink: true }}
                />
                <TextField
                  fullWidth
                  label="Nhà cung cấp / Đối tượng nhận"
                  value={expenseForm.vendor}
                  onChange={(event) => setExpenseForm((prev) => ({ ...prev, vendor: event.target.value }))}
                />
                <TextField
                  fullWidth
                  label="Link ảnh / file chứng từ"
                  value={expenseForm.receiptUrl}
                  onChange={(event) => setExpenseForm((prev) => ({ ...prev, receiptUrl: event.target.value }))}
                />
                <TextField
                  fullWidth
                  multiline
                  rows={2}
                  label="Ghi chú thêm"
                  value={expenseForm.notes}
                  onChange={(event) => setExpenseForm((prev) => ({ ...prev, notes: event.target.value }))}
                />
                <Button variant="contained" color="error" size="large" disabled={submitting} onClick={handleCreateExpense} sx={{ borderRadius: 2, py: 1.5, fontWeight: 700 }}>
                  Xác nhận chi tiền
                </Button>
              </Stack>
            </Paper>
          </Grid>
          <Grid item xs={12} md={7}>
            {unusualExpenses.length > 0 && (
              <Alert severity="warning" sx={{ mb: 2, borderRadius: 2 }}>
                Phát hiện <strong>{unusualExpenses.length} khoản chi cao bất thường</strong> so với trung bình hàng tháng.
              </Alert>
            )}
            <FinanceTable
              title="Danh sách các khoản chi"
              columns={['Ngày', 'Danh mục', 'Số tiền', 'Đối tượng', 'Người duyệt', 'Ghi chú']}
              rows={expenses.map((expense) => [
                formatDate(expense.expenseDate),
                <Chip label={expense.category} size="small" variant="outlined" sx={{ fontWeight: 700 }} />,
                <Typography fontWeight={700} color="error.main">{formatCurrency(expense.amount)}</Typography>,
                expense.vendor || '-',
                expense.approvedByName || '-',
                expense.notes || '-',
              ])}
              emptyText="Chưa có dữ liệu chi phí vận hành"
            />
          </Grid>
        </Grid>
      )}

      {activeTab === 5 && (
        <FinanceTable
          title="Nhật ký giao dịch tài chính (Audit Log)"
          columns={['Thời gian', 'Người thực hiện', 'Hành động', 'Đối tượng liên quan', 'Giá trị giao dịch']}
          rows={auditRows.map((row) => [
            formatDate(row.time),
            <Typography fontWeight={700}>{row.actor}</Typography>,
            row.action,
            row.object,
            <Typography fontWeight={800} color={row.action.includes('thu') ? 'success.main' : 'error.main'}>
              {formatCurrency(row.amount)}
            </Typography>,
          ])}
          emptyText="Hệ thống chưa ghi nhận nhật ký giao dịch nào"
        />
      )}

      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={() => setSnackbar((prev) => ({ ...prev, open: false }))}
      >
        <Alert severity={snackbar.severity} variant="filled" sx={{ borderRadius: 2, fontWeight: 600 }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}

function SummaryCard({ title, value, icon }: { title: string; value: string; icon: React.ReactNode }) {
  return (
    <Grid item xs={12} sm={6} md={3}>
      <Card sx={{ borderRadius: 4, boxShadow: '0 4px 20px rgba(0,0,0,0.05)', transition: 'transform 0.2s', '&:hover': { transform: 'translateY(-4px)' } }}>
        <CardContent sx={{ p: 3 }}>
          <Stack direction="row" justifyContent="space-between" alignItems="center" spacing={2}>
            <Box>
              <Typography variant="caption" color="text.secondary" fontWeight={700} sx={{ textTransform: 'uppercase' }}>
                {title}
              </Typography>
              <Typography variant="h5" fontWeight={900} sx={{ mt: 0.5 }}>
                {value}
              </Typography>
            </Box>
            <Box sx={{ p: 1.5, borderRadius: 3, bgcolor: 'rgba(0,0,0,0.02)', '& svg': { fontSize: 32 } }}>{icon}</Box>
          </Stack>
        </CardContent>
      </Card>
    </Grid>
  );
}

function FinanceTable({
  title,
  columns,
  rows,
  emptyText,
}: {
  title: string;
  columns: string[];
  rows: Array<Array<React.ReactNode>>;
  emptyText: string;
}) {
  return (
    <Paper sx={{ borderRadius: 4, overflow: 'hidden', boxShadow: '0 4px 20px rgba(0,0,0,0.05)' }}>
      <Stack direction="row" alignItems="center" spacing={1.5} sx={{ p: 3, bgcolor: 'rgba(0,0,0,0.01)' }}>
        <FactCheck color="primary" />
        <Typography variant="h6" fontWeight={800}>
          {title}
        </Typography>
      </Stack>
      <Divider />
      <TableContainer>
        <Table size="small">
          <TableHead sx={{ bgcolor: 'rgba(0,0,0,0.01)' }}>
            <TableRow>
              {columns.map((column) => (
                <TableCell key={column} sx={{ fontWeight: 800, py: 2 }}>{column}</TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {rows.length === 0 ? (
              <TableRow>
                <TableCell colSpan={columns.length} sx={{ py: 6, textAlign: 'center' }}>
                  <Typography color="text.secondary">{emptyText}</Typography>
                </TableCell>
              </TableRow>
            ) : (
              rows.map((row, index) => (
                <TableRow key={index} hover>
                  {row.map((cell, cellIndex) => (
                    <TableCell key={cellIndex} sx={{ py: 2 }}>
                      {cell}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </Paper>
  );
}
