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
  MenuItem,
  Paper,
  Snackbar,
  TextField,
  Typography,
  Divider,
  IconButton,
  Tooltip,
  useTheme,
  useMediaQuery,
} from '@mui/material';
import {
  Email as EmailIcon,
  PersonAdd as PersonAddIcon,
  Phone as PhoneIcon,
  CheckCircle as CheckCircleIcon,
  Cancel as CancelIcon,
  Message as MessageIcon,
  Payment as PaymentIcon,
  School as SchoolIcon,
  Info as InfoIcon,
} from '@mui/icons-material';
import { classApi, courseApi, leadApi } from '../../../services/api';

type LeadStatus = 'NEW' | 'INTERESTED' | 'CONSULTING' | 'AGREED' | 'PAID' | 'CONVERTED' | 'REJECTED';

type LeadInterest = {
  id: string;
  courseId?: string;
  courseName?: string;
  clazzId?: string;
  clazzName?: string;
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
  currentEnrollmentId?: string;
  currentInvoiceId?: string;
  interests?: LeadInterest[];
};

const stages: Array<{ id: LeadStatus; title: string; color: string }> = [
  { id: 'NEW', title: 'Khách hàng mới', color: '#f8f9fa' },
  { id: 'INTERESTED', title: 'Đã liên hệ', color: '#e3f2fd' },
  { id: 'CONSULTING', title: 'Đang tư vấn', color: '#fff3e0' },
  { id: 'AGREED', title: 'Chờ thanh toán', color: '#fff9c4' },
  { id: 'PAID', title: 'Đã thanh toán', color: '#e8f5e9' },
  { id: 'CONVERTED', title: 'Đã nhập học', color: '#f3e5f5' },
];

export default function LeadManagementPage() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  
  const [leads, setLeads] = useState<LeadItem[]>([]);
  const [classes, setClasses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedLead, setSelectedLead] = useState<LeadItem | null>(null);
  const [agreeLead, setAgreeLead] = useState<LeadItem | null>(null);
  const [agreeClassId, setAgreeClassId] = useState('');
  const [cashPaymentLead, setCashPaymentLead] = useState<LeadItem | null>(null);
  
  const [newLead, setNewLead] = useState({
    fullName: '',
    email: '',
    phone: '',
    notes: '',
    password: '',
    courseIds: [] as string[],
  });

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
      const classList = await classApi.getAll();
      setClasses(classList || []);
    } catch {
      setClasses([]);
    }
  };

  const fetchLeads = async () => {
    try {
      setLoading(true);
      const response = await leadApi.getAll({ size: 100 });
      
      let leadsData: LeadItem[] = [];
      if (Array.isArray(response)) {
        leadsData = response;
      } else if (response && response.content && Array.isArray(response.content)) {
        leadsData = response.content;
      } else if (response && Array.isArray((response as any).data)) {
        leadsData = (response as any).data;
      }
      
      setLeads(leadsData);
    } catch (error: any) {
      console.error('Failed to fetch leads:', error);
      setSnackbar({
        open: true,
        message: error?.response?.data?.message || 'Không thể tải danh sách khách hàng tiềm năng',
        severity: 'error',
      });
    } finally {
      setLoading(false);
    }
  };

  const getLeadsByStatus = (status: LeadStatus) => {
    return leads.filter((lead) => {
      if (status === 'CONSULTING') {
        return lead.status === 'CONSULTING' || (lead.status as any) === 'CONTACTED';
      }
      return lead.status === status;
    });
  };

  const handleAction = async (id: string, action: () => Promise<any>, successMsg: string) => {
    try {
      setActionLoading(id);
      await action();
      setSnackbar({ open: true, message: successMsg, severity: 'success' });
      await fetchLeads();
    } catch (error: any) {
      setSnackbar({
        open: true,
        message: error?.response?.data?.message || 'Thao tác thất bại',
        severity: 'error',
      });
    } finally {
      setActionLoading(null);
    }
  };

  const handleConsulting = (lead: LeadItem) => 
    handleAction(lead.id, () => leadApi.moveToConsulting(lead.id), 'Đã chuyển sang trạng thái đang tư vấn');

  const handleReject = (lead: LeadItem) => 
    handleAction(lead.id, () => leadApi.reject(lead.id), 'Đã hủy trạng thái tư vấn');

  const handleAgree = async () => {
    if (!agreeLead || !agreeClassId) return;
    try {
      setActionLoading(agreeLead.id);
      await leadApi.agree(agreeLead.id, agreeClassId);
      setSnackbar({ open: true, message: 'Xác nhận nhập học thành công. Hóa đơn đã được tạo tự động.', severity: 'success' });
      setAgreeLead(null);
      setAgreeClassId('');
      await fetchLeads();
    } catch (error: any) {
      setSnackbar({
        open: true,
        message: error?.response?.data?.message || 'Không thể xác nhận nhập học',
        severity: 'error',
      });
    } finally {
      setActionLoading(null);
    }
  };

  const handleConvert = (lead: LeadItem) => 
    handleAction(lead.id, () => leadApi.convert(lead.id), 'Đã chuyển đổi thành học viên chính thức');

  const handleConfirmCashPayment = async () => {
    if (!cashPaymentLead || !cashPaymentLead.currentInvoiceId) return;

    try {
      setActionLoading(cashPaymentLead.id);
      await leadApi.confirmCash(cashPaymentLead.id);
      setSnackbar({ open: true, message: 'Đã xác nhận thu tiền mặt thành công', severity: 'success' });
      setCashPaymentLead(null);
      await fetchLeads();
    } catch (error: any) {
      setSnackbar({ 
        open: true, 
        message: error?.response?.data?.message || 'Lỗi khi xác nhận thanh toán tiền mặt', 
        severity: 'error' 
      });
    } finally {
      setActionLoading(null);
    }
  };

  const renderInterests = (lead: LeadItem) => (
    <Box sx={{ mt: 1, display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
      {(lead.interests || []).map((interest) => (
        <Tooltip key={interest.id} title={interest.clazzName ? `Lớp: ${interest.clazzName}` : `Khóa: ${interest.courseName}`}>
          <Chip 
            label={interest.clazzName || interest.courseName || 'Khác'} 
            size="small" 
            variant="outlined" 
            color={interest.clazzId ? "primary" : "default"}
            sx={{ fontSize: '0.75rem', borderRadius: 1, whiteSpace: 'nowrap', fontWeight: 600 }}
          />
        </Tooltip>
      ))}
    </Box>
  );

  return (
    <Box sx={{ pb: 4 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4, flexDirection: isMobile ? 'column' : 'row', gap: 2 }}>
        <Box>
          <Typography variant="h4" fontWeight={800} color="primary.main">
            Quản lý khách hàng tiềm năng
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Theo dõi và chăm sóc học viên từ giai đoạn quan tâm đến khi nhập học chính thức.
          </Typography>
        </Box>
        <Button 
          variant="contained" 
          startIcon={<PersonAddIcon />} 
          onClick={() => setOpenDialog(true)}
          sx={{ borderRadius: 3, px: 3, py: 1.2, boxShadow: '0 4px 12px rgba(25, 118, 210, 0.2)' }}
          fullWidth={isMobile}
        >
          Thêm khách hàng mới
        </Button>
      </Box>

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 10 }}>
          <CircularProgress />
        </Box>
      ) : (
        <Box sx={{ 
          overflowX: 'auto', 
          pb: 2, 
          mx: { xs: -2, sm: 0 }, 
          px: { xs: 2, sm: 0 },
          display: 'flex',
          gap: 2,
          scrollSnapType: 'x mandatory'
        }}>
          {stages.map((stage) => (
            <Box 
              key={stage.id}
              sx={{ 
                minWidth: { xs: '85vw', sm: 300 }, 
                width: { xs: '85vw', sm: 300 },
                scrollSnapAlign: 'start'
              }}
            >
              <Paper 
                elevation={0}
                sx={{ 
                  p: 2, 
                  bgcolor: stage.color, 
                  minHeight: '75vh', 
                  borderRadius: 4,
                  border: '1px solid rgba(0,0,0,0.05)',
                  display: 'flex',
                  flexDirection: 'column'
                }}
              >
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2, px: 0.5 }}>
                  <Typography variant="subtitle1" fontWeight={800} color="text.primary">
                    {stage.title}
                  </Typography>
                  <Chip 
                    label={getLeadsByStatus(stage.id).length} 
                    size="small" 
                    sx={{ bgcolor: 'white', fontWeight: 800, border: '1px solid rgba(0,0,0,0.1)' }} 
                  />
                </Box>

                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  {getLeadsByStatus(stage.id).length === 0 && (
                    <Box sx={{ textAlign: 'center', py: 4, opacity: 0.5 }}>
                      <Typography variant="body2" sx={{ fontStyle: 'italic' }}>Trống</Typography>
                    </Box>
                  )}
                  {getLeadsByStatus(stage.id).map((lead) => (
                    <Card 
                      key={lead.id} 
                      sx={{ 
                        borderRadius: 3, 
                        boxShadow: '0 4px 12px rgba(0,0,0,0.03)',
                        border: '1px solid rgba(0,0,0,0.04)',
                        transition: 'all 0.2s',
                        '&:hover': { transform: 'translateY(-4px)', boxShadow: '0 8px 24px rgba(0,0,0,0.08)' }
                      }}
                    >
                      <CardContent sx={{ p: 2 }}>
                        <Typography variant="subtitle1" fontWeight={700} noWrap gutterBottom>
                          {lead.fullName}
                        </Typography>
                        
                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <PhoneIcon sx={{ fontSize: 14, color: 'primary.main' }} />
                            <Typography variant="body2" color="text.secondary" fontWeight={500}>{lead.phone}</Typography>
                          </Box>
                          {lead.email && (
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                              <EmailIcon sx={{ fontSize: 14, color: 'text.secondary' }} />
                              <Typography variant="body2" color="text.secondary" noWrap sx={{ fontSize: '0.8rem' }}>{lead.email}</Typography>
                            </Box>
                          )}
                        </Box>

                        {renderInterests(lead)}

                        <Divider sx={{ my: 2, borderStyle: 'dashed' }} />

                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                          {lead.status === 'INTERESTED' && (
                            <Button
                              size="small"
                              variant="contained"
                              fullWidth
                              startIcon={<MessageIcon />}
                              onClick={() => void handleConsulting(lead)}
                              disabled={!!actionLoading}
                              sx={{ borderRadius: 2 }}
                            >
                              Bắt đầu tư vấn
                            </Button>
                          )}

                          {lead.status === 'CONSULTING' && (
                            <>
                              <Button
                                size="small"
                                variant="contained"
                                color="success"
                                fullWidth
                                startIcon={<CheckCircleIcon />}
                                onClick={() => setAgreeLead(lead)}
                                sx={{ borderRadius: 2 }}
                              >
                                Đã đồng ý học
                              </Button>
                              <Button
                                size="small"
                                variant="outlined"
                                color="error"
                                fullWidth
                                startIcon={<CancelIcon />}
                                onClick={() => void handleReject(lead)}
                                disabled={!!actionLoading}
                                sx={{ borderRadius: 2 }}
                              >
                                Không có nhu cầu
                              </Button>
                            </>
                          )}

                          {lead.status === 'AGREED' && (
                            <>
                              <Button
                                size="small"
                                variant="contained"
                                color="warning"
                                fullWidth
                                startIcon={<PaymentIcon />}
                                onClick={() => setCashPaymentLead(lead)}
                                disabled={!!actionLoading}
                                sx={{ borderRadius: 2, color: 'white' }}
                              >
                                Xác nhận thu tiền mặt
                              </Button>
                              <Button 
                                size="small" 
                                variant="text" 
                                startIcon={<InfoIcon />}
                                onClick={() => setSelectedLead(lead)}
                              >
                                Chi tiết thanh toán
                              </Button>
                            </>
                          )}

                          {lead.status === 'PAID' && (
                            <Button
                              size="small"
                              variant="contained"
                              color="primary"
                              fullWidth
                              startIcon={<SchoolIcon />}
                              onClick={() => void handleConvert(lead)}
                              disabled={!!actionLoading}
                              sx={{ borderRadius: 2 }}
                            >
                              Nhập học chính thức
                            </Button>
                          )}

                          {lead.status === 'CONVERTED' && (
                            <Chip 
                              label="Học viên chính thức" 
                              color="primary" 
                              sx={{ width: '100%', fontWeight: 700, borderRadius: 2 }}
                              variant="outlined"
                            />
                          )}
                        </Box>
                      </CardContent>
                    </Card>
                  ))}
                </Box>
              </Paper>
            </Box>
          ))}
        </Box>
      )}

      {/* Dialog Thêm Lead */}
      <Dialog open={openDialog} onClose={() => setOpenDialog(false)} maxWidth="sm" fullWidth scroll="paper" PaperProps={{ sx: { borderRadius: 4 } }}>
        <DialogTitle sx={{ fontWeight: 800 }}>Thêm khách hàng tiềm năng</DialogTitle>
        <DialogContent dividers>
          <TextField fullWidth label="Họ và tên" margin="normal" value={newLead.fullName} onChange={(e) => setNewLead((prev) => ({ ...prev, fullName: e.target.value }))} />
          <TextField fullWidth label="Số điện thoại" margin="normal" value={newLead.phone} onChange={(e) => setNewLead((prev) => ({ ...prev, phone: e.target.value }))} />
          <TextField fullWidth label="Địa chỉ Email" margin="normal" value={newLead.email} onChange={(e) => setNewLead((prev) => ({ ...prev, email: e.target.value }))} />
          <TextField fullWidth label="Mật khẩu đăng nhập" type="password" margin="normal" value={newLead.password} onChange={(e) => setNewLead((prev) => ({ ...prev, password: e.target.value }))} />
          <TextField fullWidth label="Ghi chú thêm" margin="normal" multiline rows={3} value={newLead.notes} onChange={(e) => setNewLead((prev) => ({ ...prev, notes: e.target.value }))} />
        </DialogContent>
        <DialogActions sx={{ p: 2.5 }}>
          <Button onClick={() => setOpenDialog(false)} color="inherit">Hủy bỏ</Button>
          <Button 
            variant="contained" 
            sx={{ borderRadius: 2, px: 4 }}
            onClick={() => void handleAction('CREATE', async () => leadApi.create(newLead), 'Đã thêm khách hàng mới thành công')}
          >
            Lưu khách hàng
          </Button>
        </DialogActions>
      </Dialog>

      {/* Dialog Đồng ý nhập học */}
      <Dialog open={Boolean(agreeLead)} onClose={() => setAgreeLead(null)} maxWidth="sm" fullWidth PaperProps={{ sx: { borderRadius: 4 } }}>
        <DialogTitle sx={{ fontWeight: 800 }}>Thiết lập lộ trình nhập học</DialogTitle>
        <DialogContent dividers>
          <Typography variant="body2" sx={{ mb: 3, color: 'text.secondary' }}>
            Chọn lớp học phù hợp cho khách hàng <b>{agreeLead?.fullName}</b>. Hệ thống sẽ tự động tạo hồ sơ ghi danh và hóa đơn tương ứng.
          </Typography>

          <Grid container spacing={2}>
            <Grid item xs={12}>
                <TextField
                  fullWidth
                  select
                  label="Chọn lớp học & Chương trình đào tạo"
                  value={agreeClassId}
                  onChange={(e) => setAgreeClassId(e.target.value)}
                  variant="outlined"
                  SelectProps={{
                    MenuProps: {
                      PaperProps: {
                        sx: { minWidth: 350, maxWidth: 500 }
                      }
                    }
                  }}
                >
                {classes.map((cls) => (
                  <MenuItem key={cls.id} value={cls.id}>
                    {cls.name} — {cls.courseName}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>

            {agreeClassId && (
              <Grid item xs={12}>
                <Paper variant="outlined" sx={{ p: 2, bgcolor: 'rgba(0,0,0,0.01)', borderRadius: 3, borderStyle: 'dashed' }}>
                  <Typography variant="subtitle2" color="primary" gutterBottom fontWeight={700}>
                    Thông tin lớp học:
                  </Typography>
                  {(() => {
                    const selected = classes.find(c => c.id === agreeClassId);
                    if (!selected) return null;
                    return (
                      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                          <Typography variant="body2" color="text.secondary">Học phí:</Typography>
                          <Typography variant="body2" fontWeight={800} color="error.main">
                            {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(selected.price || 0)}
                          </Typography>
                        </Box>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                          <Typography variant="body2" color="text.secondary">Cơ sở đào tạo:</Typography>
                          <Typography variant="body2">{selected.branchName || 'Cơ sở chính'}</Typography>
                        </Box>
                      </Box>
                    );
                  })()}
                </Paper>
              </Grid>
            )}
          </Grid>
        </DialogContent>
        <DialogActions sx={{ p: 2.5 }}>
          <Button onClick={() => setAgreeLead(null)} color="inherit">Để sau</Button>
          <Button 
            variant="contained" 
            color="success" 
            disabled={!agreeClassId}
            onClick={() => void handleAgree()}
            startIcon={<CheckCircleIcon />}
            sx={{ borderRadius: 2, px: 3 }}
          >
            Xác nhận nhập học
          </Button>
        </DialogActions>
      </Dialog>

      {/* Dialog Chi tiết Lead & Thông tin Thanh toán */}
      <Dialog open={Boolean(selectedLead)} onClose={() => setSelectedLead(null)} maxWidth="sm" fullWidth PaperProps={{ sx: { borderRadius: 4 } }}>
        <DialogTitle sx={{ fontWeight: 800 }}>Thông tin chi tiết khách hàng</DialogTitle>
        <DialogContent dividers>
          {selectedLead && (
            <Box>
              <Typography variant="h6" fontWeight={700}>{selectedLead.fullName}</Typography>
              <Typography variant="body2" color="text.secondary">Số điện thoại liên hệ: {selectedLead.phone}</Typography>
              <Typography variant="body2" color="text.secondary" gutterBottom>Trạng thái hiện tại: {selectedLead.status}</Typography>
              
              <Divider sx={{ my: 2 }} />
              
              <Alert severity="info" sx={{ borderRadius: 3 }}>
                <Typography variant="subtitle2" fontWeight={700}>Hướng dẫn quy trình thanh toán:</Typography>
                <Typography variant="body2">
                  1. Khách hàng nộp tiền mặt trực tiếp tại quầy kế toán.<br/>
                  2. Kế toán kiểm đếm và in phiếu thu.<br/>
                  3. Quản lý xác nhận trạng thái "Đã thu tiền" trên hệ thống để hoàn tất hồ sơ.
                </Typography>
              </Alert>
            </Box>
          )}
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setSelectedLead(null)} variant="outlined" sx={{ borderRadius: 2 }}>Đóng cửa sổ</Button>
        </DialogActions>
      </Dialog>
      
      {/* Dialog Xác nhận Thu tiền mặt */}
      <Dialog open={Boolean(cashPaymentLead)} onClose={() => setCashPaymentLead(null)} maxWidth="xs" fullWidth PaperProps={{ sx: { borderRadius: 4 } }}>
        <DialogTitle sx={{ fontWeight: 800, display: 'flex', alignItems: 'center', gap: 1 }}>
          <PaymentIcon color="primary" />
          Xác nhận giao dịch
        </DialogTitle>
        <DialogContent>
          <Box sx={{ textAlign: 'center', py: 2 }}>
            <Typography variant="body1" gutterBottom>
              Bạn xác nhận đã thu đủ học phí từ khách hàng:
            </Typography>
            <Typography variant="h6" color="primary" fontWeight={800}>
              {cashPaymentLead?.fullName}
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 2, px: 2 }}>
              Hệ thống sẽ tự động cập nhật hóa đơn sang trạng thái <b>Đã thanh toán</b> và cho phép chuyển đổi sang học viên chính thức.
            </Typography>
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: 2.5, justifyContent: 'center', gap: 2 }}>
          <Button onClick={() => setCashPaymentLead(null)} color="inherit" sx={{ minWidth: 100 }}>Hủy</Button>
          <Button 
            variant="contained" 
            color="primary"
            onClick={() => void handleConfirmCashPayment()}
            disabled={!!actionLoading}
            startIcon={actionLoading ? <CircularProgress size={20} /> : <CheckCircleIcon />}
            sx={{ borderRadius: 2, px: 3 }}
          >
            Xác nhận đã thu đủ tiền
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar open={snackbar.open} autoHideDuration={3000} onClose={() => setSnackbar((prev) => ({ ...prev, open: false }))}>
        <Alert severity={snackbar.severity} variant="filled" sx={{ borderRadius: 2 }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}
