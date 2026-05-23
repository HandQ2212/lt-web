import { useEffect, useMemo, useState } from 'react';
import { 
  Alert, 
  Box, 
  Card, 
  CardContent, 
  CircularProgress, 
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
    <Box sx={{ pb: 6, maxWidth: 1240, mx: 'auto', px: { xs: 1, sm: 2, xl: 0 } }}>
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
        <Alert
          severity="warning"
          icon={<WarningIcon />}
          sx={{
            mb: 3,
            borderRadius: 4,
            border: '2px solid #1E293B',
            boxShadow: '5px 5px 0 #1E293B',
            bgcolor: '#FFF7DF',
            alignItems: 'center',
            '& .MuiAlert-message': { fontWeight: 800 },
          }}
        >
          Có {unusualExpenses.length} khoản chi phí cao bất thường cần được đối soát lại.
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
          gap: { xs: 2, md: 2.5 },
          mb: 4,
        }}
      >
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
      </Box>

      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: {
            xs: '1fr',
            lg: 'minmax(0, 1.35fr) minmax(360px, 0.85fr)',
          },
          gap: { xs: 3, lg: 3.5 },
          alignItems: 'stretch',
        }}
      >
        <Paper
          sx={{
            p: { xs: 2.5, md: 3.5 },
            borderRadius: 4,
            border: '2px solid #1E293B',
            boxShadow: '6px 6px 0 #1E293B',
            height: '100%',
            minHeight: { xs: 420, md: 500 },
            overflow: 'hidden',
            bgcolor: '#FFFFFF',
          }}
        >
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
              <Avatar sx={{ bgcolor: '#EDE9FE', mr: 2, border: '2px solid #1E293B' }}>
                <BarChartIcon sx={{ color: 'primary.main' }} />
              </Avatar>
              <Typography variant="h6" fontWeight={800}>
                Biểu đồ Thu chi hàng tháng
              </Typography>
            </Box>
            <Divider sx={{ mb: 4 }} />
            <Box sx={{ width: '100%', height: { xs: 320, md: 380 } }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={monthlyData} margin={{ top: 12, right: 18, left: 4, bottom: 8 }}>
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

        <Paper
          sx={{
            p: { xs: 2.5, md: 3.5 },
            borderRadius: 4,
            border: '2px solid #1E293B',
            boxShadow: '6px 6px 0 #1E293B',
            height: '100%',
            minHeight: { xs: 420, md: 500 },
            overflow: 'hidden',
            bgcolor: '#FFFFFF',
          }}
        >
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
              <Avatar sx={{ bgcolor: '#FEF3C7', mr: 2, border: '2px solid #1E293B' }}>
                <PieChartIcon sx={{ color: 'warning.main' }} />
              </Avatar>
              <Typography variant="h6" fontWeight={800}>
                Cơ cấu Chi phí
              </Typography>
            </Box>
            <Divider sx={{ mb: 4 }} />
            <Box sx={{ width: '100%', minHeight: { xs: 320, md: 380 }, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              {expenseBreakdown.length === 0 ? (
                <Box sx={{ flex: 1, display: 'grid', placeItems: 'center', textAlign: 'center', color: 'text.secondary', fontWeight: 700 }}>
                  Chưa có dữ liệu chi phí
                </Box>
              ) : (
                <>
                  <Box sx={{ width: '100%', height: { xs: 220, md: 260 } }}>
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={expenseBreakdown}
                          dataKey="value"
                          nameKey="name"
                          cx="50%"
                          cy="50%"
                          innerRadius="48%"
                          outerRadius="72%"
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
                  </Box>
                  <Box
                    sx={{
                      width: '100%',
                      mt: 2,
                      display: 'grid',
                      gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, minmax(0, 1fr))', lg: '1fr' },
                      gap: 1,
                    }}
                  >
                  {expenseBreakdown.map((entry, index) => (
                    <Box key={entry.name} sx={{ display: 'flex', alignItems: 'center', minWidth: 0 }}>
                        <Box sx={{ width: 12, height: 12, borderRadius: '50%', bgcolor: CHART_COLORS[index % CHART_COLORS.length], mr: 1 }} />
                        <Typography variant="caption" fontWeight={600} noWrap>{entry.name}</Typography>
                      </Box>
                  ))}
                  </Box>
                </>
              )}
            </Box>
        </Paper>
      </Box>
    </Box>
  );
}

function SummaryCard({ title, value, icon, color }: { title: string; value: string; icon: React.ReactNode; color: string }) {
  return (
    <Card
      sx={{
        borderRadius: 4,
        border: '2px solid #1E293B',
        boxShadow: '5px 5px 0 #1E293B',
        minHeight: 126,
        background: `linear-gradient(135deg, #FFFFFF 0%, ${color} 100%)`,
      }}
    >
      <CardContent sx={{ p: 2.75, height: '100%' }}>
        <Stack
          direction="row"
          justifyContent="space-between"
          alignItems="flex-start"
          spacing={1.5}
          sx={{ height: '100%', minWidth: 0 }}
        >
          <Box sx={{ minWidth: 0, flex: '1 1 auto', pr: 1 }}>
            <Typography variant="body2" color="text.secondary" fontWeight={800} gutterBottom>
              {title}
            </Typography>
            <Typography
              variant="h5"
              fontWeight={800}
              color="text.primary"
              sx={{
                fontSize: { xs: '1.45rem', sm: '1.55rem', lg: '1.45rem', xl: '1.65rem' },
                lineHeight: 1.15,
                overflowWrap: 'anywhere',
                wordBreak: 'break-word',
              }}
            >
              {value}
            </Typography>
          </Box>
          <Avatar
            sx={{
              bgcolor: '#FFFFFF',
              border: '2px solid #1E293B',
              width: { xs: 52, lg: 48, xl: 56 },
              height: { xs: 52, lg: 48, xl: 56 },
              flex: '0 0 auto',
              '& svg': { fontSize: { xs: 26, lg: 24, xl: 28 } },
            }}
          >
            {icon}
          </Avatar>
        </Stack>
      </CardContent>
    </Card>
  );
}
