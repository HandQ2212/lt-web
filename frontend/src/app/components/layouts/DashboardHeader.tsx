import { useEffect } from 'react';
import { AppBar, Toolbar, Typography, IconButton, Badge, Menu, MenuItem, Avatar, Box, useTheme } from '@mui/material';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../../../store';
import { logout } from '../../../store/slices/authSlice';
import { authApi, notificationApi } from '../../../services/api';
import {
  Notifications as NotificationsIcon,
  AccountCircle as AccountCircleIcon,
  Logout as LogoutIcon,
  Menu as MenuIcon,
} from '@mui/icons-material';

interface DashboardHeaderProps {
  onMenuClick: () => void;
  drawerWidth: number;
}

export default function DashboardHeader({ onMenuClick, drawerWidth }: DashboardHeaderProps) {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const theme = useTheme();
  const user = useSelector((state: RootState) => state.auth.user);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [notifAnchorEl, setNotifAnchorEl] = useState<null | HTMLElement>(null);
  const [unreadCount, setUnreadCount] = useState(0);
  const [notifications, setNotifications] = useState<any[]>([]);

  useEffect(() => {
    void fetchNotifications();
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
      // Force local logout
    } finally {
      dispatch(logout());
      navigate('/login');
    }
  };

  return (
    <AppBar
      position="fixed"
      sx={{
        width: { md: `calc(100% - ${drawerWidth}px)` },
        ml: { md: `${drawerWidth}px` },
        bgcolor: 'rgba(255, 255, 255, 0.9)',
        backdropFilter: 'blur(8px)',
        color: 'text.primary',
        boxShadow: '0 1px 4px rgba(0,0,0,0.05)',
        transition: theme.transitions.create(['margin', 'width'], {
          easing: theme.transitions.easing.sharp,
          duration: theme.transitions.duration.leavingScreen,
        }),
      }}
    >
      <Toolbar sx={{ justifyContent: 'space-between' }}>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <IconButton
            color="inherit"
            aria-label="open drawer"
            onClick={onMenuClick}
            edge="start"
            sx={{ mr: 2, display: { md: 'none' } }}
          >
            <MenuIcon />
          </IconButton>
          <Typography variant="h6" noWrap component="div" fontWeight={700} sx={{ display: { xs: 'none', sm: 'block' } }}>
            Xin chào, {user?.fullName}
          </Typography>
        </Box>

        <Box sx={{ display: 'flex', gap: 1.5, alignItems: 'center' }}>
          <IconButton onClick={handleNotificationMenuOpen} sx={{ 
            bgcolor: 'rgba(0,0,0,0.03)',
            '&:hover': { bgcolor: 'rgba(0,0,0,0.06)' }
          }}>
            <Badge badgeContent={unreadCount} color="error">
              <NotificationsIcon fontSize="small" />
            </Badge>
          </IconButton>

          <Box 
            onClick={handleProfileMenuOpen}
            sx={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: 1.5, 
              cursor: 'pointer',
              ml: 1,
              p: 0.5,
              pr: 1.5,
              borderRadius: 8,
              transition: 'all 0.2s',
              '&:hover': { bgcolor: 'rgba(0,0,0,0.04)' }
            }}
          >
            <Avatar 
              src={user?.avatarUrl} 
              sx={{ 
                width: 36, 
                height: 36, 
                border: '2px solid white',
                boxShadow: '0 2px 8px rgba(0,0,0,0.1)' 
              }}
            >
              {(user?.fullName?.charAt(0) || 'U').toUpperCase()}
            </Avatar>
            <Box sx={{ display: { xs: 'none', lg: 'block' } }}>
              <Typography variant="subtitle2" fontWeight={700} lineHeight={1}>
                {user?.fullName}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {user?.role}
              </Typography>
            </Box>
          </Box>
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
                width: '320px',
                borderRadius: '12px',
                marginTop: '8px',
                boxShadow: '0 10px 40px rgba(0,0,0,0.12)'
              },
            },
          }}
        >
          <Box sx={{ p: 2, pb: 1, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="subtitle1" fontWeight={800}>Thông báo</Typography>
            {unreadCount > 0 && (
              <Typography 
                variant="caption" 
                color="primary" 
                fontWeight={700} 
                sx={{ cursor: 'pointer' }}
                onClick={handleMarkAllAsRead}
              >
                Đánh dấu đã đọc
              </Typography>
            )}
          </Box>
          {notifications.length === 0 ? (
            <MenuItem disabled sx={{ py: 3, justifyContent: 'center' }}>
              <Typography variant="body2" color="text.secondary">Không có thông báo mới</Typography>
            </MenuItem>
          ) : (
            <>
              {notifications.slice(0, 5).map((notif, index) => (
                <MenuItem key={index} onClick={handleNotificationMenuClose} sx={{ px: 2, py: 1.5, whiteSpace: 'normal', borderBottom: '1px solid rgba(0,0,0,0.05)' }}>
                  <Box>
                    <Typography variant="body2" fontWeight={notif.read ? 400 : 700}>{notif.message || notif.title}</Typography>
                    <Typography variant="caption" color="text.secondary">
                      {new Date(notif.createdAt).toLocaleString('vi-VN')}
                    </Typography>
                  </Box>
                </MenuItem>
              ))}
              <MenuItem onClick={() => navigate('/notifications')} sx={{ justifyContent: 'center', py: 1 }}>
                <Typography variant="caption" fontWeight={700} color="primary">Xem tất cả thông báo</Typography>
              </MenuItem>
            </>
          )}
        </Menu>

        <Menu
          anchorEl={anchorEl}
          open={Boolean(anchorEl)}
          onClose={handleMenuClose}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
          transformOrigin={{ vertical: 'top', horizontal: 'right' }}
          slotProps={{
            paper: {
              style: {
                width: '200px',
                borderRadius: '12px',
                marginTop: '8px',
                boxShadow: '0 10px 40px rgba(0,0,0,0.12)'
              },
            },
          }}
        >
          <MenuItem onClick={() => { navigate('/profile'); handleMenuClose(); }} sx={{ py: 1.2 }}>
            <AccountCircleIcon sx={{ mr: 1.5, fontSize: 20, color: 'text.secondary' }} /> Thông tin cá nhân
          </MenuItem>
          <MenuItem onClick={handleLogout} sx={{ py: 1.2, color: 'error.main' }}>
            <LogoutIcon sx={{ mr: 1.5, fontSize: 20 }} /> Đăng xuất
          </MenuItem>
        </Menu>
      </Toolbar>
    </AppBar>
  );
}
