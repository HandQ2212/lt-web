import { useEffect, useState } from 'react';
import { Box, Typography, Grid, Card, CardContent, Paper, CircularProgress, Alert } from '@mui/material';
import {
  TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon,
  AccountBalance as AccountBalanceIcon,
  Warning as WarningIcon,
} from '@mui/icons-material';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { invoiceApi, analyticsApi } from '../../../services/api';

const defaultMonthlyData = [
  { month: 'T1', revenue: 45000000, expense: 32000000 },
  { month: 'T2', revenue: 52000000, expense: 35000000 },
  { month: 'T3', revenue: 48000000, expense: 33000000 },
  { month: 'T4', revenue: 61000000, expense: 38000000 },
  { month: 'T5', revenue: 55000000, expense: 36000000 },
];

const defaultExpenseBreakdown = [
  { name: 'Lương giáo viên', value: 24000000 },
  { name: 'Thuê mặt bằng', value: 8000000 },
  { name: 'Điện nước', value: 2000000 },
  { name: 'Marketing', value: 2000000 },
];

const COLORS = ['#1976d2', '#4caf50', '#ff9800', '#f44336'];

interface FinanceData {
  currentMonthRevenue?: number;
  currentMonthExpense?: number;
  profit?: number;
  outstandingDebt?: number;
  monthlyData?: any[];
  expenseBreakdown?: any[];
}

export default function FinanceDashboard() {
  const [financeData, setFinanceData] = useState<FinanceData>({
    currentMonthRevenue: 55000000,
    currentMonthExpense: 36000000,
    profit: 19000000,
    outstandingDebt: 12500000,
    monthlyData: defaultMonthlyData,
    expenseBreakdown: defaultExpenseBreakdown,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    void fetchFinanceData();
  }, []);

  const fetchFinanceData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch invoice data for outstanding debt
      const debtResponse = await invoiceApi.getDebt();
      
      if (debtResponse) {
        setFinanceData((prev) => ({
          ...prev,
          outstandingDebt: debtResponse.data?.totalDebt || prev.outstandingDebt,
        }));
      }
    } catch (err: any) {
      console.error('Failed to fetch finance data:', err);
      setError('Không thể tải dữ liệu tài chính');
      // Keep using default data
    } finally {
      setLoading(false);
    }
  };

  if (error) {
    return (
      <Box>
        <Typography variant="h4" gutterBottom fontWeight={700}>
          Dashboard Tài chính
        </Typography>
        <Alert severity="error">{error}</Alert>
      </Box>
    );
  }

  return (
    <Box>
      <Typography variant="h4" gutterBottom fontWeight={700}>
        Dashboard Tài chính
      </Typography>

      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box>
                  <Typography variant="body2" color="text.secondary">
                    Doanh thu tháng
                  </Typography>
                  <Typography variant="h5" fontWeight={700}>
                    {loading ? '...' : (financeData.currentMonthRevenue || 55000000).toLocaleString('vi-VN')}đ
                  </Typography>
                </Box>
                <TrendingUpIcon sx={{ fontSize: 40, color: 'success.main' }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box>
                  <Typography variant="body2" color="text.secondary">
                    Chi phí tháng
                  </Typography>
                  <Typography variant="h5" fontWeight={700}>
                    {loading ? '...' : (financeData.currentMonthExpense || 36000000).toLocaleString('vi-VN')}đ
                  </Typography>
                </Box>
                <TrendingDownIcon sx={{ fontSize: 40, color: 'error.main' }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box>
                  <Typography variant="body2" color="text.secondary">
                    Lợi nhuận
                  </Typography>
                  <Typography variant="h5" fontWeight={700}>
                    {loading ? '...' : (financeData.profit || 19000000).toLocaleString('vi-VN')}đ
                  </Typography>
                </Box>
                <AccountBalanceIcon sx={{ fontSize: 40, color: 'primary.main' }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box>
                  <Typography variant="body2" color="text.secondary">
                    Công nợ
                  </Typography>
                  <Typography variant="h5" fontWeight={700}>
                    {loading ? '...' : (financeData.outstandingDebt || 12500000).toLocaleString('vi-VN')}đ
                  </Typography>
                </Box>
                <WarningIcon sx={{ fontSize: 40, color: 'warning.main' }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Grid container spacing={3}>
        <Grid item xs={12} md={8}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom fontWeight={600}>
              Doanh thu & Chi phí 5 tháng gần đây
            </Typography>
            {loading ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', height: 300 }}>
                <CircularProgress />
              </Box>
            ) : (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={financeData.monthlyData || defaultMonthlyData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="revenue" fill="#4caf50" name="Doanh thu" />
                  <Bar dataKey="expense" fill="#f44336" name="Chi phí" />
                </BarChart>
              </ResponsiveContainer>
            )}
          </Paper>
        </Grid>

        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom fontWeight={600}>
              Phân bổ chi phí
            </Typography>
            {loading ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', height: 300 }}>
                <CircularProgress />
              </Box>
            ) : (
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={financeData.expenseBreakdown || defaultExpenseBreakdown}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {(financeData.expenseBreakdown || defaultExpenseBreakdown).map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            )}
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
}
