import { useState } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import { Box, Container, Paper, TextField, Button, Typography, Link, Alert } from '@mui/material';
import { useTranslation } from 'react-i18next';
import { authApi } from '../../../services/api';

export default function ForgotPasswordPage() {
  const { t } = useTranslation();
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await authApi.forgotPassword(email);
      setSuccess(true);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Có lỗi xảy ra. Vui lòng thử lại.');
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
          'radial-gradient(circle at 20% 18%, rgba(251,191,36,0.34), transparent 18rem), radial-gradient(circle at 82% 18%, rgba(52,211,153,0.18), transparent 18rem), linear-gradient(180deg, #FFFDF5 0%, #FFF7DF 100%)',
      }}
    >
      <Container maxWidth="sm">
        <Paper elevation={3} sx={{ p: 4, borderRadius: 5, border: '2px solid #1E293B', boxShadow: '7px 7px 0 #1E293B' }}>
          <Typography variant="h4" align="center" gutterBottom fontWeight={900} color="primary">
            Quên mật khẩu
          </Typography>
          <Typography variant="body2" align="center" color="text.secondary" sx={{ mb: 3 }}>
            Nhập email của bạn để nhận link đặt lại mật khẩu
          </Typography>

          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}

          {success && (
            <Alert severity="success" sx={{ mb: 2 }}>
              Link đặt lại mật khẩu đã được gửi đến email của bạn. Vui lòng kiểm tra hộp thư.
            </Alert>
          )}

          {!success && (
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

              <Button
                type="submit"
                fullWidth
                variant="contained"
                size="large"
                sx={{ mt: 3, mb: 2, borderRadius: 999 }}
                disabled={loading}
              >
                {loading ? 'Đang gửi...' : 'Gửi link đặt lại'}
              </Button>

              <Typography variant="body2" align="center">
                <Link component={RouterLink} to="/login">
                  Quay lại đăng nhập
                </Link>
              </Typography>
            </form>
          )}
        </Paper>
      </Container>
    </Box>
  );
}
