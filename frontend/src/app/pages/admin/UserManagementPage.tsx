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
import { Add as AddIcon, Delete as DeleteIcon, Edit as EditIcon, Search as SearchIcon } from '@mui/icons-material';
import { AppUser, userApi, UserRole } from '../../../services/api';

interface UserManagementPageProps {
  role?: UserRole;
}

type UserForm = {
  fullName: string;
  email: string;
  phone: string;
  role: UserRole;
  status: 'ACTIVE' | 'INACTIVE' | 'DEACTIVATED';
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

export default function UserManagementPage({ role }: UserManagementPageProps) {
  const [users, setUsers] = useState<AppUser[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<AppUser[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
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

  const pageTitle = role
    ? role === 'TEACHER'
      ? 'Quản lý Giáo viên'
      : role === 'ACCOUNTANT'
        ? 'Quản lý Kế toán'
        : role === 'STUDENT'
          ? 'Quản lý Học viên'
          : 'Quản lý người dùng'
    : 'Quản lý người dùng';

  useEffect(() => {
    void fetchUsers();
  }, [role]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const page = await userApi.getAll({ size: 100, sort: 'fullName,asc' });
      let allUsers = page.content;
      
      // Filter by role if specified
      if (role) {
        allUsers = allUsers.filter((user) => user.role === role);
      }
      
      setUsers(allUsers);
      setFilteredUsers(allUsers);
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

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    if (!query.trim()) {
      setFilteredUsers(users);
    } else {
      const lowercaseQuery = query.toLowerCase();
      const filtered = users.filter((user) =>
        user.fullName?.toLowerCase().includes(lowercaseQuery) ||
        user.email?.toLowerCase().includes(lowercaseQuery) ||
        user.phone?.includes(lowercaseQuery)
      );
      setFilteredUsers(filtered);
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
      fullName: user.fullName,
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

  const getRoleLabel = (roleValue: string) => {
    switch (roleValue) {
      case 'MANAGER':
        return 'Quản trị viên';
      case 'TEACHER':
        return 'Giáo viên';
      case 'STUDENT':
        return 'Học viên';
      case 'ACCOUNTANT':
        return 'Kế toán';
      case 'LEAD':
        return 'Khách tiềm năng';
      default:
        return roleValue;
    }
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" fontWeight={700}>
          {pageTitle}
        </Typography>
        {!role && (
          <Button variant="contained" startIcon={<AddIcon />} onClick={handleOpenCreate}>
            Thêm người dùng
          </Button>
        )}
      </Box>

      {/* Search Bar */}
      <Box sx={{ mb: 3 }}>
        <TextField
          fullWidth
          placeholder="Tìm kiếm (tên, email, số điện thoại...)"
          value={searchQuery}
          onChange={(e) => handleSearch(e.target.value)}
          InputProps={{
            startAdornment: <SearchIcon sx={{ mr: 1, color: 'text.secondary' }} />,
          }}
          variant="outlined"
          size="small"
        />
      </Box>

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
          <CircularProgress />
        </Box>
      ) : filteredUsers.length === 0 ? (
        <Paper sx={{ p: 3, textAlign: 'center' }}>
          <Typography color="text.secondary">
            {searchQuery ? 'Không tìm thấy kết quả phù hợp' : 'Chưa có người dùng nào'}
          </Typography>
        </Paper>
      ) : (
        <TableContainer component={Paper}>
          <Table>
            <TableHead sx={{ backgroundColor: '#f5f5f5' }}>
              <TableRow>
                <TableCell sx={{ fontWeight: 600 }}>Họ tên</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Email</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Số điện thoại</TableCell>
                {!role && <TableCell sx={{ fontWeight: 600 }}>Vai trò</TableCell>}
                <TableCell sx={{ fontWeight: 600 }}>Trạng thái</TableCell>
                <TableCell align="right" sx={{ fontWeight: 600 }}>Thao tác</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredUsers.map((user) => (
                <TableRow key={user.id} hover>
                  <TableCell>{user.fullName}</TableCell>
                  <TableCell>{user.email}</TableCell>
                  <TableCell>{user.phone || '-'}</TableCell>
                  {!role && (
                    <TableCell>
                      <Chip 
                        label={getRoleLabel(user.role)} 
                        color={getRoleColor(user.role)} 
                        size="small" 
                        sx={{ whiteSpace: 'nowrap', fontWeight: 600 }}
                      />
                    </TableCell>
                  )}
                  <TableCell>
                    <Chip
                      label={user.status === 'ACTIVE' ? 'Hoạt động' : 'Vô hiệu hóa'}
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
            SelectProps={{
              MenuProps: {
                PaperProps: {
                  sx: { minWidth: 200 }
                }
              }
            }}
          >
            <MenuItem value="MANAGER">Quản trị viên</MenuItem>
            <MenuItem value="TEACHER">Giáo viên</MenuItem>
            <MenuItem value="STUDENT">Học viên</MenuItem>
            <MenuItem value="ACCOUNTANT">Kế toán</MenuItem>
            <MenuItem value="LEAD">Khách tiềm năng</MenuItem>
          </TextField>
          <TextField
            fullWidth
            select
            label="Trạng thái"
            margin="normal"
            value={form.status}
            onChange={(e) =>
              setForm((prev) => ({ ...prev, status: e.target.value as 'ACTIVE' | 'INACTIVE' | 'DEACTIVATED' }))
            }
            SelectProps={{
              MenuProps: {
                PaperProps: {
                  sx: { minWidth: 200 }
                }
              }
            }}
          >
            <MenuItem value="ACTIVE">Hoạt động</MenuItem>
            <MenuItem value="INACTIVE">Không hoạt động</MenuItem>
            <MenuItem value="DEACTIVATED">Đã vô hiệu hóa</MenuItem>
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
