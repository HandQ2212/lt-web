import { useEffect, useState } from 'react';
import {
  Alert,
  Avatar,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  Grid,
  IconButton,
  LinearProgress,
  List,
  ListItem,
  ListItemText,
  Paper,
  Snackbar,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import {
  Add as AddIcon,
  Delete as DeleteIcon,
  Edit as EditIcon,
  Search as SearchIcon,
  Email as EmailIcon,
  Phone as PhoneIcon,
  School as SchoolIcon,
  ArrowBack as ArrowBackIcon,
  Class as ClassIcon,
} from '@mui/icons-material';
import { AppUser, classApi, userApi, UserRole } from '../../../services/api';
import { formatDateToDDMMYYYY } from '../../utils/dateFormatter';

type ClassItem = {
  id: string;
  name?: string;
  status?: string;
  startDate?: string;
  endDate?: string;
  maxStudents?: number;
  courseName?: string;
  roomName?: string;
  teacherName?: string;
  schedules?: Array<{ id?: string; dayOfWeek: string; startTime: string; endTime: string }>;
};

type TeacherForm = {
  fullName: string;
  email: string;
  phone: string;
  password: string;
};

const defaultForm: TeacherForm = { fullName: '', email: '', phone: '', password: '' };

const getStatusColor = (status?: string): 'default' | 'info' | 'success' | 'warning' | 'error' => {
  switch (status) {
    case 'UPCOMING': return 'warning';
    case 'ACCEPTING': return 'info';
    case 'ONGOING': return 'success';
    case 'COMPLETED': return 'default';
    default: return 'default';
  }
};

const getStatusLabel = (status?: string) => {
  switch (status) {
    case 'UPCOMING': return 'Mới tạo';
    case 'ACCEPTING': return 'Đang tuyển sinh';
    case 'ONGOING': return 'Đang diễn ra';
    case 'COMPLETED': return 'Hoàn thành';
    default: return status || '';
  }
};

export default function TeacherManagementPage() {
  const [teachers, setTeachers] = useState<AppUser[]>([]);
  const [filteredTeachers, setFilteredTeachers] = useState<AppUser[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [openDialog, setOpenDialog] = useState(false);
  const [editingTeacher, setEditingTeacher] = useState<AppUser | null>(null);
  const [form, setForm] = useState<TeacherForm>(defaultForm);
  const [selectedTeacher, setSelectedTeacher] = useState<AppUser | null>(null);
  const [teacherClasses, setTeacherClasses] = useState<ClassItem[]>([]);
  const [detailLoading, setDetailLoading] = useState(false);
  const [snackbar, setSnackbar] = useState<{ open: boolean; message: string; severity: 'success' | 'error' }>({
    open: false, message: '', severity: 'success',
  });

  useEffect(() => { void fetchTeachers(); }, []);

  const fetchTeachers = async () => {
    try {
      setLoading(true);
      const page = await userApi.getAll({ size: 200, sort: 'fullName,asc' });
      const list = (page.content || []).filter((u) => u.role === 'TEACHER');
      setTeachers(list);
      setFilteredTeachers(list);
    } catch (err: any) {
      setSnackbar({ open: true, message: err?.response?.data?.message || 'Không thể tải danh sách giáo viên', severity: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const fetchTeacherClasses = async (teacherId: string) => {
    try {
      setDetailLoading(true);
      const allClasses = await classApi.getAll();
      const filtered = (allClasses || []).filter((cls: any) =>
        cls.teacherId === teacherId || cls.teacherName === selectedTeacher?.name
      );
      setTeacherClasses(filtered);
    } catch (err: any) {
      setTeacherClasses([]);
    } finally {
      setDetailLoading(false);
    }
  };

  useEffect(() => {
    if (selectedTeacher) {
      void fetchTeacherClasses(selectedTeacher.id);
    }
  }, [selectedTeacher]);

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    if (!query.trim()) {
      setFilteredTeachers(teachers);
    } else {
      const q = query.toLowerCase();
      setFilteredTeachers(teachers.filter((t) =>
        t.name?.toLowerCase().includes(q) || t.email?.toLowerCase().includes(q) || t.phone?.includes(q)
      ));
    }
  };

  const handleOpenCreate = () => {
    setEditingTeacher(null);
    setForm(defaultForm);
    setOpenDialog(true);
  };

  const handleOpenEdit = (teacher: AppUser) => {
    setEditingTeacher(teacher);
    setForm({ fullName: teacher.name, email: teacher.email, phone: teacher.phone || '', password: '' });
    setOpenDialog(true);
  };

  const handleSubmit = async () => {
    try {
      setSubmitting(true);
      if (editingTeacher) {
        await userApi.update(editingTeacher.id, { fullName: form.fullName, phone: form.phone });
      } else {
        await userApi.create({ email: form.email, password: form.password, fullName: form.fullName, phone: form.phone, role: 'TEACHER' as UserRole });
      }
      setSnackbar({ open: true, message: editingTeacher ? 'Cập nhật giáo viên thành công' : 'Thêm giáo viên thành công', severity: 'success' });
      setOpenDialog(false);
      await fetchTeachers();
    } catch (err: any) {
      setSnackbar({ open: true, message: err?.response?.data?.message || 'Thao tác thất bại', severity: 'error' });
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await userApi.deactivate(id);
      setSnackbar({ open: true, message: 'Đã vô hiệu hóa giáo viên', severity: 'success' });
      if (selectedTeacher?.id === id) setSelectedTeacher(null);
      await fetchTeachers();
    } catch (err: any) {
      setSnackbar({ open: true, message: err?.response?.data?.message || 'Không thể vô hiệu hóa', severity: 'error' });
    }
  };

  // Detail View
  if (selectedTeacher) {
    return (
      <Box>
        <Button startIcon={<ArrowBackIcon />} onClick={() => setSelectedTeacher(null)} sx={{ mb: 2 }}>
          Quay lại danh sách
        </Button>

        <Grid container spacing={3}>
          {/* Teacher Profile Card */}
          <Grid item xs={12} md={4}>
            <Card sx={{ height: '100%' }}>
              <CardContent>
                <Stack alignItems="center" spacing={2} sx={{ py: 2 }}>
                  <Avatar sx={{ width: 80, height: 80, fontSize: 32, bgcolor: 'primary.main' }}>
                    {selectedTeacher.name?.charAt(0)?.toUpperCase()}
                  </Avatar>
                  <Typography variant="h5" fontWeight={700}>{selectedTeacher.name}</Typography>
                  <Chip label={selectedTeacher.status === 'ACTIVE' ? 'Hoạt động' : 'Không hoạt động'} color={selectedTeacher.status === 'ACTIVE' ? 'success' : 'default'} />
                </Stack>
                <Divider sx={{ my: 2 }} />
                <Stack spacing={2}>
                  <Stack direction="row" spacing={1.5} alignItems="center">
                    <EmailIcon color="action" fontSize="small" />
                    <Box>
                      <Typography variant="caption" color="text.secondary">Email</Typography>
                      <Typography variant="body2">{selectedTeacher.email}</Typography>
                    </Box>
                  </Stack>
                  <Stack direction="row" spacing={1.5} alignItems="center">
                    <PhoneIcon color="action" fontSize="small" />
                    <Box>
                      <Typography variant="caption" color="text.secondary">Số điện thoại</Typography>
                      <Typography variant="body2">{selectedTeacher.phone || 'Chưa cập nhật'}</Typography>
                    </Box>
                  </Stack>
                  <Stack direction="row" spacing={1.5} alignItems="center">
                    <SchoolIcon color="action" fontSize="small" />
                    <Box>
                      <Typography variant="caption" color="text.secondary">Vai trò</Typography>
                      <Typography variant="body2">Giáo viên</Typography>
                    </Box>
                  </Stack>
                  <Stack direction="row" spacing={1.5} alignItems="center">
                    <ClassIcon color="action" fontSize="small" />
                    <Box>
                      <Typography variant="caption" color="text.secondary">Số lớp đang dạy</Typography>
                      <Typography variant="body2" fontWeight={700}>{teacherClasses.length}</Typography>
                    </Box>
                  </Stack>
                </Stack>
                <Divider sx={{ my: 2 }} />
                <Stack direction="row" spacing={1}>
                  <Button fullWidth variant="outlined" startIcon={<EditIcon />} onClick={() => handleOpenEdit(selectedTeacher)}>
                    Sửa
                  </Button>
                  <Button fullWidth variant="outlined" color="error" startIcon={<DeleteIcon />} onClick={() => void handleDelete(selectedTeacher.id)}>
                    Xóa
                  </Button>
                </Stack>
              </CardContent>
            </Card>
          </Grid>

          {/* Teacher Classes */}
          <Grid item xs={12} md={8}>
            <Paper sx={{ p: 3 }}>
              <Typography variant="h6" fontWeight={700} sx={{ mb: 2 }}>
                Danh sách lớp đang dạy
              </Typography>
              {detailLoading ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}><CircularProgress /></Box>
              ) : teacherClasses.length === 0 ? (
                <Alert severity="info">Giáo viên chưa được phân công lớp nào.</Alert>
              ) : (
                <Grid container spacing={2}>
                  {teacherClasses.map((cls) => (
                    <Grid item xs={12} sm={6} key={cls.id}>
                      <Card variant="outlined" sx={{ '&:hover': { boxShadow: 3 }, transition: 'box-shadow 0.2s' }}>
                        <CardContent>
                          <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
                            <Box>
                              <Typography variant="subtitle1" fontWeight={700}>{cls.name || cls.id}</Typography>
                              <Typography variant="body2" color="text.secondary">{cls.courseName || ''}</Typography>
                            </Box>
                            <Chip size="small" label={getStatusLabel(cls.status)} color={getStatusColor(cls.status)} />
                          </Stack>
                          <Divider sx={{ my: 1.5 }} />
                          <Stack spacing={0.5}>
                            <Typography variant="body2">
                              <strong>Thời gian:</strong> {formatDateToDDMMYYYY(cls.startDate)} - {formatDateToDDMMYYYY(cls.endDate)}
                            </Typography>
                            <Typography variant="body2">
                              <strong>Phòng:</strong> {cls.roomName || 'Chưa xếp'}
                            </Typography>
                            <Typography variant="body2">
                              <strong>Sĩ số tối đa:</strong> {cls.maxStudents || 'N/A'}
                            </Typography>
                            {cls.schedules && cls.schedules.length > 0 && (
                              <Box sx={{ mt: 1 }}>
                                <Typography variant="caption" color="text.secondary" fontWeight={600}>Lịch học:</Typography>
                                {cls.schedules.map((s, idx) => (
                                  <Typography key={idx} variant="caption" display="block" color="text.secondary">
                                    {s.dayOfWeek}: {s.startTime} - {s.endTime}
                                  </Typography>
                                ))}
                              </Box>
                            )}
                          </Stack>
                        </CardContent>
                      </Card>
                    </Grid>
                  ))}
                </Grid>
              )}
            </Paper>
          </Grid>
        </Grid>

        {/* Reuse dialog */}
        <Dialog open={openDialog} onClose={() => setOpenDialog(false)} maxWidth="sm" fullWidth>
          <DialogTitle>{editingTeacher ? 'Chỉnh sửa giáo viên' : 'Thêm giáo viên mới'}</DialogTitle>
          <DialogContent>
            <TextField fullWidth label="Họ tên" margin="normal" value={form.fullName} onChange={(e) => setForm((p) => ({ ...p, fullName: e.target.value }))} />
            <TextField fullWidth label="Email" type="email" margin="normal" disabled={!!editingTeacher} value={form.email} onChange={(e) => setForm((p) => ({ ...p, email: e.target.value }))} />
            {!editingTeacher && <TextField fullWidth label="Mật khẩu" type="password" margin="normal" value={form.password} onChange={(e) => setForm((p) => ({ ...p, password: e.target.value }))} />}
            <TextField fullWidth label="Số điện thoại" margin="normal" value={form.phone} onChange={(e) => setForm((p) => ({ ...p, phone: e.target.value }))} />
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setOpenDialog(false)}>Hủy</Button>
            <Button variant="contained" disabled={submitting} onClick={() => void handleSubmit()}>
              {submitting ? 'Đang lưu...' : 'Lưu'}
            </Button>
          </DialogActions>
        </Dialog>

        <Snackbar open={snackbar.open} autoHideDuration={3000} onClose={() => setSnackbar((p) => ({ ...p, open: false }))}>
          <Alert severity={snackbar.severity} variant="filled">{snackbar.message}</Alert>
        </Snackbar>
      </Box>
    );
  }

  // List View
  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box>
          <Typography variant="h4" fontWeight={700}>Quản lý Giáo viên</Typography>
          <Typography color="text.secondary">Xem thông tin chi tiết từng giáo viên, các lớp đang dạy.</Typography>
        </Box>
        <Button variant="contained" startIcon={<AddIcon />} onClick={handleOpenCreate}>Thêm giáo viên</Button>
      </Box>

      <Box sx={{ mb: 3 }}>
        <TextField fullWidth placeholder="Tìm kiếm giáo viên (tên, email, SĐT...)" value={searchQuery} onChange={(e) => handleSearch(e.target.value)} InputProps={{ startAdornment: <SearchIcon sx={{ mr: 1, color: 'text.secondary' }} /> }} variant="outlined" size="small" />
      </Box>

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}><CircularProgress /></Box>
      ) : filteredTeachers.length === 0 ? (
        <Paper sx={{ p: 3, textAlign: 'center' }}>
          <Typography color="text.secondary">{searchQuery ? 'Không tìm thấy giáo viên phù hợp' : 'Chưa có giáo viên nào'}</Typography>
        </Paper>
      ) : (
        <Grid container spacing={2}>
          {filteredTeachers.map((teacher) => (
            <Grid item xs={12} sm={6} md={4} key={teacher.id}>
              <Card sx={{ cursor: 'pointer', transition: 'all 0.2s', '&:hover': { transform: 'translateY(-3px)', boxShadow: 4 } }} onClick={() => setSelectedTeacher(teacher)}>
                <CardContent>
                  <Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 2 }}>
                    <Avatar sx={{ bgcolor: 'primary.main', width: 48, height: 48 }}>{teacher.name?.charAt(0)?.toUpperCase()}</Avatar>
                    <Box sx={{ minWidth: 0 }}>
                      <Typography variant="subtitle1" fontWeight={700} noWrap>{teacher.name}</Typography>
                      <Typography variant="body2" color="text.secondary" noWrap>{teacher.email}</Typography>
                    </Box>
                  </Stack>
                  <Stack direction="row" spacing={1} sx={{ mb: 1 }}>
                    <Chip size="small" label="Giáo viên" color="primary" />
                    <Chip size="small" label={teacher.status === 'ACTIVE' ? 'Hoạt động' : 'Ngừng'} color={teacher.status === 'ACTIVE' ? 'success' : 'default'} />
                  </Stack>
                  <Typography variant="body2" color="text.secondary">SĐT: {teacher.phone || 'Chưa cập nhật'}</Typography>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}

      <Dialog open={openDialog} onClose={() => setOpenDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>{editingTeacher ? 'Chỉnh sửa giáo viên' : 'Thêm giáo viên mới'}</DialogTitle>
        <DialogContent>
          <TextField fullWidth label="Họ tên" margin="normal" value={form.fullName} onChange={(e) => setForm((p) => ({ ...p, fullName: e.target.value }))} />
          <TextField fullWidth label="Email" type="email" margin="normal" disabled={!!editingTeacher} value={form.email} onChange={(e) => setForm((p) => ({ ...p, email: e.target.value }))} />
          {!editingTeacher && <TextField fullWidth label="Mật khẩu" type="password" margin="normal" value={form.password} onChange={(e) => setForm((p) => ({ ...p, password: e.target.value }))} />}
          <TextField fullWidth label="Số điện thoại" margin="normal" value={form.phone} onChange={(e) => setForm((p) => ({ ...p, phone: e.target.value }))} />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)}>Hủy</Button>
          <Button variant="contained" disabled={submitting} onClick={() => void handleSubmit()}>
            {submitting ? 'Đang lưu...' : 'Lưu'}
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar open={snackbar.open} autoHideDuration={3000} onClose={() => setSnackbar((p) => ({ ...p, open: false }))}>
        <Alert severity={snackbar.severity} variant="filled">{snackbar.message}</Alert>
      </Snackbar>
    </Box>
  );
}
