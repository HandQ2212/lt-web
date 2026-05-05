import { useState } from 'react';
import { useSelector } from 'react-redux';
import { useDispatch } from 'react-redux';
import { Box, Typography, Paper, Grid, TextField, Button, Avatar, Divider, Snackbar, Alert } from '@mui/material';
import { Save as SaveIcon, Edit as EditIcon } from '@mui/icons-material';
import { RootState } from '../../../store';
import { profileApi } from '../../../services/api';
import { setCurrentUser } from '../../../store/slices/authSlice';

export default function ProfilePage() {
  const dispatch = useDispatch();
  const user = useSelector((state: RootState) => state.auth.user);
  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [snackbar, setSnackbar] = useState<{ open: boolean; message: string; severity: 'success' | 'error' }>({
    open: false,
    message: '',
    severity: 'success',
  });
  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: user?.phone || '',
  });
  const [passwordForm, setPasswordForm] = useState({
    oldPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      const updated = await profileApi.update({
        fullName: formData.name,
        phone: formData.phone,
      });
      dispatch(setCurrentUser(updated));
      setSnackbar({ open: true, message: 'Cập nhật thông tin thành công', severity: 'success' });
      setIsEditing(false);
    } catch (error: any) {
      setSnackbar({
        open: true,
        message: error?.response?.data?.message || 'Cập nhật thông tin thất bại',
        severity: 'error',
      });
    } finally {
      setSaving(false);
    }
  };

  const handleChangePassword = async () => {
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setSnackbar({ open: true, message: 'Xác nhận mật khẩu mới không khớp', severity: 'error' });
      return;
    }

    try {
      await profileApi.changePassword({
        oldPassword: passwordForm.oldPassword,
        newPassword: passwordForm.newPassword,
      });
      setSnackbar({ open: true, message: 'Đổi mật khẩu thành công', severity: 'success' });
      setPasswordForm({ oldPassword: '', newPassword: '', confirmPassword: '' });
    } catch (error: any) {
      setSnackbar({
        open: true,
        message: error?.response?.data?.message || 'Đổi mật khẩu thất bại',
        severity: 'error',
      });
    }
  };

  return (
    <Box>
      <Typography variant="h4" gutterBottom fontWeight={700}>
        Hồ sơ cá nhân
      </Typography>

      <Grid container spacing={3}>
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 3, textAlign: 'center' }}>
            <Avatar
              sx={{
                width: 120,
                height: 120,
                mx: 'auto',
                mb: 2,
                bgcolor: 'primary.main',
                fontSize: 48,
              }}
            >
              {(user?.name?.charAt(0) || 'U').toUpperCase()}
            </Avatar>
            <Typography variant="h6" fontWeight={600}>
              {user?.name}
            </Typography>
            <Typography variant="body2" color="text.secondary" gutterBottom>
              {user?.role}
            </Typography>
            <Button variant="outlined" startIcon={<EditIcon />} sx={{ mt: 2 }}>
              Thay đổi ảnh
            </Button>
          </Paper>
        </Grid>

        <Grid item xs={12} md={8}>
          <Paper sx={{ p: 3 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
              <Typography variant="h6" fontWeight={600}>
                Thông tin cá nhân
              </Typography>
              {!isEditing && (
                <Button variant="outlined" startIcon={<EditIcon />} onClick={() => setIsEditing(true)}>
                  Chỉnh sửa
                </Button>
              )}
            </Box>

            <Grid container spacing={2}>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Họ tên"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  disabled={!isEditing}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                  disabled={!isEditing}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Số điện thoại"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  disabled={!isEditing}
                />
              </Grid>
            </Grid>

            {isEditing && (
              <Box sx={{ mt: 3, display: 'flex', gap: 2 }}>
                <Button variant="contained" startIcon={<SaveIcon />} onClick={handleSave}>
                  {saving ? 'Đang lưu...' : 'Lưu thay đổi'}
                </Button>
                <Button variant="outlined" onClick={() => setIsEditing(false)}>
                  Hủy
                </Button>
              </Box>
            )}

            <Divider sx={{ my: 3 }} />

            <Typography variant="h6" fontWeight={600} gutterBottom>
              Đổi mật khẩu
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Mật khẩu hiện tại"
                  type="password"
                  value={passwordForm.oldPassword}
                  onChange={(e) => setPasswordForm((prev) => ({ ...prev, oldPassword: e.target.value }))}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Mật khẩu mới"
                  type="password"
                  value={passwordForm.newPassword}
                  onChange={(e) => setPasswordForm((prev) => ({ ...prev, newPassword: e.target.value }))}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Xác nhận mật khẩu mới"
                  type="password"
                  value={passwordForm.confirmPassword}
                  onChange={(e) => setPasswordForm((prev) => ({ ...prev, confirmPassword: e.target.value }))}
                />
              </Grid>
            </Grid>
            <Button variant="outlined" sx={{ mt: 2 }} onClick={() => void handleChangePassword()}>
              Đổi mật khẩu
            </Button>
          </Paper>
        </Grid>
      </Grid>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={3000}
        onClose={() => setSnackbar((prev) => ({ ...prev, open: false }))}
      >
        <Alert severity={snackbar.severity} variant="filled">
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}
