import { Drawer, List, ListItem, ListItemButton, ListItemIcon, ListItemText, Box, Typography, Divider, IconButton, useTheme, Tooltip } from '@mui/material';
import { useNavigate, useLocation } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { RootState } from '../../../store';
import {
  People as PeopleIcon,
  School as SchoolIcon,
  Class as ClassIcon,
  Assignment as AssignmentIcon,
  Payment as PaymentIcon,
  BarChart as BarChartIcon,
  Person as PersonIcon,
  CalendarToday as CalendarTodayIcon,
  Groups as GroupsIcon,
  ReceiptLong as ReceiptLongIcon,
  Notifications as NotificationsIcon,
  MenuBook as MenuBookIcon,
  AccountBalance as AccountBalanceIcon,
  Home as HomeIcon,
  Explore as ExploreIcon,
  ChevronLeft as ChevronLeftIcon,
  ChevronRight as ChevronRightIcon,
} from '@mui/icons-material';

interface MenuItem {
  text: string;
  icon: React.ReactNode;
  path: string;
  roles: string[];
}

const menuItems: MenuItem[] = [
  { text: 'Trang chủ', icon: <HomeIcon />, path: '/', roles: ['STUDENT', 'LEAD', 'TEACHER', 'MANAGER', 'ACCOUNTANT'] },
  { text: 'Khám phá khóa học', icon: <ExploreIcon />, path: '/courses', roles: ['STUDENT', 'LEAD'] },
  
  { text: 'Người dùng', icon: <PeopleIcon />, path: '/admin/users', roles: ['MANAGER'] },
  { text: 'Lớp học', icon: <ClassIcon />, path: '/admin/classes', roles: ['MANAGER'] },
  { text: 'Giảng viên', icon: <SchoolIcon />, path: '/admin/teachers', roles: ['MANAGER'] },
  { text: 'Kế toán', icon: <AccountBalanceIcon />, path: '/admin/accountants', roles: ['MANAGER'] },
  { text: 'Học viên', icon: <GroupsIcon />, path: '/admin/students', roles: ['MANAGER'] },
  { text: 'Quản lý Leads (CRM)', icon: <GroupsIcon />, path: '/admin/leads', roles: ['MANAGER', 'ACCOUNTANT'] },
  { text: 'Thông báo', icon: <NotificationsIcon />, path: '/notifications', roles: ['MANAGER', 'TEACHER', 'STUDENT', 'ACCOUNTANT', 'LEAD'] },
  { text: 'Chương trình học', icon: <MenuBookIcon />, path: '/admin/programs', roles: ['MANAGER'] },

  { text: 'Lịch giảng dạy', icon: <CalendarTodayIcon />, path: '/teacher/schedule', roles: ['TEACHER'] },
  { text: 'Lớp phụ trách', icon: <ClassIcon />, path: '/teacher/classes', roles: ['TEACHER'] },
  { text: 'Điểm danh', icon: <AssignmentIcon />, path: '/teacher/attendance', roles: ['TEACHER'] },
  { text: 'Bài tập giao', icon: <AssignmentIcon />, path: '/teacher/assignments', roles: ['TEACHER'] },

  { text: 'Khóa học của tôi', icon: <SchoolIcon />, path: '/student/courses', roles: ['STUDENT'] },
  { text: 'Bài tập về nhà', icon: <AssignmentIcon />, path: '/student/assignments', roles: ['STUDENT'] },
  { text: 'Bảng điểm chi tiết', icon: <BarChartIcon />, path: '/student/grades', roles: ['STUDENT'] },
  { text: 'Thanh toán học phí', icon: <PaymentIcon />, path: '/student/payments', roles: ['STUDENT', 'LEAD'] },
  { text: 'Hóa đơn học phí', icon: <ReceiptLongIcon />, path: '/student/invoices', roles: ['STUDENT'] },

  { text: 'Thống kê tài chính', icon: <BarChartIcon />, path: '/finance/dashboard', roles: ['ACCOUNTANT'] },
  { text: 'Nghiệp vụ kế toán', icon: <ReceiptLongIcon />, path: '/finance/operations', roles: ['ACCOUNTANT'] },
  { text: 'Theo dõi công nợ', icon: <BarChartIcon />, path: '/finance/debts', roles: ['ACCOUNTANT'] },
  { text: 'Chi trả giảng viên', icon: <PaymentIcon />, path: '/finance/teacher-payments', roles: ['ACCOUNTANT'] },

  { text: 'Hồ sơ cá nhân', icon: <PersonIcon />, path: '/profile', roles: ['MANAGER', 'TEACHER', 'STUDENT', 'ACCOUNTANT', 'LEAD'] },
];

interface DashboardSidebarProps {
  open: boolean;
  onClose: () => void;
  onToggle: () => void;
  drawerWidth: number;
  isMobile: boolean;
}

const CLOSED_DRAWER_WIDTH = 80;

export default function DashboardSidebar({ open, onClose, onToggle, drawerWidth, isMobile }: DashboardSidebarProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const theme = useTheme();
  const user = useSelector((state: RootState) => state.auth.user);

  const filteredMenuItems = menuItems.filter(item =>
    user && item.roles.includes(user.role)
  );

  const isActive = (item: MenuItem) => {
    return location.pathname === item.path || (item.path !== '/' && location.pathname.startsWith(item.path));
  };

  const getRoleLabel = (role?: string) => {
    switch (role) {
      case 'MANAGER': return 'Quản trị viên';
      case 'TEACHER': return 'Giảng viên';
      case 'STUDENT': return 'Học viên';
      case 'ACCOUNTANT': return 'Kế toán';
      case 'LEAD': return 'Khách hàng';
      default: return 'Thành viên';
    }
  };

  const drawerContent = (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
      <Box sx={{ 
        p: open ? 2.5 : 1, 
        display: 'flex', 
        flexDirection: 'column',
        alignItems: open ? 'flex-start' : 'center',
        justifyContent: 'center',
        background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.secondary.main} 100%)`,
        color: 'white',
        borderBottom: '2px solid #1E293B',
        minHeight: 100,
        transition: 'all 0.3s ease'
      }}>
        {open ? (
          <Box sx={{ width: '100%', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Box>
              <Typography variant="h6" fontWeight={900} sx={{ letterSpacing: 1, lineHeight: 1.2 }}>
                ELC SYSTEM
              </Typography>
              <Typography variant="caption" sx={{ opacity: 0.9, fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.5 }}>
                {getRoleLabel(user?.role)}
              </Typography>
            </Box>
            {isMobile && (
              <IconButton onClick={onClose} sx={{ color: 'white' }}>
                <ChevronLeftIcon />
              </IconButton>
            )}
          </Box>
        ) : (
          <Typography variant="h6" fontWeight={900} color="inherit">ELC</Typography>
        )}
      </Box>
      
      <Divider />
      
      <Box sx={{ flexGrow: 1, overflowY: 'auto', py: 2, overflowX: 'hidden' }}>
        <List sx={{ px: open ? 1.5 : 1 }}>
          {filteredMenuItems.map((item) => (
            <ListItem key={item.path} disablePadding sx={{ mb: 0.5 }}>
              <Tooltip title={!open ? item.text : ""} placement="right">
                <ListItemButton
                  selected={isActive(item)}
                  onClick={() => {
                    navigate(item.path);
                    if (isMobile) onClose();
                  }}
                  sx={{
                    borderRadius: 999,
                    py: 1.5,
                    minHeight: 48,
                    justifyContent: open ? 'initial' : 'center',
                    px: open ? 2.5 : 2.5,
                    border: '2px solid transparent',
                    transition: 'all 260ms cubic-bezier(0.34, 1.56, 0.64, 1)',
                    '&.Mui-selected': {
                      bgcolor: 'primary.main',
                      color: 'white',
                      borderColor: '#1E293B',
                      boxShadow: '4px 4px 0 #1E293B',
                      '&:hover': { bgcolor: 'primary.main' },
                      '& .MuiListItemIcon-root': { color: 'white' }
                    },
                    '&:hover': {
                      bgcolor: 'rgba(251, 191, 36, 0.35)',
                      borderColor: '#1E293B',
                    }
                  }}
                >
                  <ListItemIcon sx={{ 
                    minWidth: 0,
                    mr: open ? 2 : 'auto',
                    justifyContent: 'center',
                    color: isActive(item) ? 'white' : 'text.secondary',
                    transition: 'color 0.2s'
                  }}>
                    {item.icon}
                  </ListItemIcon>
                  {open && (
                    <ListItemText 
                      primary={item.text} 
                      primaryTypographyProps={{ 
                        fontWeight: isActive(item) ? 800 : 600,
                        fontSize: '0.875rem',
                        noWrap: true
                      }} 
                    />
                  )}
                </ListItemButton>
              </Tooltip>
            </ListItem>
          ))}
        </List>
      </Box>

      {/* Toggle Button for Desktop */}
      {!isMobile && (
        <Box sx={{ p: 1, display: 'flex', justifyContent: 'center' }}>
          <IconButton 
            onClick={onToggle}
            sx={{ 
              bgcolor: '#FFFFFF', 
              border: '2px solid #1E293B',
              boxShadow: '3px 3px 0 #1E293B',
              '&:hover': { bgcolor: '#FBBF24' },
              borderRadius: 3
            }}
          >
            {open ? <ChevronLeftIcon /> : <ChevronRightIcon />}
          </IconButton>
        </Box>
      )}

      <Box sx={{ p: 2, bgcolor: '#FFF7DF', borderTop: '2px solid #1E293B', textAlign: 'center' }}>
        <Typography variant="caption" color="text.secondary" sx={{ fontSize: '10px', fontWeight: 600 }}>
          {open ? 'VERSION 1.4.0' : 'V1.4'}
        </Typography>
      </Box>
    </Box>
  );

  return (
    <Drawer
      variant={isMobile ? 'temporary' : 'permanent'}
      open={open}
      onClose={onClose}
      sx={{
        width: open ? drawerWidth : CLOSED_DRAWER_WIDTH,
        flexShrink: 0,
        whiteSpace: 'nowrap',
        boxSizing: 'border-box',
        '& .MuiDrawer-paper': {
          width: open ? drawerWidth : CLOSED_DRAWER_WIDTH,
          transition: theme.transitions.create('width', {
            easing: theme.transitions.easing.sharp,
            duration: theme.transitions.duration.enteringScreen,
          }),
          overflowX: 'hidden',
          borderRight: '1px solid rgba(0,0,0,0.08)',
          borderRightColor: '#1E293B',
          borderRightWidth: 2,
          borderRadius: '0 !important',
          bgcolor: '#FFFDF5',
          boxShadow: '4px 0 0 #1E293B',
        },
      }}
    >
      {drawerContent}
    </Drawer>
  );
}
