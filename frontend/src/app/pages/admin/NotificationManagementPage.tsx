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
        message: error?.response?.data?.message || 'Khong the tai thong bao',
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
        return 'Toan trung tam';
      case 'ROLE':
        return 'Theo vai tro';
      case 'CLASS':
        return 'Theo lop';
      case 'FINANCE':
        return 'Tai chinh';
      default:
        return scope || 'Khong xac dinh';
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
        setSnackbar({ open: true, message: 'Vui long nhap tieu de va noi dung', severity: 'error' });
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

      setSnackbar({ open: true, message: 'Tao thong bao thanh cong', severity: 'success' });
      setOpenDialog(false);
      setForm(defaultForm);
      await loadData();
    } catch (error: any) {
      setSnackbar({
        open: true,
        message: error?.response?.data?.message || 'Khong the tao thong bao',
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
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3, gap: 2 }}>
        <Box>
          <Typography variant="h4" fontWeight={700}>
            Quan ly thong bao
          </Typography>
          <Typography color="text.secondary">
            Tao thong bao noi bo va theo doi danh sach da dang tren he thong.
          </Typography>
        </Box>
        <Button variant="contained" startIcon={<AddIcon />} onClick={() => setOpenDialog(true)}>
          Tao thong bao
        </Button>
      </Box>

      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={4}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="caption" color="text.secondary">
              Tong thong bao
            </Typography>
            <Typography variant="h5" fontWeight={700}>
              {counts.total}
            </Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} sm={4}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="caption" color="text.secondary">
              Dang hoat dong
            </Typography>
            <Typography variant="h5" fontWeight={700}>
              {counts.active}
            </Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} sm={4}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="caption" color="text.secondary">
              Da truyen
            </Typography>
            <Typography variant="h5" fontWeight={700}>
              {counts.delivered}
            </Typography>
          </Paper>
        </Grid>
      </Grid>

      <Box sx={{ mb: 3 }}>
        <TextField
          fullWidth
          placeholder="Tim theo tieu de, noi dung, loai thong bao..."
          value={searchQuery}
          onChange={(e) => handleSearch(e.target.value)}
          size="small"
          InputProps={{ startAdornment: <SearchIcon sx={{ mr: 1, color: 'text.secondary' }} /> }}
        />
      </Box>

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
          <CircularProgress />
        </Box>
      ) : filteredAnnouncements.length === 0 ? (
        <Paper sx={{ p: 3, textAlign: 'center' }}>
          <Typography color="text.secondary">
            {searchQuery ? 'Khong tim thay thong bao phu hop' : 'Chua co thong bao nao'}
          </Typography>
        </Paper>
      ) : (
        <Grid container spacing={2}>
          {filteredAnnouncements.map((item) => (
            <Grid item xs={12} md={6} lg={4} key={item.id}>
              <Card sx={{ height: '100%' }}>
                <CardContent>
                  <Stack direction="row" spacing={1} sx={{ mb: 1, flexWrap: 'wrap' }}>
                    <Chip label={item.type || 'INFO'} size="small" color={getTypeColor(item.type)} />
                    <Chip label={getScopeLabel(item.scope)} size="small" variant="outlined" />
                    <Chip
                      label={item.isActive ? 'Dang mo' : 'Da tat'}
                      size="small"
                      color={item.isActive ? 'success' : 'default'}
                    />
                  </Stack>
                  <Typography variant="h6" fontWeight={700} sx={{ mb: 1 }}>
                    {item.title}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                    {item.message}
                  </Typography>
                  <Stack spacing={0.5}>
                    <Typography variant="caption" color="text.secondary">
                      Nguoi tao: {item.createdByFullName || item.createdByEmail || '-'}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      Tao luc: {formatDateTimeToPattern(item.createdAt || '', 'dd/MM/yyyy HH:mm')}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      Het han: {item.expiresAt ? formatDateTimeToPattern(item.expiresAt, 'dd/MM/yyyy HH:mm') : 'Khong co'}
                    </Typography>
                  </Stack>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}

      <Dialog open={openDialog} onClose={() => setOpenDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Tao thong bao moi</DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            label="Tieu de"
            margin="normal"
            value={form.title}
            onChange={(e) => setForm((prev) => ({ ...prev, title: e.target.value }))}
          />
          <TextField
            fullWidth
            label="Noi dung"
            margin="normal"
            multiline
            rows={4}
            value={form.message}
            onChange={(e) => setForm((prev) => ({ ...prev, message: e.target.value }))}
          />
          <TextField
            fullWidth
            select
            label="Loai thong bao"
            margin="normal"
            value={form.type}
            onChange={(e) => setForm((prev) => ({ ...prev, type: e.target.value as AnnouncementForm['type'] }))}
          >
            <MenuItem value="INFO">Thong tin</MenuItem>
            <MenuItem value="URGENT">Khan cap</MenuItem>
            <MenuItem value="PROMO">Khuyen mai</MenuItem>
          </TextField>
          <TextField
            fullWidth
            select
            label="Pham vi"
            margin="normal"
            value={form.scope}
            onChange={(e) => setForm((prev) => ({ ...prev, scope: e.target.value as AnnouncementForm['scope'] }))}
          >
            <MenuItem value="CENTER">Toan trung tam</MenuItem>
            <MenuItem value="ROLE">Theo vai tro</MenuItem>
            <MenuItem value="CLASS">Theo lop</MenuItem>
            <MenuItem value="FINANCE">Tai chinh</MenuItem>
          </TextField>

          {form.scope === 'ROLE' && (
            <TextField
              fullWidth
              select
              label="Vai tro dich"
              margin="normal"
              value={form.targetRole}
              onChange={(e) => setForm((prev) => ({ ...prev, targetRole: e.target.value }))}
            >
              <MenuItem value="TEACHER">Giao vien</MenuItem>
              <MenuItem value="STUDENT">Hoc vien</MenuItem>
              <MenuItem value="ACCOUNTANT">Ke toan</MenuItem>
              <MenuItem value="MANAGER">Quan ly</MenuItem>
            </TextField>
          )}

          {form.scope === 'CLASS' && (
            <TextField
              fullWidth
              select
              label="Lop hoc dich"
              margin="normal"
              value={form.targetClassId}
              onChange={(e) => setForm((prev) => ({ ...prev, targetClassId: e.target.value }))}
            >
              {classes.map((item) => (
                <MenuItem value={item.id} key={item.id}>
                  {item.name || item.id}
                </MenuItem>
              ))}
            </TextField>
          )}

          {form.scope === 'FINANCE' && (
            <Alert severity="info" sx={{ mt: 2 }}>
              Pham vi tai chinh hien chua co bo chon rieng, thong bao se theo quy tac backend.
            </Alert>
          )}

          <TextField
            fullWidth
            type="datetime-local"
            label="Het han"
            margin="normal"
            InputLabelProps={{ shrink: true }}
            value={form.expiresAt}
            onChange={(e) => setForm((prev) => ({ ...prev, expiresAt: e.target.value }))}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)}>Huy</Button>
          <Button variant="contained" startIcon={<SendIcon />} disabled={submitting} onClick={() => void handleCreate()}>
            {submitting ? 'Dang tao...' : 'Tao thong bao'}
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
