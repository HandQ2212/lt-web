import { useEffect, useState } from 'react';
import {
  Box,
  Typography,
  Paper,
  Tabs,
  Tab,
  Stack,
  Card,
  CardContent,
  Chip,
  Button,
  Divider,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  MenuItem,
  Snackbar,
  Alert,
  CircularProgress,
  useTheme,
  InputAdornment,
} from '@mui/material';
import {
  ArrowBack as ArrowBackIcon,
  Notifications as NotificationsIcon,
  Announcement as AnnouncementIcon,
  Campaign as CampaignIcon,
  Send as SendIcon,
  CheckCircle as CheckCircleIcon,
  Search as SearchIcon,
  School as SchoolIcon,
  AccountBalance as AccountBalanceIcon,
  Settings as SettingsIcon,
  LocalOffer as LocalOfferIcon,
  AdminPanelSettings as AdminPanelSettingsIcon,
} from '@mui/icons-material';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { RootState } from '../../../store';
import { announcementApi, classApi, notificationApi } from '../../../services/api';

export default function RoleNotificationsPage() {
  const theme = useTheme();
  const navigate = useNavigate();
  const user = useSelector((state: RootState) => state.auth.user);
  const hasRoleUtilityPanel = Boolean(user?.role && ['MANAGER', 'TEACHER', 'ACCOUNTANT', 'STUDENT', 'LEAD'].includes(user.role));
  
  const [currentTab, setCurrentTab] = useState(0);
  const [personalNotifs, setPersonalNotifs] = useState<any[]>([]);
  const [announcements, setAnnouncements] = useState<any[]>([]);
  const [classes, setClasses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  // Dialog / Popup chi tiết
  const [selectedItem, setSelectedItem] = useState<any | null>(null);
  const [openDetail, setOpenDetail] = useState(false);

  // Form tiện ích gửi thông báo (dành cho Teacher / Accountant)
  const [utilForm, setUtilForm] = useState({
    title: '',
    message: '',
    targetClassId: '',
    type: 'INFO',
  });
  const [submittingUtil, setSubmittingUtil] = useState(false);

  // Cài đặt thông báo (dành cho Student)
  const [studentSettings, setStudentSettings] = useState({
    emailNotif: true,
    classReminder: true,
    assignmentReminder: true,
    promoUpdates: false,
  });

  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' as 'success' | 'error' });

  useEffect(() => {
    void fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [notifsRes, annRes, clsRes] = await Promise.all([
        notificationApi.getAll().catch(() => ({ data: [] })),
        announcementApi.getAll().catch(() => []),
        classApi.getAll().catch(() => []),
      ]);

      const loadedNotifs = Array.isArray(notifsRes?.data) ? notifsRes.data : [];
      setPersonalNotifs(loadedNotifs);

      const loadedAnnouncements = Array.isArray(annRes) ? annRes : [];
      // Lọc thông báo hệ thống phù hợp với user
      const filteredAnns = loadedAnnouncements.filter((ann) => {
        if (ann.scope === 'CENTER') return true;
        if (ann.scope === 'ROLE' && ann.targetRole === user?.role) return true;
        if (ann.scope === 'FINANCE' && (user?.role === 'ACCOUNTANT' || user?.role === 'MANAGER')) return true;
        return false;
      });
      setAnnouncements(filteredAnns);

      setClasses(Array.isArray(clsRes) ? clsRes : []);
    } catch (err) {
      console.error('Lỗi khi tải thông báo:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenDetail = async (item: any, isPersonal: boolean) => {
    let nextItem = { ...item, isPersonal };
    setOpenDetail(true);

    // Nếu là thông báo cá nhân và chưa xem, tự động đánh dấu đã xem
    if (isPersonal && !item.read && item.id) {
      try {
        await notificationApi.markAsRead(item.id);
        nextItem = { ...nextItem, read: true };
        setPersonalNotifs((prev) =>
          prev.map((n) => (n.id === item.id ? { ...n, read: true } : n))
        );
      } catch (err) {
        console.error('Không thể đánh dấu đã đọc:', err);
      }
    }

    setSelectedItem(nextItem);
  };

  const handleMarkAllRead = async () => {
    try {
      await notificationApi.markAllAsRead();
      setPersonalNotifs((prev) => prev.map((n) => ({ ...n, read: true })));
      setSnackbar({ open: true, message: 'Đã đánh dấu tất cả là đã đọc', severity: 'success' });
    } catch (err) {
      setSnackbar({ open: true, message: 'Thao tác thất bại', severity: 'error' });
    }
  };

  const handleSendCustomNotif = async () => {
    if (!utilForm.title.trim() || !utilForm.message.trim()) {
      setSnackbar({ open: true, message: 'Vui lòng nhập đầy đủ tiêu đề và nội dung', severity: 'error' });
      return;
    }

    try {
      setSubmittingUtil(true);
      const payload = {
        title: utilForm.title,
        message: utilForm.message,
        type: utilForm.type,
        scope: user?.role === 'TEACHER' ? 'CLASS' : 'FINANCE',
        targetClassId: user?.role === 'TEACHER' ? utilForm.targetClassId || null : null,
      };

      await announcementApi.create(payload);
      setSnackbar({ open: true, message: 'Gửi thông báo thành công!', severity: 'success' });
      setUtilForm({ title: '', message: '', targetClassId: '', type: 'INFO' });
      await fetchData();
    } catch (err) {
      setSnackbar({ open: true, message: 'Không thể gửi thông báo lúc này', severity: 'error' });
    } finally {
      setSubmittingUtil(false);
    }
  };

  const filteredPersonalNotifs = personalNotifs.filter((n) =>
    (n.title || n.message || '').toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredSystemAnns = announcements.filter((a) =>
    (a.title || a.message || '').toLowerCase().includes(searchQuery.toLowerCase())
  );

  const unreadCount = personalNotifs.filter((n) => !n.read).length;

  return (
    <Box sx={{ pb: 6, px: { xs: 1, sm: 2 } }}>
      <Button
        variant="outlined"
        startIcon={<ArrowBackIcon />}
        onClick={() => navigate(-1)}
        sx={{ mb: 2, fontWeight: 800, borderRadius: 2 }}
      >
        Quay lại
      </Button>

      {/* Premium Header Banner */}
      <Paper
        sx={{
          p: { xs: 3, sm: 4 },
          mb: 4,
          borderRadius: 4,
          background: 'linear-gradient(135deg, #FFFDF5 0%, #FFF7DF 45%, #F7E9FF 100%)',
          color: 'text.primary',
          border: '2px solid #1E293B',
          boxShadow: '6px 6px 0 #1E293B',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        <Box sx={{ position: 'relative', zIndex: 1 }}>
          <Stack direction={{ xs: 'column', md: 'row' }} justifyContent="space-between" alignItems={{ xs: 'flex-start', md: 'center' }} spacing={3}>
            <Box>
              <Stack direction="row" spacing={1.5} alignItems="center" sx={{ mb: 1 }}>
                <CampaignIcon sx={{ fontSize: 36, color: 'secondary.main' }} />
                <Typography variant="h4" fontWeight={900} letterSpacing={0.5}>
                  Trung tâm Thông báo
                </Typography>
              </Stack>
              <Typography variant="body1" sx={{ maxWidth: 680, fontWeight: 650, color: 'text.secondary', lineHeight: 1.7 }}>
                Cập nhật nhanh chóng các thông báo nội bộ, lịch học, học phí và các bảng tin quan trọng dành riêng cho vai trò của bạn.
              </Typography>
            </Box>

            <Stack direction="row" spacing={1.5} flexWrap="wrap" gap={1}>
              <Paper sx={{ px: 2.5, py: 1.5, borderRadius: 3, bgcolor: '#FFFFFF', border: '2px solid #1E293B', boxShadow: '4px 4px 0 #1E293B' }}>
                <Typography variant="caption" display="block" sx={{ fontWeight: 800, color: 'text.secondary', textTransform: 'uppercase' }}>
                  Thông báo chưa đọc
                </Typography>
                <Typography variant="h5" fontWeight={900} color="error.main">
                  {unreadCount}
                </Typography>
              </Paper>
              <Paper sx={{ px: 2.5, py: 1.5, borderRadius: 3, bgcolor: '#FFFFFF', border: '2px solid #1E293B', boxShadow: '4px 4px 0 #1E293B' }}>
                <Typography variant="caption" display="block" sx={{ fontWeight: 800, color: 'text.secondary', textTransform: 'uppercase' }}>
                  Bảng tin hệ thống
                </Typography>
                <Typography variant="h5" fontWeight={900} color="text.primary">
                  {announcements.length}
                </Typography>
              </Paper>
            </Stack>
          </Stack>
        </Box>
        {/* Background decorative circles */}
        <Box sx={{ position: 'absolute', right: -50, top: -50, width: 200, height: 200, borderRadius: '50%', background: 'radial-gradient(circle, rgba(255,255,255,0.15) 0%, transparent 70%)' }} />
      </Paper>

      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: {
            xs: '1fr',
            lg: hasRoleUtilityPanel ? 'minmax(0, 1.35fr) minmax(320px, 0.9fr)' : '1fr',
          },
          gap: { xs: 3, lg: 3.5 },
          alignItems: 'start',
        }}
      >
        {/* Cột chính: Danh sách thông báo */}
        <Box sx={{ minWidth: 0 }}>
          <Paper sx={{ borderRadius: 4, overflow: 'hidden', border: '2px solid #1E293B', boxShadow: '5px 5px 0 #1E293B', bgcolor: '#FFFFFF' }}>
            <Box sx={{ borderBottom: 1, borderColor: 'divider', bgcolor: '#fdfdfe', px: 2, pt: 1 }}>
              <Tabs value={currentTab} onChange={(_, v) => setCurrentTab(v)} variant="fullWidth">
                <Tab
                  icon={<NotificationsIcon sx={{ mr: 1 }} />}
                  iconPosition="start"
                  label={
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <span>Thông báo cá nhân</span>
                      {unreadCount > 0 && <Chip size="small" label={unreadCount} color="error" sx={{ height: 18, minWidth: 18, fontSize: '0.65rem', fontWeight: 800 }} />}
                    </Box>
                  }
                  sx={{ py: 2.5, fontWeight: 800, fontSize: '0.95rem' }}
                />
                <Tab
                  icon={<AnnouncementIcon sx={{ mr: 1 }} />}
                  iconPosition="start"
                  label="Bảng tin hệ thống"
                  sx={{ py: 2.5, fontWeight: 800, fontSize: '0.95rem' }}
                />
              </Tabs>
            </Box>

            <Box sx={{ p: 2.5, bgcolor: '#fcfcfd', borderBottom: '1px solid rgba(0,0,0,0.08)' }}>
              <Stack direction={{ xs: 'column', md: 'row' }} spacing={1.5} justifyContent="space-between" alignItems={{ xs: 'stretch', md: 'center' }}>
                <TextField
                  fullWidth
                  placeholder="Tìm kiếm thông báo..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  size="small"
                  InputProps={{
                    startAdornment: <InputAdornment position="start"><SearchIcon sx={{ color: 'text.secondary' }} /></InputAdornment>,
                  }}
                  sx={{ minWidth: 0, flex: 1, bgcolor: 'white', borderRadius: 2 }}
                />
                {currentTab === 0 && unreadCount > 0 && (
                  <Button variant="outlined" startIcon={<CheckCircleIcon />} onClick={handleMarkAllRead} size="small" sx={{ fontWeight: 800, borderRadius: 2, whiteSpace: 'nowrap', alignSelf: { xs: 'stretch', md: 'center' }, px: 1.5 }}>
                    Đánh dấu tất cả đã đọc
                  </Button>
                )}
              </Stack>
            </Box>

            {loading ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}><CircularProgress /></Box>
            ) : currentTab === 0 ? (
              /* Danh sách thông báo cá nhân */
              filteredPersonalNotifs.length === 0 ? (
                <Box sx={{ p: 6, textAlign: 'center' }}>
                  <Typography color="text.secondary" fontWeight={600}>Không tìm thấy thông báo cá nhân nào</Typography>
                </Box>
              ) : (
                <Stack divider={<Divider />}>
                  {filteredPersonalNotifs.map((item) => (
                    <Box
                      key={item.id || item.createdAt}
                      onClick={() => void handleOpenDetail(item, true)}
                      sx={{
                        p: 3,
                        transition: 'all 0.2s',
                        cursor: 'pointer',
                        bgcolor: item.read ? 'transparent' : 'rgba(29, 78, 216, 0.03)',
                        '&:hover': { bgcolor: 'rgba(0,0,0,0.02)' },
                        position: 'relative',
                        borderLeft: !item.read ? `4px solid ${theme.palette.primary.main}` : 'none',
                      }}
                    >
                      <Stack direction="row" justifyContent="space-between" alignItems="flex-start" spacing={2} sx={{ mb: 1 }}>
                        <Typography variant="subtitle1" fontWeight={item.read ? 600 : 800} color={item.read ? 'text.secondary' : 'text.primary'} sx={{ minWidth: 0, overflowWrap: 'anywhere', pr: 1 }}>
                          {item.title || item.message}
                        </Typography>
                        <Chip
                          size="small"
                          label={item.read ? 'Đã xem' : 'Chưa xem'}
                          color={item.read ? 'default' : 'primary'}
                          sx={{ fontWeight: 800, fontSize: '0.7rem', flexShrink: 0, maxWidth: 96 }}
                        />
                      </Stack>
                      <Typography variant="caption" color="text.secondary" display="block">
                        {item.createdAt ? new Date(item.createdAt).toLocaleString('vi-VN') : ''}
                      </Typography>
                    </Box>
                  ))}
                </Stack>
              )
            ) : (
              /* Danh sách bảng tin hệ thống */
              filteredSystemAnns.length === 0 ? (
                <Box sx={{ p: 6, textAlign: 'center' }}>
                  <Typography color="text.secondary" fontWeight={600}>Hiện chưa có bảng tin hệ thống nào</Typography>
                </Box>
              ) : (
                <Stack divider={<Divider />}>
                  {filteredSystemAnns.map((item) => (
                    <Box
                      key={item.id}
                      onClick={() => void handleOpenDetail(item, false)}
                      sx={{
                        p: 3,
                        transition: 'all 0.2s',
                        cursor: 'pointer',
                        '&:hover': { bgcolor: 'rgba(0,0,0,0.02)' },
                      }}
                    >
                      <Stack direction="row" spacing={1} sx={{ mb: 1.5 }} alignItems="center">
                        <Chip
                          size="small"
                          label={item.type === 'URGENT' ? 'Khẩn cấp' : item.type === 'PROMO' ? 'Khuyến mãi' : 'Thông tin'}
                          color={item.type === 'URGENT' ? 'error' : item.type === 'PROMO' ? 'success' : 'info'}
                          sx={{ fontWeight: 800, fontSize: '0.65rem' }}
                        />
                        <Chip size="small" label={item.scope === 'CENTER' ? 'Toàn trung tâm' : item.scope === 'ROLE' ? 'Vai trò' : 'Lớp học'} variant="outlined" sx={{ fontSize: '0.65rem', fontWeight: 700 }} />
                      </Stack>
                      <Typography variant="h6" fontWeight={800} sx={{ mb: 0.5, color: 'text.primary', fontSize: '1.1rem' }}>
                        {item.title}
                      </Typography>
                      <Typography variant="body2" color="text.secondary" sx={{ display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                        {item.message}
                      </Typography>
                      <Typography variant="caption" color="text.secondary" sx={{ mt: 1.5, display: 'block', fontWeight: 600 }}>
                        Đăng bởi: {item.createdByFullName || 'Ban Quản trị'} • {item.createdAt ? new Date(item.createdAt).toLocaleString('vi-VN') : ''}
                      </Typography>
                    </Box>
                  ))}
                </Stack>
              )
            )}
          </Paper>
        </Box>

        {/* Cột phụ: Bảng tính năng điều khiển chuyên biệt theo Role (Chia role ra để xem tab thông báo đấy có thể làm gì) */}
        {hasRoleUtilityPanel && (
          <Box sx={{ minWidth: 0 }}>
            <Stack spacing={3}>
              {/* Tiện ích dành cho MANAGER */}
              {user?.role === 'MANAGER' && (
                <Card sx={{ borderRadius: 4, border: '1px solid rgba(29, 78, 216, 0.12)', boxShadow: '0 10px 30px rgba(29, 78, 216, 0.06)' }}>
                  <CardContent sx={{ p: 3 }}>
                    <Stack direction="row" spacing={1.5} alignItems="center" sx={{ mb: 2.5 }}>
                      <AdminPanelSettingsIcon color="primary" fontSize="large" />
                      <Box>
                        <Typography variant="h6" fontWeight={800} color="primary.main">
                          Trung tâm Quản trị
                        </Typography>
                        <Typography variant="caption" color="text.secondary" display="block">
                          Theo dõi thông báo toàn trung tâm và chuyển nhanh sang trang phát hành thông báo.
                        </Typography>
                      </Box>
                    </Stack>

                    <Stack spacing={1.5}>
                      <Paper variant="outlined" sx={{ p: 2, borderRadius: 3 }}>
                        <Typography variant="body2" fontWeight={800}>Thông báo cá nhân</Typography>
                        <Typography variant="caption" color="text.secondary">
                          Xem các thông báo gửi riêng cho tài khoản quản trị và đánh dấu đã xem ngay trong tab này.
                        </Typography>
                      </Paper>
                      <Paper variant="outlined" sx={{ p: 2, borderRadius: 3 }}>
                        <Typography variant="body2" fontWeight={800}>Bảng tin hệ thống</Typography>
                        <Typography variant="caption" color="text.secondary">
                          Kiểm tra các bản tin toàn trung tâm, thông báo theo vai trò và nhóm tài chính.
                        </Typography>
                      </Paper>
                      <Button
                        variant="contained"
                        startIcon={<SendIcon />}
                        onClick={() => navigate('/admin/notifications')}
                        sx={{ fontWeight: 800, py: 1.2, borderRadius: 2 }}
                      >
                        Quản lý phát hành thông báo
                      </Button>
                    </Stack>
                  </CardContent>
                </Card>
              )}

              {/* Tiện ích dành cho TEACHER */}
              {user.role === 'TEACHER' && (
                <Card sx={{ borderRadius: 4, border: '1px solid rgba(29, 78, 216, 0.12)', boxShadow: '0 10px 30px rgba(29, 78, 216, 0.06)' }}>
                  <CardContent sx={{ p: 3 }}>
                    <Stack direction="row" spacing={1.5} alignItems="center" sx={{ mb: 2.5 }}>
                      <SchoolIcon color="primary" fontSize="large" />
                      <Box>
                        <Typography variant="h6" fontWeight={800} color="primary.main">
                          Tiện ích Giảng viên
                        </Typography>
                        <Typography variant="caption" color="text.secondary" display="block">
                          Gửi lời nhắn nhanh đến các lớp bạn đang phụ trách
                        </Typography>
                      </Box>
                    </Stack>

                    <Stack spacing={2}>
                      <TextField
                        select
                        fullWidth
                        label="Chọn lớp học nhận thông báo"
                        size="small"
                        value={utilForm.targetClassId}
                        onChange={(e) => setUtilForm((p) => ({ ...p, targetClassId: e.target.value }))}
                      >
                        {classes.length === 0 ? (
                          <MenuItem disabled value="">Không có dữ liệu lớp</MenuItem>
                        ) : (
                          classes.map((c) => (
                            <MenuItem key={c.id} value={c.id}>
                              {c.name || `Lớp ${c.id.slice(0, 6)}`}
                            </MenuItem>
                          ))
                        )}
                      </TextField>
                      <TextField
                        fullWidth
                        label="Tiêu đề thông báo"
                        placeholder="VD: Nhắc nhở nộp bài tập lớn"
                        size="small"
                        value={utilForm.title}
                        onChange={(e) => setUtilForm((p) => ({ ...p, title: e.target.value }))}
                      />
                      <TextField
                        fullWidth
                        multiline
                        rows={3}
                        label="Nội dung chi tiết"
                        placeholder="Nhập thông điệp gửi tới lớp..."
                        size="small"
                        value={utilForm.message}
                        onChange={(e) => setUtilForm((p) => ({ ...p, message: e.target.value }))}
                      />
                      <TextField
                        select
                        fullWidth
                        label="Độ ưu tiên"
                        size="small"
                        value={utilForm.type}
                        onChange={(e) => setUtilForm((p) => ({ ...p, type: e.target.value }))}
                      >
                        <MenuItem value="INFO">Thông tin chung</MenuItem>
                        <MenuItem value="URGENT">Khẩn cấp</MenuItem>
                      </TextField>

                      <Button
                        variant="contained"
                        startIcon={<SendIcon />}
                        onClick={() => void handleSendCustomNotif()}
                        disabled={submittingUtil || !utilForm.targetClassId}
                        sx={{ fontWeight: 800, py: 1.2, borderRadius: 2 }}
                      >
                        {submittingUtil ? 'Đang gửi...' : 'Phát thông báo lớp học'}
                      </Button>
                    </Stack>
                  </CardContent>
                </Card>
              )}

              {/* Tiện ích dành cho ACCOUNTANT */}
              {user.role === 'ACCOUNTANT' && (
                <Card sx={{ borderRadius: 4, border: '1px solid rgba(2, 136, 209, 0.12)', boxShadow: '0 10px 30px rgba(2, 136, 209, 0.06)' }}>
                  <CardContent sx={{ p: 3 }}>
                    <Stack direction="row" spacing={1.5} alignItems="center" sx={{ mb: 2.5 }}>
                      <AccountBalanceIcon color="info" fontSize="large" />
                      <Box>
                        <Typography variant="h6" fontWeight={800} color="info.main">
                          Nghiệp vụ Tài chính
                        </Typography>
                        <Typography variant="caption" color="text.secondary" display="block">
                          Gửi thông báo nhắc nhở nộp học phí / thanh toán
                        </Typography>
                      </Box>
                    </Stack>

                    <Stack spacing={2}>
                      <TextField
                        fullWidth
                        label="Tiêu đề nhắc nhở"
                        placeholder="VD: Thông báo hạn nộp học phí kỳ 2"
                        size="small"
                        value={utilForm.title}
                        onChange={(e) => setUtilForm((p) => ({ ...p, title: e.target.value }))}
                      />
                      <TextField
                        fullWidth
                        multiline
                        rows={4}
                        label="Nội dung chi tiết"
                        placeholder="Kính gửi học viên, vui lòng hoàn tất các khoản phí..."
                        size="small"
                        value={utilForm.message}
                        onChange={(e) => setUtilForm((p) => ({ ...p, message: e.target.value }))}
                      />

                      <Button
                        variant="contained"
                        color="info"
                        startIcon={<SendIcon />}
                        onClick={() => void handleSendCustomNotif()}
                        disabled={submittingUtil}
                        sx={{ fontWeight: 800, py: 1.2, borderRadius: 2 }}
                      >
                        {submittingUtil ? 'Đang phát hành...' : 'Gửi thông báo tài chính'}
                      </Button>
                    </Stack>
                  </CardContent>
                </Card>
              )}

              {/* Tiện ích dành cho STUDENT */}
              {user.role === 'STUDENT' && (
                <Card sx={{ borderRadius: 4, border: '1px solid rgba(46, 125, 50, 0.12)', boxShadow: '0 10px 30px rgba(46, 125, 50, 0.06)' }}>
                  <CardContent sx={{ p: 3 }}>
                    <Stack direction="row" spacing={1.5} alignItems="center" sx={{ mb: 2.5 }}>
                      <SettingsIcon color="success" fontSize="large" />
                      <Box>
                        <Typography variant="h6" fontWeight={800} color="success.main">
                          Tùy chỉnh Thông báo
                        </Typography>
                        <Typography variant="caption" color="text.secondary" display="block">
                          Quản lý các thông điệp bạn muốn nhận
                        </Typography>
                      </Box>
                    </Stack>

                    <Stack spacing={1.5}>
                      <Paper variant="outlined" sx={{ p: 2, borderRadius: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Box>
                          <Typography variant="body2" fontWeight={700}>Thông báo qua Email</Typography>
                          <Typography variant="caption" color="text.secondary">Nhận bản sao các thông báo quan trọng</Typography>
                        </Box>
                        <Button
                          size="small"
                          variant={studentSettings.emailNotif ? 'contained' : 'outlined'}
                          color="success"
                          onClick={() => setStudentSettings((s) => ({ ...s, emailNotif: !s.emailNotif }))}
                          sx={{ borderRadius: 2, fontWeight: 700 }}
                        >
                          {studentSettings.emailNotif ? 'Đang Bật' : 'Đã Tắt'}
                        </Button>
                      </Paper>

                      <Paper variant="outlined" sx={{ p: 2, borderRadius: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Box>
                          <Typography variant="body2" fontWeight={700}>Nhắc nhở lịch lên lớp</Typography>
                          <Typography variant="caption" color="text.secondary">Thông báo trước khi buổi học bắt đầu</Typography>
                        </Box>
                        <Button
                          size="small"
                          variant={studentSettings.classReminder ? 'contained' : 'outlined'}
                          color="success"
                          onClick={() => setStudentSettings((s) => ({ ...s, classReminder: !s.classReminder }))}
                          sx={{ borderRadius: 2, fontWeight: 700 }}
                        >
                          {studentSettings.classReminder ? 'Đang Bật' : 'Đã Tắt'}
                        </Button>
                      </Paper>

                      <Paper variant="outlined" sx={{ p: 2, borderRadius: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Box>
                          <Typography variant="body2" fontWeight={700}>Nhắc nhở nộp bài tập</Typography>
                          <Typography variant="caption" color="text.secondary">Thông báo trước hạn nộp bài tập về nhà</Typography>
                        </Box>
                        <Button
                          size="small"
                          variant={studentSettings.assignmentReminder ? 'contained' : 'outlined'}
                          color="success"
                          onClick={() => setStudentSettings((s) => ({ ...s, assignmentReminder: !s.assignmentReminder }))}
                          sx={{ borderRadius: 2, fontWeight: 700 }}
                        >
                          {studentSettings.assignmentReminder ? 'Đang Bật' : 'Đã Tắt'}
                        </Button>
                      </Paper>

                      <Alert severity="info" sx={{ borderRadius: 3, mt: 1 }}>
                        Các cài đặt này giúp bạn kiểm soát tối đa các thông báo gửi đến tài khoản của mình.
                      </Alert>
                    </Stack>
                  </CardContent>
                </Card>
              )}

              {/* Tiện ích dành cho LEAD */}
              {user.role === 'LEAD' && (
                <Card sx={{ borderRadius: 4, border: '2px solid #1E293B', boxShadow: '5px 5px 0 #1E293B', background: 'linear-gradient(180deg, #fffaf0 0%, #ffffff 100%)' }}>
                  <CardContent sx={{ p: { xs: 2.5, md: 3 } }}>
                    <Stack direction="row" spacing={1.5} alignItems="center" sx={{ mb: 2 }}>
                      <LocalOfferIcon color="warning" fontSize="large" />
                      <Box>
                        <Typography variant="h6" fontWeight={800} color="warning.dark">
                          Ưu đãi Đặc quyền
                        </Typography>
                        <Typography variant="caption" color="text.secondary" display="block">
                          Chương trình học bổng & Sự kiện tuyển sinh
                        </Typography>
                      </Box>
                    </Stack>

                    <Alert severity="success" sx={{ borderRadius: 3, mb: 2, fontWeight: 700, alignItems: 'center' }}>
                      Tặng ngay Voucher giảm 20% học phí khi hoàn tất ghi danh trong tuần này!
                    </Alert>

                    <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.6 }}>
                      Hãy thường xuyên kiểm tra tab thông báo để không bỏ lỡ các ưu đãi độc quyền dành riêng cho khách hàng tiềm năng của ELC System.
                    </Typography>
                  </CardContent>
                </Card>
              )}
            </Stack>
          </Box>
        )}
      </Box>

      {/* Popup / Dialog hiển thị thông tin chi tiết */}
      <Dialog open={openDetail} onClose={() => setOpenDetail(false)} fullWidth maxWidth="sm" PaperProps={{ sx: { borderRadius: 4, overflow: 'hidden' } }}>
        <DialogTitle sx={{ fontWeight: 900, bgcolor: selectedItem?.isPersonal ? 'primary.main' : 'secondary.main', color: 'white', pb: 2 }}>
          {selectedItem?.title || 'Thông tin chi tiết'}
        </DialogTitle>
        <DialogContent sx={{ p: 4 }}>
          <Box sx={{ mb: 3 }}>
            {selectedItem?.isPersonal ? (
              <Chip size="small" label={selectedItem?.read ? 'Đã xem' : 'Chưa xem'} color={selectedItem?.read ? 'default' : 'primary'} sx={{ fontWeight: 800, mb: 2 }} />
            ) : (
              <Stack direction="row" spacing={1} sx={{ mb: 2 }}>
                <Chip size="small" label={selectedItem?.type || 'INFO'} color="info" sx={{ fontWeight: 800 }} />
                <Chip size="small" label={selectedItem?.scope || 'CENTER'} variant="outlined" sx={{ fontWeight: 700 }} />
              </Stack>
            )}

            <Typography variant="body1" sx={{ whiteSpace: 'pre-line', color: 'text.primary', lineHeight: 1.7, fontSize: '1.05rem' }}>
              {selectedItem?.message || 'Không có nội dung'}
            </Typography>
          </Box>
          <Divider sx={{ my: 2 }} />
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="caption" color="text.secondary" fontWeight={600}>
              Nguồn: <Box component="span" sx={{ color: 'text.primary', fontWeight: 700 }}>{selectedItem?.createdByFullName || 'Hệ thống ELC'}</Box>
            </Typography>
            <Typography variant="caption" color="text.secondary" fontWeight={600}>
              {selectedItem?.createdAt ? new Date(selectedItem.createdAt).toLocaleString('vi-VN') : ''}
            </Typography>
          </Box>
        </DialogContent>
        <DialogActions sx={{ px: 3, py: 2, bgcolor: 'rgba(0,0,0,0.02)' }}>
          <Button variant="contained" onClick={() => setOpenDetail(false)} sx={{ fontWeight: 700, px: 3, borderRadius: 2 }}>
            Đóng cửa sổ
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar open={snackbar.open} autoHideDuration={4000} onClose={() => setSnackbar((p) => ({ ...p, open: false }))}>
        <Alert severity={snackbar.severity} variant="filled" sx={{ borderRadius: 2, fontWeight: 700 }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}
