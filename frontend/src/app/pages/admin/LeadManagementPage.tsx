import { useEffect, useState } from 'react';
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Checkbox,
  Chip,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Grid,
  ListItemText,
  MenuItem,
  Paper,
  Snackbar,
  TextField,
  Typography,
} from '@mui/material';
import {
  Email as EmailIcon,
  PersonAdd as PersonAddIcon,
  Phone as PhoneIcon,
  SwapHoriz as SwapHorizIcon,
} from '@mui/icons-material';
import { classApi, courseApi, enrollmentApi, leadApi } from '../../../services/api';

type LeadStatus = 'NEW' | 'CONTACTED' | 'INTERESTED' | 'CONVERTED' | 'ENROLLED' | 'REJECTED';

type LeadInterest = {
  id: string;
  courseId: string;
  courseName?: string;
  status: string;
};

type LeadItem = {
  id: string;
  userId?: string;
  fullName: string;
  email?: string;
  phone: string;
  status: LeadStatus;
  createdAt?: string;
  notes?: string;
  interests?: LeadInterest[];
};

type EnrollmentItem = {
  id: string;
  studentId: string;
  studentName?: string;
  classId: string;
  className?: string;
  status: string;
};

const stages: Array<{ id: LeadStatus; title: string; color: string }> = [
  { id: 'NEW', title: 'Mới', color: '#e3f2fd' },
  { id: 'CONTACTED', title: 'Đã liên hệ', color: '#fff3e0' },
  { id: 'INTERESTED', title: 'Quan tâm', color: '#e8f5e9' },
  { id: 'CONVERTED', title: 'Đã chuyển đổi', color: '#f3e5f5' },
];

export default function LeadManagementPage() {
  const [leads, setLeads] = useState<LeadItem[]>([]);
  const [courses, setCourses] = useState<any[]>([]);
  const [classes, setClasses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [converting, setConverting] = useState(false);
  const [transferring, setTransferring] = useState(false);
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedLead, setSelectedLead] = useState<LeadItem | null>(null);
  const [convertLead, setConvertLead] = useState<LeadItem | null>(null);
  const [transferLead, setTransferLead] = useState<LeadItem | null>(null);
  const [transferEnrollments, setTransferEnrollments] = useState<EnrollmentItem[]>([]);
  const [newLead, setNewLead] = useState({
    fullName: '',
    email: '',
    phone: '',
    notes: '',
    courseIds: [] as string[],
  });
  const [convertForm, setConvertForm] = useState({ classId: '', password: '' });
  const [transferForm, setTransferForm] = useState({ enrollmentId: '', targetClassId: '' });
  const [snackbar, setSnackbar] = useState<{ open: boolean; message: string; severity: 'success' | 'error' }>({
    open: false,
    message: '',
    severity: 'success',
  });

  useEffect(() => {
    void fetchLeads();
    void fetchOptions();
  }, []);

  const fetchOptions = async () => {
    try {
      const [courseList, classList] = await Promise.all([courseApi.getAll(), classApi.getAll()]);
      setCourses(courseList || []);
      setClasses(classList || []);
    } catch {
      setCourses([]);
      setClasses([]);
    }
  };

  const fetchLeads = async () => {
    try {
      setLoading(true);
      const page = await leadApi.getAll({ size: 200 });
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
    const nextStatusMap: Record<string, LeadStatus> = {
      NEW: 'CONTACTED',
      CONTACTED: 'INTERESTED',
      INTERESTED: 'INTERESTED',
      CONVERTED: 'CONVERTED',
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
        courseIds: newLead.courseIds,
        status: 'NEW',
      });
      setSnackbar({ open: true, message: 'Tạo lead thành công', severity: 'success' });
      setOpenDialog(false);
      setNewLead({ fullName: '', email: '', phone: '', notes: '', courseIds: [] });
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

  const handleConvertLead = async () => {
    if (!convertLead || !convertForm.classId) {
      return;
    }

    try {
      setConverting(true);
      await leadApi.convert(convertLead.id, {
        email: convertLead.email,
        password: convertLead.userId ? undefined : convertForm.password,
        classId: convertForm.classId,
      });
      setSnackbar({ open: true, message: 'Đã duyệt lead thành học viên', severity: 'success' });
      setConvertLead(null);
      setConvertForm({ classId: '', password: '' });
      await fetchLeads();
    } catch (error: any) {
      setSnackbar({
        open: true,
        message: error?.response?.data?.message || 'Không thể duyệt lead',
        severity: 'error',
      });
    } finally {
      setConverting(false);
    }
  };

  const openTransferDialog = async (lead: LeadItem) => {
    if (!lead.userId) {
      setSnackbar({ open: true, message: 'Lead này chưa liên kết tài khoản học viên', severity: 'error' });
      return;
    }

    try {
      setTransferring(true);
      const response = await enrollmentApi.getByStudent(lead.userId);
      const enrollments = Array.isArray(response.data) ? response.data : [];
      setTransferLead(lead);
      setTransferEnrollments(enrollments);
      setTransferForm({
        enrollmentId: enrollments[0]?.id || '',
        targetClassId: '',
      });
    } catch (error: any) {
      setSnackbar({
        open: true,
        message: error?.response?.data?.message || 'Không thể tải lớp hiện tại của học viên',
        severity: 'error',
      });
    } finally {
      setTransferring(false);
    }
  };

  const handleTransferClass = async () => {
    if (!transferForm.enrollmentId || !transferForm.targetClassId) {
      return;
    }

    try {
      setTransferring(true);
      await enrollmentApi.transferClass(transferForm.enrollmentId, transferForm.targetClassId);
      setSnackbar({ open: true, message: 'Đã chuyển lớp cho học viên', severity: 'success' });
      setTransferLead(null);
      setTransferEnrollments([]);
      setTransferForm({ enrollmentId: '', targetClassId: '' });
      await fetchLeads();
    } catch (error: any) {
      setSnackbar({
        open: true,
        message: error?.response?.data?.message || 'Không thể chuyển lớp cho học viên',
        severity: 'error',
      });
    } finally {
      setTransferring(false);
    }
  };

  const renderInterests = (lead: LeadItem) => (
    <Box sx={{ mt: 1, display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
      {(lead.interests || []).map((interest) => (
        <Chip key={interest.id} label={interest.courseName || interest.courseId} size="small" variant="outlined" />
      ))}
    </Box>
  );

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
                        {renderInterests(lead)}
                        {stage.id !== 'CONVERTED' ? (
                          <>
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
                            <Button
                              size="small"
                              variant="outlined"
                              fullWidth
                              sx={{ mt: 1 }}
                              onClick={(e) => {
                                e.stopPropagation();
                                setConvertLead(lead);
                              }}
                            >
                              Duyệt học viên
                            </Button>
                          </>
                        ) : (
                          <Button
                            size="small"
                            variant="outlined"
                            fullWidth
                            startIcon={<SwapHorizIcon />}
                            sx={{ mt: 1 }}
                            disabled={transferring}
                            onClick={(e) => {
                              e.stopPropagation();
                              void openTransferDialog(lead);
                            }}
                          >
                            Chuyển lớp
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
          <TextField fullWidth label="Họ tên" margin="normal" value={newLead.fullName} onChange={(e) => setNewLead((prev) => ({ ...prev, fullName: e.target.value }))} />
          <TextField fullWidth label="Email" type="email" margin="normal" value={newLead.email} onChange={(e) => setNewLead((prev) => ({ ...prev, email: e.target.value }))} />
          <TextField fullWidth label="Số điện thoại" margin="normal" value={newLead.phone} onChange={(e) => setNewLead((prev) => ({ ...prev, phone: e.target.value }))} />
          <TextField
            fullWidth
            select
            label="Khóa quan tâm"
            margin="normal"
            value={newLead.courseIds}
            SelectProps={{
              multiple: true,
              renderValue: (selected) => (selected as string[]).map((id) => courses.find((course) => course.id === id)?.name || id).join(', '),
            }}
            onChange={(e) =>
              setNewLead((prev) => ({
                ...prev,
                courseIds: typeof e.target.value === 'string' ? e.target.value.split(',') : (e.target.value as string[]),
              }))
            }
          >
            {courses.map((course) => (
              <MenuItem value={course.id} key={course.id}>
                <Checkbox checked={newLead.courseIds.includes(course.id)} />
                <ListItemText primary={course.name} />
              </MenuItem>
            ))}
          </TextField>
          <TextField fullWidth label="Ghi chú" multiline rows={3} margin="normal" value={newLead.notes} onChange={(e) => setNewLead((prev) => ({ ...prev, notes: e.target.value }))} />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)}>Hủy</Button>
          <Button variant="contained" disabled={creating || !newLead.fullName || !newLead.phone} onClick={() => void handleCreateLead()}>
            {creating ? 'Đang thêm...' : 'Thêm'}
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={Boolean(convertLead)} onClose={() => setConvertLead(null)} maxWidth="sm" fullWidth>
        <DialogTitle>Duyệt lead thành học viên</DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            {convertLead?.fullName} - {convertLead?.email || convertLead?.phone}
          </Typography>
          <TextField
            fullWidth
            select
            label="Lớp sẽ ghi danh"
            margin="normal"
            value={convertForm.classId}
            onChange={(e) => setConvertForm((prev) => ({ ...prev, classId: e.target.value }))}
          >
            {classes.map((cls) => (
              <MenuItem value={cls.id} key={cls.id}>
                {cls.name || cls.id} {cls.courseName ? `- ${cls.courseName}` : ''}
              </MenuItem>
            ))}
          </TextField>
          {!convertLead?.userId && (
            <TextField
              fullWidth
              type="password"
              label="Mật khẩu tài khoản học viên"
              margin="normal"
              value={convertForm.password}
              onChange={(e) => setConvertForm((prev) => ({ ...prev, password: e.target.value }))}
              helperText="Chỉ cần nhập nếu lead này chưa có tài khoản đăng nhập."
            />
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConvertLead(null)}>Hủy</Button>
          <Button
            variant="contained"
            disabled={!convertForm.classId || (!convertLead?.userId && convertForm.password.length < 8) || converting}
            onClick={() => void handleConvertLead()}
          >
            {converting ? 'Đang duyệt...' : 'Duyệt'}
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={Boolean(transferLead)} onClose={() => setTransferLead(null)} maxWidth="sm" fullWidth>
        <DialogTitle>Chuyển lớp học viên</DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            {transferLead?.fullName} - {transferLead?.email || transferLead?.phone}
          </Typography>

          {transferEnrollments.length === 0 ? (
            <Alert severity="warning">Học viên này chưa có lớp đang ghi danh.</Alert>
          ) : (
            <>
              <TextField
                fullWidth
                select
                label="Lớp hiện tại"
                margin="normal"
                value={transferForm.enrollmentId}
                onChange={(e) =>
                  setTransferForm((prev) => ({
                    ...prev,
                    enrollmentId: e.target.value,
                    targetClassId: '',
                  }))
                }
              >
                {transferEnrollments.map((enrollment) => (
                  <MenuItem value={enrollment.id} key={enrollment.id}>
                    {enrollment.className || enrollment.classId} - {enrollment.status}
                  </MenuItem>
                ))}
              </TextField>

              <TextField
                fullWidth
                select
                label="Chuyển sang lớp"
                margin="normal"
                value={transferForm.targetClassId}
                onChange={(e) => setTransferForm((prev) => ({ ...prev, targetClassId: e.target.value }))}
              >
                {classes
                  .filter((cls) => {
                    const currentEnrollment = transferEnrollments.find(
                      (enrollment) => enrollment.id === transferForm.enrollmentId
                    );
                    return cls.id !== currentEnrollment?.classId;
                  })
                  .map((cls) => (
                    <MenuItem value={cls.id} key={cls.id}>
                      {cls.name || cls.id} {cls.courseName ? `- ${cls.courseName}` : ''}
                    </MenuItem>
                  ))}
              </TextField>
            </>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setTransferLead(null)}>Hủy</Button>
          <Button
            variant="contained"
            disabled={
              transferEnrollments.length === 0 ||
              !transferForm.enrollmentId ||
              !transferForm.targetClassId ||
              transferring
            }
            onClick={() => void handleTransferClass()}
          >
            {transferring ? 'Đang chuyển...' : 'Chuyển lớp'}
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={Boolean(selectedLead)} onClose={() => setSelectedLead(null)} maxWidth="sm" fullWidth>
        <DialogTitle>Chi tiết Lead</DialogTitle>
        <DialogContent>
          {selectedLead && (
            <Box>
              <Typography variant="h6">{selectedLead.fullName}</Typography>
              <Typography variant="body2" color="text.secondary">Email: {selectedLead.email || '-'}</Typography>
              <Typography variant="body2" color="text.secondary">Điện thoại: {selectedLead.phone}</Typography>
              <Typography variant="body2" color="text.secondary">Ngày tạo: {selectedLead.createdAt || '-'}</Typography>
              {renderInterests(selectedLead)}
              <TextField fullWidth label="Ghi chú tư vấn" multiline rows={4} margin="normal" defaultValue={selectedLead.notes} />
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setSelectedLead(null)}>Đóng</Button>
        </DialogActions>
      </Dialog>

      <Snackbar open={snackbar.open} autoHideDuration={3000} onClose={() => setSnackbar((prev) => ({ ...prev, open: false }))}>
        <Alert severity={snackbar.severity} variant="filled">
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}
