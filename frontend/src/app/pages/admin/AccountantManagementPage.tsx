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
  AccountBalance as AccountBalanceIcon,
  ArrowBack as ArrowBackIcon,
} from '@mui/icons-material';
import { AppUser, userApi, UserRole } from '../../../services/api';

type AccountantForm = {
  fullName: string;
  email: string;
  phone: string;
  password: string;
};

const defaultForm: AccountantForm = { fullName: '', email: '', phone: '', password: '' };

export default function AccountantManagementPage() {
  const [accountants, setAccountants] = useState<AppUser[]>([]);
  const [filteredAccountants, setFilteredAccountants] = useState<AppUser[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [openDialog, setOpenDialog] = useState(false);
  const [editingAccountant, setEditingAccountant] = useState<AppUser | null>(null);
  const [form, setForm] = useState<AccountantForm>(defaultForm);
  const [selectedAccountant, setSelectedAccountant] = useState<AppUser | null>(null);
  const [snackbar, setSnackbar] = useState<{ open: boolean; message: string; severity: 'success' | 'error' }>({
    open: false, message: '', severity: 'success',
  });

  useEffect(() => { void fetchAccountants(); }, []);

  const fetchAccountants = async () => {
    try {
      setLoading(true);
      const page = await userApi.getAll({ size: 200, sort: 'fullName,asc' });
      const list = (page.content || []).filter((u) => u.role === 'ACCOUNTANT');
      setAccountants(list);
      setFilteredAccountants(list);
    } catch (err: any) {
      setSnackbar({ open: true, message: err?.response?.data?.message || 'Không thể tải danh sách kế toán', severity: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    if (!query.trim()) {
      setFilteredAccountants(accountants);
    } else {
      const q = query.toLowerCase();
      setFilteredAccountants(accountants.filter((a) =>
        a.name?.toLowerCase().includes(q) || a.email?.toLowerCase().includes(q) || a.phone?.includes(q)
      ));
    }
  };

  const handleOpenCreate = () => { setEditingAccountant(null); setForm(defaultForm); setOpenDialog(true); };
  const handleOpenEdit = (acc: AppUser) => {
    setEditingAccountant(acc);
    setForm({ fullName: acc.name, email: acc.email, phone: acc.phone || '', password: '' });
    setOpenDialog(true);
  };

  const handleSubmit = async () => {
    try {
      setSubmitting(true);
      if (editingAccountant) {
        await userApi.update(editingAccountant.id, { fullName: form.fullName, phone: form.phone });
      } else {
        await userApi.create({ email: form.email, password: form.password, fullName: form.fullName, phone: form.phone, role: 'ACCOUNTANT' as UserRole });
      }
      setSnackbar({ open: true, message: editingAccountant ? 'Cập nhật kế toán thành công' : 'Thêm kế toán thành công', severity: 'success' });
      setOpenDialog(false);
      await fetchAccountants();
    } catch (err: any) {
      setSnackbar({ open: true, message: err?.response?.data?.message || 'Thao tác thất bại', severity: 'error' });
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await userApi.deactivate(id);
      setSnackbar({ open: true, message: 'Đã vô hiệu hóa kế toán', severity: 'success' });
      if (selectedAccountant?.id === id) setSelectedAccountant(null);
      await fetchAccountants();
    } catch (err: any) {
      setSnackbar({ open: true, message: err?.response?.data?.message || 'Không thể vô hiệu hóa', severity: 'error' });
    }
  };

  // Detail View
  if (selectedAccountant) {
    return (
      <Box>
        <Button startIcon={<ArrowBackIcon />} onClick={() => setSelectedAccountant(null)} sx={{ mb: 2 }}>
          Quay lại danh sách
        </Button>

        <Grid container spacing={3}>
          <Grid item xs={12}>
            <Card sx={{ borderRadius: 4, border: '1px solid rgba(15,23,42,0.06)', boxShadow: '0 10px 30px rgba(15,23,42,0.04)' }}>
              <CardContent sx={{ p: { xs: 2.5, sm: 3.5 } }}>
                <Stack direction={{ xs: 'column', sm: 'row' }} spacing={3.5} alignItems="flex-start">
                  <Avatar sx={{ width: { xs: 100, sm: 120 }, height: { xs: 100, sm: 120 }, fontSize: { xs: 40, sm: 48 }, fontWeight: 800, bgcolor: 'info.main', borderRadius: 3, flexShrink: 0 }} variant="rounded">
                    {selectedAccountant.name?.charAt(0)?.toUpperCase()}
                  </Avatar>

                  <Box sx={{ flexGrow: 1, minWidth: 0, width: '100%' }}>
                    <Stack direction="row" spacing={2} alignItems="center" flexWrap="wrap" sx={{ mb: 2 }}>
                      <Typography variant="h5" fontWeight={900}>{selectedAccountant.name}</Typography>
                      <Chip label={selectedAccountant.status === 'ACTIVE' ? 'Hoạt động' : 'Không hoạt động'} color={selectedAccountant.status === 'ACTIVE' ? 'success' : 'default'} size="small" sx={{ fontWeight: 800 }} />
                    </Stack>

                    <Grid container spacing={2.5} sx={{ mb: 1.5 }}>
                      <Grid item xs={12} sm={6} md={4}>
                        <Stack direction="row" spacing={1.5} alignItems="center">
                          <EmailIcon color="action" fontSize="small" />
                          <Box sx={{ minWidth: 0 }}>
                            <Typography variant="caption" color="text.secondary" display="block" fontWeight={700}>Email</Typography>
                            <Typography variant="body2" fontWeight={600} noWrap>{selectedAccountant.email}</Typography>
                          </Box>
                        </Stack>
                      </Grid>
                      <Grid item xs={12} sm={6} md={4}>
                        <Stack direction="row" spacing={1.5} alignItems="center">
                          <PhoneIcon color="action" fontSize="small" />
                          <Box sx={{ minWidth: 0 }}>
                            <Typography variant="caption" color="text.secondary" display="block" fontWeight={700}>Số điện thoại</Typography>
                            <Typography variant="body2" fontWeight={600}>{selectedAccountant.phone || 'Chưa cập nhật'}</Typography>
                          </Box>
                        </Stack>
                      </Grid>
                      <Grid item xs={12} sm={6} md={4}>
                        <Stack direction="row" spacing={1.5} alignItems="center">
                          <AccountBalanceIcon color="action" fontSize="small" />
                          <Box sx={{ minWidth: 0 }}>
                            <Typography variant="caption" color="text.secondary" display="block" fontWeight={700}>Vai trò</Typography>
                            <Typography variant="body2" fontWeight={600}>Kế toán</Typography>
                          </Box>
                        </Stack>
                      </Grid>
                    </Grid>

                    <Divider sx={{ my: 2 }} />
                    <Stack direction="row" spacing={1.5} justifyContent="flex-end">
                      <Button variant="outlined" startIcon={<EditIcon />} onClick={() => handleOpenEdit(selectedAccountant)} sx={{ fontWeight: 700, px: 3, borderRadius: 2 }}>Sửa thông tin</Button>
                      <Button variant="outlined" color="error" startIcon={<DeleteIcon />} onClick={() => void handleDelete(selectedAccountant.id)} sx={{ fontWeight: 700, px: 3, borderRadius: 2 }}>Xóa</Button>
                    </Stack>
                  </Box>
                </Stack>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12}>
            <Paper sx={{ p: 3, borderRadius: 4 }}>
              <Typography variant="h6" fontWeight={700} sx={{ mb: 2 }}>Thông tin bổ sung</Typography>
              <Alert severity="info" sx={{ borderRadius: 2 }}>
                Kế toán có quyền truy cập vào Dashboard tài chính, Nghiệp vụ kế toán, Công nợ học viên, và Thanh toán giáo viên.
              </Alert>
            </Paper>
          </Grid>
        </Grid>

        <Dialog open={openDialog} onClose={() => setOpenDialog(false)} maxWidth="sm" fullWidth>
          <DialogTitle>{editingAccountant ? 'Chỉnh sửa kế toán' : 'Thêm kế toán mới'}</DialogTitle>
          <DialogContent>
            <TextField fullWidth label="Họ tên" margin="normal" value={form.fullName} onChange={(e) => setForm((p) => ({ ...p, fullName: e.target.value }))} />
            <TextField fullWidth label="Email" type="email" margin="normal" disabled={!!editingAccountant} value={form.email} onChange={(e) => setForm((p) => ({ ...p, email: e.target.value }))} />
            {!editingAccountant && <TextField fullWidth label="Mật khẩu" type="password" margin="normal" value={form.password} onChange={(e) => setForm((p) => ({ ...p, password: e.target.value }))} />}
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
          <Typography variant="h4" fontWeight={700}>Quản lý Kế toán</Typography>
          <Typography color="text.secondary">Xem thông tin chi tiết từng kế toán, thêm sửa xóa.</Typography>
        </Box>
        <Button variant="contained" startIcon={<AddIcon />} onClick={handleOpenCreate}>Thêm kế toán</Button>
      </Box>

      <Box sx={{ mb: 3 }}>
        <TextField fullWidth placeholder="Tìm kiếm kế toán (tên, email, SĐT...)" value={searchQuery} onChange={(e) => handleSearch(e.target.value)} InputProps={{ startAdornment: <SearchIcon sx={{ mr: 1, color: 'text.secondary' }} /> }} variant="outlined" size="small" />
      </Box>

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}><CircularProgress /></Box>
      ) : filteredAccountants.length === 0 ? (
        <Paper sx={{ p: 3, textAlign: 'center' }}>
          <Typography color="text.secondary">{searchQuery ? 'Không tìm thấy kế toán' : 'Chưa có kế toán nào'}</Typography>
        </Paper>
      ) : (
        <Grid container spacing={2}>
          {filteredAccountants.map((acc) => (
            <Grid item xs={12} sm={6} md={4} key={acc.id}>
              <Card sx={{ cursor: 'pointer', transition: 'all 0.2s', '&:hover': { transform: 'translateY(-3px)', boxShadow: 4 } }} onClick={() => setSelectedAccountant(acc)}>
                <CardContent>
                  <Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 2 }}>
                    <Avatar sx={{ bgcolor: 'info.main', width: 48, height: 48 }}>{acc.name?.charAt(0)?.toUpperCase()}</Avatar>
                    <Box sx={{ minWidth: 0 }}>
                      <Typography variant="subtitle1" fontWeight={700} noWrap>{acc.name}</Typography>
                      <Typography variant="body2" color="text.secondary" noWrap>{acc.email}</Typography>
                    </Box>
                  </Stack>
                  <Stack direction="row" spacing={1} sx={{ mb: 1 }}>
                    <Chip size="small" label="Kế toán" color="info" />
                    <Chip size="small" label={acc.status === 'ACTIVE' ? 'Hoạt động' : 'Ngừng'} color={acc.status === 'ACTIVE' ? 'success' : 'default'} />
                  </Stack>
                  <Typography variant="body2" color="text.secondary">SĐT: {acc.phone || 'Chưa cập nhật'}</Typography>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}

      <Dialog open={openDialog} onClose={() => setOpenDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>{editingAccountant ? 'Chỉnh sửa kế toán' : 'Thêm kế toán mới'}</DialogTitle>
        <DialogContent>
          <TextField fullWidth label="Họ tên" margin="normal" value={form.fullName} onChange={(e) => setForm((p) => ({ ...p, fullName: e.target.value }))} />
          <TextField fullWidth label="Email" type="email" margin="normal" disabled={!!editingAccountant} value={form.email} onChange={(e) => setForm((p) => ({ ...p, email: e.target.value }))} />
          {!editingAccountant && <TextField fullWidth label="Mật khẩu" type="password" margin="normal" value={form.password} onChange={(e) => setForm((p) => ({ ...p, password: e.target.value }))} />}
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
