import { useEffect } from 'react';
import { AppBar, Toolbar, Typography, IconButton, Badge, Menu, MenuItem, Avatar, Box, useTheme, Dialog, DialogTitle, DialogContent, DialogActions, Button, Divider, Chip } from '@mui/material';
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
  const [selectedNotification, setSelectedNotification] = useState<any | null>(null);
  const [notifDialogOpen, setNotifDialogOpen] = useState(false);

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

  const openNotificationDetail = async (notif: any) => {
    let nextNotification = notif;
    try {
      // mark as read if not already
      if (notif && !notif.read && notif.id) {
        await notificationApi.markAsRead(notif.id);
        nextNotification = { ...notif, read: true };
        setUnreadCount((c) => Math.max(0, c - 1));
        setNotifications((prev) => prev.map((n) => (n.id === notif.id ? { ...n, read: true } : n)));
      }
    } catch (err) {
      console.error('Failed to mark notification as read:', err);
    }

    setSelectedNotification(nextNotification);
    setNotifDialogOpen(true);
    setNotifAnchorEl(null);
  };

  const closeNotificationDialog = () => {
    setNotifDialogOpen(false);
    setSelectedNotification(null);
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
        bgcolor: 'rgba(255, 253, 245, 0.9)',
        backdropFilter: 'blur(12px)',
        color: 'text.primary',
        boxShadow: '0 2px 0 #1E293B',
        borderBottom: '2px solid #1E293B',
        borderRadius: '0 !important',
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
            bgcolor: '#FFFFFF',
            border: '2px solid #1E293B',
            boxShadow: '3px 3px 0 #1E293B',
            '&:hover': { bgcolor: '#FBBF24' }
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
              border: '2px solid transparent',
              transition: 'all 0.2s',
              '&:hover': { bgcolor: '#FFFFFF', borderColor: '#1E293B', boxShadow: '3px 3px 0 #1E293B' }
            }}
          >
            <Avatar 
              src={user?.avatarUrl} 
              sx={{ 
                width: 36, 
                height: 36, 
                border: '2px solid white',
                boxShadow: '3px 3px 0 #1E293B' 
              }}
            >
              {(user?.fullName?.charAt(0) || 'U').toUpperCase()}
            </Avatar>
            <Box sx={{ display: { xs: 'none', sm: 'flex' }, flexDirection: 'column', minWidth: 0 }}>
              <Typography variant="subtitle2" fontWeight={700} lineHeight={1.15} noWrap>
                {user?.fullName}
              </Typography>
              <Typography variant="caption" color="text.secondary" lineHeight={1.2} noWrap>
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
                border: '2px solid #1E293B',
                boxShadow: '6px 6px 0 #1E293B'
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
                <MenuItem key={index} onClick={() => openNotificationDetail(notif)} sx={{ px: 2, py: 1.5, whiteSpace: 'normal', borderBottom: '1px solid rgba(0,0,0,0.05)', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 1 }}>
                  <Box sx={{ minWidth: 0, flexGrow: 1 }}>
                    <Typography variant="body2" fontWeight={notif.read ? 500 : 800} color={notif.read ? 'text.secondary' : 'text.primary'} sx={{ mb: 0.5 }}>{notif.title || notif.message}</Typography>
                    <Typography variant="caption" color="text.secondary" display="block">
                      {new Date(notif.createdAt).toLocaleString('vi-VN')}
                    </Typography>
                  </Box>
                  <Chip size="small" label={notif.read ? 'Đã xem' : 'Chưa xem'} color={notif.read ? 'default' : 'primary'} sx={{ height: 20, fontSize: '0.65rem', fontWeight: 700 }} />
                </MenuItem>
              ))}
              <MenuItem onClick={() => { 
                navigate('/notifications'); 
                handleNotificationMenuClose(); 
              }} sx={{ justifyContent: 'center', py: 1.5, bgcolor: 'rgba(29, 78, 216, 0.02)' }}>
                <Typography variant="caption" fontWeight={800} color="primary.main">Xem tất cả thông báo</Typography>
              </MenuItem>
            </>
          )}
        </Menu>

          {/* Notification Detail Dialog */}
          <Dialog open={notifDialogOpen} onClose={closeNotificationDialog} fullWidth maxWidth="sm" PaperProps={{ sx: { borderRadius: 4, overflow: 'hidden' } }}>
            <DialogTitle sx={{ fontWeight: 900, bgcolor: 'primary.main', color: 'white', pb: 2, borderBottom: '2px solid #1E293B' }}>
              {selectedNotification?.title || 'Chi tiết thông báo'}
            </DialogTitle>
            <DialogContent sx={{ p: 4 }}>
              <Box sx={{ mb: 3 }}>
                <Chip size="small" label={selectedNotification?.read ? 'Đã xem' : 'Chưa xem'} color={selectedNotification?.read ? 'default' : 'primary'} sx={{ fontWeight: 700, mb: 1.5 }} />
                <Typography variant="body1" sx={{ whiteSpace: 'pre-line', color: 'text.primary', lineHeight: 1.7, fontSize: '1.05rem' }}>
                  {selectedNotification?.message || '-'}
                </Typography>
              </Box>
              <Divider sx={{ my: 2 }} />
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography variant="caption" color="text.secondary" fontWeight={600}>
                  Gửi bởi: <Box component="span" sx={{ color: 'text.primary', fontWeight: 700 }}>{selectedNotification?.createdByFullName || 'Hệ thống'}</Box>
                </Typography>
                <Typography variant="caption" color="text.secondary" fontWeight={600}>
                  {selectedNotification?.createdAt ? new Date(selectedNotification.createdAt).toLocaleString('vi-VN') : ''}
                </Typography>
              </Box>
            </DialogContent>
            <DialogActions sx={{ px: 3, py: 2, bgcolor: '#FFF7DF', borderTop: '2px solid #1E293B' }}>
              <Button variant="contained" onClick={closeNotificationDialog} sx={{ fontWeight: 700, px: 3, borderRadius: 2 }}>Đã hiểu</Button>
            </DialogActions>
          </Dialog>

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
                border: '2px solid #1E293B',
                boxShadow: '6px 6px 0 #1E293B'
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
