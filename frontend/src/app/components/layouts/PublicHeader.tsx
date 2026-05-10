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
    <AppBar position="static" elevation={0} sx={{ bgcolor: 'white', color: 'primary.main', borderBottom: '1px solid rgba(0,0,0,0.05)' }}>
      <Container maxWidth="xl">
        <Toolbar disableGutters>
          <Typography
            variant="h6"
            component={RouterLink}
            to="/"
            sx={{ flexGrow: 0, mr: 4, textDecoration: 'none', color: 'inherit', fontWeight: 700 }}
          >
            ELC English Center
          </Typography>

          <Box sx={{ flexGrow: 1, display: 'flex', gap: 3 }}>
            <Button component={RouterLink} to="/" color="inherit">
              {t('nav.home')}
            </Button>
            <Button component={RouterLink} to="/courses" color="inherit">
              {t('nav.courses')}
            </Button>
            <Button component={RouterLink} to="/teachers" color="inherit">
              {t('nav.teachers')}
            </Button>
            <Button component={RouterLink} to="/contact" color="inherit">
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
                  sx={{ mr: 1 }}
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
                <Button component={RouterLink} to="/login" variant="outlined">
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
