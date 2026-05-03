import { Box, Typography, Grid, Card, CardContent, Paper } from '@mui/material';
import {
  TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon,
  AccountBalance as AccountBalanceIcon,
  Warning as WarningIcon,
} from '@mui/icons-material';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

const monthlyData = [
  { month: 'T1', revenue: 45000000, expense: 32000000 },
  { month: 'T2', revenue: 52000000, expense: 35000000 },
  { month: 'T3', revenue: 48000000, expense: 33000000 },
  { month: 'T4', revenue: 61000000, expense: 38000000 },
  { month: 'T5', revenue: 55000000, expense: 36000000 },
];

const expenseBreakdown = [
  { name: 'Lương giáo viên', value: 24000000 },
  { name: 'Thuê mặt bằng', value: 8000000 },
  { name: 'Điện nước', value: 2000000 },
  { name: 'Marketing', value: 2000000 },
];

const COLORS = ['#1976d2', '#4caf50', '#ff9800', '#f44336'];

export default function FinanceDashboard() {
  const currentMonthRevenue = 55000000;
  const currentMonthExpense = 36000000;
  const profit = currentMonthRevenue - currentMonthExpense;
  const outstandingDebt = 12500000;

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
                    {currentMonthRevenue.toLocaleString('vi-VN')}đ
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
                    {currentMonthExpense.toLocaleString('vi-VN')}đ
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
                    {profit.toLocaleString('vi-VN')}đ
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
                    {outstandingDebt.toLocaleString('vi-VN')}đ
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
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={monthlyData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="revenue" fill="#4caf50" name="Doanh thu" />
                <Bar dataKey="expense" fill="#f44336" name="Chi phí" />
              </BarChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>

        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom fontWeight={600}>
              Phân bổ chi phí
            </Typography>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={expenseBreakdown}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {expenseBreakdown.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
}
