import { useEffect, useState } from 'react';
import {
  Alert,
  Box,
  Button,
  Chip,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  MenuItem,
  Paper,
  Snackbar,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Typography,
} from '@mui/material';
import { Add as AddIcon, Delete as DeleteIcon } from '@mui/icons-material';
import { branchApi, classApi, courseApi, roomApi, userApi } from '../../../services/api';

type ClassItem = {
  id: string;
  name?: string;
  status?: string;
  startDate?: string;
  endDate?: string;
  schedules?: Array<{ dayOfWeek: string; startTime: string; endTime: string }>;
};

type ClassForm = {
  name: string;
  courseId: string;
  roomId: string;
  teacherId: string;
  branchId: string;
  startDate: string;
  endDate: string;
  maxStudents: string;
  status: string;
};

const defaultForm: ClassForm = {
  name: '',
  courseId: '',
  roomId: '',
  teacherId: '',
  branchId: '',
  startDate: '',
  endDate: '',
  maxStudents: '15',
  status: 'ACCEPTING',
};

export default function ClassManagementPage() {
  const [classes, setClasses] = useState<ClassItem[]>([]);
  const [courses, setCourses] = useState<any[]>([]);
  const [teachers, setTeachers] = useState<any[]>([]);
  const [rooms, setRooms] = useState<any[]>([]);
  const [branches, setBranches] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [openDialog, setOpenDialog] = useState(false);
  const [scheduleDialog, setScheduleDialog] = useState<{ open: boolean; classId: string }>({ open: false, classId: '' });
  const [scheduleForm, setScheduleForm] = useState({ dayOfWeek: 'MONDAY', startTime: '18:00', endTime: '20:00' });
  const [form, setForm] = useState<ClassForm>(defaultForm);
  const [snackbar, setSnackbar] = useState<{ open: boolean; message: string; severity: 'success' | 'error' }>({
    open: false,
    message: '',
    severity: 'success',
  });

  useEffect(() => {
    void fetchClasses();
    void fetchOptions();
  }, []);

  const fetchClasses = async () => {
    try {
      setLoading(true);
      const data = await classApi.getAll();
      setClasses(data || []);
    } catch (error: any) {
      setSnackbar({
        open: true,
        message: error?.response?.data?.message || 'Không thể tải danh sách lớp',
        severity: 'error',
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchOptions = async () => {
    try {
      const [courseList, roomList, branchList, userPage] = await Promise.all([
        courseApi.getAll(),
        roomApi.getAll(),
        branchApi.getAll(),
        userApi.getAll({ size: 200, sort: 'fullName,asc' }),
      ]);
      setCourses(courseList || []);
      setRooms(roomList || []);
      setBranches(branchList || []);
      setTeachers((userPage.content || []).filter((user: any) => user.role === 'TEACHER'));
    } catch (error: any) {
      setSnackbar({
        open: true,
        message: error?.response?.data?.message || 'Không thể tải dữ liệu tạo lớp',
        severity: 'error',
      });
    }
  };

  const handleCreate = async () => {
    try {
      setSubmitting(true);
      await classApi.create({
        name: form.name,
        courseId: form.courseId,
        roomId: form.roomId,
        teacherId: form.teacherId,
        branchId: form.branchId,
        startDate: form.startDate,
        endDate: form.endDate,
        maxStudents: Number(form.maxStudents),
        status: form.status,
      });
      setSnackbar({ open: true, message: 'Tạo lớp thành công', severity: 'success' });
      setOpenDialog(false);
      setForm(defaultForm);
      await fetchClasses();
    } catch (error: any) {
      setSnackbar({
        open: true,
        message: error?.response?.data?.message || 'Không thể tạo lớp',
        severity: 'error',
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await classApi.delete(id);
      setSnackbar({ open: true, message: 'Xóa lớp thành công', severity: 'success' });
      await fetchClasses();
    } catch (error: any) {
      setSnackbar({
        open: true,
        message: error?.response?.data?.message || 'Không thể xóa lớp',
        severity: 'error',
      });
    }
  };

  const handleUpdateStatus = async (id: string, newStatus: string) => {
    try {
      await classApi.updateStatus(id, newStatus);
      setSnackbar({ open: true, message: 'Cập nhật trạng thái thành công', severity: 'success' });
      await fetchClasses();
    } catch (error: any) {
      setSnackbar({
        open: true,
        message: error?.response?.data?.message || 'Không thể cập nhật trạng thái',
        severity: 'error',
      });
    }
  };

  const handleAddSchedule = async (id: string) => {
    try {
      await classApi.addSchedule(id, scheduleForm);
      setSnackbar({ open: true, message: 'Thêm lịch học thành công', severity: 'success' });
      setScheduleDialog({ open: false, classId: '' });
      await fetchClasses();
    } catch (error: any) {
      setSnackbar({
        open: true,
        message: error?.response?.data?.message || 'Không thể thêm lịch học',
        severity: 'error',
      });
    }
  };

  const getStatusColor = (status?: string) => {
    switch (status) {
      case 'ACCEPTING':
        return 'success';
      case 'UPCOMING':
        return 'info';
      case 'ONGOING':
        return 'primary';
      case 'COMPLETED':
        return 'default';
      case 'CANCELLED':
        return 'error';
      default:
        return 'default';
    }
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" fontWeight={700}>
          Quản lý lớp học
        </Typography>
        <Button variant="contained" startIcon={<AddIcon />} onClick={() => setOpenDialog(true)}>
          Tạo lớp mới
        </Button>
      </Box>

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
          <CircularProgress />
        </Box>
      ) : (
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Tên lớp</TableCell>
                <TableCell>Lịch học</TableCell>
                <TableCell>Ngày bắt đầu</TableCell>
                <TableCell>Ngày kết thúc</TableCell>
                <TableCell>Trạng thái</TableCell>
                <TableCell align="right">Thao tác</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {classes.map((cls) => (
                <TableRow key={cls.id}>
                  <TableCell>
                    <Typography variant="body2" fontWeight={600}>
                      {cls.name || cls.id}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                      {(cls.schedules || []).map((sch, idx) => (
                        <Typography key={idx} variant="caption">
                          {sch.dayOfWeek}: {sch.startTime}-{sch.endTime}
                        </Typography>
                      ))}
                      {!cls.schedules?.length && (
                        <Typography variant="caption" color="text.secondary">
                          Chưa có lịch
                        </Typography>
                      )}
                    </Box>
                  </TableCell>
                  <TableCell>{cls.startDate || '-'}</TableCell>
                  <TableCell>{cls.endDate || '-'}</TableCell>
                  <TableCell>
                    <Chip label={cls.status || 'UNKNOWN'} color={getStatusColor(cls.status)} size="small" />
                  </TableCell>
                  <TableCell align="right">
                    <Box sx={{ display: 'flex', gap: 1, justifyContent: 'flex-end' }}>
                      {cls.status && cls.status !== 'COMPLETED' && cls.status !== 'CANCELLED' && (
                        <Button
                          size="small"
                          variant="outlined"
                          onClick={() => {
                            const nextStatus =
                              cls.status === 'ACCEPTING'
                                ? 'UPCOMING'
                                : cls.status === 'UPCOMING'
                                  ? 'ONGOING'
                                  : 'COMPLETED';
                            void handleUpdateStatus(cls.id, nextStatus);
                          }}
                        >
                          {cls.status === 'ACCEPTING'
                            ? 'Tiếp theo'
                            : cls.status === 'UPCOMING'
                              ? 'Bắt đầu'
                              : 'Hoàn thành'}
                        </Button>
                      )}
                      <Button size="small" variant="outlined" onClick={() => setScheduleDialog({ open: true, classId: cls.id })}>
                        Thêm lịch
                      </Button>
                      <IconButton size="small" color="error" onClick={() => void handleDelete(cls.id)}>
                        <DeleteIcon />
                      </IconButton>
                    </Box>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      <Dialog open={openDialog} onClose={() => setOpenDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Tạo lớp học mới</DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            label="Tên lớp"
            margin="normal"
            value={form.name}
            onChange={(e) => setForm((prev) => ({ ...prev, name: e.target.value }))}
          />
          <TextField fullWidth select label="Khóa học" margin="normal" value={form.courseId} onChange={(e) => setForm((prev) => ({ ...prev, courseId: e.target.value }))}>
            {courses.map((course) => <MenuItem value={course.id} key={course.id}>{course.name}</MenuItem>)}
          </TextField>
          <TextField fullWidth select label="Giáo viên" margin="normal" value={form.teacherId} onChange={(e) => setForm((prev) => ({ ...prev, teacherId: e.target.value }))}>
            {teachers.map((teacher) => <MenuItem value={teacher.id} key={teacher.id}>{teacher.name || teacher.email}</MenuItem>)}
          </TextField>
          <TextField fullWidth select label="Phòng học" margin="normal" value={form.roomId} onChange={(e) => setForm((prev) => ({ ...prev, roomId: e.target.value }))}>
            {rooms.map((room) => <MenuItem value={room.id} key={room.id}>{room.name} ({room.capacity || '-'} chỗ)</MenuItem>)}
          </TextField>
          <TextField fullWidth select label="Chi nhánh" margin="normal" value={form.branchId} onChange={(e) => setForm((prev) => ({ ...prev, branchId: e.target.value }))}>
            {branches.map((branch) => <MenuItem value={branch.id} key={branch.id}>{branch.name}</MenuItem>)}
          </TextField>
          <TextField
            fullWidth
            type="date"
            label="Ngày bắt đầu"
            margin="normal"
            InputLabelProps={{ shrink: true }}
            value={form.startDate}
            onChange={(e) => setForm((prev) => ({ ...prev, startDate: e.target.value }))}
          />
          <TextField
            fullWidth
            type="date"
            label="Ngày kết thúc"
            margin="normal"
            InputLabelProps={{ shrink: true }}
            value={form.endDate}
            onChange={(e) => setForm((prev) => ({ ...prev, endDate: e.target.value }))}
          />
          <TextField
            fullWidth
            type="number"
            label="Sĩ số tối đa"
            margin="normal"
            value={form.maxStudents}
            onChange={(e) => setForm((prev) => ({ ...prev, maxStudents: e.target.value }))}
          />
          <TextField
            fullWidth
            select
            label="Trạng thái"
            margin="normal"
            value={form.status}
            onChange={(e) => setForm((prev) => ({ ...prev, status: e.target.value }))}
          >
            <MenuItem value="ACCEPTING">ACCEPTING</MenuItem>
            <MenuItem value="UPCOMING">UPCOMING</MenuItem>
            <MenuItem value="ONGOING">ONGOING</MenuItem>
          </TextField>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)}>Hủy</Button>
          <Button variant="contained" disabled={submitting} onClick={() => void handleCreate()}>
            {submitting ? 'Đang tạo...' : 'Tạo lớp'}
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={scheduleDialog.open} onClose={() => setScheduleDialog({ open: false, classId: '' })} maxWidth="xs" fullWidth>
        <DialogTitle>Thêm lịch học</DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            select
            label="Ngày trong tuần"
            margin="normal"
            value={scheduleForm.dayOfWeek}
            onChange={(e) => setScheduleForm((prev) => ({ ...prev, dayOfWeek: e.target.value }))}
          >
            <MenuItem value="MONDAY">Thứ Hai</MenuItem>
            <MenuItem value="TUESDAY">Thứ Ba</MenuItem>
            <MenuItem value="WEDNESDAY">Thứ Tư</MenuItem>
            <MenuItem value="THURSDAY">Thứ Năm</MenuItem>
            <MenuItem value="FRIDAY">Thứ Sáu</MenuItem>
            <MenuItem value="SATURDAY">Thứ Bảy</MenuItem>
            <MenuItem value="SUNDAY">Chủ Nhật</MenuItem>
          </TextField>
          <TextField
            fullWidth
            type="time"
            label="Giờ bắt đầu"
            margin="normal"
            InputLabelProps={{ shrink: true }}
            value={scheduleForm.startTime}
            onChange={(e) => setScheduleForm((prev) => ({ ...prev, startTime: e.target.value }))}
          />
          <TextField
            fullWidth
            type="time"
            label="Giờ kết thúc"
            margin="normal"
            InputLabelProps={{ shrink: true }}
            value={scheduleForm.endTime}
            onChange={(e) => setScheduleForm((prev) => ({ ...prev, endTime: e.target.value }))}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setScheduleDialog({ open: false, classId: '' })}>Hủy</Button>
          <Button variant="contained" onClick={() => void handleAddSchedule(scheduleDialog.classId)}>
            Thêm lịch
          </Button>
        </DialogActions>
      </Dialog>

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
