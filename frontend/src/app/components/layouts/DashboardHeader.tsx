import { AppBar, Toolbar, Typography, IconButton, Badge, Menu, MenuItem, Avatar, Box } from '@mui/material';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../../../store';
import { logout } from '../../../store/slices/authSlice';
import { authApi } from '../../../services/api';
import NotificationsIcon from '@mui/icons-material/Notifications';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import LogoutIcon from '@mui/icons-material/Logout';

const drawerWidth = 260;

export default function DashboardHeader() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const user = useSelector((state: RootState) => state.auth.user);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

  const handleProfileMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = async () => {
    try {
      const refreshToken = localStorage.getItem('refreshToken');
      if (refreshToken) {
        await authApi.logout(refreshToken);
      }
    } catch {
      // Force local logout even when backend token is expired.
    } finally {
      dispatch(logout());
      navigate('/login');
    }
  };

  return (
    <AppBar
      position="fixed"
      sx={{
        width: `calc(100% - ${drawerWidth}px)`,
        ml: `${drawerWidth}px`,
        bgcolor: 'white',
        color: 'text.primary',
        boxShadow: 1,
      }}
    >
      <Toolbar>
        <Typography variant="h6" noWrap component="div" sx={{ flexGrow: 1 }}>
          Chào mừng, {user?.name}
        </Typography>

        <Box sx={{ display: 'flex', gap: 1 }}>
          <IconButton color="inherit">
            <Badge badgeContent={3} color="error">
              <NotificationsIcon />
            </Badge>
          </IconButton>

          <IconButton onClick={handleProfileMenuOpen} color="inherit">
            <Avatar sx={{ width: 32, height: 32 }}>
              {(user?.name?.charAt(0) || 'U').toUpperCase()}
            </Avatar>
          </IconButton>
        </Box>

        <Menu
          anchorEl={anchorEl}
          open={Boolean(anchorEl)}
          onClose={handleMenuClose}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
          transformOrigin={{ vertical: 'top', horizontal: 'right' }}
        >
          <MenuItem onClick={() => { navigate('/profile'); handleMenuClose(); }}>
            <AccountCircleIcon sx={{ mr: 1 }} /> Hồ sơ
          </MenuItem>
          <MenuItem onClick={handleLogout}>
            <LogoutIcon sx={{ mr: 1 }} /> Đăng xuất
          </MenuItem>
        </Menu>
      </Toolbar>
    </AppBar>
  );
}
