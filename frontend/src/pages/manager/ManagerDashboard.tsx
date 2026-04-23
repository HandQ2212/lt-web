import { Box, Card, CardContent, Grid, Typography, Paper } from '@mui/material';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import PeopleIcon from '@mui/icons-material/People';
import ClassIcon from '@mui/icons-material/Class';
import WarningIcon from '@mui/icons-material/Warning';

const revenueData = [
  { name: 'Jan', value: 400 },
  { name: 'Feb', value: 300 },
  { name: 'Mar', value: 500 },
  { name: 'Apr', value: 450 },
  { name: 'May', value: 600 },
  { name: 'Jun', value: 700 },
];

const enrollmentData = [
  { name: 'Beginner', students: 120 },
  { name: 'Intermediate', students: 85 },
  { name: 'Advanced', students: 40 },
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

const ManagerDashboard = () => {
  return (
    <Box>
      <Typography variant="h4" sx={{ fontWeight: "bold" }} gutterBottom>
        Manager Dashboard
      </Typography>

      {/* KPI Cards */}
      <Grid container spacing={3} mb={4}>
        <Grid size={{xs: 12, sm: 6, lg: 3}}>
          <StatCard title="Monthly Revenue" value="$24k" icon={<TrendingUpIcon />} color="#4caf50" />
        </Grid>
        <Grid size={{xs: 12, sm: 6, lg: 3}}>
          <StatCard title="New Students" value="145" icon={<PeopleIcon />} color="#1976d2" />
        </Grid>
        <Grid size={{xs: 12, sm: 6, lg: 3}}>
          <StatCard title="Active Classes" value="32" icon={<ClassIcon />} color="#ff9800" />
        </Grid>
        <Grid size={{xs: 12, sm: 6, lg: 3}}>
          <StatCard title="System Alerts" value="3" icon={<WarningIcon />} color="#f44336" />
        </Grid>
      </Grid>

      {/* Charts */}
      <Grid container spacing={3}>
        <Grid  xs={12} lg={8}>
          <Paper sx={{ p: 3, height: 400 }}>
            <Typography variant="h6" gutterBottom sx={{ fontWeight: "bold" }}>Revenue Trend</Typography>
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={revenueData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Area type="monotone" dataKey="value" stroke="#1976d2" fill="#1976d2" fillOpacity={0.2} />
              </AreaChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>
        <Grid  xs={12} lg={4}>
          <Paper sx={{ p: 3, height: 400 }}>
            <Typography variant="h6" gutterBottom sx={{ fontWeight: "bold" }}>Enrollment by Level</Typography>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={enrollmentData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="students" fill="#4caf50" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>
      </Grid>

      {/* Alerts */}
      <Box mt={4}>
        <Typography variant="h6" sx={{ fontWeight: "bold" }} gutterBottom>Recent Alerts</Typography>
        <Paper sx={{ p: 2, display: 'flex', flexDir: 'column', gap: 2 }}>
          <Box sx={{ p: 2, bgcolor: '#fff3cd', borderRadius: 1, color: '#856404' }}>
            <strong>Schedule Conflict:</strong> Teacher John Doe is assigned to two classes on Mon 08:00.
          </Box>
          <Box sx={{ p: 2, bgcolor: '#f8d7da', borderRadius: 1, color: '#721c24' }}>
            <strong>Room Maintenance:</strong> Room 102 requires A/C fixing.
          </Box>
        </Paper>
      </Box>
    </Box>
  );
};

export default ManagerDashboard;
