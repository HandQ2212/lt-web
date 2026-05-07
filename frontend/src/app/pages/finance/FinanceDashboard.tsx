import { useEffect, useMemo, useState } from 'react';
import { Alert, Box, Card, CardContent, CircularProgress, Grid, Paper, Stack, Typography } from '@mui/material';
import {
  AccountBalance,
  ReceiptLong,
  TrendingDown,
  TrendingUp,
  WarningAmber,
} from '@mui/icons-material';
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { expenseApi, invoiceApi, paymentApi } from '../../../services/api';
import {
  debtStatuses,
  ExpenseRecord,
  formatCurrency,
  getMonthKey,
  getOutstandingAmount,
  InvoiceRecord,
  isCurrentMonth,
  PaymentRecord,
} from './financeUtils';

const colors = ['#1976d2', '#2e7d32', '#ed6c02', '#d32f2f', '#6d4c41', '#7b1fa2'];

export default function FinanceDashboard() {
  const [invoices, setInvoices] = useState<InvoiceRecord[]>([]);
  const [expenses, setExpenses] = useState<ExpenseRecord[]>([]);
  const [payments, setPayments] = useState<PaymentRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    void fetchFinanceData();
  }, []);

  const fetchFinanceData = async () => {
    try {
      setLoading(true);
      setError(null);
      const [invoiceResponse, expenseResponse, paymentResponse] = await Promise.all([
        invoiceApi.getAll(),
        expenseApi.getAll(),
        paymentApi.getAll(),
      ]);
      setInvoices(Array.isArray(invoiceResponse.data) ? invoiceResponse.data : []);
      setExpenses(Array.isArray(expenseResponse.data) ? expenseResponse.data : []);
      setPayments(Array.isArray(paymentResponse.data) ? paymentResponse.data : []);
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Khong tai duoc dashboard tai chinh');
    } finally {
      setLoading(false);
    }
  };

  const summary = useMemo(() => {
    const monthRevenue = payments
      .filter((payment) => isCurrentMonth(payment.paymentDate))
      .reduce((sum, payment) => sum + Number(payment.amount || 0), 0);
    const monthExpense = expenses
      .filter((expense) => isCurrentMonth(expense.expenseDate))
      .reduce((sum, expense) => sum + Number(expense.amount || 0), 0);
    const outstandingDebt = invoices
      .filter((invoice) => debtStatuses.has(invoice.status || 'UNPAID'))
      .reduce((sum, invoice) => sum + getOutstandingAmount(invoice), 0);

    return {
      monthRevenue,
      monthExpense,
      profit: monthRevenue - monthExpense,
      outstandingDebt,
    };
  }, [payments, expenses, invoices]);

  const monthlyData = useMemo(() => {
    const rows = new Map<string, { month: string; revenue: number; expense: number }>();

    payments.forEach((payment) => {
      const month = getMonthKey(payment.paymentDate);
      const row = rows.get(month) || { month, revenue: 0, expense: 0 };
      row.revenue += Number(payment.amount || 0);
      rows.set(month, row);
    });

    expenses.forEach((expense) => {
      const month = getMonthKey(expense.expenseDate);
      const row = rows.get(month) || { month, revenue: 0, expense: 0 };
      row.expense += Number(expense.amount || 0);
      rows.set(month, row);
    });

    return Array.from(rows.values()).sort((a, b) => a.month.localeCompare(b.month)).slice(-6);
  }, [payments, expenses]);

  const expenseBreakdown = useMemo(() => {
    const rows = new Map<string, number>();
    expenses.forEach((expense) => {
      rows.set(expense.category, (rows.get(expense.category) || 0) + Number(expense.amount || 0));
    });
    return Array.from(rows.entries()).map(([name, value]) => ({ name, value }));
  }, [expenses]);

  const unusualExpenses = useMemo(() => {
    const average = expenses.length ? expenses.reduce((sum, expense) => sum + Number(expense.amount || 0), 0) / expenses.length : 0;
    return expenses.filter((expense) => average > 0 && Number(expense.amount || 0) >= average * 1.5);
  }, [expenses]);

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
        Dashboard tai chinh
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {unusualExpenses.length > 0 && (
        <Alert severity="warning" icon={<WarningAmber />} sx={{ mb: 3 }}>
          Co {unusualExpenses.length} khoan chi cao bat thuong can doi soat.
        </Alert>
      )}

      <Grid container spacing={3} sx={{ mb: 4 }}>
        <SummaryCard title="Doanh thu thang" value={formatCurrency(summary.monthRevenue)} icon={<TrendingUp color="success" />} />
        <SummaryCard title="Chi phi thang" value={formatCurrency(summary.monthExpense)} icon={<TrendingDown color="error" />} />
        <SummaryCard title="Loi nhuan" value={formatCurrency(summary.profit)} icon={<AccountBalance color="primary" />} />
        <SummaryCard title="Cong no hoc phi" value={formatCurrency(summary.outstandingDebt)} icon={<ReceiptLong color="warning" />} />
      </Grid>

      <Grid container spacing={3}>
        <Grid item xs={12} md={8}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom fontWeight={700}>
              Thu chi theo thang
            </Typography>
            <ResponsiveContainer width="100%" height={320}>
              <BarChart data={monthlyData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis tickFormatter={(value) => `${Number(value) / 1000000}tr`} />
                <Tooltip formatter={(value) => formatCurrency(Number(value))} />
                <Legend />
                <Bar dataKey="revenue" fill="#2e7d32" name="Doanh thu" />
                <Bar dataKey="expense" fill="#d32f2f" name="Chi phi" />
              </BarChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>

        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom fontWeight={700}>
              Co cau chi phi
            </Typography>
            <ResponsiveContainer width="100%" height={320}>
              <PieChart>
                <Pie data={expenseBreakdown} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={90} label>
                  {expenseBreakdown.map((entry, index) => (
                    <Cell key={entry.name} fill={colors[index % colors.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => formatCurrency(Number(value))} />
              </PieChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
}

function SummaryCard({ title, value, icon }: { title: string; value: string; icon: React.ReactNode }) {
  return (
    <Grid item xs={12} md={3}>
      <Card>
        <CardContent>
          <Stack direction="row" justifyContent="space-between" alignItems="center">
            <Box>
              <Typography variant="body2" color="text.secondary">
                {title}
              </Typography>
              <Typography variant="h5" fontWeight={700}>
                {value}
              </Typography>
            </Box>
            <Box sx={{ '& svg': { fontSize: 40 } }}>{icon}</Box>
          </Stack>
        </CardContent>
      </Card>
    </Grid>
  );
}
