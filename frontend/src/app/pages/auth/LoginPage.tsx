import { useState } from 'react';
import { useNavigate, Link as RouterLink } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { Box, Container, Paper, TextField, Button, Typography, Link, Checkbox, FormControlLabel, Alert, IconButton, InputAdornment } from '@mui/material';
import { Visibility, VisibilityOff } from '@mui/icons-material';
import { useTranslation } from 'react-i18next';
import { authApi } from '../../../services/api';
import { setCredentials } from '../../../store/slices/authSlice';
import { getDefaultRouteByRole } from '../../utils/roleRouting';

export default function LoginPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const { token, refreshToken, user } = await authApi.login(email, password);

      dispatch(setCredentials({ user, token, refreshToken }));

      navigate(getDefaultRouteByRole(user.role));
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
        bgcolor: '#FFFDF5',
        background:
          'radial-gradient(circle at 20% 18%, rgba(251,191,36,0.34), transparent 18rem), radial-gradient(circle at 82% 18%, rgba(139,92,246,0.18), transparent 18rem), linear-gradient(180deg, #FFFDF5 0%, #FFF7DF 100%)',
      }}
    >
      <Container maxWidth="sm">
        <Paper elevation={3} sx={{ p: 4, borderRadius: 5, border: '2px solid #1E293B', boxShadow: '7px 7px 0 #1E293B' }}>
          <Typography variant="h4" align="center" gutterBottom fontWeight={900} color="primary">
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
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              margin="normal"
              required
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      aria-label={showPassword ? 'Ẩn mật khẩu' : 'Hiển thị mật khẩu'}
                      onClick={() => setShowPassword((current) => !current)}
                      onMouseDown={(event) => event.preventDefault()}
                      edge="end"
                      sx={{ color: 'text.secondary' }}
                    >
                      {showPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
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
              sx={{ mt: 3, mb: 2, borderRadius: 999 }}
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
