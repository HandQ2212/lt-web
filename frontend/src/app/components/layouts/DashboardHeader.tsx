import { useEffect } from 'react';
import { AppBar, Toolbar, Typography, IconButton, Badge, Menu, MenuItem, Avatar, Box } from '@mui/material';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../../../store';
import { logout } from '../../../store/slices/authSlice';
import { authApi, notificationApi } from '../../../services/api';
import NotificationsIcon from '@mui/icons-material/Notifications';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import LogoutIcon from '@mui/icons-material/Logout';

const drawerWidth = 260;

export default function DashboardHeader() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const user = useSelector((state: RootState) => state.auth.user);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [notifAnchorEl, setNotifAnchorEl] = useState<null | HTMLElement>(null);
  const [unreadCount, setUnreadCount] = useState(0);
  const [notifications, setNotifications] = useState<any[]>([]);

  useEffect(() => {
    void fetchNotifications();
    // Polling interval: refresh every 30 seconds
    const interval = setInterval(() => {
      void fetchNotifications();
    }, 30000);
    return () => clearInterval(interval);
  }, []);

  const fetchNotifications = async () => {
    try {
      const countRes = await notificationApi.getUnreadCount();
      setUnreadCount(Number(countRes?.data?.count || 0));

      const allNotifs = await notificationApi.getAll();
      if (allNotifs?.data && Array.isArray(allNotifs.data)) {
        setNotifications(allNotifs.data);
      }
    } catch (err) {
      console.error('Failed to fetch notifications:', err);
    }
  };

  const handleProfileMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleNotificationMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setNotifAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleNotificationMenuClose = () => {
    setNotifAnchorEl(null);
  };

  const handleMarkAllAsRead = async () => {
    try {
      await notificationApi.markAllAsRead();
      setUnreadCount(0);
      handleNotificationMenuClose();
      void fetchNotifications();
    } catch (err) {
      console.error('Failed to mark all as read:', err);
    }
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
          <IconButton onClick={handleNotificationMenuOpen} color="inherit">
            <Badge badgeContent={unreadCount} color="error">
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
          anchorEl={notifAnchorEl}
          open={Boolean(notifAnchorEl)}
          onClose={handleNotificationMenuClose}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
          transformOrigin={{ vertical: 'top', horizontal: 'right' }}
          slotProps={{
            paper: {
              style: {
                maxHeight: '400px',
                width: '300px',
              },
            },
          }}
        >
          {notifications.length === 0 ? (
            <MenuItem disabled>Không có thông báo</MenuItem>
          ) : (
            <>
              {notifications.slice(0, 5).map((notif, index) => (
                <MenuItem key={index} onClick={handleNotificationMenuClose} sx={{ whiteSpace: 'normal' }}>
                  <Box>
                    <Typography variant="body2">{notif.message || notif.title}</Typography>
                    <Typography variant="caption" color="text.secondary">
                      {new Date(notif.createdAt).toLocaleDateString('vi-VN')}
                    </Typography>
                  </Box>
                </MenuItem>
              ))}
              {unreadCount > 0 && (
                <MenuItem onClick={handleMarkAllAsRead} sx={{ textAlign: 'center', fontWeight: 600 }}>
                  Đánh dấu tất cả đã đọc
                </MenuItem>
              )}
            </>
          )}
        </Menu>

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
