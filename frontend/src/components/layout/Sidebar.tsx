import { Box, Drawer, List, ListItem, ListItemButton, ListItemIcon, ListItemText, Typography } from '@mui/material';
import { useSelector } from 'react-redux';
import type {  RootState  } from '../../app/store';
import { useNavigate, useLocation } from 'react-router-dom';
import DashboardIcon from '@mui/icons-material/Dashboard';
import PeopleIcon from '@mui/icons-material/People';
import LibraryBooksIcon from '@mui/icons-material/LibraryBooks';
import ClassIcon from '@mui/icons-material/Class';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import AssignmentIcon from '@mui/icons-material/Assignment';
import FactCheckIcon from '@mui/icons-material/FactCheck';
import MenuBookIcon from '@mui/icons-material/MenuBook';
import ReceiptIcon from '@mui/icons-material/Receipt';
import PaymentIcon from '@mui/icons-material/Payment';
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet';

const drawerWidth = 260;

const Sidebar = () => {
  const { user } = useSelector((state: RootState) => state.auth);
  const navigate = useNavigate();
  const location = useLocation();

  const getMenuItems = () => {
    switch (user?.role) {
      case 'MANAGER':
        return [
          { text: 'Dashboard', icon: <DashboardIcon />, path: '/manager/dashboard' },
          { text: 'Users', icon: <PeopleIcon />, path: '/manager/users' },
          { text: 'Courses', icon: <LibraryBooksIcon />, path: '/manager/courses' },
          { text: 'Classes', icon: <ClassIcon />, path: '/manager/classes' },
          { text: 'CRM Pipeline', icon: <PeopleIcon />, path: '/manager/crm' },
        ];
      case 'TEACHER':
        return [
          { text: 'Dashboard', icon: <DashboardIcon />, path: '/teacher/dashboard' },
          { text: 'My Classes', icon: <ClassIcon />, path: '/teacher/classes' },
          { text: 'Attendance', icon: <FactCheckIcon />, path: '/teacher/attendance' },
          { text: 'Assignments', icon: <AssignmentIcon />, path: '/teacher/assignments' },
        ];
      case 'STUDENT':
        return [
          { text: 'Dashboard', icon: <DashboardIcon />, path: '/student/dashboard' },
          { text: 'Schedule', icon: <CalendarMonthIcon />, path: '/student/schedule' },
          { text: 'Gradebook', icon: <MenuBookIcon />, path: '/student/gradebook' },
          { text: 'Invoices', icon: <ReceiptIcon />, path: '/student/invoices' },
        ];
      case 'ACCOUNTANT':
        return [
          { text: 'Dashboard', icon: <DashboardIcon />, path: '/accountant/dashboard' },
          { text: 'Invoices', icon: <AttachMoneyIcon />, path: '/accountant/invoices' },
          { text: 'Payroll', icon: <PaymentIcon />, path: '/accountant/payroll' },
          { text: 'Expenses', icon: <AccountBalanceWalletIcon />, path: '/accountant/expenses' },
        ];
      default:
        return [];
    }
  };

  const menuItems = getMenuItems();

  return (
    <Drawer
      variant="permanent"
      sx={{
        width: drawerWidth,
        flexShrink: 0,
        [`& .MuiDrawer-paper`]: { width: drawerWidth, boxSizing: 'border-box', backgroundColor: '#1565c0', color: 'white' },
      }}
    >
      <Box sx={{ p: 3, borderBottom: '1px solid rgba(255, 255, 255, 0.12)' }}>
        <Typography variant="h5" sx={{ fontWeight: "bold" }}>ELC System</Typography>
        <Typography variant="body2" sx={{ opacity: 0.7 }}>{user?.role} Portal</Typography>
      </Box>
      <List>
        {menuItems.map((item) => (
          <ListItem key={item.text} disablePadding>
            <ListItemButton
              selected={location.pathname === item.path}
              onClick={() => navigate(item.path)}
              sx={{
                '&.Mui-selected': {
                  backgroundColor: 'rgba(255, 255, 255, 0.2)',
                  '&:hover': {
                    backgroundColor: 'rgba(255, 255, 255, 0.3)',
                  }
                },
                '&:hover': {
                  backgroundColor: 'rgba(255, 255, 255, 0.1)',
                }
              }}
            >
              <ListItemIcon sx={{ color: 'white' }}>{item.icon}</ListItemIcon>
              <ListItemText primary={item.text} />
            </ListItemButton>
          </ListItem>
        ))}
      </List>
    </Drawer>
  );
};

export default Sidebar;
