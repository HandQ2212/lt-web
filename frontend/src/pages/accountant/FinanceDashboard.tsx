import { Box, Card, CardContent, Grid, Typography, Paper } from '@mui/material';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';
import AccountBalanceIcon from '@mui/icons-material/AccountBalance';
import PaymentIcon from '@mui/icons-material/Payment';
import ReceiptIcon from '@mui/icons-material/Receipt';

const cashFlowData = [
  { name: 'Jan', income: 4000, expense: 2400 },
  { name: 'Feb', income: 3000, expense: 1398 },
  { name: 'Mar', income: 2000, expense: 9800 },
  { name: 'Apr', income: 2780, expense: 3908 },
  { name: 'May', income: 1890, expense: 4800 },
  { name: 'Jun', income: 2390, expense: 3800 },
];

const StatCard = ({ title, value, icon, color }: { title: string, value: string, icon: any, color: string }) => (
  <Card sx={{ height: '100%' }}>
    <CardContent>
      <Box display="flex" justifyContent="space-between" alignItems="center">
        <Box>
          <Typography color="textSecondary" gutterBottom variant="overline">
            {title}
          </Typography>
          <Typography color="textPrimary" variant="h4">
            {value}
          </Typography>
        </Box>
        <Box sx={{ backgroundColor: `${color}15`, p: 1, borderRadius: '50%', color: color, display: 'flex' }}>
          {icon}
        </Box>
      </Box>
    </CardContent>
  </Card>
);

const FinanceDashboard = () => {
  return (
    <Box>
      <Typography variant="h4" sx={{ fontWeight: "bold" }} gutterBottom>
        Finance Dashboard
      </Typography>

      <Grid container spacing={3} mb={4}>
        <Grid size={{xs: 12, sm: 4}}>
          <StatCard title="Total Revenue" value="1.2B VND" icon={<AccountBalanceIcon />} color="#4caf50" />
        </Grid>
        <Grid size={{xs: 12, sm: 4}}>
          <StatCard title="Pending Invoices" value="45" icon={<ReceiptIcon />} color="#ff9800" />
        </Grid>
        <Grid size={{xs: 12, sm: 4}}>
          <StatCard title="Monthly Expenses" value="320M VND" icon={<PaymentIcon />} color="#f44336" />
        </Grid>
      </Grid>

      <Grid container spacing={3}>
        <Grid size={{xs: 12}}>
          <Paper sx={{ p: 3, height: 400 }}>
            <Typography variant="h6" gutterBottom sx={{ fontWeight: "bold" }}>Cash Flow (Income vs Expense)</Typography>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={cashFlowData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="income" fill="#4caf50" name="Income" />
                <Bar dataKey="expense" fill="#f44336" name="Expense" />
              </BarChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default FinanceDashboard;
