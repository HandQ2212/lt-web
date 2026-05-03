import { useEffect, useMemo, useState } from 'react';
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
import { Add as AddIcon, Delete as DeleteIcon, Edit as EditIcon } from '@mui/icons-material';
import { AppUser, userApi, UserRole } from '../../../services/api';

type UserForm = {
  fullName: string;
  email: string;
  phone: string;
  role: UserRole;
  status: 'ACTIVE' | 'INACTIVE';
  password: string;
};

const defaultForm: UserForm = {
  fullName: '',
  email: '',
  phone: '',
  role: 'STUDENT',
  status: 'ACTIVE',
  password: '',
};

export default function UserManagementPage() {
  const [users, setUsers] = useState<AppUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedUser, setSelectedUser] = useState<AppUser | null>(null);
  const [form, setForm] = useState<UserForm>(defaultForm);
  const [snackbar, setSnackbar] = useState<{ open: boolean; message: string; severity: 'success' | 'error' }>({
    open: false,
    message: '',
    severity: 'success',
  });

  const isEdit = useMemo(() => !!selectedUser, [selectedUser]);

  useEffect(() => {
    void fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const page = await userApi.getAll({ size: 100, sort: 'fullName,asc' });
      setUsers(page.content);
    } catch (error: any) {
      setSnackbar({
        open: true,
        message: error?.response?.data?.message || 'Không thể tải danh sách người dùng',
        severity: 'error',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleOpenCreate = () => {
    setSelectedUser(null);
    setForm(defaultForm);
    setOpenDialog(true);
  };

  const handleOpenEdit = (user: AppUser) => {
    setSelectedUser(user);
    setForm({
      fullName: user.name,
      email: user.email,
      phone: user.phone || '',
      role: user.role,
      status: user.status,
      password: '',
    });
    setOpenDialog(true);
  };

  const handleSubmit = async () => {
    try {
      setSubmitting(true);

      if (isEdit && selectedUser) {
        await userApi.update(selectedUser.id, {
          fullName: form.fullName,
          phone: form.phone,
          role: form.role,
          status: form.status,
        });
      } else {
        await userApi.create({
          email: form.email,
          password: form.password,
          fullName: form.fullName,
          phone: form.phone,
          role: form.role,
        });
      }

      setSnackbar({
        open: true,
        message: isEdit ? 'Cập nhật người dùng thành công' : 'Tạo người dùng thành công',
        severity: 'success',
      });
      setOpenDialog(false);
      await fetchUsers();
    } catch (error: any) {
      setSnackbar({
        open: true,
        message: error?.response?.data?.message || 'Thao tác thất bại',
        severity: 'error',
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await userApi.deactivate(id);
      setSnackbar({ open: true, message: 'Đã vô hiệu hóa người dùng', severity: 'success' });
      await fetchUsers();
    } catch (error: any) {
      setSnackbar({
        open: true,
        message: error?.response?.data?.message || 'Không thể vô hiệu hóa người dùng',
        severity: 'error',
      });
    }
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'ADMIN':
        return 'error';
      case 'MANAGER':
        return 'warning';
      case 'TEACHER':
        return 'primary';
      case 'STUDENT':
      case 'LEAD':
        return 'success';
      case 'ACCOUNTANT':
        return 'info';
      default:
        return 'default';
    }
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" fontWeight={700}>
          Quản lý người dùng
        </Typography>
        <Button variant="contained" startIcon={<AddIcon />} onClick={handleOpenCreate}>
          Thêm người dùng
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
                <TableCell>Họ tên</TableCell>
                <TableCell>Email</TableCell>
                <TableCell>Số điện thoại</TableCell>
                <TableCell>Vai trò</TableCell>
                <TableCell>Trạng thái</TableCell>
                <TableCell align="right">Thao tác</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {users.map((user) => (
                <TableRow key={user.id}>
                  <TableCell>{user.name}</TableCell>
                  <TableCell>{user.email}</TableCell>
                  <TableCell>{user.phone || '-'}</TableCell>
                  <TableCell>
                    <Chip label={user.role} color={getRoleColor(user.role)} size="small" />
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={user.status === 'ACTIVE' ? 'Hoạt động' : 'Không hoạt động'}
                      color={user.status === 'ACTIVE' ? 'success' : 'default'}
                      size="small"
                    />
                  </TableCell>
                  <TableCell align="right">
                    <IconButton size="small" onClick={() => handleOpenEdit(user)}>
                      <EditIcon />
                    </IconButton>
                    <IconButton size="small" color="error" onClick={() => void handleDelete(user.id)}>
                      <DeleteIcon />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      <Dialog open={openDialog} onClose={() => setOpenDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>{isEdit ? 'Chỉnh sửa người dùng' : 'Thêm người dùng mới'}</DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            label="Họ tên"
            margin="normal"
            value={form.fullName}
            onChange={(e) => setForm((prev) => ({ ...prev, fullName: e.target.value }))}
          />
          <TextField
            fullWidth
            label="Email"
            type="email"
            margin="normal"
            disabled={isEdit}
            value={form.email}
            onChange={(e) => setForm((prev) => ({ ...prev, email: e.target.value }))}
          />
          {!isEdit && (
            <TextField
              fullWidth
              label="Mật khẩu"
              type="password"
              margin="normal"
              value={form.password}
              onChange={(e) => setForm((prev) => ({ ...prev, password: e.target.value }))}
            />
          )}
          <TextField
            fullWidth
            label="Số điện thoại"
            margin="normal"
            value={form.phone}
            onChange={(e) => setForm((prev) => ({ ...prev, phone: e.target.value }))}
          />
          <TextField
            fullWidth
            select
            label="Vai trò"
            margin="normal"
            value={form.role}
            onChange={(e) => setForm((prev) => ({ ...prev, role: e.target.value as UserRole }))}
          >
            <MenuItem value="ADMIN">Admin</MenuItem>
            <MenuItem value="MANAGER">Manager</MenuItem>
            <MenuItem value="TEACHER">Teacher</MenuItem>
            <MenuItem value="STUDENT">Student</MenuItem>
            <MenuItem value="ACCOUNTANT">Accountant</MenuItem>
            <MenuItem value="LEAD">Lead</MenuItem>
          </TextField>
          <TextField
            fullWidth
            select
            label="Trạng thái"
            margin="normal"
            value={form.status}
            onChange={(e) => setForm((prev) => ({ ...prev, status: e.target.value as 'ACTIVE' | 'INACTIVE' }))}
          >
            <MenuItem value="ACTIVE">Hoạt động</MenuItem>
            <MenuItem value="INACTIVE">Không hoạt động</MenuItem>
          </TextField>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)}>Hủy</Button>
          <Button variant="contained" disabled={submitting} onClick={() => void handleSubmit()}>
            {submitting ? 'Đang lưu...' : 'Lưu'}
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
