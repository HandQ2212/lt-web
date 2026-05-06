import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  Alert,
  Avatar,
  Box,
  Button,
  Checkbox,
  Chip,
  Divider,
  FormControl,
  Grid,
  InputLabel,
  ListItemText,
  MenuItem,
  OutlinedInput,
  Paper,
  Select,
  Snackbar,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import type { SelectChangeEvent } from '@mui/material/Select';
import { Edit as EditIcon, Save as SaveIcon } from '@mui/icons-material';
import { RootState } from '../../../store';
import { courseApi, leadApi, profileApi } from '../../../services/api';
import { setCurrentUser } from '../../../store/slices/authSlice';

type CourseOption = {
  id: string;
  name: string;
  level?: string;
};

type LeadInterest = {
  id: string;
  courseId: string;
  courseName: string;
  status: string;
  notes?: string;
};

type LeadProfile = {
  id: string;
  status: string;
  interests?: LeadInterest[];
};

export default function ProfilePage() {
  const dispatch = useDispatch();
  const user = useSelector((state: RootState) => state.auth.user);
  const isLead = user?.role === 'LEAD';

  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [courses, setCourses] = useState<CourseOption[]>([]);
  const [leadProfile, setLeadProfile] = useState<LeadProfile | null>(null);
  const [selectedCourseIds, setSelectedCourseIds] = useState<string[]>([]);
  const [interestNotes, setInterestNotes] = useState('');
  const [interestLoading, setInterestLoading] = useState(false);
  const [interestSaving, setInterestSaving] = useState(false);
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

  useEffect(() => {
    setFormData({
      name: user?.name || '',
      email: user?.email || '',
      phone: user?.phone || '',
    });
  }, [user]);

  useEffect(() => {
    if (!isLead) {
      return;
    }

    setInterestLoading(true);
    courseApi
      .getAll()
      .then((courseList) => {
        setCourses(courseList);
        return leadApi.getMine();
      })
      .then((lead) => {
        setLeadProfile(lead);
      })
      .catch((error) => {
        setSnackbar({
          open: true,
          message: error?.response?.data?.message || 'Không tải được danh sách khóa học quan tâm',
          severity: 'error',
        });
      })
      .finally(() => setInterestLoading(false));
  }, [isLead]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleCourseSelect = (event: SelectChangeEvent<string[]>) => {
    const value = event.target.value;
    setSelectedCourseIds(typeof value === 'string' ? value.split(',') : value);
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
      if (isLead) {
        leadApi.getMine().then(setLeadProfile).catch(() => undefined);
      }
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

  const handleAddInterests = async () => {
    if (selectedCourseIds.length === 0) {
      setSnackbar({ open: true, message: 'Chọn ít nhất một khóa học', severity: 'error' });
      return;
    }

    try {
      setInterestSaving(true);
      const updatedLead = await leadApi.addMyInterests({
        courseIds: selectedCourseIds,
        notes: interestNotes || undefined,
      });
      setLeadProfile(updatedLead);
      setSelectedCourseIds([]);
      setInterestNotes('');
      setSnackbar({ open: true, message: 'Đã lưu khóa học quan tâm', severity: 'success' });
    } catch (error: any) {
      setSnackbar({
        open: true,
        message: error?.response?.data?.message || 'Không lưu được khóa học quan tâm',
        severity: 'error',
      });
    } finally {
      setInterestSaving(false);
    }
  };

  const interestedCourseIds = new Set((leadProfile?.interests || []).map((interest) => interest.courseId));
  const availableCourses = courses.filter((course) => !interestedCourseIds.has(course.id));

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
                <TextField fullWidth label="Email" name="email" type="email" value={formData.email} disabled />
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
                <Button variant="contained" startIcon={<SaveIcon />} onClick={handleSave} disabled={saving}>
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

          {isLead && (
            <Paper sx={{ p: 3, mt: 3 }}>
              <Typography variant="h6" fontWeight={600} gutterBottom>
                Khóa học quan tâm
              </Typography>

              <Stack direction="row" spacing={1} useFlexGap flexWrap="wrap" sx={{ mb: 3 }}>
                {interestLoading && <Typography color="text.secondary">Đang tải...</Typography>}
                {!interestLoading && (leadProfile?.interests || []).length === 0 && (
                  <Typography color="text.secondary">Bạn chưa chọn khóa học quan tâm.</Typography>
                )}
                {(leadProfile?.interests || []).map((interest) => (
                  <Chip
                    key={interest.id}
                    label={`${interest.courseName || 'Khóa học'} - ${interest.status}`}
                    color="primary"
                    variant="outlined"
                  />
                ))}
              </Stack>

              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <FormControl fullWidth disabled={interestLoading || availableCourses.length === 0}>
                    <InputLabel id="interested-courses-label">Chọn khóa học</InputLabel>
                    <Select
                      labelId="interested-courses-label"
                      multiple
                      value={selectedCourseIds}
                      onChange={handleCourseSelect}
                      input={<OutlinedInput label="Chọn khóa học" />}
                      renderValue={(selected) =>
                        selected
                          .map((courseId) => courses.find((course) => course.id === courseId)?.name)
                          .filter(Boolean)
                          .join(', ')
                      }
                    >
                      {availableCourses.map((course) => (
                        <MenuItem key={course.id} value={course.id}>
                          <Checkbox checked={selectedCourseIds.includes(course.id)} />
                          <ListItemText primary={course.name} secondary={course.level} />
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    multiline
                    minRows={2}
                    label="Ghi chú nhu cầu học"
                    value={interestNotes}
                    onChange={(e) => setInterestNotes(e.target.value)}
                  />
                </Grid>
              </Grid>

              <Button
                variant="contained"
                sx={{ mt: 2 }}
                onClick={() => void handleAddInterests()}
                disabled={interestSaving || selectedCourseIds.length === 0}
              >
                {interestSaving ? 'Đang lưu...' : 'Thêm khóa quan tâm'}
              </Button>
            </Paper>
          )}
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
