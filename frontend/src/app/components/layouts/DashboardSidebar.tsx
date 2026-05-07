import { Drawer, List, ListItem, ListItemButton, ListItemIcon, ListItemText, Box, Typography, Divider } from '@mui/material';
import { useNavigate, useLocation } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { RootState } from '../../../store';
import PeopleIcon from '@mui/icons-material/People';
import SchoolIcon from '@mui/icons-material/School';
import ClassIcon from '@mui/icons-material/Class';
import AssignmentIcon from '@mui/icons-material/Assignment';
import PaymentIcon from '@mui/icons-material/Payment';
import BarChartIcon from '@mui/icons-material/BarChart';
import PersonIcon from '@mui/icons-material/Person';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import GroupsIcon from '@mui/icons-material/Groups';
import ReceiptLongIcon from '@mui/icons-material/ReceiptLong';
import NotificationsIcon from '@mui/icons-material/Notifications';
import MenuBookIcon from '@mui/icons-material/MenuBook';
import AccountBalanceIcon from '@mui/icons-material/AccountBalance';
import HomeIcon from '@mui/icons-material/Home';
import ExploreIcon from '@mui/icons-material/Explore';

const drawerWidth = 260;

interface MenuItem {
  text: string;
  icon: React.ReactNode;
  path: string;
  roles: string[];
}

const menuItems: MenuItem[] = [
  { text: 'Trang chủ', icon: <HomeIcon />, path: '/', roles: ['STUDENT', 'LEAD', 'TEACHER', 'MANAGER', 'ACCOUNTANT'] },
  { text: 'Khám phá khóa học', icon: <ExploreIcon />, path: '/courses', roles: ['STUDENT', 'LEAD'] },
  
  { text: 'Quản lý người dùng', icon: <PeopleIcon />, path: '/admin/users', roles: ['MANAGER'] },
  { text: 'Quản lý lớp học', icon: <ClassIcon />, path: '/admin/classes', roles: ['MANAGER'] },
  { text: 'Quản lý Giáo viên', icon: <SchoolIcon />, path: '/admin/teachers', roles: ['MANAGER'] },
  { text: 'Quản lý Kế toán', icon: <AccountBalanceIcon />, path: '/admin/accountants', roles: ['MANAGER'] },
  { text: 'Quản lý Học viên', icon: <GroupsIcon />, path: '/admin/students', roles: ['MANAGER'] },
  { text: 'CRM & Leads', icon: <GroupsIcon />, path: '/admin/leads', roles: ['MANAGER', 'ACCOUNTANT'] },
  { text: 'Quản lý Thông báo', icon: <NotificationsIcon />, path: '/admin/notifications', roles: ['MANAGER'] },
  { text: 'Quản lý Chương trình', icon: <MenuBookIcon />, path: '/admin/programs', roles: ['MANAGER'] },

  { text: 'Lịch dạy', icon: <CalendarTodayIcon />, path: '/teacher/schedule', roles: ['TEACHER'] },
  { text: 'Lớp học của tôi', icon: <ClassIcon />, path: '/teacher/classes', roles: ['TEACHER'] },
  { text: 'Điểm danh', icon: <AssignmentIcon />, path: '/teacher/attendance', roles: ['TEACHER'] },
  { text: 'Bài tập', icon: <AssignmentIcon />, path: '/teacher/assignments', roles: ['TEACHER'] },

  { text: 'Khóa học của tôi', icon: <SchoolIcon />, path: '/student/courses', roles: ['STUDENT'] },
  { text: 'Bài tập', icon: <AssignmentIcon />, path: '/student/assignments', roles: ['STUDENT'] },
  { text: 'Bảng điểm', icon: <BarChartIcon />, path: '/student/grades', roles: ['STUDENT'] },
  { text: 'Học phí', icon: <PaymentIcon />, path: '/student/payments', roles: ['STUDENT', 'LEAD'] },
  { text: 'Hóa đơn học phí', icon: <ReceiptLongIcon />, path: '/student/invoices', roles: ['STUDENT'] },

  { text: 'Dashboard tài chính', icon: <BarChartIcon />, path: '/finance/dashboard', roles: ['ACCOUNTANT'] },
  { text: 'Nghiệp vụ kế toán', icon: <ReceiptLongIcon />, path: '/finance/operations', roles: ['ACCOUNTANT'] },
  { text: 'Công nợ học viên', icon: <BarChartIcon />, path: '/finance/debts', roles: ['ACCOUNTANT'] },
  { text: 'Thanh toán GV', icon: <PaymentIcon />, path: '/finance/teacher-payments', roles: ['ACCOUNTANT'] },

  { text: 'Hồ sơ', icon: <PersonIcon />, path: '/profile', roles: ['MANAGER', 'TEACHER', 'STUDENT', 'ACCOUNTANT', 'LEAD'] },
];

export default function DashboardSidebar() {
  const navigate = useNavigate();
  const location = useLocation();
  const user = useSelector((state: RootState) => state.auth.user);

  const filteredMenuItems = menuItems.filter(item =>
    user && item.roles.includes(user.role)
  );

  const isActive = (item: MenuItem) => {
    return location.pathname === item.path || location.pathname.startsWith(`${item.path}/`);
  };

  return (
    <Drawer
      variant="permanent"
      sx={{
        width: drawerWidth,
        flexShrink: 0,
        '& .MuiDrawer-paper': {
          width: drawerWidth,
          boxSizing: 'border-box',
          borderRight: '1px solid rgba(0,0,0,0.12)',
        },
      }}
    >
      <Box sx={{ p: 2 }}>
        <Typography variant="h6" fontWeight={700} color="primary">
          ELC System
        </Typography>
        <Typography variant="caption" color="text.secondary">
          {user?.role}
        </Typography>
      </Box>
      <Divider />
      <List>
        {filteredMenuItems.map((item) => (
          <ListItem key={item.path} disablePadding>
            <ListItemButton
              selected={isActive(item)}
              onClick={() => navigate(item.path)}
              sx={{
                '&.Mui-selected': {
                  bgcolor: 'primary.light',
                  '&:hover': { bgcolor: 'primary.light' },
                },
              }}
            >
              <ListItemIcon sx={{ color: isActive(item) ? 'primary.main' : 'inherit' }}>
                {item.icon}
              </ListItemIcon>
              <ListItemText primary={item.text} />
            </ListItemButton>
          </ListItem>
        ))}
      </List>
    </Drawer>
  );
}
