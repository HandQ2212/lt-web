import { useState } from 'react';
import { useNavigate, Link as RouterLink } from 'react-router-dom';
import { Box, Container, Paper, TextField, Button, Typography, Link, Alert, Grid } from '@mui/material';
import { useTranslation } from 'react-i18next';
import { authApi } from '../../../services/api';

export default function RegisterPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (formData.password !== formData.confirmPassword) {
      setError('Mật khẩu không khớp');
      return;
    }

    setLoading(true);

    try {
      await authApi.register({
        fullName: formData.name,
        email: formData.email,
        phone: formData.phone,
        password: formData.password,
      });

      setSuccess('Đăng ký thành công! Bạn có thể đăng nhập ngay bây giờ.');
      setTimeout(() => navigate('/login'), 800);
    } catch (err: any) {
      setError(err.response?.data?.message || t('auth.registerError'));
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
            {t('common.register')}
          </Typography>
          <Typography variant="body2" align="center" color="text.secondary" sx={{ mb: 3 }}>
            Tạo tài khoản mới
          </Typography>

          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}

          {success && (
            <Alert severity="success" sx={{ mb: 2 }}>
              {success}
            </Alert>
          )}

          <form onSubmit={handleSubmit}>
            <TextField
              fullWidth
              label="Họ tên"
              name="name"
              value={formData.name}
              onChange={handleChange}
              margin="normal"
              required
              autoFocus
            />
            <TextField
              fullWidth
              label={t('auth.email')}
              name="email"
              type="email"
              value={formData.email}
              onChange={handleChange}
              margin="normal"
              required
            />
            <TextField
              fullWidth
              label="Số điện thoại"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              margin="normal"
              required
            />
            <TextField
              fullWidth
              label={t('auth.password')}
              name="password"
              type="password"
              value={formData.password}
              onChange={handleChange}
              margin="normal"
              required
            />
            <TextField
              fullWidth
              label="Xác nhận mật khẩu"
              name="confirmPassword"
              type="password"
              value={formData.confirmPassword}
              onChange={handleChange}
              margin="normal"
              required
            />

            <Button
              type="submit"
              fullWidth
              variant="contained"
              size="large"
              sx={{ mt: 3, mb: 2 }}
              disabled={loading}
            >
              {loading ? 'Đang đăng ký...' : t('common.register')}
            </Button>

            <Typography variant="body2" align="center">
              {t('auth.haveAccount')}{' '}
              <Link component={RouterLink} to="/login">
                {t('common.login')}
              </Link>
            </Typography>
          </form>
        </Paper>
      </Container>
    </Box>
  );
}
