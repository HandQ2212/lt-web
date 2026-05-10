import { useEffect, useMemo, useState } from 'react';
import { 
  Alert, 
  Box, 
  Card, 
  CardContent, 
  CircularProgress, 
  Grid, 
  Paper, 
  Stack, 
  Typography, 
  useTheme,
  Divider,
  Avatar
} from '@mui/material';
import {
  AccountBalance as AccountBalanceIcon,
  ReceiptLong as ReceiptLongIcon,
  TrendingDown as TrendingDownIcon,
  TrendingUp as TrendingUpIcon,
  WarningAmber as WarningIcon,
  PieChart as PieChartIcon,
  BarChart as BarChartIcon,
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

const CHART_COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d'];

export default function FinanceDashboard() {
  const theme = useTheme();
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
      setError(err?.response?.data?.message || 'Không thể tải dữ liệu dashboard tài chính');
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

    return Array.from(rows.values())
      .sort((a, b) => a.month.localeCompare(b.month))
      .slice(-6);
  }, [payments, expenses]);

  const expenseBreakdown = useMemo(() => {
    const rows = new Map<string, number>();
    expenses.forEach((expense) => {
      const category = expense.category || 'Khác';
      rows.set(category, (rows.get(category) || 0) + Number(expense.amount || 0));
    });
    return Array.from(rows.entries()).map(([name, value]) => ({ name, value }));
  }, [expenses]);

  const unusualExpenses = useMemo(() => {
    const average = expenses.length ? expenses.reduce((sum, expense) => sum + Number(expense.amount || 0), 0) / expenses.length : 0;
    return expenses.filter((expense) => average > 0 && Number(expense.amount || 0) >= average * 1.5);
  }, [expenses]);

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ pb: 6 }}>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" fontWeight={800} color="primary.main" gutterBottom>
          Báo cáo Tài chính
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Tổng quan tình hình thu chi, doanh thu và công nợ của hệ thống.
        </Typography>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3, borderRadius: 3 }}>
          {error}
        </Alert>
      )}

      {unusualExpenses.length > 0 && (
        <Alert severity="warning" icon={<WarningIcon />} sx={{ mb: 3, borderRadius: 3 }}>
          Có {unusualExpenses.length} khoản chi phí cao bất thường cần được đối soát lại.
        </Alert>
      )}

      <Grid container spacing={3} sx={{ mb: 4 }}>
        <SummaryCard 
          title="Doanh thu tháng này" 
          value={formatCurrency(summary.monthRevenue)} 
          icon={<TrendingUpIcon sx={{ color: 'success.main' }} />} 
          color="#e8f5e9"
        />
        <SummaryCard 
          title="Chi phí tháng này" 
          value={formatCurrency(summary.monthExpense)} 
          icon={<TrendingDownIcon sx={{ color: 'error.main' }} />} 
          color="#ffebee"
        />
        <SummaryCard 
          title="Lợi nhuận ròng" 
          value={formatCurrency(summary.profit)} 
          icon={<AccountBalanceIcon sx={{ color: 'primary.main' }} />} 
          color="#e3f2fd"
        />
        <SummaryCard 
          title="Công nợ học phí" 
          value={formatCurrency(summary.outstandingDebt)} 
          icon={<ReceiptLongIcon sx={{ color: 'warning.main' }} />} 
          color="#fff8e1"
        />
      </Grid>

      <Grid container spacing={3}>
        <Grid item xs={12} lg={8}>
          <Paper sx={{ p: 4, borderRadius: 4, boxShadow: '0 8px 32px rgba(0,0,0,0.04)', height: '100%' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
              <Avatar sx={{ bgcolor: 'primary.light', mr: 2 }}>
                <BarChartIcon sx={{ color: 'primary.main' }} />
              </Avatar>
              <Typography variant="h6" fontWeight={800}>
                Biểu đồ Thu chi hàng tháng
              </Typography>
            </Box>
            <Divider sx={{ mb: 4 }} />
            <Box sx={{ width: '100%', height: 350 }}>
              <ResponsiveContainer>
                <BarChart data={monthlyData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                  <XAxis 
                    dataKey="month" 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fontSize: 12, fontWeight: 600 }}
                  />
                  <YAxis 
                    axisLine={false} 
                    tickLine={false} 
                    tickFormatter={(value) => `${Number(value) / 1000000}tr`}
                    tick={{ fontSize: 12, fontWeight: 600 }}
                  />
                  <Tooltip 
                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.1)' }}
                    formatter={(value: number) => [formatCurrency(value), ""]}
                  />
                  <Legend verticalAlign="top" align="right" height={36} iconType="circle" />
                  <Bar 
                    dataKey="revenue" 
                    fill={theme.palette.success.main} 
                    name="Doanh thu" 
                    radius={[4, 4, 0, 0]} 
                    barSize={30}
                  />
                  <Bar 
                    dataKey="expense" 
                    fill={theme.palette.error.main} 
                    name="Chi phí" 
                    radius={[4, 4, 0, 0]} 
                    barSize={30}
                  />
                </BarChart>
              </ResponsiveContainer>
            </Box>
          </Paper>
        </Grid>

        <Grid item xs={12} lg={4}>
          <Paper sx={{ p: 4, borderRadius: 4, boxShadow: '0 8px 32px rgba(0,0,0,0.04)', height: '100%' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
              <Avatar sx={{ bgcolor: 'warning.light', mr: 2 }}>
                <PieChartIcon sx={{ color: 'warning.main' }} />
              </Avatar>
              <Typography variant="h6" fontWeight={800}>
                Cơ cấu Chi phí
              </Typography>
            </Box>
            <Divider sx={{ mb: 4 }} />
            <Box sx={{ width: '100%', height: 350, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <ResponsiveContainer width="100%" height="70%">
                <PieChart>
                  <Pie 
                    data={expenseBreakdown} 
                    dataKey="value" 
                    nameKey="name" 
                    cx="50%" 
                    cy="50%" 
                    innerRadius={60}
                    outerRadius={80} 
                    paddingAngle={5}
                    stroke="none"
                  >
                    {expenseBreakdown.map((entry, index) => (
                      <Cell key={entry.name} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.1)' }}
                    formatter={(value: number) => formatCurrency(value)}
                  />
                </PieChart>
              </ResponsiveContainer>
              <Box sx={{ width: '100%', mt: 2 }}>
                <Grid container spacing={1}>
                  {expenseBreakdown.map((entry, index) => (
                    <Grid item xs={6} key={entry.name}>
                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 0.5 }}>
                        <Box sx={{ width: 12, height: 12, borderRadius: '50%', bgcolor: CHART_COLORS[index % CHART_COLORS.length], mr: 1 }} />
                        <Typography variant="caption" fontWeight={600} noWrap>{entry.name}</Typography>
                      </Box>
                    </Grid>
                  ))}
                </Grid>
              </Box>
            </Box>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
}

function SummaryCard({ title, value, icon, color }: { title: string; value: string; icon: React.ReactNode; color: string }) {
  return (
    <Grid item xs={12} sm={6} md={3}>
      <Card sx={{ borderRadius: 4, boxShadow: '0 4px 20px rgba(0,0,0,0.03)', border: '1px solid rgba(0,0,0,0.05)' }}>
        <CardContent sx={{ p: 3 }}>
          <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
            <Box>
              <Typography variant="body2" color="text.secondary" fontWeight={600} gutterBottom>
                {title}
              </Typography>
              <Typography variant="h5" fontWeight={800} color="text.primary">
                {value}
              </Typography>
            </Box>
            <Avatar sx={{ bgcolor: color, borderRadius: 3, width: 48, height: 48 }}>
              {icon}
            </Avatar>
          </Stack>
        </CardContent>
      </Card>
    </Grid>
  );
}
