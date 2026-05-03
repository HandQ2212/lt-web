import { AppBar, Toolbar, Typography, Button, Box, Container } from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

export default function PublicHeader() {
  const { t } = useTranslation();

  return (
    <AppBar position="static" elevation={1} sx={{ bgcolor: 'white', color: 'primary.main' }}>
      <Container maxWidth="lg">
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

          <Box sx={{ display: 'flex', gap: 1 }}>
            <Button component={RouterLink} to="/login" variant="outlined">
              {t('common.login')}
            </Button>
            <Button component={RouterLink} to="/register" variant="contained">
              {t('common.register')}
            </Button>
          </Box>
        </Toolbar>
      </Container>
    </AppBar>
  );
}
