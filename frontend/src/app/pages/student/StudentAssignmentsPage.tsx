import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  Chip,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Paper,
  Alert,
  CircularProgress,
  Snackbar,
  IconButton,
  Divider,
  useTheme,
  useMediaQuery,
} from '@mui/material';
import {
  Assignment as AssignmentIcon,
  CloudUpload as UploadIcon,
  CheckCircle as CheckCircleIcon,
  Schedule as ScheduleIcon,
  Link as LinkIcon,
  ErrorOutline as ErrorIcon,
} from '@mui/icons-material';
import { enrollmentApi, assignmentApi, submissionApi } from '../../../services/api';
import { RootState } from '../../../store';

export default function StudentAssignmentsPage() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const user = useSelector((state: RootState) => state.auth.user);
  
  const [assignments, setAssignments] = useState<any[]>([]);
  const [submissions, setSubmissions] = useState<Record<string, any>>({});
  const [loading, setLoading] = useState(true);
  const [submitDialogOpen, setSubmitDialogOpen] = useState(false);
  const [selectedAssignment, setSelectedAssignment] = useState<any>(null);
  const [fileUrl, setFileUrl] = useState('');
  const [content, setContent] = useState('');
  const [submitting, setSubmitting] = useState(false);
  
  const [snackbar, setSnackbar] = useState<{ open: boolean; message: string; severity: 'success' | 'error' }>({
    open: false,
    message: '',
    severity: 'success',
  });

  useEffect(() => {
    void fetchAssignments();
  }, [user?.id]);

  const fetchAssignments = async () => {
    try {
      setLoading(true);
      const userId = user?.id || localStorage.getItem('userId') || '';
      if (!userId) return;

      const enrollmentsResponse = await enrollmentApi.getByStudent(userId);
      const enrollments = Array.isArray(enrollmentsResponse.data) ? enrollmentsResponse.data : [];

      const [assignmentsResponse, mySubmissionsResponse] = await Promise.all([
        Promise.all(enrollments.filter(e => e.classId).map(e => assignmentApi.getByClass(e.classId))),
        submissionApi.getMine()
      ]);

      const allAssignments: any[] = [];
      const allSubmissions: Record<string, any> = {};

      const mySubs = Array.isArray(mySubmissionsResponse.data) ? mySubmissionsResponse.data : [];
      mySubs.forEach((s: any) => {
        allSubmissions[s.assignmentId] = s;
      });

      assignmentsResponse.forEach((res, index) => {
        const classAssignments = Array.isArray(res.data) ? res.data : [];
        const enrollment = enrollments.filter(e => e.classId)[index];
        classAssignments.forEach((assignment: any) => {
          allAssignments.push({
            ...assignment,
            className: enrollment.className
          });
        });
      });

      setAssignments(allAssignments.sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime()));
      setSubmissions(allSubmissions);
    } catch (error) {
      console.error('Failed to fetch assignments', error);
      setSnackbar({ open: true, message: 'Không thể tải danh sách bài tập. Vui lòng thử lại sau.', severity: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const handleOpenSubmit = (assignment: any) => {
    setSelectedAssignment(assignment);
    const existing = submissions[assignment.id];
    setFileUrl(existing?.fileUrl || '');
    setContent(existing?.content || '');
    setSubmitDialogOpen(true);
  };

  const handleSubmit = async () => {
    if (!selectedAssignment || !fileUrl) {
      setSnackbar({ open: true, message: 'Vui lòng cung cấp link bài làm', severity: 'error' });
      return;
    }

    try {
      setSubmitting(true);
      await submissionApi.submit({
        assignmentId: selectedAssignment.id,
        fileUrl: fileUrl,
        content: content
      });
      setSnackbar({ open: true, message: 'Nộp bài tập thành công!', severity: 'success' });
      setSubmitDialogOpen(false);
      await fetchAssignments();
    } catch (error: any) {
      setSnackbar({ 
        open: true, 
        message: error?.response?.data?.message || 'Không thể nộp bài tập. Vui lòng kiểm tra lại.', 
        severity: 'error' 
      });
    } finally {
      setSubmitting(false);
    }
  };

  const isOverdue = (dueDate: string) => {
    return new Date(dueDate) < new Date();
  };

  return (
    <Box sx={{ pb: 6 }}>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" fontWeight={800} color="primary.main" gutterBottom>
          Bài tập & Nhiệm vụ
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Hoàn thành các bài tập đúng hạn để đạt kết quả học tập tốt nhất.
        </Typography>
      </Box>

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 10 }}>
          <CircularProgress />
        </Box>
      ) : (
        <Grid container spacing={3}>
          {assignments.length === 0 && (
            <Grid item xs={12}>
              <Paper sx={{ p: 6, textAlign: 'center', borderRadius: 4, bgcolor: 'rgba(0,0,0,0.02)' }}>
                <AssignmentIcon sx={{ fontSize: 64, color: 'text.disabled', mb: 2 }} />
                <Typography variant="h6" color="text.secondary">Bạn chưa có bài tập nào được giao.</Typography>
              </Paper>
            </Grid>
          )}
          {assignments.map((assignment) => {
            const submission = submissions[assignment.id];
            const overdue = isOverdue(assignment.dueDate) && !submission;

            return (
              <Grid item xs={12} md={6} lg={4} key={assignment.id}>
                <Card sx={{ 
                  height: '100%', 
                  display: 'flex', 
                  flexDirection: 'column',
                  borderRadius: 4,
                  boxShadow: '0 8px 24px rgba(0,0,0,0.05)',
                  border: overdue ? '2px solid rgba(244, 67, 54, 0.2)' : '1px solid rgba(0,0,0,0.05)',
                  transition: 'transform 0.2s',
                  '&:hover': { transform: 'translateY(-4px)' }
                }}>
                  <CardContent sx={{ flexGrow: 1, p: 3 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                      <Chip 
                        label={assignment.className} 
                        size="small" 
                        color="primary"
                        variant="outlined" 
                        sx={{ fontWeight: 700, borderRadius: 1.5 }}
                      />
                      {overdue && (
                        <Chip 
                          icon={<ErrorIcon sx={{ fontSize: '14px !important' }} />}
                          label="Quá hạn" 
                          size="small" 
                          color="error" 
                          sx={{ fontWeight: 800, borderRadius: 1.5 }}
                        />
                      )}
                      {submission && (
                        <Chip 
                          icon={<CheckCircleIcon sx={{ fontSize: '14px !important' }} />}
                          label="Đã hoàn thành" 
                          size="small" 
                          color="success" 
                          sx={{ fontWeight: 800, borderRadius: 1.5 }}
                        />
                      )}
                    </Box>

                    <Typography variant="h6" fontWeight={800} gutterBottom>
                      {assignment.title}
                    </Typography>

                    <Typography variant="body2" color="text.secondary" sx={{ 
                      mb: 2,
                      display: '-webkit-box',
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: 'vertical',
                      overflow: 'hidden',
                      minHeight: 40
                    }}>
                      {assignment.description || 'Không có mô tả chi tiết từ giảng viên.'}
                    </Typography>

                    <Divider sx={{ my: 2, borderStyle: 'dashed' }} />

                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 1, color: overdue ? 'error.main' : 'text.secondary' }}>
                      <ScheduleIcon sx={{ fontSize: 16, mr: 1 }} />
                      <Typography variant="caption" fontWeight={700}>
                        Hạn chót: {new Date(assignment.dueDate).toLocaleString('vi-VN')}
                      </Typography>
                    </Box>

                    {submission?.grade != null && (
                      <Box sx={{ mt: 2, p: 1.5, bgcolor: 'success.light', borderRadius: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center', color: 'success.contrastText' }}>
                        <Typography variant="subtitle2" fontWeight={800}>Điểm số:</Typography>
                        <Typography variant="h6" fontWeight={900}>{submission.grade} / 10</Typography>
                      </Box>
                    )}
                  </CardContent>

                  <Box sx={{ p: 2, pt: 0 }}>
                    <Button 
                      variant={submission ? "outlined" : "contained"} 
                      fullWidth 
                      startIcon={submission ? <CheckCircleIcon /> : <UploadIcon />}
                      onClick={() => handleOpenSubmit(assignment)}
                      color={overdue ? "error" : "primary"}
                      sx={{ borderRadius: 2, py: 1, fontWeight: 700 }}
                    >
                      {submission ? "Xem bài làm / Nộp lại" : "Nộp bài ngay"}
                    </Button>
                  </Box>
                </Card>
              </Grid>
            );
          })}
        </Grid>
      )}

      {/* Submission Dialog */}
      <Dialog open={submitDialogOpen} onClose={() => setSubmitDialogOpen(false)} maxWidth="sm" fullWidth PaperProps={{ sx: { borderRadius: 4 } }}>
        <DialogTitle sx={{ fontWeight: 800 }}>
          {submissions[selectedAssignment?.id] ? 'Cập nhật bài nộp' : 'Nộp bài tập'}
        </DialogTitle>
        <DialogContent dividers>
          <Typography variant="h6" fontWeight={700} color="primary.main" gutterBottom>
            {selectedAssignment?.title}
          </Typography>
          
          <Alert severity="warning" sx={{ mb: 3, borderRadius: 3 }}>
            <Typography variant="body2" fontWeight={600}>Lưu ý quan trọng:</Typography>
            <Typography variant="caption">
              Vui lòng tải tệp lên Google Drive/Dropbox và bật quyền "Bất kỳ ai có liên kết đều có thể xem" trước khi dán link vào đây.
            </Typography>
          </Alert>

          <TextField
            fullWidth
            label="Liên kết bài làm (URL)"
            placeholder="https://drive.google.com/file/d/..."
            margin="normal"
            value={fileUrl}
            onChange={(e) => setFileUrl(e.target.value)}
            InputProps={{
              startAdornment: <LinkIcon sx={{ mr: 1, color: 'primary.main' }} />,
            }}
            sx={{ mb: 2 }}
          />
          
          <TextField
            fullWidth
            label="Ghi chú gửi giảng viên"
            multiline
            rows={4}
            margin="normal"
            placeholder="Ví dụ: Em gửi bài tập phần Reading..."
            value={content}
            onChange={(e) => setContent(e.target.value)}
          />

          {submissions[selectedAssignment?.id]?.feedback && (
            <Box sx={{ mt: 3, p: 2, bgcolor: 'rgba(25, 118, 210, 0.05)', borderRadius: 3, borderLeft: '4px solid #1976d2' }}>
              <Typography variant="subtitle2" color="primary" fontWeight={800} display="flex" alignItems="center">
                <CheckCircleIcon sx={{ fontSize: 16, mr: 1 }} /> Nhận xét từ giảng viên:
              </Typography>
              <Typography variant="body2" sx={{ mt: 1, fontStyle: 'italic' }}>
                "{submissions[selectedAssignment?.id].feedback}"
              </Typography>
            </Box>
          )}
        </DialogContent>
        <DialogActions sx={{ p: 3 }}>
          <Button onClick={() => setSubmitDialogOpen(false)} color="inherit">Hủy bỏ</Button>
          <Button 
            variant="contained" 
            onClick={() => void handleSubmit()} 
            disabled={!fileUrl || submitting}
            startIcon={submitting ? <CircularProgress size={20} /> : <UploadIcon />}
            sx={{ borderRadius: 2, px: 4, fontWeight: 700 }}
          >
            {submitting ? 'Đang nộp bài...' : 'Xác nhận nộp bài'}
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar 
        open={snackbar.open} 
        autoHideDuration={4000} 
        onClose={() => setSnackbar(prev => ({ ...prev, open: false }))}
      >
        <Alert severity={snackbar.severity} variant="filled" sx={{ borderRadius: 2 }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}
