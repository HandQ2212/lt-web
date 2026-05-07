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
} from '@mui/material';
import {
  Assignment as AssignmentIcon,
  CloudUpload as UploadIcon,
  CheckCircle as CheckCircleIcon,
  Schedule as ScheduleIcon,
  Link as LinkIcon,
} from '@mui/icons-material';
import { enrollmentApi, assignmentApi, submissionApi } from '../../../services/api';
import { RootState } from '../../../store';

export default function StudentAssignmentsPage() {
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
      const userId = user?.id || '';
      if (!userId) return;

      const enrollmentsResponse = await enrollmentApi.getByStudent(userId);
      const enrollments = Array.isArray(enrollmentsResponse.data) ? enrollmentsResponse.data : [];

      const [assignmentsResponse, mySubmissionsResponse] = await Promise.all([
        Promise.all(enrollments.filter(e => e.classId).map(e => assignmentApi.getByClass(e.classId))),
        submissionApi.getMine()
      ]);

      const allAssignments: any[] = [];
      const allSubmissions: Record<string, any> = {};

      // Map my submissions
      const mySubs = Array.isArray(mySubmissionsResponse.data) ? mySubmissionsResponse.data : [];
      mySubs.forEach((s: any) => {
        allSubmissions[s.assignmentId] = s;
      });

      // Map assignments
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
      setSnackbar({ open: true, message: 'Không thể tải danh sách bài tập', severity: 'error' });
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
    if (!selectedAssignment || !submissionUrl) return;

    try {
      setSubmitting(true);
      await submissionApi.submit({
        assignmentId: selectedAssignment.id,
        fileUrl: fileUrl,
        content: content
      });
      setSnackbar({ open: true, message: 'Nộp bài thành công', severity: 'success' });
      setSubmitDialogOpen(false);
      await fetchAssignments();
    } catch (error: any) {
      setSnackbar({ 
        open: true, 
        message: error?.response?.data?.message || 'Không thể nộp bài', 
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
    <Box>
      <Typography variant="h4" gutterBottom fontWeight={700}>
        Bài tập & Nhiệm vụ
      </Typography>

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 10 }}>
          <CircularProgress />
        </Box>
      ) : (
        <Grid container spacing={3}>
          {assignments.length === 0 && (
            <Grid item xs={12}>
              <Alert severity="info">Bạn chưa có bài tập nào được giao.</Alert>
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
                  borderRadius: 3,
                  boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
                  border: overdue ? '1px solid #f44336' : '1px solid rgba(0,0,0,0.05)'
                }}>
                  <CardContent sx={{ flexGrow: 1 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                      <Box sx={{ p: 1, bgcolor: 'primary.light', borderRadius: 2, display: 'flex' }}>
                        <AssignmentIcon color="primary" />
                      </Box>
                      <Chip 
                        label={assignment.className} 
                        size="small" 
                        variant="outlined" 
                        sx={{ borderRadius: 1 }}
                      />
                    </Box>

                    <Typography variant="h6" fontWeight={700} gutterBottom>
                      {assignment.title}
                    </Typography>

                    <Typography variant="body2" color="text.secondary" paragraph sx={{ 
                      display: '-webkit-box',
                      WebkitLineClamp: 3,
                      WebkitBoxOrient: 'vertical',
                      overflow: 'hidden',
                      height: 60
                    }}>
                      {assignment.description || 'Không có mô tả chi tiết.'}
                    </Typography>

                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 1, color: overdue ? 'error.main' : 'text.secondary' }}>
                      <ScheduleIcon sx={{ fontSize: 16, mr: 1 }} />
                      <Typography variant="caption" fontWeight={600}>
                        Hạn nộp: {new Date(assignment.dueDate).toLocaleString('vi-VN')}
                      </Typography>
                    </Box>

                    {submission && (
                      <Box sx={{ display: 'flex', alignItems: 'center', color: 'success.main', mt: 1 }}>
                        <CheckCircleIcon sx={{ fontSize: 16, mr: 1 }} />
                        <Typography variant="caption" fontWeight={700}>
                          Đã nộp: {new Date(submission.submissionDate).toLocaleDateString('vi-VN')}
                        </Typography>
                        {submission.grade != null && (
                          <Chip 
                            label={`${submission.grade}đ`} 
                            size="small" 
                            color="success" 
                            sx={{ ml: 2, fontWeight: 800, height: 20 }}
                          />
                        )}
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
                      sx={{ borderRadius: 2 }}
                    >
                      {submission ? "Xem bài nộp / Nộp lại" : "Nộp bài tập"}
                    </Button>
                  </Box>
                </Card>
              </Grid>
            );
          })}
        </Grid>
      )}

      <Dialog open={submitDialogOpen} onClose={() => setSubmitDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ fontWeight: 700 }}>
          {submissions[selectedAssignment?.id] ? 'Cập nhật bài nộp' : 'Nộp bài tập'}
        </DialogTitle>
        <DialogContent>
          <Typography variant="subtitle1" fontWeight={600} gutterBottom>
            {selectedAssignment?.title}
          </Typography>
          <Alert severity="info" sx={{ mb: 3 }}>
            Vui lòng tải bài làm lên các nền tảng lưu trữ (Google Drive, Dropbox...) và dán link vào bên dưới. Đảm bảo đã bật quyền truy cập cho giảng viên.
          </Alert>
          <TextField
            fullWidth
            label="Link bài làm"
            placeholder="https://drive.google.com/..."
            margin="normal"
            value={fileUrl}
            onChange={(e) => setFileUrl(e.target.value)}
            InputProps={{
              startAdornment: <LinkIcon sx={{ mr: 1, color: 'text.secondary' }} />,
            }}
          />
          <TextField
            fullWidth
            label="Ghi chú (nếu có)"
            multiline
            rows={3}
            margin="normal"
            value={content}
            onChange={(e) => setContent(e.target.value)}
          />
          {submissions[selectedAssignment?.id]?.feedback && (
            <Paper sx={{ p: 2, mt: 2, bgcolor: 'grey.50', border: '1px dashed #ccc' }}>
              <Typography variant="subtitle2" color="primary" fontWeight={700}>
                Phản hồi từ giảng viên:
              </Typography>
              <Typography variant="body2">
                {submissions[selectedAssignment?.id].feedback}
              </Typography>
            </Paper>
          )}
        </DialogContent>
        <DialogActions sx={{ p: 3 }}>
          <Button onClick={() => setSubmitDialogOpen(false)}>Hủy</Button>
          <Button 
            variant="contained" 
            onClick={() => void handleSubmit()} 
            disabled={!fileUrl || submitting}
            startIcon={submitting ? <CircularProgress size={20} /> : <UploadIcon />}
          >
            {submitting ? 'Đang nộp...' : 'Xác nhận nộp'}
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar 
        open={snackbar.open} 
        autoHideDuration={4000} 
        onClose={() => setSnackbar(prev => ({ ...prev, open: false }))}
      >
        <Alert severity={snackbar.severity} variant="filled">
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}
