import { Box, Toolbar } from '@mui/material';
import { Outlet } from 'react-router-dom';
import DashboardSidebar from './DashboardSidebar';
import DashboardHeader from './DashboardHeader';

const drawerWidth = 260;

export default function DashboardLayout() {
  return (
    <Box sx={{ display: 'flex' }}>
      <DashboardSidebar />
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          width: `calc(100% - ${drawerWidth}px)`,
          minHeight: '100vh',
          bgcolor: '#f5f5f5',
        }}
      >
        <DashboardHeader />
        <Toolbar />
        <Box sx={{ p: 3 }}>
          <Outlet />
        </Box>
      </Box>
    </Box>
  );
}
