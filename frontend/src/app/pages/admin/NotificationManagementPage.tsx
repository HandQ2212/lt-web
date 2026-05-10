import { useEffect, useMemo, useState } from 'react';
import {
  Alert,
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
  Grid,
  MenuItem,
  Paper,
  Snackbar,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import { Add as AddIcon, Search as SearchIcon, Send as SendIcon } from '@mui/icons-material';
import { announcementApi, branchApi, classApi, userApi } from '../../../services/api';
import { formatDateTimeToPattern } from '../../utils/dateFormatter';

type AnnouncementItem = {
  id: string;
  title?: string;
  message?: string;
  type?: string;
  scope?: string;
  targetRole?: string;
  targetClassId?: string;
  createdByFullName?: string;
  createdByEmail?: string;
  createdAt?: string;
  expiresAt?: string;
  isActive?: boolean;
  isDelivered?: boolean;
};

type AnnouncementForm = {
  title: string;
  message: string;
  type: 'URGENT' | 'INFO' | 'PROMO';
  scope: 'CENTER' | 'ROLE' | 'CLASS' | 'FINANCE';
  targetRole: string;
  targetClassId: string;
  expiresAt: string;
};

const defaultForm: AnnouncementForm = {
  title: '',
  message: '',
  type: 'INFO',
  scope: 'CENTER',
  targetRole: '',
  targetClassId: '',
  expiresAt: '',
};

export default function NotificationManagementPage() {
  const [announcements, setAnnouncements] = useState<AnnouncementItem[]>([]);
  const [filteredAnnouncements, setFilteredAnnouncements] = useState<AnnouncementItem[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [openDialog, setOpenDialog] = useState(false);
  const [form, setForm] = useState<AnnouncementForm>(defaultForm);
  const [teachers, setTeachers] = useState<any[]>([]);
  const [classes, setClasses] = useState<any[]>([]);
  const [branches, setBranches] = useState<any[]>([]);
  const [snackbar, setSnackbar] = useState<{ open: boolean; message: string; severity: 'success' | 'error' }>({
    open: false,
    message: '',
    severity: 'success',
  });

  useEffect(() => {
    void loadData();
  }, []);

  useEffect(() => {
    handleSearch(searchQuery);
  }, [announcements]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [announcementResponse, userResponse, classResponse, branchResponse] = await Promise.all([
        announcementApi.getAll({ size: 100, sort: 'createdAt,desc' }),
        userApi.getAll({ size: 200 }),
        classApi.getAll(),
        branchApi.getAll(),
      ]);

      setAnnouncements(announcementResponse.data || []);
      setTeachers((userResponse?.content || []).filter((user: any) => user.role === 'TEACHER'));
      setClasses(classResponse || []);
      setBranches(branchResponse || []);
    } catch (error: any) {
      setSnackbar({
        open: true,
        message: error?.response?.data?.message || 'Không thể tải danh sách thông báo',
        severity: 'error',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    if (!query.trim()) {
      setFilteredAnnouncements(announcements);
      return;
    }

    const lowered = query.toLowerCase();
    setFilteredAnnouncements(
      announcements.filter(
        (item) =>
          item.title?.toLowerCase().includes(lowered) ||
          item.message?.toLowerCase().includes(lowered) ||
          item.type?.toLowerCase().includes(lowered) ||
          item.scope?.toLowerCase().includes(lowered)
      )
    );
  };

  const getScopeLabel = (scope?: string) => {
    switch (scope) {
      case 'CENTER':
        return 'Toàn trung tâm';
      case 'ROLE':
        return 'Theo vai trò';
      case 'CLASS':
        return 'Theo lớp học';
      case 'FINANCE':
        return 'Tài chính';
      default:
        return scope || 'Không xác định';
    }
  };

  const getTypeColor = (type?: string): 'default' | 'error' | 'info' | 'success' => {
    switch (type) {
      case 'URGENT':
        return 'error';
      case 'PROMO':
        return 'success';
      default:
        return 'info';
    }
  };

  const handleCreate = async () => {
    try {
      if (!form.title.trim() || !form.message.trim()) {
        setSnackbar({ open: true, message: 'Vui lòng nhập tiêu đề và nội dung thông báo', severity: 'error' });
        return;
      }

      setSubmitting(true);
      await announcementApi.create({
        title: form.title,
        message: form.message,
        type: form.type,
        scope: form.scope,
        targetRole: form.scope === 'ROLE' ? form.targetRole || null : null,
        targetClassId: form.scope === 'CLASS' ? form.targetClassId || null : null,
        expiresAt: form.expiresAt ? new Date(form.expiresAt).toISOString() : null,
      });

      setSnackbar({ open: true, message: 'Tạo thông báo thành công', severity: 'success' });
      setOpenDialog(false);
      setForm(defaultForm);
      await loadData();
    } catch (error: any) {
      setSnackbar({
        open: true,
        message: error?.response?.data?.message || 'Không thể tạo thông báo mới',
        severity: 'error',
      });
    } finally {
      setSubmitting(false);
    }
  };

  const counts = useMemo(() => {
    return {
      total: announcements.length,
      active: announcements.filter((item) => item.isActive).length,
      delivered: announcements.filter((item) => item.isDelivered).length,
    };
  }, [announcements]);

  return (
    <Box sx={{ pb: 4 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4, gap: 2 }}>
        <Box>
          <Typography variant="h4" fontWeight={800} color="primary.main">
            Quản lý Thông báo
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Tạo và quản lý các thông báo nội bộ, chương trình khuyến mãi trên toàn hệ thống.
          </Typography>
        </Box>
        <Button variant="contained" startIcon={<AddIcon />} onClick={() => setOpenDialog(true)} sx={{ borderRadius: 2, px: 3, fontWeight: 700 }}>
          Tạo thông báo
        </Button>
      </Box>

      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={4}>
          <Paper sx={{ p: 3, borderRadius: 3, borderLeft: '4px solid', borderLeftColor: 'primary.main', boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}>
            <Typography variant="caption" color="text.secondary" fontWeight={700} sx={{ textTransform: 'uppercase' }}>
              Tổng số thông báo
            </Typography>
            <Typography variant="h4" fontWeight={800}>
              {counts.total}
            </Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} sm={4}>
          <Paper sx={{ p: 3, borderRadius: 3, borderLeft: '4px solid', borderLeftColor: 'success.main', boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}>
            <Typography variant="caption" color="text.secondary" fontWeight={700} sx={{ textTransform: 'uppercase' }}>
              Đang hoạt động
            </Typography>
            <Typography variant="h4" fontWeight={800} color="success.main">
              {counts.active}
            </Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} sm={4}>
          <Paper sx={{ p: 3, borderRadius: 3, borderLeft: '4px solid', borderLeftColor: 'info.main', boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}>
            <Typography variant="caption" color="text.secondary" fontWeight={700} sx={{ textTransform: 'uppercase' }}>
              Đã gửi thành công
            </Typography>
            <Typography variant="h4" fontWeight={800} color="info.main">
              {counts.delivered}
            </Typography>
          </Paper>
        </Grid>
      </Grid>

      <Box sx={{ mb: 4 }}>
        <TextField
          fullWidth
          placeholder="Tìm kiếm theo tiêu đề, nội dung hoặc loại thông báo..."
          value={searchQuery}
          onChange={(e) => handleSearch(e.target.value)}
          size="medium"
          InputProps={{ startAdornment: <SearchIcon sx={{ mr: 1, color: 'text.secondary' }} /> }}
          sx={{ bgcolor: 'white', borderRadius: 2, '& fieldset': { borderRadius: 2 } }}
        />
      </Box>

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 10 }}>
          <CircularProgress />
        </Box>
      ) : filteredAnnouncements.length === 0 ? (
        <Paper sx={{ p: 6, textAlign: 'center', borderRadius: 4, bgcolor: 'rgba(0,0,0,0.02)' }}>
          <Typography color="text.secondary" variant="h6">
            {searchQuery ? 'Không tìm thấy thông báo phù hợp với từ khóa' : 'Chưa có thông báo nào được tạo'}
          </Typography>
        </Paper>
      ) : (
        <Grid container spacing={3}>
          {filteredAnnouncements.map((item) => (
            <Grid item xs={12} md={6} lg={4} key={item.id}>
              <Card sx={{ height: '100%', borderRadius: 4, boxShadow: '0 4px 20px rgba(0,0,0,0.05)', display: 'flex', flexDirection: 'column' }}>
                <CardContent sx={{ p: 3, flexGrow: 1 }}>
                  <Stack direction="row" spacing={1} sx={{ mb: 2, flexWrap: 'wrap' }}>
                    <Chip 
                      label={item.type === 'URGENT' ? 'Khẩn cấp' : item.type === 'PROMO' ? 'Khuyến mãi' : 'Thông tin'} 
                      size="small" 
                      color={getTypeColor(item.type)} 
                      sx={{ fontWeight: 800 }}
                    />
                    <Chip label={getScopeLabel(item.scope)} size="small" variant="outlined" sx={{ fontWeight: 600 }} />
                    <Chip
                      label={item.isActive ? 'Đang mở' : 'Đã tắt'}
                      size="small"
                      color={item.isActive ? 'success' : 'default'}
                      variant={item.isActive ? 'filled' : 'outlined'}
                      sx={{ fontWeight: 700 }}
                    />
                  </Stack>
                  <Typography variant="h6" fontWeight={800} sx={{ mb: 1.5, color: 'text.primary' }}>
                    {item.title}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 3, display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                    {item.message}
                  </Typography>
                  <Divider sx={{ mb: 2, opacity: 0.6 }} />
                  <Stack spacing={0.8}>
                    <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600 }}>
                      Người tạo: <span style={{ color: '#333' }}>{item.createdByFullName || item.createdByEmail || '-'}</span>
                    </Typography>
                    <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600 }}>
                      Ngày tạo: <span style={{ color: '#333' }}>{formatDateTimeToPattern(item.createdAt || '', 'dd/MM/yyyy HH:mm')}</span>
                    </Typography>
                    {item.expiresAt && (
                      <Typography variant="caption" color="error.main" sx={{ fontWeight: 700 }}>
                        Hết hạn: {formatDateTimeToPattern(item.expiresAt, 'dd/MM/yyyy HH:mm')}
                      </Typography>
                    )}
                  </Stack>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}

      {/* Create Notification Dialog */}
      <Dialog open={openDialog} onClose={() => setOpenDialog(false)} maxWidth="sm" fullWidth PaperProps={{ sx: { borderRadius: 4 } }}>
        <DialogTitle sx={{ fontWeight: 900, pb: 1 }}>Tạo thông báo mới</DialogTitle>
        <DialogContent sx={{ pt: 2 }}>
          <Stack spacing={2.5} sx={{ mt: 1 }}>
            <TextField
              fullWidth
              label="Tiêu đề thông báo"
              placeholder="VD: Thông báo nghỉ lễ 30/4 - 1/5"
              value={form.title}
              onChange={(e) => setForm((prev) => ({ ...prev, title: e.target.value }))}
            />
            <TextField
              fullWidth
              label="Nội dung chi tiết"
              placeholder="Nhập nội dung thông báo tại đây..."
              multiline
              rows={5}
              value={form.message}
              onChange={(e) => setForm((prev) => ({ ...prev, message: e.target.value }))}
            />
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  select
                  label="Loại thông báo"
                  value={form.type}
                  onChange={(e) => setForm((prev) => ({ ...prev, type: e.target.value as AnnouncementForm['type'] }))}
                >
                  <MenuItem value="INFO">Thông tin chung</MenuItem>
                  <MenuItem value="URGENT">Thông báo khẩn cấp</MenuItem>
                  <MenuItem value="PROMO">Chương trình khuyến mãi</MenuItem>
                </TextField>
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  select
                  label="Phạm vi thông báo"
                  value={form.scope}
                  onChange={(e) => setForm((prev) => ({ ...prev, scope: e.target.value as AnnouncementForm['scope'] }))}
                >
                  <MenuItem value="CENTER">Toàn trung tâm</MenuItem>
                  <MenuItem value="ROLE">Theo vai trò người dùng</MenuItem>
                  <MenuItem value="CLASS">Theo lớp học cụ thể</MenuItem>
                  <MenuItem value="FINANCE">Phòng tài chính</MenuItem>
                </TextField>
              </Grid>
            </Grid>

            {form.scope === 'ROLE' && (
              <TextField
                fullWidth
                select
                label="Gửi đến vai trò"
                value={form.targetRole}
                onChange={(e) => setForm((prev) => ({ ...prev, targetRole: e.target.value }))}
              >
                <MenuItem value="TEACHER">Giáo viên</MenuItem>
                <MenuItem value="STUDENT">Học viên</MenuItem>
                <MenuItem value="ACCOUNTANT">Kế toán</MenuItem>
                <MenuItem value="MANAGER">Quản lý trung tâm</MenuItem>
              </TextField>
            )}

            {form.scope === 'CLASS' && (
              <TextField
                fullWidth
                select
                label="Gửi đến lớp học"
                value={form.targetClassId}
                onChange={(e) => setForm((prev) => ({ ...prev, targetClassId: e.target.value }))}
              >
                {classes.map((item) => (
                  <MenuItem value={item.id} key={item.id}>
                    {item.name || `Lớp: ${item.id.slice(0, 8)}`}
                  </MenuItem>
                ))}
              </TextField>
            )}

            <TextField
              fullWidth
              type="datetime-local"
              label="Thời gian hết hạn (Tùy chọn)"
              InputLabelProps={{ shrink: true }}
              value={form.expiresAt}
              onChange={(e) => setForm((prev) => ({ ...prev, expiresAt: e.target.value }))}
            />
          </Stack>
        </DialogContent>
        <DialogActions sx={{ p: 3 }}>
          <Button onClick={() => setOpenDialog(false)} color="inherit" sx={{ fontWeight: 700 }}>Hủy bỏ</Button>
          <Button 
            variant="contained" 
            startIcon={<SendIcon />} 
            disabled={submitting} 
            onClick={() => void handleCreate()}
            sx={{ px: 4, borderRadius: 2, fontWeight: 700 }}
          >
            {submitting ? 'Đang gửi...' : 'Gửi thông báo'}
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={() => setSnackbar((prev) => ({ ...prev, open: false }))}
      >
        <Alert severity={snackbar.severity} variant="filled" sx={{ borderRadius: 2, fontWeight: 600 }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}
