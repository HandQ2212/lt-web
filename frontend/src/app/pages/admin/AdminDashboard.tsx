import { useEffect, useMemo, useState } from 'react';
import {
  Alert,
  Box,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  Divider,
  Grid,
  Paper,
  Stack,
  Tab,
  Tabs,
  Typography,
} from '@mui/material';
import {
  AccountBalanceWallet as AccountBalanceWalletIcon,
  BarChart as BarChartIcon,
  Groups as GroupsIcon,
  MonetizationOn as MonetizationOnIcon,
  People as PeopleIcon,
  School as SchoolIcon,
  TrendingUp as TrendingUpIcon,
  WarningAmber as WarningAmberIcon,
} from '@mui/icons-material';
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
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

type DashboardSummary = {
  totalStudents: number;
  totalLeads: number;
  totalTeachers: number;
  totalClasses: number;
  totalRevenue: number;
  outstandingBalance: number;
  averageAttendanceRate: number;
};

type RevenueSeriesItem = {
  monthKey: string;
  label: string;
  revenue: number;
};

type AcademicSeriesItem = {
  label: string;
  count: number;
};

type AcademicSummary = {
  averageMidtermScore: number;
  averageFinalScore: number;
  totalCompletedEnrollments: number;
  passRate: number;
};

const emptySummary: DashboardSummary = {
  totalStudents: 0,
  totalLeads: 0,
  totalTeachers: 0,
  totalClasses: 0,
  totalRevenue: 0,
  outstandingBalance: 0,
  averageAttendanceRate: 0,
};

const gradeOrder = ['A', 'B', 'C', 'D', 'F'];

const formatCurrency = (value: number) =>
  `${new Intl.NumberFormat('vi-VN').format(Math.round(value || 0))}đ`;

const formatPercent = (value: number) => `${Math.round((value || 0) * 100)}%`;

const formatMonthLabel = (monthKey: string) => {
  const [year, month] = monthKey.split('-');
  if (!year || !month) {
    return monthKey;
  }

  return `T${Number(month)} / ${year}`;
};

const normalizeSummary = (dashboard: any): DashboardSummary => ({
  totalStudents: Number(dashboard?.totalStudents || 0),
  totalLeads: Number(dashboard?.totalLeads || 0),
  totalTeachers: Number(dashboard?.totalTeachers || 0),
  totalClasses: Number(dashboard?.totalClasses || 0),
  totalRevenue: Number(dashboard?.totalRevenue || 0),
  outstandingBalance: Number(dashboard?.outstandingBalance || 0),
  averageAttendanceRate: Number(dashboard?.averageAttendanceRate || 0),
});

const normalizeRevenueSeries = (payload: any): RevenueSeriesItem[] => {
  const source = payload?.revenueByMonth || {};

  return Object.entries(source)
    .map(([monthKey, value]) => ({
      monthKey,
      label: formatMonthLabel(monthKey),
      revenue: Number(value || 0),
    }))
    .sort((left, right) => left.monthKey.localeCompare(right.monthKey));
};

const normalizeAcademicSummary = (payload: any): AcademicSummary => ({
  averageMidtermScore: Number(payload?.averageMidtermScore || 0),
  averageFinalScore: Number(payload?.averageFinalScore || 0),
  totalCompletedEnrollments: Number(payload?.totalCompletedEnrollments || 0),
  passRate: Number(payload?.passRate || 0),
});

const normalizeAcademicSeries = (payload: any): AcademicSeriesItem[] => {
  const source = payload?.gradeDistribution || {};

  return Object.entries(source)
    .map(([label, count]) => ({
      label,
      count: Number(count || 0),
    }))
    .sort((left, right) => {
      const leftIndex = gradeOrder.indexOf(left.label);
      const rightIndex = gradeOrder.indexOf(right.label);

      if (leftIndex === -1 && rightIndex === -1) {
        return left.label.localeCompare(right.label);
      }

      if (leftIndex === -1) {
        return 1;
      }

      if (rightIndex === -1) {
        return -1;
      }

      return leftIndex - rightIndex;
    });
};

const statCards = [
  {
    key: 'students',
    label: 'Học viên',
    icon: <PeopleIcon />,
    gradient: 'linear-gradient(135deg, #1d4ed8 0%, #60a5fa 100%)',
    subtitle: 'Đang theo học',
  },
  {
    key: 'classes',
    label: 'Lớp học',
    icon: <SchoolIcon />,
    gradient: 'linear-gradient(135deg, #0f766e 0%, #2dd4bf 100%)',
    subtitle: 'Đang vận hành',
  },
  {
    key: 'teachers',
    label: 'Giảng viên',
    icon: <GroupsIcon />,
    gradient: 'linear-gradient(135deg, #7c3aed 0%, #a78bfa 100%)',
    subtitle: 'Đang hoạt động',
  },
  {
    key: 'leads',
    label: 'Lead',
    icon: <MonetizationOnIcon />,
    gradient: 'linear-gradient(135deg, #c2410c 0%, #fb923c 100%)',
    subtitle: 'Nguồn tư vấn',
  },
  {
    key: 'revenue',
    label: 'Doanh thu',
    icon: <TrendingUpIcon />,
    gradient: 'linear-gradient(135deg, #14532d 0%, #22c55e 100%)',
    subtitle: 'Tích lũy',
  },
  {
    key: 'debt',
    label: 'Công nợ',
    icon: <AccountBalanceWalletIcon />,
    gradient: 'linear-gradient(135deg, #991b1b 0%, #ef4444 100%)',
    subtitle: 'Chưa thu hồi',
  },
];

interface DashboardData {
  summary: DashboardSummary;
  revenueSeries: RevenueSeriesItem[];
  academicSummary: AcademicSummary;
  academicSeries: AcademicSeriesItem[];
}

export default function AdminDashboard() {
  const [tabValue, setTabValue] = useState(0);
  const [dashboardData, setDashboardData] = useState<DashboardData>({
    summary: emptySummary,
    revenueSeries: [],
    academicSummary: {
      averageMidtermScore: 0,
      averageFinalScore: 0,
      totalCompletedEnrollments: 0,
      passRate: 0,
    },
    academicSeries: [],
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

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
      setStatusMessage(null);

      const [dashboardResult, revenueResult, academicResult] = await Promise.allSettled([
        analyticsApi.getDashboard(),
        analyticsApi.getRevenue(),
        analyticsApi.getAcademic(),
      ]);

      const nextSummary = dashboardResult.status === 'fulfilled' ? normalizeSummary(dashboardResult.value) : emptySummary;
      const nextRevenueSeries =
        revenueResult.status === 'fulfilled' ? normalizeRevenueSeries(revenueResult.value?.data) : [];
      const nextAcademicSummary =
        academicResult.status === 'fulfilled'
          ? normalizeAcademicSummary(academicResult.value?.data)
          : {
              averageMidtermScore: 0,
              averageFinalScore: 0,
              totalCompletedEnrollments: 0,
              passRate: 0,
            };
      const nextAcademicSeries =
        academicResult.status === 'fulfilled' ? normalizeAcademicSeries(academicResult.value?.data) : [];

      setDashboardData({
        summary: nextSummary,
        revenueSeries: nextRevenueSeries,
        academicSummary: nextAcademicSummary,
        academicSeries: nextAcademicSeries,
      });

      const failures = [dashboardResult, revenueResult, academicResult].filter((result) => result.status === 'rejected').length;
      if (failures > 0) {
        setStatusMessage('Một số chỉ số chưa tải được đầy đủ, nhưng dashboard vẫn hiển thị dữ liệu hiện có.');
      }

      if (failures === 3) {
        setError('Không thể tải dữ liệu dashboard');
      }
    } catch (err: any) {
      console.error('Failed to fetch dashboard data:', err);
      setError('Không thể tải dữ liệu dashboard');
    } finally {
      setLoading(false);
    }
  };

  const summaryCards = useMemo(
    () => [
      {
        ...statCards[0],
        value: dashboardData.summary.totalStudents,
      },
      {
        ...statCards[1],
        value: dashboardData.summary.totalClasses,
      },
      {
        ...statCards[2],
        value: dashboardData.summary.totalTeachers,
      },
      {
        ...statCards[3],
        value: dashboardData.summary.totalLeads,
      },
      {
        ...statCards[4],
        value: formatCurrency(dashboardData.summary.totalRevenue),
      },
      {
        ...statCards[5],
        value: formatCurrency(dashboardData.summary.outstandingBalance),
      },
    ],
    [dashboardData.summary]
  );

  const systemInsights = useMemo(
    () => [
      {
        label: 'Tỷ lệ chuyên cần',
        value: formatPercent(dashboardData.summary.averageAttendanceRate),
        detail: 'Dữ liệu điểm danh toàn hệ thống',
      },
      {
        label: 'Điểm trung bình giữa kỳ',
        value: dashboardData.academicSummary.averageMidtermScore.toFixed(1),
        detail: 'Từ các lớp đã chấm điểm',
      },
      {
        label: 'Điểm trung bình cuối kỳ',
        value: dashboardData.academicSummary.averageFinalScore.toFixed(1),
        detail: 'Từ dữ liệu học tập hiện có',
      },
      {
        label: 'Tỷ lệ đạt',
        value: formatPercent(dashboardData.academicSummary.passRate),
        detail: 'Học viên đã hoàn thành',
      },
    ],
    [dashboardData.academicSummary, dashboardData.summary.averageAttendanceRate]
  );

  if (error) {
    return (
      <Box sx={{ display: 'grid', gap: 2 }}>
        <Box>
          <Typography variant="h4" gutterBottom fontWeight={800} color="primary.main">
            Dashboard Quản lý
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Dữ liệu tổng hợp cho quản trị viên, đồng bộ trực tiếp từ backend.
          </Typography>
        </Box>
        <Alert severity="error" sx={{ borderRadius: 3 }}>
          {error}
        </Alert>
      </Box>
    );
  }

  return (
    <Box sx={{ display: 'grid', gap: 3 }}>
      <Paper
        sx={{
          p: { xs: 3, md: 4 },
          borderRadius: 4,
          color: 'white',
          background:
            'linear-gradient(135deg, rgba(15, 23, 42, 0.95) 0%, rgba(29, 78, 216, 0.92) 55%, rgba(15, 118, 110, 0.92) 100%)',
          overflow: 'hidden',
          position: 'relative',
        }}
      >
        <Box
          aria-hidden
          sx={{
            position: 'absolute',
            inset: 0,
            background:
              'radial-gradient(circle at top right, rgba(255,255,255,0.18), transparent 24%), radial-gradient(circle at bottom left, rgba(255,255,255,0.12), transparent 18%)',
          }}
        />
        <Box sx={{ position: 'relative', zIndex: 1 }}>
          <Stack direction={{ xs: 'column', lg: 'row' }} spacing={3} justifyContent="space-between" alignItems={{ xs: 'flex-start', lg: 'center' }}>
            <Box sx={{ maxWidth: 700 }}>
              <Chip
                label="Manager overview"
                size="small"
                sx={{
                  mb: 2,
                  bgcolor: 'rgba(255,255,255,0.14)',
                  color: 'white',
                  fontWeight: 800,
                  letterSpacing: 0.4,
                }}
              />
              <Typography variant="h4" fontWeight={900} sx={{ mb: 1.5, lineHeight: 1.1 }}>
                Dashboard điều hành trung tâm
              </Typography>
              <Typography variant="body1" sx={{ maxWidth: 680, color: 'rgba(255,255,255,0.82)', lineHeight: 1.8 }}>
                Theo dõi học viên, lớp học, doanh thu và hiệu quả vận hành theo thời gian thực. Giao diện này dùng dữ liệu thật từ backend thay vì số liệu mô phỏng.
              </Typography>
            </Box>

            <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap justifyContent={{ xs: 'flex-start', lg: 'flex-end' }}>
              <Chip label={loading ? 'Đang tải học viên...' : `${dashboardData.summary.totalStudents} học viên`} sx={{ bgcolor: 'rgba(255,255,255,0.16)', color: 'white', fontWeight: 700 }} />
              <Chip label={loading ? 'Đang tải lớp...' : `${dashboardData.summary.totalClasses} lớp`} sx={{ bgcolor: 'rgba(255,255,255,0.16)', color: 'white', fontWeight: 700 }} />
              <Chip label={loading ? 'Đang tải giảng viên...' : `${dashboardData.summary.totalTeachers} giảng viên`} sx={{ bgcolor: 'rgba(255,255,255,0.16)', color: 'white', fontWeight: 700 }} />
            </Stack>
          </Stack>

          {statusMessage && (
            <Alert severity="warning" sx={{ mt: 3, borderRadius: 3, bgcolor: 'rgba(255,255,255,0.12)', color: 'white', '& .MuiAlert-icon': { color: 'white' } }}>
              {statusMessage}
            </Alert>
          )}
        </Box>
      </Paper>

      <Grid container spacing={2.5}>
        {summaryCards.map((card) => (
          <Grid key={card.key} item xs={12} sm={6} lg={4}>
            <Card
              sx={{
                height: '100%',
                position: 'relative',
                overflow: 'hidden',
                background: card.gradient,
                color: 'white',
              }}
            >
              <CardContent sx={{ position: 'relative', zIndex: 1, p: 3 }}>
                <Stack direction="row" justifyContent="space-between" alignItems="flex-start" spacing={2}>
                  <Box>
                    <Typography variant="body2" sx={{ opacity: 0.85, fontWeight: 700, mb: 0.75 }}>
                      {card.label}
                    </Typography>
                    <Typography variant="h4" fontWeight={900} sx={{ lineHeight: 1.05 }}>
                      {loading ? '...' : card.value}
                    </Typography>
                    <Typography variant="caption" sx={{ opacity: 0.85, fontWeight: 600 }}>
                      {card.subtitle}
                    </Typography>
                  </Box>
                  <Box
                    sx={{
                      width: 52,
                      height: 52,
                      borderRadius: 3,
                      display: 'grid',
                      placeItems: 'center',
                      bgcolor: 'rgba(255,255,255,0.16)',
                      backdropFilter: 'blur(10px)',
                    }}
                  >
                    {card.icon}
                  </Box>
                </Stack>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      <Grid container spacing={3}>
        <Grid item xs={12} lg={8}>
          <Paper sx={{ p: { xs: 2.5, md: 3.5 }, borderRadius: 4, height: '100%' }}>
            <Stack direction={{ xs: 'column', sm: 'row' }} justifyContent="space-between" spacing={2} sx={{ mb: 2 }}>
              <Box>
                <Typography variant="h6" fontWeight={900}>
                  Doanh thu theo tháng
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Dữ liệu lấy từ báo cáo tài chính backend, không còn dùng số cứng trong giao diện.
                </Typography>
              </Box>
              <Chip
                icon={<BarChartIcon />}
                label="Revenue analytics"
                variant="outlined"
                sx={{ alignSelf: { xs: 'flex-start', sm: 'center' }, fontWeight: 700 }}
              />
            </Stack>

            <Divider sx={{ mb: 3 }} />

            {loading ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 320 }}>
                <CircularProgress />
              </Box>
            ) : dashboardData.revenueSeries.length > 0 ? (
              <ResponsiveContainer width="100%" height={320}>
                <AreaChart data={dashboardData.revenueSeries} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="revenueFill" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#1d4ed8" stopOpacity={0.32} />
                      <stop offset="95%" stopColor="#1d4ed8" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(148,163,184,0.25)" />
                  <XAxis dataKey="label" tickLine={false} axisLine={false} />
                  <YAxis tickLine={false} axisLine={false} width={70} tickFormatter={(value) => `${Number(value) / 1000000}tr`} />
                  <Tooltip formatter={(value: any) => formatCurrency(Number(value || 0))} />
                  <Legend />
                  <Area type="monotone" dataKey="revenue" name="Doanh thu" stroke="#1d4ed8" fillOpacity={1} fill="url(#revenueFill)" strokeWidth={3} />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <Alert severity="info" sx={{ borderRadius: 3 }}>
                Chưa có dữ liệu doanh thu theo tháng.
              </Alert>
            )}
          </Paper>
        </Grid>

        <Grid item xs={12} lg={4}>
          <Paper sx={{ p: { xs: 2.5, md: 3.5 }, borderRadius: 4, height: '100%' }}>
            <Stack spacing={2}>
              <Box>
                <Typography variant="h6" fontWeight={900}>
                  Tình hình học tập
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Tổng hợp từ bảng điểm và kết quả hoàn thành.
                </Typography>
              </Box>

              <Divider />

              <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                <Chip label={`${dashboardData.academicSummary.totalCompletedEnrollments} lượt chấm`} variant="outlined" sx={{ fontWeight: 700 }} />
                <Chip label={`Đạt: ${formatPercent(dashboardData.academicSummary.passRate)}`} color="success" variant="outlined" sx={{ fontWeight: 700 }} />
              </Stack>

              <Stack spacing={1.5}>
                {systemInsights.map((item) => (
                  <Box key={item.label} sx={{ p: 1.75, borderRadius: 3, bgcolor: 'rgba(15,23,42,0.03)' }}>
                    <Typography variant="caption" color="text.secondary" fontWeight={700} sx={{ display: 'block', mb: 0.25 }}>
                      {item.label}
                    </Typography>
                    <Typography variant="h5" fontWeight={900} sx={{ lineHeight: 1.1 }}>
                      {loading ? '...' : item.value}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {item.detail}
                    </Typography>
                  </Box>
                ))}
              </Stack>
            </Stack>
          </Paper>
        </Grid>

        <Grid item xs={12} lg={7}>
          <Paper sx={{ p: { xs: 2.5, md: 3.5 }, borderRadius: 4, height: '100%' }}>
            <Typography variant="h6" fontWeight={900} sx={{ mb: 0.5 }}>
              Phân phối học lực
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
              Dữ liệu từ kết quả hoàn thành của học viên.
            </Typography>

            {loading ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 320 }}>
                <CircularProgress />
              </Box>
            ) : dashboardData.academicSeries.length > 0 ? (
              <ResponsiveContainer width="100%" height={320}>
                <BarChart data={dashboardData.academicSeries} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(148,163,184,0.25)" />
                  <XAxis dataKey="label" tickLine={false} axisLine={false} />
                  <YAxis tickLine={false} axisLine={false} allowDecimals={false} />
                  <Tooltip />
                  <Bar dataKey="count" name="Số lượng" fill="#0f766e" radius={[10, 10, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <Alert severity="info" sx={{ borderRadius: 3 }}>
                Chưa có dữ liệu phân phối học lực.
              </Alert>
            )}
          </Paper>
        </Grid>

        <Grid item xs={12} lg={5}>
          <Paper sx={{ p: { xs: 2.5, md: 3.5 }, borderRadius: 4, height: '100%' }}>
            <Typography variant="h6" fontWeight={900} sx={{ mb: 0.5 }}>
              Chỉ số vận hành
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
              Bức tranh tổng quát cho quyết định nhanh.
            </Typography>

            <Stack spacing={2}>
              {[
                {
                  label: 'Tỷ lệ chuyên cần',
                  value: formatPercent(dashboardData.summary.averageAttendanceRate),
                  accent: '#1d4ed8',
                },
                {
                  label: 'Tổng doanh thu',
                  value: formatCurrency(dashboardData.summary.totalRevenue),
                  accent: '#0f766e',
                },
                {
                  label: 'Công nợ còn lại',
                  value: formatCurrency(dashboardData.summary.outstandingBalance),
                  accent: '#b45309',
                },
              ].map((item) => (
                <Box
                  key={item.label}
                  sx={{
                    p: 2,
                    borderRadius: 3,
                    bgcolor: 'rgba(15,23,42,0.03)',
                    borderLeft: `4px solid ${item.accent}`,
                  }}
                >
                  <Typography variant="caption" color="text.secondary" fontWeight={700} sx={{ display: 'block' }}>
                    {item.label}
                  </Typography>
                  <Typography variant="h5" fontWeight={900} sx={{ mt: 0.5 }}>
                    {loading ? '...' : item.value}
                  </Typography>
                </Box>
              ))}

              <Alert severity="info" sx={{ borderRadius: 3 }}>
                Dữ liệu dashboard hiện tại đã được lấy từ backend thật. Nếu backend chưa trả đủ trường, giao diện vẫn giữ bố cục ổn định.
              </Alert>
            </Stack>
          </Paper>
        </Grid>
      </Grid>

      <Box sx={{ borderBottom: 1, borderColor: 'divider', mt: 1 }}>
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
              fontWeight: 800,
              textTransform: 'none',
              fontSize: '0.95rem',
            },
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
