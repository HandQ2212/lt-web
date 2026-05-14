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
  Divider,
  Grid,
  MenuItem,
  Paper,
  Snackbar,
  Stack,
  TextField,
  Typography,
  InputAdornment,
} from '@mui/material';
import { Add as AddIcon, Search as SearchIcon, Send as SendIcon } from '@mui/icons-material';
import { announcementApi, classApi } from '../../../services/api';
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
  active?: boolean;
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
  const [classes, setClasses] = useState<any[]>([]);
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
      const [announcementResponse, classResponse] = await Promise.all([
        announcementApi.getAll({ size: 100, sort: 'createdAt,desc' }),
        classApi.getAll(),
      ]);

      setAnnouncements(Array.isArray(announcementResponse) ? announcementResponse : []);
      setClasses(Array.isArray(classResponse) ? classResponse : []);
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
      active: announcements.filter((item) => (item.active ?? item.isActive) === true).length,
      delivered: announcements.filter((item) => item.isDelivered).length,
    };
  }, [announcements]);

  const isAnnouncementActive = (item: AnnouncementItem) => item.active ?? item.isActive ?? false;

  return (
    <Box sx={{ pb: 4 }}>
      <Paper
        sx={{
          p: { xs: 2, sm: 3 },
          mb: 3,
          borderRadius: 4,
          border: '1px solid rgba(15, 23, 42, 0.08)',
          boxShadow: '0 10px 30px rgba(15, 23, 42, 0.06)',
          bgcolor: 'rgba(255,255,255,0.92)',
          backdropFilter: 'blur(8px)',
        }}
      >
        <Stack direction={{ xs: 'column', md: 'row' }} justifyContent="space-between" alignItems={{ xs: 'stretch', md: 'center' }} spacing={2} sx={{ mb: 2.5 }}>
          <Box>
            <Typography variant="h4" fontWeight={900} color="primary.main">
              Quản lý Thông báo
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ maxWidth: 760 }}>
              Tạo, lọc và theo dõi thông báo nội bộ theo phạm vi, trạng thái và thời gian hết hạn.
            </Typography>
          </Box>
          <Button variant="contained" startIcon={<AddIcon />} onClick={() => setOpenDialog(true)} sx={{ borderRadius: 2, px: 3, fontWeight: 800, whiteSpace: 'nowrap' }}>
            Tạo thông báo
          </Button>
        </Stack>

        <Grid container spacing={2} sx={{ mb: 2.5 }}>
          <Grid item xs={12} sm={4}>
            <Paper sx={{ p: 2.25, borderRadius: 3, bgcolor: 'rgba(25,118,210,0.06)', border: '1px solid rgba(25,118,210,0.14)' }}>
              <Typography variant="caption" color="text.secondary" fontWeight={700} sx={{ textTransform: 'uppercase' }}>
                Tổng số
              </Typography>
              <Typography variant="h4" fontWeight={900} color="primary.main" sx={{ lineHeight: 1.05 }}>
                {counts.total}
              </Typography>
            </Paper>
          </Grid>
          <Grid item xs={12} sm={4}>
            <Paper sx={{ p: 2.25, borderRadius: 3, bgcolor: 'rgba(46,125,50,0.06)', border: '1px solid rgba(46,125,50,0.14)' }}>
              <Typography variant="caption" color="text.secondary" fontWeight={700} sx={{ textTransform: 'uppercase' }}>
                Đang hoạt động
              </Typography>
              <Typography variant="h4" fontWeight={900} color="success.main" sx={{ lineHeight: 1.05 }}>
                {counts.active}
              </Typography>
            </Paper>
          </Grid>
          <Grid item xs={12} sm={4}>
            <Paper sx={{ p: 2.25, borderRadius: 3, bgcolor: 'rgba(2,136,209,0.06)', border: '1px solid rgba(2,136,209,0.14)' }}>
              <Typography variant="caption" color="text.secondary" fontWeight={700} sx={{ textTransform: 'uppercase' }}>
                Đã gửi thành công
              </Typography>
              <Typography variant="h4" fontWeight={900} color="info.main" sx={{ lineHeight: 1.05 }}>
                {counts.delivered}
              </Typography>
            </Paper>
          </Grid>
        </Grid>

        <TextField
          fullWidth
          placeholder="Tìm kiếm theo tiêu đề, nội dung hoặc loại thông báo..."
          value={searchQuery}
          onChange={(e) => handleSearch(e.target.value)}
          size="medium"
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon sx={{ color: 'text.secondary' }} />
              </InputAdornment>
            ),
          }}
          sx={{
            '& .MuiOutlinedInput-root': {
              borderRadius: 3,
              bgcolor: 'background.paper',
            },
          }}
        />
      </Paper>

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
        <Stack spacing={2.5}>
          {filteredAnnouncements.map((item) => (
            <Card
              key={item.id}
              sx={{
                borderRadius: 4,
                overflow: 'hidden',
                boxShadow: '0 8px 24px rgba(15,23,42,0.06)',
                border: '1px solid rgba(15,23,42,0.06)',
                transition: 'transform 0.2s ease, box-shadow 0.2s ease',
                '&:hover': {
                  transform: 'translateY(-2px)',
                  boxShadow: '0 14px 32px rgba(15,23,42,0.10)',
                },
              }}
            >
              <CardContent sx={{ p: { xs: 2.25, sm: 3 } }}>
                <Stack direction={{ xs: 'column', md: 'row' }} spacing={2.25} alignItems={{ xs: 'flex-start', md: 'flex-start' }}>
                  <Box sx={{ flex: 1, minWidth: 0 }}>
                    <Stack direction="row" spacing={1} sx={{ mb: 1.5, flexWrap: 'wrap' }}>
                      <Chip
                        label={item.type === 'URGENT' ? 'Khẩn cấp' : item.type === 'PROMO' ? 'Khuyến mãi' : 'Thông tin'}
                        size="small"
                        color={getTypeColor(item.type)}
                        sx={{ fontWeight: 800 }}
                      />
                      <Chip label={getScopeLabel(item.scope)} size="small" variant="outlined" sx={{ fontWeight: 700 }} />
                      <Chip
                          label={isAnnouncementActive(item) ? 'Đang hoạt động' : 'Đã tắt'}
                        size="small"
                          color={isAnnouncementActive(item) ? 'success' : 'default'}
                          variant={isAnnouncementActive(item) ? 'filled' : 'outlined'}
                        sx={{ fontWeight: 700 }}
                      />
                    </Stack>

                    <Typography variant="h6" fontWeight={900} sx={{ mb: 1, color: 'text.primary' }}>
                      {item.title}
                    </Typography>
                    <Typography
                      variant="body2"
                      color="text.secondary"
                      sx={{
                        mb: 2,
                        lineHeight: 1.7,
                        display: '-webkit-box',
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: 'vertical',
                        overflow: 'hidden',
                      }}
                    >
                      {item.message}
                    </Typography>
                  </Box>

                  <Paper
                    variant="outlined"
                    sx={{
                      minWidth: { xs: '100%', md: 260 },
                      p: 2,
                      borderRadius: 3,
                      bgcolor: 'rgba(248,250,252,0.9)',
                      borderColor: 'rgba(15,23,42,0.08)',
                    }}
                  >
                    <Typography variant="caption" color="text.secondary" fontWeight={700} sx={{ textTransform: 'uppercase' }}>
                      Thông tin bổ sung
                    </Typography>
                    <Divider sx={{ my: 1.5 }} />
                    <Stack spacing={1}>
                      <Typography variant="body2" color="text.secondary">
                        Người tạo: <Box component="span" sx={{ color: 'text.primary', fontWeight: 700 }}>{item.createdByFullName || item.createdByEmail || '-'}</Box>
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Ngày tạo: <Box component="span" sx={{ color: 'text.primary', fontWeight: 700 }}>{formatDateTimeToPattern(item.createdAt || '', 'dd/MM/yyyy HH:mm')}</Box>
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Trạng thái: <Box component="span" sx={{ color: isAnnouncementActive(item) ? 'success.main' : 'text.primary', fontWeight: 700 }}>{isAnnouncementActive(item) ? 'Đang hoạt động' : 'Đã tắt'}</Box>
                      </Typography>
                      {item.expiresAt && (
                        <Typography variant="body2" color="error.main" fontWeight={700}>
                          Hết hạn: {formatDateTimeToPattern(item.expiresAt, 'dd/MM/yyyy HH:mm')}
                        </Typography>
                      )}
                    </Stack>
                  </Paper>
                </Stack>
              </CardContent>
            </Card>
          ))}
        </Stack>
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
