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
} from '@mui/material';
import {
  Email as EmailIcon,
  PersonAdd as PersonAddIcon,
  Phone as PhoneIcon,
  SwapHoriz as SwapHorizIcon,
  CheckCircle as CheckCircleIcon,
  Cancel as CancelIcon,
  Message as MessageIcon,
  Payment as PaymentIcon,
  School as SchoolIcon,
} from '@mui/icons-material';
import { classApi, courseApi, enrollmentApi, leadApi, invoiceApi } from '../../../services/api';

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
  { id: 'NEW', title: 'Mới', color: '#f5f5f5' },
  { id: 'INTERESTED', title: 'Quan tâm', color: '#e3f2fd' },
  { id: 'CONSULTING', title: 'Đang tư vấn', color: '#fff3e0' },
  { id: 'AGREED', title: 'Chưa thanh toán', color: '#fff9c4' },
  { id: 'PAID', title: 'Đã thanh toán', color: '#e8f5e9' },
  { id: 'CONVERTED', title: 'Học sinh', color: '#f3e5f5' },
];

export default function LeadManagementPage() {
  const [leads, setLeads] = useState<LeadItem[]>([]);
  const [courses, setCourses] = useState<any[]>([]);
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
      console.log('Fetching leads...');
      const response = await leadApi.getAll({ size: 100 });
      console.log('Leads response type:', typeof response, Array.isArray(response) ? 'Array' : 'Object');
      console.log('Full response:', response);
      
      // Xử lý cả 2 trường hợp: Trả về Page object (có .content) hoặc trả về Array trực tiếp
      let leadsData: LeadItem[] = [];
      if (Array.isArray(response)) {
        leadsData = response;
      } else if (response && response.content && Array.isArray(response.content)) {
        leadsData = response.content;
      } else if (response && Array.isArray((response as any).data)) {
        // Một số cấu hình axios trả về data bọc ngoài
        leadsData = (response as any).data;
      }
      
      console.log('Extracted leads count:', leadsData.length);
      setLeads(leadsData);
    } catch (error: any) {
      console.error('Failed to fetch leads:', error);
      setSnackbar({
        open: true,
        message: error?.response?.data?.message || 'Không thể tải danh sách lead',
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
    handleAction(lead.id, () => leadApi.moveToConsulting(lead.id), 'Đã chuyển sang tư vấn');

  const handleReject = (lead: LeadItem) => 
    handleAction(lead.id, () => leadApi.reject(lead.id), 'Đã hủy trạng thái và xóa quan tâm');

  const handleAgree = async () => {
    if (!agreeLead || !agreeClassId) return;
    try {
      setActionLoading(agreeLead.id);
      await leadApi.agree(agreeLead.id, agreeClassId);
      setSnackbar({ open: true, message: 'Đã xác nhận nhập học, hóa đơn đã được tạo', severity: 'success' });
      setAgreeLead(null);
      setAgreeClassId('');
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

  const handleConvert = (lead: LeadItem) => 
    handleAction(lead.id, () => leadApi.convert(lead.id), 'Đã chuyển thành học sinh chính thức');

  const handleConfirmCashPayment = async () => {
    if (!cashPaymentLead || !cashPaymentLead.currentInvoiceId) {
      return;
    }

    try {
      setActionLoading(cashPaymentLead.id);
      
      console.log('Confirming cash payment for lead:', cashPaymentLead.id);
      await leadApi.confirmCash(cashPaymentLead.id);

      setSnackbar({ open: true, message: 'Đã xác nhận thu tiền mặt thành công', severity: 'success' });
      setCashPaymentLead(null);
      await fetchLeads();
    } catch (error: any) {
      setSnackbar({ 
        open: true, 
        message: error?.response?.data?.message || 'Lỗi khi xác nhận thanh toán', 
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
            label={interest.clazzName || interest.courseName || 'N/A'} 
            size="small" 
            variant="outlined" 
            color={interest.clazzId ? "primary" : "default"}
          />
        </Tooltip>
      ))}
    </Box>
  );

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" fontWeight={700} color="primary">
          CRM & Lead Management
        </Typography>
        <Button 
          variant="contained" 
          startIcon={<PersonAddIcon />} 
          onClick={() => setOpenDialog(true)}
          sx={{ borderRadius: 2, px: 3 }}
        >
          Thêm Lead mới
        </Button>
      </Box>

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
          <CircularProgress />
        </Box>
      ) : (
        <Grid container spacing={2} sx={{ overflowX: 'auto', pb: 2, flexWrap: 'nowrap', minWidth: 'fit-content' }}>
          {stages.map((stage) => (
            <Grid item sx={{ minWidth: 300, width: 300 }} key={stage.id}>
              <Paper 
                elevation={0}
                sx={{ 
                  p: 2, 
                  bgcolor: stage.color, 
                  minHeight: '70vh', 
                  borderRadius: 3,
                  border: '1px solid rgba(0,0,0,0.05)'
                }}
              >
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                  <Typography variant="subtitle1" fontWeight={700}>
                    {stage.title}
                  </Typography>
                  <Chip 
                    label={getLeadsByStatus(stage.id).length} 
                    size="small" 
                    sx={{ bgcolor: 'white', fontWeight: 600 }} 
                  />
                </Box>

                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                  {getLeadsByStatus(stage.id).length === 0 && (
                    <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', py: 2, fontStyle: 'italic' }}>
                      Trống
                    </Typography>
                  )}
                  {getLeadsByStatus(stage.id).map((lead) => (
                    <Card 
                      key={lead.id} 
                      sx={{ 
                        borderRadius: 2, 
                        transition: 'transform 0.2s',
                        '&:hover': { transform: 'translateY(-2px)', boxShadow: 3 }
                      }}
                    >
                      <CardContent sx={{ p: '16px !important' }}>
                        <Typography variant="subtitle1" fontWeight={600} noWrap>
                          {lead.fullName}
                        </Typography>
                        
                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5, mt: 1 }}>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <PhoneIcon sx={{ fontSize: 16, color: 'text.secondary' }} />
                            <Typography variant="body2" color="text.secondary">{lead.phone}</Typography>
                          </Box>
                          {lead.email && (
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                              <EmailIcon sx={{ fontSize: 16, color: 'text.secondary' }} />
                              <Typography variant="body2" color="text.secondary" noWrap>{lead.email}</Typography>
                            </Box>
                          )}
                        </Box>

                        {renderInterests(lead)}

                        <Divider sx={{ my: 1.5 }} />

                        <Box sx={{ display: 'flex', gap: 1 }}>
                          
                          {/* Cột Quan tâm (INTERESTED) */}
                          {lead.status === 'INTERESTED' || (lead.status as any) === 'CONTACTED' ? (
                            <Button
                              size="small"
                              variant="contained"
                              fullWidth
                              startIcon={<MessageIcon />}
                              onClick={() => void handleConsulting(lead)}
                              disabled={!!actionLoading}
                            >
                              Tư vấn
                            </Button>
                          ) : null}

                          {/* Cột Đang tư vấn (CONSULTING) */}
                          {lead.status === 'CONSULTING' ? (
                            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, width: '100%' }}>
                              <Button
                                size="small"
                                variant="contained"
                                color="success"
                                fullWidth
                                startIcon={<CheckCircleIcon />}
                                onClick={() => setAgreeLead(lead)}
                              >
                                Chấp thuận học
                              </Button>
                              <Button
                                size="small"
                                variant="outlined"
                                color="error"
                                fullWidth
                                startIcon={<CancelIcon />}
                                onClick={() => void handleReject(lead)}
                                disabled={!!actionLoading}
                              >
                                Hủy (Về mục Mới)
                              </Button>
                            </Box>
                          ) : null}

                          {lead.status === 'AGREED' ? (
                             <Box sx={{ width: '100%', display: 'flex', flexDirection: 'column', gap: 1 }}>
                               <Chip 
                                 icon={<PaymentIcon />} 
                                 label="Chờ thanh toán" 
                                 color="warning" 
                                 variant="outlined"
                                 sx={{ width: '100%' }}
                               />
                               <Button
                                 size="small"
                                 variant="contained"
                                 color="primary"
                                 fullWidth
                                 onClick={() => setCashPaymentLead(lead)}
                                 disabled={!!actionLoading}
                               >
                                 Đã thu tiền mặt
                               </Button>
                               <Button size="small" variant="text" onClick={() => setSelectedLead(lead)}>Chi tiết</Button>
                             </Box>
                          ) : null}

                          {lead.status === 'PAID' ? (
                            <Button
                              size="small"
                              variant="contained"
                              color="primary"
                              fullWidth
                              startIcon={<SchoolIcon />}
                              onClick={() => void handleConvert(lead)}
                              disabled={!!actionLoading}
                            >
                              Chuyển Student
                            </Button>
                          ) : null}

                          {lead.status === 'CONVERTED' ? (
                            <Chip 
                              label="Đã là Học sinh" 
                              color="primary" 
                              sx={{ width: '100%' }}
                            />
                          ) : null}
                        </Box>
                      </CardContent>
                    </Card>
                  ))}
                </Box>
              </Paper>
            </Grid>
          ))}
        </Grid>
      )}

      {/* Dialog Thêm Lead */}
      <Dialog open={openDialog} onClose={() => setOpenDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Thêm Lead mới</DialogTitle>
        <DialogContent>
          <TextField fullWidth label="Họ tên" margin="normal" value={newLead.fullName} onChange={(e) => setNewLead((prev) => ({ ...prev, fullName: e.target.value }))} />
          <TextField fullWidth label="Số điện thoại" margin="normal" value={newLead.phone} onChange={(e) => setNewLead((prev) => ({ ...prev, phone: e.target.value }))} />
          <TextField fullWidth label="Email" margin="normal" value={newLead.email} onChange={(e) => setNewLead((prev) => ({ ...prev, email: e.target.value }))} />
          <TextField fullWidth label="Mật khẩu" type="password" margin="normal" value={newLead.password} onChange={(e) => setNewLead((prev) => ({ ...prev, password: e.target.value }))} />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)}>Hủy</Button>
          <Button variant="contained" onClick={() => void handleAction('CREATE', async () => leadApi.create(newLead), 'Tạo lead thành công')}>
            Thêm
          </Button>
        </DialogActions>
      </Dialog>

      {/* Dialog Đồng ý nhập học */}
      <Dialog open={Boolean(agreeLead)} onClose={() => setAgreeLead(null)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ fontWeight: 700 }}>Xác nhận chấp thuận học</DialogTitle>
        <DialogContent>
          <Typography variant="body2" sx={{ mb: 3, color: 'text.secondary' }}>
            Thiết lập lộ trình học cho <b>{agreeLead?.fullName}</b>. Sau khi xác nhận, hệ thống sẽ tự động tạo ghi danh (Enrollment) và hóa đơn (Invoice).
          </Typography>

          <Grid container spacing={2}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                select
                label="Chọn lớp học (Bao gồm chương trình & ca học)"
                value={agreeClassId}
                onChange={(e) => setAgreeClassId(e.target.value)}
                variant="outlined"
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
                <Paper variant="outlined" sx={{ p: 2, bgcolor: '#fbfbfb', borderRadius: 2 }}>
                  <Typography variant="subtitle2" color="primary" gutterBottom fontWeight={600}>
                    Thông tin lớp học đã chọn:
                  </Typography>
                  {(() => {
                    const selected = classes.find(c => c.id === agreeClassId);
                    if (!selected) return null;
                    return (
                      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                          <Typography variant="body2" color="text.secondary">Chương trình:</Typography>
                          <Typography variant="body2" fontWeight={500}>{selected.courseName}</Typography>
                        </Box>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                          <Typography variant="body2" color="text.secondary">Học phí:</Typography>
                          <Typography variant="body2" fontWeight={600} color="error.main">
                            {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(selected.price || 0)}
                          </Typography>
                        </Box>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                          <Typography variant="body2" color="text.secondary">Cơ sở:</Typography>
                          <Typography variant="body2">{selected.branchName || 'Trung tâm chính'}</Typography>
                        </Box>
                        {selected.schedule && (
                          <Box sx={{ mt: 1 }}>
                            <Typography variant="caption" color="text.secondary">Lịch học dự kiến:</Typography>
                            <Typography variant="body2" sx={{ fontStyle: 'italic' }}>{selected.schedule}</Typography>
                          </Box>
                        )}
                      </Box>
                    );
                  })()}
                </Paper>
              </Grid>
            )}
          </Grid>
        </DialogContent>
        <DialogActions sx={{ p: 2, px: 3 }}>
          <Button onClick={() => setAgreeLead(null)} color="inherit">Hủy bỏ</Button>
          <Button 
            variant="contained" 
            color="success" 
            disabled={!agreeClassId}
            onClick={() => void handleAgree()}
            startIcon={<CheckCircleIcon />}
          >
            Xác nhận & Tạo hóa đơn
          </Button>
        </DialogActions>
      </Dialog>

      {/* Dialog Chi tiết Lead & Thông tin Thanh toán */}
      <Dialog open={Boolean(selectedLead)} onClose={() => setSelectedLead(null)} maxWidth="sm" fullWidth>
        <DialogTitle>Chi tiết Lead</DialogTitle>
        <DialogContent>
          {selectedLead && (
            <Box>
              <Typography variant="h6">{selectedLead.fullName}</Typography>
              <Typography variant="body2" color="text.secondary">SĐT: {selectedLead.phone}</Typography>
              <Typography variant="body2" color="text.secondary">Trạng thái: {selectedLead.status}</Typography>
              
              <Divider sx={{ my: 2 }} />
              
              {selectedLead.status === 'AGREED' && (
                <Alert severity="info">
                  <Typography variant="subtitle2">Hướng dẫn thanh toán tiền mặt:</Typography>
                  <Typography variant="body2">
                    Vui lòng hướng dẫn khách hàng đến địa chỉ: <b>123 Đường ABC, Quận X, TP. HCM</b>
                  </Typography>
                  <Typography variant="body2">
                    Số điện thoại kế toán: <b>0123.456.789</b>
                  </Typography>
                </Alert>
              )}
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setSelectedLead(null)}>Đóng</Button>
        </DialogActions>
      </Dialog>
      
      {/* Dialog Xác nhận Thu tiền mặt */}
      <Dialog open={Boolean(cashPaymentLead)} onClose={() => setCashPaymentLead(null)} maxWidth="xs" fullWidth>
        <DialogTitle sx={{ fontWeight: 700, display: 'flex', alignItems: 'center', gap: 1 }}>
          <PaymentIcon color="primary" />
          Xác nhận thu tiền mặt
        </DialogTitle>
        <DialogContent>
          <Box sx={{ textAlign: 'center', py: 2 }}>
            <Typography variant="body1" gutterBottom>
              Bạn xác nhận đã thu đủ học phí từ:
            </Typography>
            <Typography variant="h6" color="primary" fontWeight={700}>
              {cashPaymentLead?.fullName}
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
              Hành động này sẽ đánh dấu hóa đơn là <b>Đã thanh toán</b> và cập nhật trạng thái học viên.
            </Typography>
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: 2, px: 3 }}>
          <Button onClick={() => setCashPaymentLead(null)} color="inherit">Hủy</Button>
          <Button 
            variant="contained" 
            color="primary"
            onClick={() => void handleConfirmCashPayment()}
            disabled={!!actionLoading}
            startIcon={actionLoading ? <CircularProgress size={20} /> : <CheckCircleIcon />}
          >
            Xác nhận đã thu tiền
          </Button>
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
