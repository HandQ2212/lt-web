import { useEffect, useState, useRef } from 'react';
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
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  useTheme,
  useMediaQuery,
  Card,
  CardContent,
} from '@mui/material';
import type { SelectChangeEvent } from '@mui/material/Select';
import { 
  Edit as EditIcon, 
  Save as SaveIcon, 
  PhotoCamera as PhotoCameraIcon,
  Lock as LockIcon,
  Person as PersonIcon,
  Favorite as FavoriteIcon,
} from '@mui/icons-material';
import { RootState } from '../../../store';
import { courseApi, leadApi, profileApi } from '../../../services/api';
import { setCurrentUser } from '../../../store/slices/authSlice';
import { formatDateToDDMMYYYY } from '../../utils/dateFormatter';
import PersonalResumeCard from '../../components/common/PersonalResumeCard';

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
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
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
    fullName: user?.fullName || '',
    email: user?.email || '',
    phone: user?.phone || '',
    address: user?.address || '',
    dateOfBirth: user?.dateOfBirth || '',
    gender: user?.gender || '',
  });

  const [passwordForm, setPasswordForm] = useState({
    oldPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  const [avatarDialogOpen, setAvatarDialogOpen] = useState(false);
  const [newAvatarUrl, setNewAvatarUrl] = useState(user?.avatarUrl || '');
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    setFormData({
      fullName: user?.fullName || '',
      email: user?.email || '',
      phone: user?.phone || '',
      address: user?.address || '',
      dateOfBirth: user?.dateOfBirth || '',
      gender: user?.gender || '',
    });
  }, [user]);

  useEffect(() => {
    if (!isLead) return;

    setInterestLoading(true);
    courseApi.getAll()
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

  const handleSave = async () => {
    try {
      setSaving(true);
      const updated = await profileApi.update({
        fullName: formData.fullName,
        phone: formData.phone,
        address: formData.address,
        dateOfBirth: formData.dateOfBirth,
        gender: formData.gender,
      });
      dispatch(setCurrentUser(updated));
      setSnackbar({ open: true, message: 'Đã lưu thay đổi hồ sơ cá nhân', severity: 'success' });
      setIsEditing(false);
    } catch (error: any) {
      setSnackbar({
        open: true,
        message: error?.response?.data?.message || 'Không thể lưu hồ sơ',
        severity: 'error',
      });
    } finally {
      setSaving(false);
    }
  };

  const handleAvatarSave = async () => {
    try {
      setSaving(true);
      const updated = await profileApi.update({
        avatarUrl: newAvatarUrl,
      });
      dispatch(setCurrentUser(updated));
      setSnackbar({ open: true, message: 'Đã cập nhật ảnh đại diện mới', severity: 'success' });
      setAvatarDialogOpen(false);
    } catch (error: any) {
      setSnackbar({ open: true, message: 'Lỗi khi cập nhật ảnh đại diện', severity: 'error' });
    } finally {
      setSaving(false);
    }
  };

  const handleChangePassword = async () => {
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setSnackbar({ open: true, message: 'Mật khẩu mới không khớp nhau', severity: 'error' });
      return;
    }

    try {
      await profileApi.changePassword({
        oldPassword: passwordForm.oldPassword,
        newPassword: passwordForm.newPassword,
      });
      setSnackbar({ open: true, message: 'Mật khẩu đã được thay đổi thành công', severity: 'success' });
      setPasswordForm({ oldPassword: '', newPassword: '', confirmPassword: '' });
    } catch (error: any) {
      setSnackbar({ open: true, message: error?.response?.data?.message || 'Mật khẩu hiện tại không chính xác', severity: 'error' });
    }
  };

  const interestedCourseIds = new Set((leadProfile?.interests || []).map((interest) => interest.courseId));
  const availableCourses = courses.filter((course) => !interestedCourseIds.has(course.id));
  const roleLabel = user?.role === 'STUDENT'
    ? 'Học viên'
    : user?.role === 'ADMIN'
      ? 'Quản trị viên'
      : user?.role === 'MANAGER'
        ? 'Quản trị viên'
        : user?.role === 'TEACHER'
          ? 'Giảng viên'
          : user?.role === 'ACCOUNTANT'
            ? 'Kế toán viên'
            : 'Khách hàng';
  const genderLabel = formData.gender === 'MALE' ? 'Nam' : formData.gender === 'FEMALE' ? 'Nữ' : formData.gender === 'OTHER' ? 'Khác' : 'Chưa cập nhật';
  const statusLabel = user?.status === 'ACTIVE' ? 'Hoạt động' : 'Không hoạt động';

  return (
    <Box sx={{ pb: 6 }}>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" fontWeight={800} color="primary.main" gutterBottom>
          Hồ sơ của tôi
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Quản lý thông tin cá nhân và thiết lập tài khoản của bạn.
        </Typography>
      </Box>

      <Stack spacing={4}>
        {!isEditing ? (
          <PersonalResumeCard
            name={user?.fullName || 'Người dùng'}
            avatarUrl={user?.avatarUrl}
            avatarFallback={user?.fullName?.charAt(0)?.toUpperCase() || 'U'}
            statusLabel={statusLabel}
            statusColor={user?.status === 'ACTIVE' ? 'success' : 'default'}
            fields={[
              { number: 1, label: 'Mã người dùng', value: user?.id?.slice(0, 8)?.toUpperCase() || '-' },
              { number: 2, label: 'Họ và tên', value: user?.fullName || '-' },
              { number: 3, label: 'Giới tính', value: genderLabel },
              { number: 4, label: 'Ngày sinh', value: user?.dateOfBirth ? formatDateToDDMMYYYY(user.dateOfBirth) : 'Chưa cập nhật' },
              { number: 5, label: 'Trạng thái', value: statusLabel },
              { number: 6, label: 'Vai trò', value: roleLabel },
              { number: 7, label: 'Số điện thoại', value: user?.phone || 'Chưa cập nhật' },
              { number: 8, label: 'Email', value: user?.email || '-' },
              { number: 9, label: 'Địa chỉ thường trú', value: user?.address || 'Chưa cập nhật', fullWidth: true },
            ]}
            actions={
              <Stack direction="row" spacing={1} flexWrap="wrap">
                <Button variant="contained" startIcon={<EditIcon />} onClick={() => setIsEditing(true)} sx={{ borderRadius: 2 }}>
                  Chỉnh sửa hồ sơ
                </Button>
                <Button variant="outlined" startIcon={<PhotoCameraIcon />} onClick={() => setAvatarDialogOpen(true)} sx={{ borderRadius: 2 }}>
                  Đổi ảnh đại diện
                </Button>
              </Stack>
            }
          />
        ) : (
          <Card sx={{ borderRadius: 4, boxShadow: '0 8px 32px rgba(0,0,0,0.04)', overflow: 'visible' }}>
            <CardContent sx={{ p: 4 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
                <Typography variant="h6" fontWeight={800} display="flex" alignItems="center">
                  <PersonIcon sx={{ mr: 1, color: 'primary.main' }} /> Cập nhật thông tin
                </Typography>
                <Box sx={{ display: 'flex', gap: 1 }}>
                  <Button variant="outlined" onClick={() => setIsEditing(false)} sx={{ borderRadius: 2 }}>Hủy</Button>
                  <Button 
                    variant="contained" 
                    startIcon={<SaveIcon />} 
                    onClick={handleSave} 
                    disabled={saving}
                    sx={{ borderRadius: 2 }}
                  >
                    Lưu thông tin
                  </Button>
                </Box>
              </Box>

              <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Họ và tên"
                    name="fullName"
                    value={formData.fullName}
                    onChange={handleChange}
                    disabled={!isEditing}
                    variant={isEditing ? "outlined" : "filled"}
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Số điện thoại"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    disabled={!isEditing}
                    variant={isEditing ? "outlined" : "filled"}
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Ngày sinh"
                    name="dateOfBirth"
                    type="date"
                    value={formData.dateOfBirth}
                    onChange={handleChange}
                    disabled={!isEditing}
                    variant={isEditing ? "outlined" : "filled"}
                    InputLabelProps={{ shrink: true }}
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Giới tính"
                    name="gender"
                    select
                    value={formData.gender}
                    onChange={handleChange}
                    disabled={!isEditing}
                    variant={isEditing ? "outlined" : "filled"}
                  >
                    <MenuItem value="MALE">Nam</MenuItem>
                    <MenuItem value="FEMALE">Nữ</MenuItem>
                    <MenuItem value="OTHER">Khác</MenuItem>
                  </TextField>
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Địa chỉ thường trú"
                    name="address"
                    value={formData.address}
                    onChange={handleChange}
                    disabled={!isEditing}
                    variant={isEditing ? "outlined" : "filled"}
                    multiline
                    rows={2}
                  />
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        )}

        {/* Security Card */}
        <Card sx={{ borderRadius: 4, boxShadow: '0 8px 32px rgba(0,0,0,0.04)' }}>
              <CardContent sx={{ p: 4 }}>
                <Typography variant="h6" fontWeight={800} sx={{ mb: 4 }} display="flex" alignItems="center">
                  <LockIcon sx={{ mr: 1, color: 'primary.main' }} /> Bảo mật & Đổi mật khẩu
                </Typography>
                
                <Grid container spacing={3}>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="Mật khẩu hiện tại"
                      type="password"
                      value={passwordForm.oldPassword}
                      onChange={(e) => setPasswordForm(p => ({ ...p, oldPassword: e.target.value }))}
                      placeholder="Nhập mật khẩu cũ để xác minh"
                    />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      label="Mật khẩu mới"
                      type="password"
                      value={passwordForm.newPassword}
                      onChange={(e) => setPasswordForm(p => ({ ...p, newPassword: e.target.value }))}
                    />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      label="Xác nhận mật khẩu mới"
                      type="password"
                      value={passwordForm.confirmPassword}
                      onChange={(e) => setPasswordForm(p => ({ ...p, confirmPassword: e.target.value }))}
                    />
                  </Grid>
                </Grid>
                <Button 
                  variant="contained" 
                  color="primary" 
                  sx={{ mt: 3, borderRadius: 2, px: 4 }}
                  onClick={handleChangePassword}
                >
                  Cập nhật mật khẩu mới
                </Button>
              </CardContent>
            </Card>
      </Stack>

      {/* Avatar Edit Dialog */}
      <Dialog open={avatarDialogOpen} onClose={() => setAvatarDialogOpen(false)} maxWidth="xs" fullWidth PaperProps={{ sx: { borderRadius: 4 } }}>
        <DialogTitle sx={{ fontWeight: 800 }}>Cập nhật ảnh đại diện</DialogTitle>
        <DialogContent dividers>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Bạn có thể tải ảnh lên từ máy hoặc dán đường dẫn (URL). Ảnh sẽ được xem trước trước khi lưu.
          </Typography>
          <Box sx={{ display: 'flex', gap: 1, alignItems: 'center', mb: 1 }}>
            <input
              ref={(el) => (fileInputRef.current = el)}
              type="file"
              accept="image/*"
              style={{ display: 'none' }}
              onChange={async (e) => {
                const f = e.target.files?.[0];
                if (!f) return;
                if (f.size > 2 * 1024 * 1024) {
                  setSnackbar({ open: true, message: 'Kích thước ảnh quá lớn (tối đa 2MB)', severity: 'error' });
                  return;
                }
                const reader = new FileReader();
                reader.onload = () => {
                  const result = reader.result as string;
                  setNewAvatarUrl(result);
                };
                reader.readAsDataURL(f);
              }}
            />
            <Button variant="outlined" onClick={() => fileInputRef.current?.click()} startIcon={<PhotoCameraIcon />}>Tải ảnh lên</Button>
            <Typography variant="caption" color="text.secondary">hoặc dán URL bên dưới</Typography>
          </Box>
          <TextField
            fullWidth
            label="Đường dẫn ảnh (URL)"
            value={newAvatarUrl}
            onChange={(e) => setNewAvatarUrl(e.target.value)}
            margin="normal"
            placeholder="https://example.com/avatar.jpg"
          />
          {newAvatarUrl && (
            <Box sx={{ mt: 3, textAlign: 'center' }}>
              <Typography variant="caption" display="block" sx={{ mb: 1 }}>Xem trước ảnh mới:</Typography>
              <Avatar src={newAvatarUrl} sx={{ width: 120, height: 120, mx: 'auto', boxShadow: 3 }} />
            </Box>
          )}
        </DialogContent>
        <DialogActions sx={{ p: 2.5 }}>
          <Button onClick={() => setAvatarDialogOpen(false)} color="inherit">Hủy bỏ</Button>
          <Button variant="contained" onClick={handleAvatarSave} disabled={saving} sx={{ borderRadius: 2 }}>
            {saving ? 'Đang lưu...' : 'Lưu ảnh đại diện'}
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar 
        open={snackbar.open} 
        autoHideDuration={4000} 
        onClose={() => setSnackbar(p => ({ ...p, open: false }))}
      >
        <Alert severity={snackbar.severity} variant="filled" sx={{ borderRadius: 2 }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}
