import { useEffect, useState } from 'react';
import {
  Grid,
  Card,
  CardContent,
  Typography,
  Box,
  Paper,
  CircularProgress,
  Alert,
  Tabs,
  Tab,
} from '@mui/material';
import {
  People as PeopleIcon,
  School as SchoolIcon,
  TrendingUp as TrendingUpIcon,
  Warning as WarningIcon,
  Book as BookIcon,
  Megaphone as MegaphoneIcon,
} from '@mui/icons-material';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, AreaChart, Area } from 'recharts';
import { analyticsApi } from '../../../services/api';
import ClassManagementPage from './ClassManagementPage';
import UserManagementPage from './UserManagementPage';
import NotificationManagementPage from './NotificationManagementPage';
import ProgramManagementPage from './ProgramManagementPage';
import TeacherManagementPage from './TeacherManagementPage';
import StudentManagementPage from './StudentManagementPage';
import AccountantManagementPage from './AccountantManagementPage';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index } = props;

  return (
    <div hidden={value !== index} style={{ width: '100%' }}>
      {value === index && <Box sx={{ pt: 3 }}>{children}</Box>}
    </div>
  );
}

const defaultRevenueData = [
  { month: 'T1', revenue: 45000000 },
  { month: 'T2', revenue: 52000000 },
  { month: 'T3', revenue: 48000000 },
  { month: 'T4', revenue: 61000000 },
  { month: 'T5', revenue: 55000000 },
  { month: 'T6', revenue: 67000000 },
];

const defaultEnrollmentData = [
  { level: 'Sơ cấp', count: 120 },
  { level: 'Trung cấp', count: 98 },
  { level: 'Nâng cao', count: 65 },
];

const alerts = [
  { id: 1, type: 'warning', message: 'Giáo viên Nguyễn Văn A có lịch trống tuần tới' },
  { id: 2, type: 'error', message: 'Phòng 301 đang bảo trì' },
  { id: 3, type: 'info', message: 'Lớp IELTS Advanced sắp đầy (14/15 học viên)' },
];

interface DashboardData {
  totalRevenue?: number;
  newEnrollments?: number;
  totalClasses?: number;
  classFullRate?: number;
  revenueData?: any[];
  academicData?: any[];
}

export default function AdminDashboard() {
  const [tabValue, setTabValue] = useState(0);
  const [dashboardData, setDashboardData] = useState<DashboardData>({
    totalRevenue: 67000000,
    newEnrollments: 42,
    totalClasses: 28,
    classFullRate: 85,
    revenueData: defaultRevenueData,
    academicData: defaultEnrollmentData,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  useEffect(() => {
    void fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch analytics data - could combine multiple API calls
      const dashboard = await analyticsApi.getDashboard();
      
      if (dashboard) {
        setDashboardData((prev) => ({
          ...prev,
          ...dashboard,
        }));
      }
    } catch (err: any) {
      console.error('Failed to fetch dashboard data:', err);
      setError('Không thể tải dữ liệu dashboard');
      // Keep using default data
    } finally {
      setLoading(false);
    }
  };

  if (error) {
    return (
      <Box>
        <Typography variant="h4" gutterBottom fontWeight={700}>
          Dashboard Quản lý
        </Typography>
        <Alert severity="error">{error}</Alert>
      </Box>
    );
  }

  return (
    <Box>
      <Typography variant="h4" gutterBottom fontWeight={700}>
        Dashboard Quản lý
      </Typography>

      {/* Main Tabs Navigation */}
      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
        <Tabs 
          value={tabValue} 
          onChange={handleTabChange} 
          aria-label="admin tabs"
          variant="scrollable"
          scrollButtons="auto"
          allowScrollButtonsMobile
          sx={{
            '& .MuiTab-root': {
              minWidth: 'fit-content',
              px: 3,
              fontWeight: 700,
              textTransform: 'none',
              fontSize: '0.95rem'
            }
          }}
        >
          <Tab label="Thống kê" />
          <Tab label="Quản lý Lớp học" />
          <Tab label="Quản lý Người dùng" />
          <Tab label="Quản lý Giáo viên" />
          <Tab label="Quản lý Kế toán" />
          <Tab label="Quản lý Học viên" />
          <Tab label="Quản lý Thông báo" />
          <Tab label="Quản lý Chương trình" />
        </Tabs>
      </Box>

      {/* Dashboard Tab (Statistics Overview) */}
      <TabPanel value={tabValue} index={0}>
        {error ? (
          <Alert severity="error">{error}</Alert>
        ) : (
          <>
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
                          {loading ? '...' : `${(dashboardData.totalRevenue || 67000000).toLocaleString('vi-VN')}đ`}
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
                          Học viên mới
                        </Typography>
                        <Typography variant="h5" fontWeight={700}>
                          {loading ? '...' : dashboardData.newEnrollments || 42}
                        </Typography>
                      </Box>
                      <PeopleIcon sx={{ fontSize: 40, color: 'primary.main' }} />
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
                          Tổng số lớp
                        </Typography>
                        <Typography variant="h5" fontWeight={700}>
                          {loading ? '...' : dashboardData.totalClasses || 28}
                        </Typography>
                      </Box>
                      <SchoolIcon sx={{ fontSize: 40, color: 'info.main' }} />
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
                          Tỷ lệ lớp đầy
                        </Typography>
                        <Typography variant="h5" fontWeight={700}>
                          {loading ? '...' : `${dashboardData.classFullRate || 85}%`}
                        </Typography>
                      </Box>
                      <TrendingUpIcon sx={{ fontSize: 40, color: 'warning.main' }} />
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>

            <Grid container spacing={3}>
              <Grid item xs={12} md={8}>
                <Paper sx={{ p: 3 }}>
                  <Typography variant="h6" gutterBottom fontWeight={600}>
                    Doanh thu 6 tháng gần đây
                  </Typography>
                  {loading ? (
                    <Box sx={{ display: 'flex', justifyContent: 'center', height: 300 }}>
                      <CircularProgress />
                    </Box>
                  ) : (
                    <ResponsiveContainer width="100%" height={300}>
                      <AreaChart data={dashboardData.revenueData || defaultRevenueData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="month" />
                        <YAxis />
                        <Tooltip />
                        <Area type="monotone" dataKey="revenue" stroke="#1976d2" fill="#1976d2" fillOpacity={0.6} />
                      </AreaChart>
                    </ResponsiveContainer>
                  )}
                </Paper>
              </Grid>

              <Grid item xs={12} md={4}>
                <Paper sx={{ p: 3 }}>
                  <Typography variant="h6" gutterBottom fontWeight={600}>
                    Học viên theo trình độ
                  </Typography>
                  {loading ? (
                    <Box sx={{ display: 'flex', justifyContent: 'center', height: 300 }}>
                      <CircularProgress />
                    </Box>
                  ) : (
                    <ResponsiveContainer width="100%" height={300}>
                      <BarChart data={dashboardData.academicData || defaultEnrollmentData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="level" />
                        <YAxis />
                        <Tooltip />
                        <Bar dataKey="count" fill="#4caf50" />
                      </BarChart>
                    </ResponsiveContainer>
                  )}
                </Paper>
              </Grid>

              <Grid item xs={12}>
                <Paper sx={{ p: 3 }}>
                  <Typography variant="h6" gutterBottom fontWeight={600}>
                    Cảnh báo hệ thống
                  </Typography>
                  {alerts.map((alert) => (
                    <Box
                      key={alert.id}
                      sx={{
                        display: 'flex',
                        alignItems: 'center',
                        p: 2,
                        mb: 1,
                        bgcolor: alert.type === 'error' ? '#ffebee' : alert.type === 'warning' ? '#fff3e0' : '#e3f2fd',
                        borderRadius: 1,
                      }}
                    >
                      <WarningIcon
                        sx={{
                          mr: 2,
                          color: alert.type === 'error' ? 'error.main' : alert.type === 'warning' ? 'warning.main' : 'info.main',
                        }}
                      />
                      <Typography variant="body2">{alert.message}</Typography>
                    </Box>
                  ))}
                </Paper>
              </Grid>
            </Grid>
          </>
        )}
      </TabPanel>

      {/* Class Management Tab */}
      <TabPanel value={tabValue} index={1}>
        <ClassManagementPage />
      </TabPanel>

      {/* User Management Tab (All Users) */}
      <TabPanel value={tabValue} index={2}>
        <UserManagementPage />
      </TabPanel>

      {/* Teacher Management Tab */}
      <TabPanel value={tabValue} index={3}>
        <TeacherManagementPage />
      </TabPanel>

      {/* Accountant Management Tab */}
      <TabPanel value={tabValue} index={4}>
        <AccountantManagementPage />
      </TabPanel>

      {/* Student Management Tab */}
      <TabPanel value={tabValue} index={5}>
        <StudentManagementPage />
      </TabPanel>

      {/* Notification Management Tab */}
      <TabPanel value={tabValue} index={6}>
        <NotificationManagementPage />
      </TabPanel>

      {/* Course/Program Management Tab */}
      <TabPanel value={tabValue} index={7}>
        <ProgramManagementPage />
      </TabPanel>
    </Box>
  );
}
