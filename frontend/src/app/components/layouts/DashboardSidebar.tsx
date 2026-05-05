import { Drawer, List, ListItem, ListItemButton, ListItemIcon, ListItemText, Box, Typography, Divider } from '@mui/material';
import { useNavigate, useLocation } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { RootState } from '../../../store';
import DashboardIcon from '@mui/icons-material/Dashboard';
import PeopleIcon from '@mui/icons-material/People';
import SchoolIcon from '@mui/icons-material/School';
import ClassIcon from '@mui/icons-material/Class';
import AssignmentIcon from '@mui/icons-material/Assignment';
import PaymentIcon from '@mui/icons-material/Payment';
import BarChartIcon from '@mui/icons-material/BarChart';
import PersonIcon from '@mui/icons-material/Person';
import SettingsIcon from '@mui/icons-material/Settings';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import GroupsIcon from '@mui/icons-material/Groups';

const drawerWidth = 260;

interface MenuItem {
  text: string;
  icon: React.ReactNode;
  path: string;
  roles: string[];
}

const menuItems: MenuItem[] = [
  { text: 'Dashboard', icon: <DashboardIcon />, path: '/dashboard', roles: ['ADMIN', 'MANAGER', 'TEACHER', 'STUDENT', 'ACCOUNTANT'] },

  { text: 'Quản lý người dùng', icon: <PeopleIcon />, path: '/admin/users', roles: ['ADMIN', 'MANAGER'] },
  { text: 'Quản lý lớp học', icon: <ClassIcon />, path: '/admin/classes', roles: ['ADMIN', 'MANAGER'] },
  { text: 'CRM & Leads', icon: <GroupsIcon />, path: '/admin/leads', roles: ['ADMIN', 'MANAGER'] },

  { text: 'Lịch dạy', icon: <CalendarTodayIcon />, path: '/teacher/schedule', roles: ['TEACHER'] },
  { text: 'Lớp học của tôi', icon: <ClassIcon />, path: '/teacher/classes', roles: ['TEACHER'] },
  { text: 'Điểm danh', icon: <AssignmentIcon />, path: '/teacher/attendance', roles: ['TEACHER'] },
  { text: 'Bài tập', icon: <AssignmentIcon />, path: '/teacher/assignments', roles: ['TEACHER'] },

  { text: 'Khóa học của tôi', icon: <SchoolIcon />, path: '/student/courses', roles: ['STUDENT'] },
  { text: 'Bảng điểm', icon: <BarChartIcon />, path: '/student/grades', roles: ['STUDENT'] },
  { text: 'Học phí', icon: <PaymentIcon />, path: '/student/payments', roles: ['STUDENT'] },

  { text: 'Tài chính', icon: <PaymentIcon />, path: '/finance/dashboard', roles: ['ACCOUNTANT', 'ADMIN'] },

  { text: 'Hồ sơ', icon: <PersonIcon />, path: '/profile', roles: ['ADMIN', 'MANAGER', 'TEACHER', 'STUDENT', 'ACCOUNTANT'] },
];

export default function DashboardSidebar() {
  const navigate = useNavigate();
  const location = useLocation();
  const user = useSelector((state: RootState) => state.auth.user);

  const filteredMenuItems = menuItems.filter(item =>
    user && item.roles.includes(user.role)
  );

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
              selected={location.pathname === item.path}
              onClick={() => navigate(item.path)}
              sx={{
                '&.Mui-selected': {
                  bgcolor: 'primary.light',
                  '&:hover': { bgcolor: 'primary.light' },
                },
              }}
            >
              <ListItemIcon sx={{ color: location.pathname === item.path ? 'primary.main' : 'inherit' }}>
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
