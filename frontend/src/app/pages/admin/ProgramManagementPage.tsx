import { useEffect, useState } from 'react';
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Grid,
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
  Chip,
  Collapse,
} from '@mui/material';
import {
  Add as AddIcon,
  Delete as DeleteIcon,
  Edit as EditIcon,
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon,
  Search as SearchIcon,
} from '@mui/icons-material';
import { courseApi } from '../../../services/api';

interface Program {
  id: string;
  name: string;
  description: string;
  level: string;
  duration: string;
  classes: number;
  students: number;
  createdAt: string;
  status: 'ACTIVE' | 'INACTIVE';
  basePrice: number;
}

interface ProgramForm {
  name: string;
  description: string;
  level: string;
  duration: string;
  basePrice: number;
}

const defaultForm: ProgramForm = {
  name: '',
  description: '',
  level: '',
  duration: '',
  basePrice: 0,
};



export default function ProgramManagementPage() {
  const [programs, setPrograms] = useState<Program[]>([]);
  const [filteredPrograms, setFilteredPrograms] = useState<Program[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [openDialog, setOpenDialog] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [form, setForm] = useState<ProgramForm>(defaultForm);
  const [snackbar, setSnackbar] = useState<{ open: boolean; message: string; severity: 'success' | 'error' }>({
    open: false,
    message: '',
    severity: 'success',
  });

  useEffect(() => {
    void fetchPrograms();
  }, []);

  const fetchPrograms = async () => {
    try {
      const data = await courseApi.getAll();
      const mappedData: Program[] = (Array.isArray(data) ? data : data.content || []).map((c: any) => ({
        id: c.id,
        name: c.name,
        description: c.description,
        level: c.level,
        duration: '12 tuần', // Mặc định nếu backend chưa có
        classes: 0,
        students: 0,
        createdAt: new Date().toISOString(),
        status: 'ACTIVE',
        basePrice: Number(c.price || 0),
      }));
      setPrograms(mappedData);
    } catch (error) {
      console.error('Failed to fetch programs', error);
    }
  };

  useEffect(() => {
    handleSearch(searchQuery);
  }, [programs]);

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    if (!query.trim()) {
      setFilteredPrograms(programs);
    } else {
      const lowercaseQuery = query.toLowerCase();
      const filtered = programs.filter(
        (prog) =>
          prog.name?.toLowerCase().includes(lowercaseQuery) ||
          prog.description?.toLowerCase().includes(lowercaseQuery) ||
          prog.level?.toLowerCase().includes(lowercaseQuery)
      );
      setFilteredPrograms(filtered);
    }
  };

  const handleOpenCreate = () => {
    setEditingId(null);
    setForm(defaultForm);
    setOpenDialog(true);
  };

  const handleOpenEdit = (program: Program) => {
    setEditingId(program.id);
    setForm({
      name: program.name,
      description: program.description,
      level: program.level,
      duration: program.duration,
      basePrice: program.basePrice,
    });
    setOpenDialog(true);
  };

  const handleSubmit = async () => {
    try {
      if (!form.name.trim() || !form.description.trim()) {
        setSnackbar({
          open: true,
          message: 'Vui lòng điền đầy đủ thông tin chương trình',
          severity: 'error',
        });
        return;
      }

      setSubmitting(true);

      if (editingId) {
        await courseApi.update(editingId, { ...form });
        setSnackbar({ open: true, message: 'Cập nhật thành công', severity: 'success' });
      } else {
        await courseApi.create({ ...form });
        setSnackbar({ open: true, message: 'Tạo chương trình thành công', severity: 'success' });
      }

      setOpenDialog(false);
      setForm(defaultForm);
      void fetchPrograms();
    } catch (error: any) {
      setSnackbar({
        open: true,
        message: error?.message || 'Thao tác thất bại',
        severity: 'error',
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Bạn có chắc chắn muốn xóa chương trình này?')) return;
    try {
      await courseApi.delete(id);
      setSnackbar({ open: true, message: 'Xóa chương trình thành công', severity: 'success' });
      void fetchPrograms();
    } catch (error) {
      setSnackbar({ open: true, message: 'Lỗi khi xóa chương trình', severity: 'error' });
    }
  };

  const handleToggleExpand = (id: string) => {
    setExpandedId(expandedId === id ? null : id);
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" fontWeight={700}>
          Quản lý Chương trình học
        </Typography>
        <Button variant="contained" startIcon={<AddIcon />} onClick={handleOpenCreate}>
          Tạo chương trình
        </Button>
      </Box>

      {/* Search Bar */}
      <Box sx={{ mb: 3 }}>
        <TextField
          fullWidth
          placeholder="Tìm kiếm chương trình (tên, mô tả, trình độ...)"
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
      ) : filteredPrograms.length === 0 ? (
        <Paper sx={{ p: 3, textAlign: 'center' }}>
          <Typography color="text.secondary">
            {searchQuery ? 'Không tìm thấy chương trình nào' : 'Chưa có chương trình nào'}
          </Typography>
        </Paper>
      ) : (
        <Grid container spacing={3}>
          {filteredPrograms.map((program) => (
            <Grid item xs={12} key={program.id}>
              <Card>
                <CardContent>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <Box sx={{ flex: 1, cursor: 'pointer' }} onClick={() => handleToggleExpand(program.id)}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        <IconButton size="small" onClick={() => handleToggleExpand(program.id)}>
                          {expandedId === program.id ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                        </IconButton>
                        <Box>
                          <Typography variant="h6" fontWeight={700}>
                            {program.name}
                          </Typography>
                          <Box sx={{ display: 'flex', gap: 1, mt: 1, flexWrap: 'wrap' }}>
                            <Chip label={program.level} size="small" variant="outlined" />
                            <Chip label={`${program.duration}`} size="small" variant="outlined" color="primary" />
                            <Chip label={`${program.basePrice.toLocaleString('vi-VN')}đ`} size="small" variant="filled" color="secondary" sx={{ fontWeight: 700 }} />
                            <Chip
                              label={program.status === 'ACTIVE' ? 'Hoạt động' : 'Không hoạt động'}
                              size="small"
                              color={program.status === 'ACTIVE' ? 'success' : 'default'}
                            />
                          </Box>
                        </Box>
                      </Box>
                    </Box>

                    <Box sx={{ display: 'flex', gap: 1 }}>
                      <IconButton size="small" onClick={() => handleOpenEdit(program)}>
                        <EditIcon />
                      </IconButton>
                      <IconButton size="small" color="error" onClick={() => handleDelete(program.id)}>
                        <DeleteIcon />
                      </IconButton>
                    </Box>
                  </Box>

                  {/* Expandable Content */}
                  <Collapse in={expandedId === program.id} timeout="auto">
                    <Box sx={{ mt: 3, pt: 2, borderTop: '1px solid #eee' }}>
                      <Typography variant="subtitle2" fontWeight={600} sx={{ mb: 1 }}>
                        Mô tả:
                      </Typography>
                      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                        {program.description}
                      </Typography>

                      {/* Stats */}
                      <Grid container spacing={2}>
                        <Grid item xs={6} sm={3}>
                          <Paper sx={{ p: 2, textAlign: 'center', bgcolor: '#f5f5f5' }}>
                            <Typography variant="h6" fontWeight={700}>
                              {program.classes}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              Lớp học
                            </Typography>
                          </Paper>
                        </Grid>
                        <Grid item xs={6} sm={3}>
                          <Paper sx={{ p: 2, textAlign: 'center', bgcolor: '#f5f5f5' }}>
                            <Typography variant="h6" fontWeight={700}>
                              {program.students}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              Học viên
                            </Typography>
                          </Paper>
                        </Grid>
                        <Grid item xs={6} sm={3}>
                          <Paper sx={{ p: 2, textAlign: 'center', bgcolor: '#f5f5f5' }}>
                            <Typography variant="body2" color="text.secondary">
                              {new Date(program.createdAt).toLocaleDateString('vi-VN')}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              Ngày tạo
                            </Typography>
                          </Paper>
                        </Grid>
                        <Grid item xs={6} sm={3}>
                          <Button variant="outlined" fullWidth size="small">
                            Xem lớp học
                          </Button>
                        </Grid>
                      </Grid>
                    </Box>
                  </Collapse>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}

      {/* Create/Edit Program Dialog */}
      <Dialog open={openDialog} onClose={() => setOpenDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>{editingId ? 'Chỉnh sửa chương trình' : 'Tạo chương trình mới'}</DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            label="Tên chương trình"
            margin="normal"
            value={form.name}
            onChange={(e) => setForm((prev) => ({ ...prev, name: e.target.value }))}
            placeholder="VD: IELTS Preparation"
          />

          <TextField
            fullWidth
            label="Mô tả"
            margin="normal"
            multiline
            rows={3}
            value={form.description}
            onChange={(e) => setForm((prev) => ({ ...prev, description: e.target.value }))}
            placeholder="Mô tả chi tiết về chương trình học"
          />

          <TextField
            fullWidth
            label="Trình độ"
            margin="normal"
            value={form.level}
            onChange={(e) => setForm((prev) => ({ ...prev, level: e.target.value }))}
            placeholder="VD: Sơ cấp, Trung cấp, Nâng cao"
          />

          <TextField
            fullWidth
            label="Thời lượng"
            margin="normal"
            value={form.duration}
            onChange={(e) => setForm((prev) => ({ ...prev, duration: e.target.value }))}
            placeholder="VD: 12 tuần, 3 tháng"
          />

          <TextField
            fullWidth
            label="Học phí (VND)"
            margin="normal"
            type="number"
            value={form.basePrice}
            onChange={(e) => setForm((prev) => ({ ...prev, basePrice: Number(e.target.value) }))}
            placeholder="VD: 5000000"
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)}>Hủy</Button>
          <Button variant="contained" disabled={submitting} onClick={() => void handleSubmit()}>
            {submitting ? 'Đang lưu...' : editingId ? 'Cập nhật' : 'Tạo'}
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
