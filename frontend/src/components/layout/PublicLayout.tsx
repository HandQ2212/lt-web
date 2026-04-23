import { AppBar, Box, Button, Container, Toolbar, Typography } from '@mui/material';
import { Outlet, useNavigate } from 'react-router-dom';
import SchoolIcon from '@mui/icons-material/School';

const PublicLayout = () => {
  const navigate = useNavigate();

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <AppBar position="static" color="inherit" elevation={1}>
        <Container maxWidth="xl">
          <Toolbar disableGutters>
            <SchoolIcon sx={{ display: 'flex', mr: 1, color: 'primary.main' }} />
            <Typography
              variant="h6"
              noWrap
              component="div"
              sx={{ flexGrow: 1, cursor: 'pointer', fontWeight: 'bold' }}
              onClick={() => navigate('/')}
            >
              ELC System
            </Typography>
            <Box sx={{ display: 'flex', gap: 2 }}>
              <Button color="inherit" onClick={() => navigate('/courses')}>Courses</Button>
              <Button color="inherit" onClick={() => navigate('/register')}>Register</Button>
              <Button variant="contained" color="primary" onClick={() => navigate('/login')}>
                Login
              </Button>
            </Box>
          </Toolbar>
        </Container>
      </AppBar>

      <Box component="main" sx={{ flexGrow: 1 }}>
        <Outlet />
      </Box>

      <Box component="footer" sx={{ py: 3, px: 2, mt: 'auto', backgroundColor: '#1565c0', color: 'white' }}>
        <Container maxWidth="xl">
          <Typography variant="body2" align="center">
            © {new Date().getFullYear()} English Language Center Management System. All rights reserved.
          </Typography>
        </Container>
      </Box>
    </Box>
  );
};

export default PublicLayout;
