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
    category: 'Mat bang',
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
      setError(err?.response?.data?.message || 'Khong tai duoc du lieu ke toan');
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
      .filter((item) => item.category === 'Refund' || item.category === 'Hoan phi')
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
      actor: 'System',
      action: `Tao/Cap nhat hoa don ${getStatusLabel(invoice.status)}`,
      object: `${invoice.studentName || '-'} - ${invoice.className || '-'}`,
      amount: getInvoiceAmount(invoice),
    }));
    const paymentRows = payments.map((payment) => ({
      time: payment.paymentDate || '',
      actor: 'Accountant',
      action: `Ghi nhan thu tien ${getPaymentMethodLabel(payment.paymentMethod)}`,
      object: payment.invoiceId,
      amount: Number(payment.amount || 0),
    }));
    const expenseRows = expenses.map((expense) => ({
      time: expense.expenseDate || '',
      actor: expense.approvedByName || 'Accountant',
      action: `Ghi nhan phieu chi: ${expense.category}`,
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
      showMessage('Chon hoa don va nhap so tien hop le', 'error');
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
      showMessage('Da ghi nhan phieu thu');
    } catch (err: any) {
      showMessage(err?.response?.data?.message || 'Khong ghi nhan duoc phieu thu', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleCreateExpense = async () => {
    const amount = Number(expenseForm.amount || 0);
    if (!expenseForm.category || amount <= 0) {
      showMessage('Nhap danh muc va so tien chi hop le', 'error');
      return;
    }

    try {
      setSubmitting(true);
      await expenseApi.create({ ...expenseForm, amount });
      setExpenseForm((prev) => ({ ...prev, amount: '', vendor: '', receiptUrl: '', notes: '' }));
      await fetchData();
      showMessage('Da ghi nhan phieu chi');
    } catch (err: any) {
      showMessage(err?.response?.data?.message || 'Khong ghi nhan duoc phieu chi', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleRefund = async () => {
    const amount = Number(refundForm.amount || 0);
    if (!refundForm.invoiceId || amount <= 0) {
      showMessage('Chon hoa don va nhap so tien hoan hop le', 'error');
      return;
    }

    try {
      setSubmitting(true);
      await invoiceApi.refund(refundForm.invoiceId, { amount, reason: refundForm.reason || 'Hoan phi hoc vu' });
      setRefundForm((prev) => ({ ...prev, amount: '', reason: '' }));
      await fetchData();
      showMessage('Da xu ly hoan phi');
    } catch (err: any) {
      showMessage(err?.response?.data?.message || 'Khong xu ly duoc hoan phi', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleCreatePayroll = async () => {
    if (!selectedTeacher || payrollAmount <= 0) {
      showMessage('Chon giao vien va thong tin tinh luong hop le', 'error');
      return;
    }

    try {
      setSubmitting(true);
      await expenseApi.create({
        category: 'Luong giao vien',
        amount: payrollAmount,
        expenseDate: `${payrollForm.month}-28`,
        vendor: selectedTeacher.name,
        notes:
          payrollForm.notes ||
          `Chot cong ${payrollForm.sessions} buoi, ${payrollForm.hoursPerSession} gio/buoi, don gia ${formatCurrency(
            Number(payrollForm.hourlyRate || 0)
          )}`,
      });
      await fetchData();
      showMessage('Da chot cong va ghi nhan luong giao vien');
    } catch (err: any) {
      showMessage(err?.response?.data?.message || 'Khong chot duoc luong', 'error');
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
      <Stack direction={{ xs: 'column', md: 'row' }} justifyContent="space-between" spacing={2} sx={{ mb: 3 }}>
        <Box>
          <Typography variant="h4" fontWeight={700}>
            Nghiep vu ke toan
          </Typography>
          <Typography color="text.secondary">
            Quan ly thu chi, cong no, hoc vu tai chinh, luong giao vien va audit log.
          </Typography>
        </Box>
        <Button variant="outlined" startIcon={<Search />} onClick={fetchData}>
          Tai lai
        </Button>
      </Stack>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      <Grid container spacing={2} sx={{ mb: 3 }}>
        <SummaryCard title="Da thu" value={formatCurrency(totals.revenue)} icon={<Paid color="success" />} />
        <SummaryCard title="Da chi" value={formatCurrency(totals.expense)} icon={<ReceiptLong color="error" />} />
        <SummaryCard title="Cong no" value={formatCurrency(totals.debt)} icon={<AccountBalanceWallet color="warning" />} />
        <SummaryCard title="Loi nhuan tam tinh" value={formatCurrency(totals.profit)} icon={<Savings color="primary" />} />
      </Grid>

      <Paper sx={{ mb: 3 }}>
        <Tabs value={activeTab} onChange={(_, value) => setActiveTab(value)} variant="scrollable" scrollButtons="auto">
          <Tab label="Chung tu" />
          <Tab label="Cong no hoc phi" />
          <Tab label="Tai chinh hoc vu" />
          <Tab label="Chot cong & luong" />
          <Tab label="Chi phi van hanh" />
          <Tab label="Audit log" />
        </Tabs>
      </Paper>

      {activeTab === 0 && (
        <Grid container spacing={3}>
          <Grid item xs={12} md={5}>
            <Paper sx={{ p: 3 }}>
              <Typography variant="h6" fontWeight={700} gutterBottom>
                Tao phieu thu
              </Typography>
              <Stack spacing={2}>
                <TextField
                  select
                  label="Hoa don"
                  value={paymentForm.invoiceId}
                  onChange={(event) => setPaymentForm((prev) => ({ ...prev, invoiceId: event.target.value }))}
                >
                  {debtInvoices.map((invoice) => (
                    <MenuItem key={invoice.id} value={invoice.id}>
                      {invoice.studentName} - {invoice.className} - con {formatCurrency(getOutstandingAmount(invoice))}
                    </MenuItem>
                  ))}
                </TextField>
                {selectedInvoice && (
                  <Alert severity="info">
                    Phai thu {formatCurrency(getInvoiceAmount(selectedInvoice))}, da thu{' '}
                    {formatCurrency(Number(selectedInvoice.paidAmount || 0))}, con{' '}
                    {formatCurrency(getOutstandingAmount(selectedInvoice))}
                  </Alert>
                )}
                <Grid container spacing={2}>
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      type="number"
                      label="So tien"
                      value={paymentForm.amount}
                      onChange={(event) => setPaymentForm((prev) => ({ ...prev, amount: event.target.value }))}
                    />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <TextField
                      select
                      fullWidth
                      label="Phuong thuc"
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
                  label="Ngay thu"
                  value={paymentForm.paymentDate}
                  onChange={(event) => setPaymentForm((prev) => ({ ...prev, paymentDate: event.target.value }))}
                  InputLabelProps={{ shrink: true }}
                />
                <TextField
                  label="Ma doi soat/chuyen khoan"
                  value={paymentForm.transactionId}
                  onChange={(event) => setPaymentForm((prev) => ({ ...prev, transactionId: event.target.value }))}
                />
                <TextField
                  label="Ghi chu"
                  value={paymentForm.notes}
                  onChange={(event) => setPaymentForm((prev) => ({ ...prev, notes: event.target.value }))}
                />
                <Button variant="contained" startIcon={<AssignmentTurnedIn />} disabled={submitting} onClick={handleCreatePayment}>
                  Ghi nhan phieu thu
                </Button>
              </Stack>
            </Paper>
          </Grid>
          <Grid item xs={12} md={7}>
            <FinanceTable
              title="Phieu thu gan day"
              columns={['Ngay', 'Hoa don', 'Phuong thuc', 'So tien', 'Ghi chu']}
              rows={payments.slice(0, 8).map((payment) => [
                formatDate(payment.paymentDate),
                payment.invoiceId,
                getPaymentMethodLabel(payment.paymentMethod),
                formatCurrency(payment.amount),
                payment.notes || '-',
              ])}
              emptyText="Chua co phieu thu"
            />
          </Grid>
        </Grid>
      )}

      {activeTab === 1 && (
        <FinanceTable
          title="Cong no chi tiet theo hoa don"
          columns={['Hoc vien', 'Lop', 'Han thanh toan', 'Trang thai', 'Phai thu', 'Da thu', 'Con no']}
          rows={debtInvoices.map((invoice) => [
            invoice.studentName || '-',
            invoice.className || '-',
            formatDate(invoice.dueDate),
            getStatusLabel(invoice.status),
            formatCurrency(getInvoiceAmount(invoice)),
            formatCurrency(invoice.paidAmount),
            formatCurrency(getOutstandingAmount(invoice)),
          ])}
          emptyText="Khong co cong no"
        />
      )}

      {activeTab === 2 && (
        <Grid container spacing={3}>
          <Grid item xs={12} md={5}>
            <Paper sx={{ p: 3 }}>
              <Typography variant="h6" fontWeight={700} gutterBottom>
                Hoan phi / bao luu / chuyen khoa
              </Typography>
              <Stack spacing={2}>
                <TextField
                  select
                  label="Hoa don"
                  value={refundForm.invoiceId}
                  onChange={(event) => setRefundForm((prev) => ({ ...prev, invoiceId: event.target.value }))}
                >
                  {invoices.map((invoice) => (
                    <MenuItem key={invoice.id} value={invoice.id}>
                      {invoice.studentName} - {invoice.className} - {getStatusLabel(invoice.status)}
                    </MenuItem>
                  ))}
                </TextField>
                {refundableInvoice && (
                  <Alert severity="warning">
                    Da thu {formatCurrency(refundableInvoice.paidAmount)} tren tong {formatCurrency(getInvoiceAmount(refundableInvoice))}.
                    He thong se ghi nhan khoan hoan phi vao chi phi.
                  </Alert>
                )}
                <TextField
                  type="number"
                  label="So tien hoan/chenh lech"
                  value={refundForm.amount}
                  onChange={(event) => setRefundForm((prev) => ({ ...prev, amount: event.target.value }))}
                />
                <TextField
                  multiline
                  minRows={3}
                  label="Ly do"
                  placeholder="Hoan phi, phi bao luu, hoac chenh lech khi chuyen khoa"
                  value={refundForm.reason}
                  onChange={(event) => setRefundForm((prev) => ({ ...prev, reason: event.target.value }))}
                />
                <Button variant="contained" color="warning" disabled={submitting} onClick={handleRefund}>
                  Xu ly tai chinh hoc vu
                </Button>
              </Stack>
            </Paper>
          </Grid>
          <Grid item xs={12} md={7}>
            <FinanceTable
              title="Lich su hoan phi / dieu chinh"
              columns={['Ngay', 'Loai', 'So tien', 'Doi tuong', 'Ghi chu']}
              rows={expenses
                .filter((expense) => ['Refund', 'Hoan phi'].includes(expense.category))
                .map((expense) => [
                  formatDate(expense.expenseDate),
                  expense.category,
                  formatCurrency(expense.amount),
                  expense.vendor || '-',
                  expense.notes || '-',
                ])}
              emptyText="Chua co xu ly tai chinh hoc vu"
            />
          </Grid>
        </Grid>
      )}

      {activeTab === 3 && (
        <Grid container spacing={3}>
          <Grid item xs={12} md={5}>
            <Paper sx={{ p: 3 }}>
              <Typography variant="h6" fontWeight={700} gutterBottom>
                Chot cong va tinh luong
              </Typography>
              <Stack spacing={2}>
                <TextField
                  select
                  label="Giao vien"
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
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      type="month"
                      label="Thang"
                      value={payrollForm.month}
                      onChange={(event) => setPayrollForm((prev) => ({ ...prev, month: event.target.value }))}
                      InputLabelProps={{ shrink: true }}
                    />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      type="number"
                      label="So buoi"
                      value={payrollForm.sessions}
                      onChange={(event) => setPayrollForm((prev) => ({ ...prev, sessions: event.target.value }))}
                    />
                  </Grid>
                </Grid>
                <Grid container spacing={2}>
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      type="number"
                      label="Gio/buoi"
                      value={payrollForm.hoursPerSession}
                      onChange={(event) => setPayrollForm((prev) => ({ ...prev, hoursPerSession: event.target.value }))}
                    />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      type="number"
                      label="Don gia/gio"
                      value={payrollForm.hourlyRate}
                      onChange={(event) => setPayrollForm((prev) => ({ ...prev, hourlyRate: event.target.value }))}
                    />
                  </Grid>
                </Grid>
                <Grid container spacing={2}>
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      type="number"
                      label="Thuong"
                      value={payrollForm.bonus}
                      onChange={(event) => setPayrollForm((prev) => ({ ...prev, bonus: event.target.value }))}
                    />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      type="number"
                      label="Khau tru"
                      value={payrollForm.deduction}
                      onChange={(event) => setPayrollForm((prev) => ({ ...prev, deduction: event.target.value }))}
                    />
                  </Grid>
                </Grid>
                <Alert icon={<WorkHistory />} severity="info">
                  Luong tam tinh: {formatCurrency(payrollAmount)}
                </Alert>
                <TextField
                  label="Ghi chu"
                  value={payrollForm.notes}
                  onChange={(event) => setPayrollForm((prev) => ({ ...prev, notes: event.target.value }))}
                />
                <Button variant="contained" disabled={submitting} onClick={handleCreatePayroll}>
                  Chot cong va ghi phieu chi luong
                </Button>
              </Stack>
            </Paper>
          </Grid>
          <Grid item xs={12} md={7}>
            <FinanceTable
              title="Lich su luong giao vien"
              columns={['Ngay', 'Giao vien', 'So tien', 'Nguoi duyet', 'Ghi chu']}
              rows={expenses
                .filter((expense) => expense.category === 'Luong giao vien')
                .map((expense) => [
                  formatDate(expense.expenseDate),
                  expense.vendor || '-',
                  formatCurrency(expense.amount),
                  expense.approvedByName || '-',
                  expense.notes || '-',
                ])}
              emptyText="Chua co phieu luong"
            />
          </Grid>
        </Grid>
      )}

      {activeTab === 4 && (
        <Grid container spacing={3}>
          <Grid item xs={12} md={5}>
            <Paper sx={{ p: 3 }}>
              <Typography variant="h6" fontWeight={700} gutterBottom>
                Ghi nhan chi phi van hanh
              </Typography>
              <Stack spacing={2}>
                <TextField
                  select
                  label="Danh muc"
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
                  type="number"
                  label="So tien"
                  value={expenseForm.amount}
                  onChange={(event) => setExpenseForm((prev) => ({ ...prev, amount: event.target.value }))}
                />
                <TextField
                  type="date"
                  label="Ngay chi"
                  value={expenseForm.expenseDate}
                  onChange={(event) => setExpenseForm((prev) => ({ ...prev, expenseDate: event.target.value }))}
                  InputLabelProps={{ shrink: true }}
                />
                <TextField
                  label="Nha cung cap/doi tuong"
                  value={expenseForm.vendor}
                  onChange={(event) => setExpenseForm((prev) => ({ ...prev, vendor: event.target.value }))}
                />
                <TextField
                  label="Link chung tu"
                  value={expenseForm.receiptUrl}
                  onChange={(event) => setExpenseForm((prev) => ({ ...prev, receiptUrl: event.target.value }))}
                />
                <TextField
                  multiline
                  minRows={2}
                  label="Ghi chu"
                  value={expenseForm.notes}
                  onChange={(event) => setExpenseForm((prev) => ({ ...prev, notes: event.target.value }))}
                />
                <Button variant="contained" color="error" disabled={submitting} onClick={handleCreateExpense}>
                  Ghi nhan phieu chi
                </Button>
              </Stack>
            </Paper>
          </Grid>
          <Grid item xs={12} md={7}>
            {unusualExpenses.length > 0 && (
              <Alert severity="warning" sx={{ mb: 2 }}>
                Co {unusualExpenses.length} khoan chi cao bat thuong so voi trung binh hien tai.
              </Alert>
            )}
            <FinanceTable
              title="Chi phi van hanh"
              columns={['Ngay', 'Danh muc', 'So tien', 'Doi tuong', 'Nguoi duyet', 'Ghi chu']}
              rows={expenses.map((expense) => [
                formatDate(expense.expenseDate),
                expense.category,
                formatCurrency(expense.amount),
                expense.vendor || '-',
                expense.approvedByName || '-',
                expense.notes || '-',
              ])}
              emptyText="Chua co chi phi"
            />
          </Grid>
        </Grid>
      )}

      {activeTab === 5 && (
        <FinanceTable
          title="Audit log tai chinh"
          columns={['Thoi gian', 'Nguoi thuc hien', 'Hanh dong', 'Doi tuong', 'Gia tri']}
          rows={auditRows.map((row) => [
            formatDate(row.time),
            row.actor,
            row.action,
            row.object,
            formatCurrency(row.amount),
          ])}
          emptyText="Chua co log tai chinh"
        />
      )}

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

function SummaryCard({ title, value, icon }: { title: string; value: string; icon: React.ReactNode }) {
  return (
    <Grid item xs={12} sm={6} md={3}>
      <Card>
        <CardContent>
          <Stack direction="row" justifyContent="space-between" alignItems="center" spacing={2}>
            <Box>
              <Typography variant="body2" color="text.secondary">
                {title}
              </Typography>
              <Typography variant="h5" fontWeight={700}>
                {value}
              </Typography>
            </Box>
            <Box sx={{ '& svg': { fontSize: 38 } }}>{icon}</Box>
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
    <Paper>
      <Stack direction="row" alignItems="center" spacing={1.5} sx={{ p: 2 }}>
        <FactCheck color="primary" />
        <Typography variant="h6" fontWeight={700}>
          {title}
        </Typography>
      </Stack>
      <Divider />
      <TableContainer>
        <Table size="small">
          <TableHead>
            <TableRow>
              {columns.map((column) => (
                <TableCell key={column}>{column}</TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {rows.map((row, index) => (
              <TableRow key={index}>
                {row.map((cell, cellIndex) => (
                  <TableCell key={cellIndex}>
                    {typeof cell === 'string' && ['Da thanh toan', 'Thanh toan mot phan', 'Cho thanh toan', 'Chua thanh toan'].includes(cell) ? (
                      <Chip size="small" label={cell} />
                    ) : (
                      cell
                    )}
                  </TableCell>
                ))}
              </TableRow>
            ))}
            {rows.length === 0 && (
              <TableRow>
                <TableCell colSpan={columns.length} align="center">
                  {emptyText}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </Paper>
  );
}
