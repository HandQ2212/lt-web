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
import { classApi } from '../../../services/api';

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
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [openDialog, setOpenDialog] = useState(false);
  const [form, setForm] = useState<ClassForm>(defaultForm);
  const [snackbar, setSnackbar] = useState<{ open: boolean; message: string; severity: 'success' | 'error' }>({
    open: false,
    message: '',
    severity: 'success',
  });

  useEffect(() => {
    void fetchClasses();
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
      // For now, show a simple alert - in production, would open a dialog
      const dayOfWeek = window.prompt('Ngày trong tuần (e.g., MONDAY):');
      const startTime = window.prompt('Giờ bắt đầu (e.g., 18:00):');
      const endTime = window.prompt('Giờ kết thúc (e.g., 20:00):');

      if (dayOfWeek && startTime && endTime) {
        await classApi.addSchedule(id, { dayOfWeek, startTime, endTime });
        setSnackbar({ open: true, message: 'Thêm lịch học thành công', severity: 'success' });
        await fetchClasses();
      }
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
                      <Button size="small" variant="outlined" onClick={() => void handleAddSchedule(cls.id)}>
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
          <TextField
            fullWidth
            label="Course ID"
            margin="normal"
            value={form.courseId}
            onChange={(e) => setForm((prev) => ({ ...prev, courseId: e.target.value }))}
          />
          <TextField
            fullWidth
            label="Teacher ID"
            margin="normal"
            value={form.teacherId}
            onChange={(e) => setForm((prev) => ({ ...prev, teacherId: e.target.value }))}
          />
          <TextField
            fullWidth
            label="Room ID"
            margin="normal"
            value={form.roomId}
            onChange={(e) => setForm((prev) => ({ ...prev, roomId: e.target.value }))}
          />
          <TextField
            fullWidth
            label="Branch ID"
            margin="normal"
            value={form.branchId}
            onChange={(e) => setForm((prev) => ({ ...prev, branchId: e.target.value }))}
          />
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
