import { Box, Toolbar, useMediaQuery, useTheme } from '@mui/material';
import { useState, useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import DashboardSidebar from './DashboardSidebar';
import DashboardHeader from './DashboardHeader';
import ChatWidget from '../ChatWidget';

const DRAWER_WIDTH = 280;
const CLOSED_DRAWER_WIDTH = 80;

export default function DashboardLayout() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  
  // On desktop, default to open. On mobile, default to closed.
  const [sidebarOpen, setSidebarOpen] = useState(!isMobile);

  useEffect(() => {
    // If screen size changes to mobile, close sidebar
    if (isMobile) {
      setSidebarOpen(false);
    } else {
      setSidebarOpen(true);
    }
  }, [isMobile]);

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const handleSidebarClose = () => {
    if (isMobile) {
      setSidebarOpen(false);
    }
  };

  return (
    <Box
      sx={{
        display: 'flex',
        minHeight: '100vh',
        background:
          'radial-gradient(circle at top right, rgba(29, 78, 216, 0.08), transparent 30%), radial-gradient(circle at left top, rgba(15, 118, 110, 0.06), transparent 24%), linear-gradient(180deg, #f7faff 0%, #eef3f9 100%)',
      }}
    >
      <DashboardHeader 
        onMenuClick={toggleSidebar} 
        // Header should shift according to sidebar width on desktop
        drawerWidth={isMobile ? 0 : (sidebarOpen ? DRAWER_WIDTH : CLOSED_DRAWER_WIDTH)} 
      />
      
      <DashboardSidebar 
        open={sidebarOpen} 
        onClose={handleSidebarClose}
        onToggle={toggleSidebar}
        drawerWidth={DRAWER_WIDTH}
        isMobile={isMobile}
      />
      
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          width: { 
            xs: '100%', 
            md: sidebarOpen ? `calc(100% - ${DRAWER_WIDTH}px)` : `calc(100% - ${CLOSED_DRAWER_WIDTH}px)` 
          },
          ml: {
            xs: 0,
            // On desktop, the permanent drawer takes space
            // md: sidebarOpen ? `${DRAWER_WIDTH}px` : `${CLOSED_DRAWER_WIDTH}px`
            // Wait, if it's "permanent" variant in Sidebar, the parent Box display: flex handles the layout
          },
          transition: theme.transitions.create(['margin', 'width'], {
            easing: theme.transitions.easing.sharp,
            duration: theme.transitions.duration.leavingScreen,
          }),
          minHeight: '100vh',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
        }}
      >
        <Toolbar />
        <Box
          sx={{
            p: { xs: 2, sm: 3, md: 4, lg: 5 },
            flexGrow: 1,
            overflowY: 'auto',
            position: 'relative',
          }}
        >
          <Box
            aria-hidden
            sx={{
              position: 'absolute',
              inset: 0,
              pointerEvents: 'none',
              background:
                'linear-gradient(180deg, rgba(255,255,255,0.42), rgba(255,255,255,0)), radial-gradient(circle at 100% 0%, rgba(29, 78, 216, 0.06), transparent 20%)',
            }}
          />
          <Box sx={{ position: 'relative', zIndex: 1 }}>
            <Outlet />
          </Box>
        </Box>
      </Box>
      <ChatWidget />
    </Box>
  );
}
