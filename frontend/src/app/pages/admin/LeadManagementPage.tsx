import { useEffect, useState } from 'react';
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
  Paper,
  Snackbar,
  TextField,
  Typography,
} from '@mui/material';
import { PersonAdd as PersonAddIcon, Phone as PhoneIcon, Email as EmailIcon } from '@mui/icons-material';
import { leadApi } from '../../../services/api';

type LeadItem = {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  status: 'NEW' | 'CONTACTED' | 'INTERESTED' | 'ENROLLED' | 'REJECTED';
  createdAt?: string;
  notes?: string;
};

const stages = [
  { id: 'NEW', title: 'Mới', color: '#e3f2fd' },
  { id: 'CONTACTED', title: 'Đã liên hệ', color: '#fff3e0' },
  { id: 'INTERESTED', title: 'Quan tâm', color: '#e8f5e9' },
  { id: 'ENROLLED', title: 'Đã đăng ký', color: '#f3e5f5' },
];

export default function LeadManagementPage() {
  const [leads, setLeads] = useState<LeadItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedLead, setSelectedLead] = useState<LeadItem | null>(null);
  const [creating, setCreating] = useState(false);
  const [newLead, setNewLead] = useState({ fullName: '', email: '', phone: '', notes: '' });
  const [snackbar, setSnackbar] = useState<{ open: boolean; message: string; severity: 'success' | 'error' }>({
    open: false,
    message: '',
    severity: 'success',
  });

  useEffect(() => {
    void fetchLeads();
  }, []);

  const fetchLeads = async () => {
    try {
      setLoading(true);
      const page = await leadApi.getAll({ size: 200, sort: 'createdAt,desc' });
      setLeads(page.content || []);
    } catch (error: any) {
      setSnackbar({
        open: true,
        message: error?.response?.data?.message || 'Không thể tải danh sách lead',
        severity: 'error',
      });
    } finally {
      setLoading(false);
    }
  };

  const getLeadsByStatus = (status: string) => leads.filter((lead) => lead.status === status);

  const handleMoveToNextStage = async (lead: LeadItem) => {
    const nextStatusMap: Record<string, LeadItem['status']> = {
      NEW: 'CONTACTED',
      CONTACTED: 'INTERESTED',
      INTERESTED: 'ENROLLED',
      ENROLLED: 'ENROLLED',
      REJECTED: 'REJECTED',
    };

    const nextStatus = nextStatusMap[lead.status];
    if (nextStatus === lead.status) {
      return;
    }

    try {
      await leadApi.updateStatus(lead.id, nextStatus);
      setSnackbar({ open: true, message: `Cập nhật lead sang ${nextStatus}`, severity: 'success' });
      await fetchLeads();
    } catch (error: any) {
      setSnackbar({
        open: true,
        message: error?.response?.data?.message || 'Không thể cập nhật trạng thái lead',
        severity: 'error',
      });
    }
  };

  const handleCreateLead = async () => {
    try {
      setCreating(true);
      await leadApi.create({
        fullName: newLead.fullName,
        email: newLead.email,
        phone: newLead.phone,
        notes: newLead.notes,
        status: 'NEW',
      });
      setSnackbar({ open: true, message: 'Tạo lead mới thành công', severity: 'success' });
      setOpenDialog(false);
      setNewLead({ fullName: '', email: '', phone: '', notes: '' });
      await fetchLeads();
    } catch (error: any) {
      setSnackbar({
        open: true,
        message: error?.response?.data?.message || 'Không thể tạo lead',
        severity: 'error',
      });
    } finally {
      setCreating(false);
    }
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" fontWeight={700}>
          CRM & Quản lý Leads
        </Typography>
        <Button variant="contained" startIcon={<PersonAddIcon />} onClick={() => setOpenDialog(true)}>
          Thêm Lead mới
        </Button>
      </Box>

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
          <CircularProgress />
        </Box>
      ) : (
        <Grid container spacing={2}>
          {stages.map((stage) => (
            <Grid item xs={12} md={3} key={stage.id}>
              <Paper sx={{ p: 2, bgcolor: stage.color, minHeight: 400 }}>
                <Typography variant="h6" gutterBottom fontWeight={600}>
                  {stage.title}
                  <Chip label={getLeadsByStatus(stage.id).length} size="small" sx={{ ml: 1 }} />
                </Typography>

                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                  {getLeadsByStatus(stage.id).map((lead) => (
                    <Card key={lead.id} sx={{ cursor: 'pointer' }} onClick={() => setSelectedLead(lead)}>
                      <CardContent>
                        <Typography variant="subtitle1" fontWeight={600}>
                          {lead.fullName}
                        </Typography>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mt: 1 }}>
                          <PhoneIcon fontSize="small" color="action" />
                          <Typography variant="caption">{lead.phone}</Typography>
                        </Box>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                          <EmailIcon fontSize="small" color="action" />
                          <Typography variant="caption">{lead.email || '-'}</Typography>
                        </Box>
                        {stage.id !== 'ENROLLED' && (
                          <Button
                            size="small"
                            variant="contained"
                            fullWidth
                            sx={{ mt: 1 }}
                            onClick={(e) => {
                              e.stopPropagation();
                              void handleMoveToNextStage(lead);
                            }}
                          >
                            Chuyển bước
                          </Button>
                        )}
                      </CardContent>
                    </Card>
                  ))}
                </Box>
              </Paper>
            </Grid>
          ))}
        </Grid>
      )}

      <Dialog open={openDialog} onClose={() => setOpenDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Thêm Lead mới</DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            label="Họ tên"
            margin="normal"
            value={newLead.fullName}
            onChange={(e) => setNewLead((prev) => ({ ...prev, fullName: e.target.value }))}
          />
          <TextField
            fullWidth
            label="Email"
            type="email"
            margin="normal"
            value={newLead.email}
            onChange={(e) => setNewLead((prev) => ({ ...prev, email: e.target.value }))}
          />
          <TextField
            fullWidth
            label="Số điện thoại"
            margin="normal"
            value={newLead.phone}
            onChange={(e) => setNewLead((prev) => ({ ...prev, phone: e.target.value }))}
          />
          <TextField
            fullWidth
            label="Ghi chú"
            multiline
            rows={3}
            margin="normal"
            value={newLead.notes}
            onChange={(e) => setNewLead((prev) => ({ ...prev, notes: e.target.value }))}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)}>Hủy</Button>
          <Button variant="contained" disabled={creating} onClick={() => void handleCreateLead()}>
            {creating ? 'Đang thêm...' : 'Thêm'}
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={Boolean(selectedLead)} onClose={() => setSelectedLead(null)} maxWidth="sm" fullWidth>
        <DialogTitle>Chi tiết Lead</DialogTitle>
        <DialogContent>
          {selectedLead && (
            <Box>
              <Typography variant="h6">{selectedLead.fullName}</Typography>
              <Typography variant="body2" color="text.secondary">
                Email: {selectedLead.email || '-'}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Điện thoại: {selectedLead.phone}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Ngày tạo: {selectedLead.createdAt || '-'}
              </Typography>
              <TextField fullWidth label="Ghi chú tư vấn" multiline rows={4} margin="normal" defaultValue={selectedLead.notes} />
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setSelectedLead(null)}>Đóng</Button>
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
