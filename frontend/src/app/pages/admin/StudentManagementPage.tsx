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
  MenuItem,
  Paper,
  Snackbar,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
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
  SwapHoriz as SwapHorizIcon,
} from '@mui/icons-material';
import { AppUser, classApi, enrollmentApi, userApi, UserRole, resultApi } from '../../../services/api';
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
};

type EnrollmentItem = {
  id: string;
  studentId: string;
  studentName: string;
  classId: string;
  className: string;
  enrollmentDate?: string;
  status?: string;
};

type StudentForm = {
  fullName: string;
  email: string;
  phone: string;
  password: string;
};

const defaultForm: StudentForm = { fullName: '', email: '', phone: '', password: '' };

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

const getEnrollStatusLabel = (status?: string) => {
  switch (status) {
    case 'ACTIVE': return 'Đang học';
    case 'COMPLETED': return 'Hoàn thành';
    case 'DROPPED': return 'Đã bỏ';
    case 'TRANSFERRED': return 'Đã chuyển';
    default: return status || '';
  }
};

export default function StudentManagementPage() {
  const [students, setStudents] = useState<AppUser[]>([]);
  const [filteredStudents, setFilteredStudents] = useState<AppUser[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [openDialog, setOpenDialog] = useState(false);
  const [editingStudent, setEditingStudent] = useState<AppUser | null>(null);
  const [form, setForm] = useState<StudentForm>(defaultForm);
  const [selectedStudent, setSelectedStudent] = useState<AppUser | null>(null);
  const [enrollments, setEnrollments] = useState<EnrollmentItem[]>([]);
  const [detailLoading, setDetailLoading] = useState(false);
  const [transferDialog, setTransferDialog] = useState<{ open: boolean; enrollmentId: string }>({ open: false, enrollmentId: '' });
  const [targetClassId, setTargetClassId] = useState('');
  const [allClasses, setAllClasses] = useState<ClassItem[]>([]);
  const [studentResults, setStudentResults] = useState<Record<string, any>>({});
  const [snackbar, setSnackbar] = useState<{ open: boolean; message: string; severity: 'success' | 'error' }>({
    open: false, message: '', severity: 'success',
  });

  useEffect(() => { void fetchStudents(); }, []);

  const fetchStudents = async () => {
    try {
      setLoading(true);
      const page = await userApi.getAll({ size: 200, sort: 'fullName,asc' });
      const list = (page.content || []).filter((u) => u.role === 'STUDENT');
      setStudents(list);
      setFilteredStudents(list);
    } catch (err: any) {
      setSnackbar({ open: true, message: err?.response?.data?.message || 'Không thể tải danh sách học viên', severity: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const fetchStudentDetail = async (studentId: string) => {
    try {
      setDetailLoading(true);
      const [enrollRes, classesRes] = await Promise.all([
        enrollmentApi.getByStudent(studentId),
        classApi.getAll(),
      ]);
      const enrollList: EnrollmentItem[] = Array.isArray(enrollRes.data) ? enrollRes.data : [];
      setEnrollments(enrollList);
      setAllClasses(classesRes || []);

      // Fetch results for each enrollment
      const results: Record<string, any> = {};
      for (const enr of enrollList) {
        try {
          const res = await resultApi.getByEnrollment(enr.id);
          results[enr.id] = res.data;
        } catch {
          results[enr.id] = null;
        }
      }
      setStudentResults(results);
    } catch (err: any) {
      setEnrollments([]);
      setAllClasses([]);
    } finally {
      setDetailLoading(false);
    }
  };

  useEffect(() => {
    if (selectedStudent) void fetchStudentDetail(selectedStudent.id);
  }, [selectedStudent]);

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    if (!query.trim()) {
      setFilteredStudents(students);
    } else {
      const q = query.toLowerCase();
      setFilteredStudents(students.filter((s) =>
        s.name?.toLowerCase().includes(q) || s.email?.toLowerCase().includes(q) || s.phone?.includes(q)
      ));
    }
  };

  const handleOpenCreate = () => { setEditingStudent(null); setForm(defaultForm); setOpenDialog(true); };
  const handleOpenEdit = (student: AppUser) => {
    setEditingStudent(student);
    setForm({ fullName: student.name, email: student.email, phone: student.phone || '', password: '' });
    setOpenDialog(true);
  };

  const handleSubmit = async () => {
    try {
      setSubmitting(true);
      if (editingStudent) {
        await userApi.update(editingStudent.id, { fullName: form.fullName, phone: form.phone });
      } else {
        await userApi.create({ email: form.email, password: form.password, fullName: form.fullName, phone: form.phone, role: 'STUDENT' as UserRole });
      }
      setSnackbar({ open: true, message: editingStudent ? 'Cập nhật học viên thành công' : 'Thêm học viên thành công', severity: 'success' });
      setOpenDialog(false);
      await fetchStudents();
    } catch (err: any) {
      setSnackbar({ open: true, message: err?.response?.data?.message || 'Thao tác thất bại', severity: 'error' });
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await userApi.deactivate(id);
      setSnackbar({ open: true, message: 'Đã vô hiệu hóa học viên', severity: 'success' });
      if (selectedStudent?.id === id) setSelectedStudent(null);
      await fetchStudents();
    } catch (err: any) {
      setSnackbar({ open: true, message: err?.response?.data?.message || 'Không thể vô hiệu hóa', severity: 'error' });
    }
  };

  const handleTransfer = async () => {
    try {
      setSubmitting(true);
      await enrollmentApi.transferClass(transferDialog.enrollmentId, targetClassId);
      setSnackbar({ open: true, message: 'Chuyển lớp thành công', severity: 'success' });
      setTransferDialog({ open: false, enrollmentId: '' });
      setTargetClassId('');
      if (selectedStudent) await fetchStudentDetail(selectedStudent.id);
    } catch (err: any) {
      setSnackbar({ open: true, message: err?.response?.data?.message || 'Không thể chuyển lớp', severity: 'error' });
    } finally {
      setSubmitting(false);
    }
  };

  // Detail View
  if (selectedStudent) {
    return (
      <Box>
        <Button startIcon={<ArrowBackIcon />} onClick={() => setSelectedStudent(null)} sx={{ mb: 2 }}>
          Quay lại danh sách
        </Button>

        <Grid container spacing={3}>
          {/* Student Profile Card */}
          <Grid item xs={12}>
            <Card sx={{ height: '100%', borderRadius: 4, border: '1px solid rgba(15,23,42,0.06)', boxShadow: '0 10px 30px rgba(15,23,42,0.04)' }}>
              <CardContent sx={{ p: { xs: 2.5, sm: 3.5 } }}>
                <Stack direction={{ xs: 'column', sm: 'row' }} spacing={3.5} alignItems="flex-start">
                  <Avatar sx={{ width: { xs: 100, sm: 120 }, height: { xs: 100, sm: 120 }, fontSize: { xs: 40, sm: 48 }, fontWeight: 800, bgcolor: 'success.main', borderRadius: 3, flexShrink: 0 }} variant="rounded">
                    {selectedStudent.name?.charAt(0)?.toUpperCase()}
                  </Avatar>
                  
                  <Box sx={{ flexGrow: 1, minWidth: 0, width: '100%' }}>
                    <Stack direction="row" spacing={2} alignItems="center" flexWrap="wrap" sx={{ mb: 2 }}>
                      <Typography variant="h5" fontWeight={900}>{selectedStudent.name}</Typography>
                      <Chip label={selectedStudent.status === 'ACTIVE' ? 'Đang học' : 'Ngừng'} color={selectedStudent.status === 'ACTIVE' ? 'success' : 'default'} size="small" sx={{ fontWeight: 800 }} />
                    </Stack>

                    <Grid container spacing={2.5} sx={{ mb: 1.5 }}>
                      <Grid item xs={12} sm={6} md={3}>
                        <Stack direction="row" spacing={1.5} alignItems="center">
                          <EmailIcon color="action" fontSize="small" />
                          <Box sx={{ minWidth: 0 }}>
                            <Typography variant="caption" color="text.secondary" display="block" fontWeight={700}>Email</Typography>
                            <Typography variant="body2" fontWeight={600} noWrap>{selectedStudent.email}</Typography>
                          </Box>
                        </Stack>
                      </Grid>
                      <Grid item xs={12} sm={6} md={3}>
                        <Stack direction="row" spacing={1.5} alignItems="center">
                          <PhoneIcon color="action" fontSize="small" />
                          <Box sx={{ minWidth: 0 }}>
                            <Typography variant="caption" color="text.secondary" display="block" fontWeight={700}>Số điện thoại</Typography>
                            <Typography variant="body2" fontWeight={600}>{selectedStudent.phone || 'Chưa cập nhật'}</Typography>
                          </Box>
                        </Stack>
                      </Grid>
                      <Grid item xs={12} sm={6} md={3}>
                        <Stack direction="row" spacing={1.5} alignItems="center">
                          <SchoolIcon color="action" fontSize="small" />
                          <Box sx={{ minWidth: 0 }}>
                            <Typography variant="caption" color="text.secondary" display="block" fontWeight={700}>Vai trò</Typography>
                            <Typography variant="body2" fontWeight={600}>Học viên</Typography>
                          </Box>
                        </Stack>
                      </Grid>
                      <Grid item xs={12} sm={6} md={3}>
                        <Stack direction="row" spacing={1.5} alignItems="center">
                          <ClassIcon color="action" fontSize="small" />
                          <Box sx={{ minWidth: 0 }}>
                            <Typography variant="caption" color="text.secondary" display="block" fontWeight={700}>Số lớp đang theo học</Typography>
                            <Typography variant="body2" fontWeight={800} color="primary.main">{enrollments.filter((e) => e.status === 'ACTIVE').length}</Typography>
                          </Box>
                        </Stack>
                      </Grid>
                    </Grid>

                    <Divider sx={{ my: 2 }} />
                    <Stack direction="row" spacing={1.5} justifyContent="flex-end">
                      <Button variant="outlined" startIcon={<EditIcon />} onClick={() => handleOpenEdit(selectedStudent)} sx={{ fontWeight: 700, px: 3, borderRadius: 2 }}>Sửa thông tin</Button>
                      <Button variant="outlined" color="error" startIcon={<DeleteIcon />} onClick={() => void handleDelete(selectedStudent.id)} sx={{ fontWeight: 700, px: 3, borderRadius: 2 }}>Xóa</Button>
                    </Stack>
                  </Box>
                </Stack>
              </CardContent>
            </Card>
          </Grid>

          {/* Enrollments & Classes */}
          <Grid item xs={12}>
            <Paper sx={{ p: 3 }}>
              <Typography variant="h6" fontWeight={700} sx={{ mb: 2 }}>Lớp học & Kết quả</Typography>
              {detailLoading ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}><CircularProgress /></Box>
              ) : enrollments.length === 0 ? (
                <Alert severity="info">Học viên chưa đăng ký lớp nào.</Alert>
              ) : (
                <Stack spacing={2}>
                  {enrollments.map((enr) => {
                    const cls = allClasses.find((c) => c.id === enr.classId);
                    const result = studentResults[enr.id];
                    return (
                      <Card key={enr.id} variant="outlined">
                        <CardContent>
                          <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
                            <Box>
                              <Typography variant="subtitle1" fontWeight={700}>{enr.className || cls?.name || enr.classId}</Typography>
                              <Typography variant="body2" color="text.secondary">{cls?.courseName || ''}</Typography>
                            </Box>
                            <Stack direction="row" spacing={1}>
                              <Chip size="small" label={getEnrollStatusLabel(enr.status)} color={enr.status === 'ACTIVE' ? 'success' : enr.status === 'COMPLETED' ? 'info' : 'default'} />
                              {cls && <Chip size="small" label={getStatusLabel(cls.status)} color={getStatusColor(cls.status)} variant="outlined" />}
                            </Stack>
                          </Stack>
                          <Divider sx={{ my: 1.5 }} />
                          <Grid container spacing={2}>
                            <Grid item xs={6} sm={3}>
                              <Typography variant="caption" color="text.secondary">Ngày ghi danh</Typography>
                              <Typography variant="body2">{formatDateToDDMMYYYY(enr.enrollmentDate)}</Typography>
                            </Grid>
                            <Grid item xs={6} sm={3}>
                              <Typography variant="caption" color="text.secondary">Thời gian lớp</Typography>
                              <Typography variant="body2">{formatDateToDDMMYYYY(cls?.startDate)} - {formatDateToDDMMYYYY(cls?.endDate)}</Typography>
                            </Grid>
                            <Grid item xs={6} sm={3}>
                              <Typography variant="caption" color="text.secondary">Điểm danh</Typography>
                              <Typography variant="body2">
                                {result?.attendanceRate != null ? `${Math.round(result.attendanceRate)}%` : 'N/A'}
                              </Typography>
                            </Grid>
                            <Grid item xs={6} sm={3}>
                              <Typography variant="caption" color="text.secondary">Kết quả</Typography>
                              <Typography variant="body2">
                                {result?.totalSessions != null ? `${result.presentCount || 0}/${result.totalSessions} buổi` : 'N/A'}
                              </Typography>
                            </Grid>
                          </Grid>
                          {enr.status === 'ACTIVE' && (
                            <Box sx={{ mt: 2 }}>
                              <Button size="small" variant="outlined" startIcon={<SwapHorizIcon />} onClick={() => { setTransferDialog({ open: true, enrollmentId: enr.id }); setTargetClassId(''); }}>
                                Chuyển lớp
                              </Button>
                            </Box>
                          )}
                        </CardContent>
                      </Card>
                    );
                  })}
                </Stack>
              )}
            </Paper>
          </Grid>
        </Grid>

        {/* Transfer Dialog */}
        <Dialog open={transferDialog.open} onClose={() => setTransferDialog({ open: false, enrollmentId: '' })} maxWidth="sm" fullWidth>
          <DialogTitle>Chuyển lớp cho học viên</DialogTitle>
          <DialogContent>
            <TextField fullWidth select label="Lớp đích" margin="normal" value={targetClassId} onChange={(e) => setTargetClassId(e.target.value)}>
              {allClasses.filter((c) => c.status === 'ACCEPTING' || c.status === 'ONGOING').map((c) => (
                <MenuItem key={c.id} value={c.id}>{c.name || c.id} ({getStatusLabel(c.status)})</MenuItem>
              ))}
            </TextField>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setTransferDialog({ open: false, enrollmentId: '' })}>Hủy</Button>
            <Button variant="contained" disabled={!targetClassId || submitting} onClick={() => void handleTransfer()}>
              {submitting ? 'Đang chuyển...' : 'Chuyển lớp'}
            </Button>
          </DialogActions>
        </Dialog>

        {/* Create/Edit Dialog */}
        <Dialog open={openDialog} onClose={() => setOpenDialog(false)} maxWidth="sm" fullWidth>
          <DialogTitle>{editingStudent ? 'Chỉnh sửa học viên' : 'Thêm học viên mới'}</DialogTitle>
          <DialogContent>
            <TextField fullWidth label="Họ tên" margin="normal" value={form.fullName} onChange={(e) => setForm((p) => ({ ...p, fullName: e.target.value }))} />
            <TextField fullWidth label="Email" type="email" margin="normal" disabled={!!editingStudent} value={form.email} onChange={(e) => setForm((p) => ({ ...p, email: e.target.value }))} />
            {!editingStudent && <TextField fullWidth label="Mật khẩu" type="password" margin="normal" value={form.password} onChange={(e) => setForm((p) => ({ ...p, password: e.target.value }))} />}
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
          <Typography variant="h4" fontWeight={700}>Quản lý Học viên</Typography>
          <Typography color="text.secondary">Xem thông tin, lớp học, kết quả và chuyển lớp cho học viên.</Typography>
        </Box>
        <Button variant="contained" startIcon={<AddIcon />} onClick={handleOpenCreate}>Thêm học viên</Button>
      </Box>

      <Box sx={{ mb: 3 }}>
        <TextField fullWidth placeholder="Tìm kiếm học viên (tên, email, SĐT...)" value={searchQuery} onChange={(e) => handleSearch(e.target.value)} InputProps={{ startAdornment: <SearchIcon sx={{ mr: 1, color: 'text.secondary' }} /> }} variant="outlined" size="small" />
      </Box>

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}><CircularProgress /></Box>
      ) : filteredStudents.length === 0 ? (
        <Paper sx={{ p: 3, textAlign: 'center' }}>
          <Typography color="text.secondary">{searchQuery ? 'Không tìm thấy học viên' : 'Chưa có học viên nào'}</Typography>
        </Paper>
      ) : (
        <TableContainer component={Paper} sx={{ borderRadius: 4, overflow: 'auto', boxShadow: '0 8px 32px rgba(0,0,0,0.05)' }}>
          <Table sx={{ minWidth: 900 }}>
            <TableHead sx={{ bgcolor: 'rgba(0,0,0,0.02)' }}>
              <TableRow>
                <TableCell sx={{ fontWeight: 800 }}>Học viên</TableCell>
                <TableCell sx={{ fontWeight: 800 }}>Email</TableCell>
                <TableCell sx={{ fontWeight: 800 }}>Số điện thoại</TableCell>
                <TableCell sx={{ fontWeight: 800 }}>Trạng thái</TableCell>
                <TableCell align="right" sx={{ fontWeight: 800 }}>Thao tác</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredStudents.map((student) => (
                <TableRow key={student.id} hover onClick={() => setSelectedStudent(student)} sx={{ cursor: 'pointer' }}>
                  <TableCell>
                    <Stack direction="row" spacing={1.5} alignItems="center">
                      <Avatar sx={{ bgcolor: 'success.main', width: 40, height: 40 }}>{student.name?.charAt(0)?.toUpperCase()}</Avatar>
                      <Box sx={{ minWidth: 0 }}>
                        <Typography variant="subtitle2" fontWeight={800}>{student.name}</Typography>
                        <Typography variant="caption" color="text.secondary">Mã: {student.id.slice(0, 8).toUpperCase()}</Typography>
                      </Box>
                    </Stack>
                  </TableCell>
                  <TableCell>{student.email}</TableCell>
                  <TableCell>{student.phone || 'Chưa cập nhật'}</TableCell>
                  <TableCell>
                    <Chip size="small" label={student.status === 'ACTIVE' ? 'Đang học' : 'Ngừng'} color={student.status === 'ACTIVE' ? 'success' : 'default'} sx={{ fontWeight: 800 }} />
                  </TableCell>
                  <TableCell align="right">
                    <Button size="small" variant="text" sx={{ fontWeight: 800 }}>Xem chi tiết</Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      <Dialog open={openDialog} onClose={() => setOpenDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>{editingStudent ? 'Chỉnh sửa học viên' : 'Thêm học viên mới'}</DialogTitle>
        <DialogContent>
          <TextField fullWidth label="Họ tên" margin="normal" value={form.fullName} onChange={(e) => setForm((p) => ({ ...p, fullName: e.target.value }))} />
          <TextField fullWidth label="Email" type="email" margin="normal" disabled={!!editingStudent} value={form.email} onChange={(e) => setForm((p) => ({ ...p, email: e.target.value }))} />
          {!editingStudent && <TextField fullWidth label="Mật khẩu" type="password" margin="normal" value={form.password} onChange={(e) => setForm((p) => ({ ...p, password: e.target.value }))} />}
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
