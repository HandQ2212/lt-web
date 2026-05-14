import { AppBar, Toolbar, Typography, Button, Box, Container, IconButton, Avatar, Menu, MenuItem } from '@mui/material';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useDispatch, useSelector } from 'react-redux';
import { useState } from 'react';
import { RootState } from '../../../store';
import { logout } from '../../../store/slices/authSlice';
import { getDefaultRouteByRole } from '../../utils/roleRouting';

export default function PublicHeader() {
  const { t } = useTranslation();
  const { user } = useSelector((state: RootState) => state.auth);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

  const handleMenu = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = () => {
    dispatch(logout());
    handleClose();
    navigate('/login');
  };

  return (
    <AppBar
      position="sticky"
      elevation={0}
      sx={{
        top: 0,
        zIndex: 1100,
        bgcolor: 'rgba(255, 253, 245, 0.92)',
        color: 'text.primary',
        borderBottom: '2px solid #1E293B',
        backdropFilter: 'blur(12px)',
      }}
    >
      <Container maxWidth="xl">
        <Toolbar disableGutters sx={{ minHeight: { xs: 68, md: 76 }, gap: 2 }}>
          <Typography
            variant="h6"
            component={RouterLink}
            to="/"
            sx={{
              flexGrow: 0,
              mr: { xs: 1, md: 4 },
              textDecoration: 'none',
              color: 'inherit',
              fontWeight: 900,
              letterSpacing: 0,
              px: 1.5,
              py: 0.75,
              border: '2px solid #1E293B',
              borderRadius: 999,
              bgcolor: '#FFFFFF',
              boxShadow: '3px 3px 0 #1E293B',
              whiteSpace: 'nowrap',
            }}
          >
            ELC English Center
          </Typography>

          <Box sx={{ flexGrow: 1, display: { xs: 'none', md: 'flex' }, gap: 1 }}>
            <Button component={RouterLink} to="/" color="inherit" sx={{ px: 2 }}>
              {t('nav.home')}
            </Button>
            <Button component={RouterLink} to="/courses" color="inherit" sx={{ px: 2 }}>
              {t('nav.courses')}
            </Button>
            <Button component={RouterLink} to="/teachers" color="inherit" sx={{ px: 2 }}>
              {t('nav.teachers')}
            </Button>
            <Button component={RouterLink} to="/contact" color="inherit" sx={{ px: 2 }}>
              {t('nav.contact')}
            </Button>
          </Box>

          <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
            {user ? (
              <>
                <Button
                  component={RouterLink}
                  to={getDefaultRouteByRole(user.role)}
                  variant="outlined"
                  sx={{ mr: 1, bgcolor: '#FFFFFF' }}
                >
                  Dashboard
                </Button>
                <IconButton onClick={handleMenu} color="inherit">
                  <Avatar sx={{ width: 32, height: 32, bgcolor: 'primary.main', fontSize: '0.875rem' }}>
                    {user.fullName.charAt(0).toUpperCase()}
                  </Avatar>
                </IconButton>
                <Menu
                  anchorEl={anchorEl}
                  open={Boolean(anchorEl)}
                  onClose={handleClose}
                  anchorOrigin={{
                    vertical: 'bottom',
                    horizontal: 'right',
                  }}
                  transformOrigin={{
                    vertical: 'top',
                    horizontal: 'right',
                  }}
                >
                  <MenuItem component={RouterLink} to="/profile" onClick={handleClose}>
                    Hồ sơ cá nhân
                  </MenuItem>
                  {user.role === 'STUDENT' && (
                    <MenuItem component={RouterLink} to="/student/payments" onClick={handleClose}>
                      Học phí
                    </MenuItem>
                  )}
                  <MenuItem onClick={handleLogout}>Đăng xuất</MenuItem>
                </Menu>
              </>
            ) : (
              <>
                <Button component={RouterLink} to="/login" variant="outlined" sx={{ bgcolor: '#FFFFFF' }}>
                  {t('common.login')}
                </Button>
                <Button component={RouterLink} to="/register" variant="contained">
                  {t('common.register')}
                </Button>
              </>
            )}
          </Box>
        </Toolbar>
      </Container>
    </AppBar>
  );
}
