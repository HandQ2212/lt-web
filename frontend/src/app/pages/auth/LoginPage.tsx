import { useState } from 'react';
import { useNavigate, Link as RouterLink } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { Box, Container, Paper, TextField, Button, Typography, Link, Checkbox, FormControlLabel, Alert } from '@mui/material';
import { useTranslation } from 'react-i18next';
import { authApi } from '../../../services/api';
import { setCredentials } from '../../../store/slices/authSlice';

export default function LoginPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const { token, refreshToken, user } = await authApi.login(email, password);

      if (rememberMe) {
        localStorage.setItem('refreshToken', refreshToken);
      }

      dispatch(setCredentials({ user, token }));

      const redirectMap: Record<string, string> = {
        ADMIN: '/admin/users',
        MANAGER: '/admin/users',
        TEACHER: '/teacher/schedule',
        STUDENT: '/student/courses',
        ACCOUNTANT: '/finance/dashboard',
      };

      navigate(redirectMap[user.role] || '/dashboard');
    } catch (err: any) {
      setError(err.response?.data?.message || t('auth.loginError'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        bgcolor: '#f5f5f5',
      }}
    >
      <Container maxWidth="sm">
        <Paper elevation={3} sx={{ p: 4 }}>
          <Typography variant="h4" align="center" gutterBottom fontWeight={700} color="primary">
            {t('common.login')}
          </Typography>
          <Typography variant="body2" align="center" color="text.secondary" sx={{ mb: 3 }}>
            Đăng nhập vào hệ thống ELC
          </Typography>

          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}

          <form onSubmit={handleSubmit}>
            <TextField
              fullWidth
              label={t('auth.email')}
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              margin="normal"
              required
              autoFocus
            />
            <TextField
              fullWidth
              label={t('auth.password')}
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              margin="normal"
              required
            />

            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 1 }}>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    color="primary"
                  />
                }
                label={t('auth.rememberMe')}
              />
              <Link component={RouterLink} to="/forgot-password" variant="body2">
                {t('auth.forgotPassword')}
              </Link>
            </Box>

            <Button
              type="submit"
              fullWidth
              variant="contained"
              size="large"
              sx={{ mt: 3, mb: 2 }}
              disabled={loading}
            >
              {loading ? 'Đang đăng nhập...' : t('common.login')}
            </Button>

            <Typography variant="body2" align="center">
              {t('auth.noAccount')}{' '}
              <Link component={RouterLink} to="/register">
                {t('common.register')}
              </Link>
            </Typography>
          </form>
        </Paper>
      </Container>
    </Box>
  );
}
