import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Grid,
  IconButton,
  MenuItem,
  Snackbar,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Typography,
} from '@mui/material';
import { Add as AddIcon, Assignment as AssignmentIcon, ContentCopy as ContentCopyIcon, Grade as GradeIcon, Visibility as VisibilityIcon } from '@mui/icons-material';
import { assignmentApi, classApi, submissionApi } from '../../../services/api';
import { RootState } from '../../../store';

const toDatetimeWithOffset = (date: string) => `${date}T23:59:00+07:00`;

export default function AssignmentPage() {
  const user = useSelector((state: RootState) => state.auth.user);
  const [classes, setClasses] = useState<any[]>([]);
  const [assignments, setAssignments] = useState<any[]>([]);
  const [submissions, setSubmissions] = useState<any[]>([]);
  const [openCreateDialog, setOpenCreateDialog] = useState(false);
  const [openGradeDialog, setOpenGradeDialog] = useState(false);
  const [openScoreDialog, setOpenScoreDialog] = useState(false);
  const [openSubmissionDetailDialog, setOpenSubmissionDetailDialog] = useState(false);
  const [selectedAssignment, setSelectedAssignment] = useState<any>(null);
  const [selectedSubmission, setSelectedSubmission] = useState<any>(null);
  const [selectedSubmissionDetail, setSelectedSubmissionDetail] = useState<any>(null);
  const [gradeForm, setGradeForm] = useState({ score: '', feedback: '' });
  const [form, setForm] = useState({ classId: '', title: '', description: '', dueDate: '' });
  const [snackbar, setSnackbar] = useState<{ open: boolean; message: string; severity: 'success' | 'error' }>({
    open: false,
    message: '',
    severity: 'success',
  });

  useEffect(() => {
    void fetchClassesAndAssignments();
  }, [user?.id]);

  const fetchClassesAndAssignments = async () => {
    try {
      const data = await classApi.getAll();
      const mine = (data || []).filter((cls: any) => !user?.id || cls.teacherId === user.id);
      setClasses(mine);
      setForm((prev) => ({ ...prev, classId: prev.classId || mine[0]?.id || '' }));

      const assignmentLists = await Promise.all(
        mine.map(async (cls: any) => {
          const response = await assignmentApi.getByClass(cls.id);
          return Array.isArray(response.data) ? response.data : [];
        })
      );
      setAssignments(assignmentLists.flat());
    } catch (err: any) {
      setSnackbar({ open: true, message: err?.response?.data?.message || 'Không thể tải bài tập', severity: 'error' });
    }
  };

  const handleCreate = async () => {
    try {
      await assignmentApi.create({
        classId: form.classId,
        title: form.title,
        description: form.description,
        dueDate: toDatetimeWithOffset(form.dueDate),
      });
      setOpenCreateDialog(false);
      setForm((prev) => ({ ...prev, title: '', description: '', dueDate: '' }));
      setSnackbar({ open: true, message: 'Tạo bài tập thành công', severity: 'success' });
      await fetchClassesAndAssignments();
    } catch (err: any) {
      setSnackbar({ open: true, message: err?.response?.data?.message || 'Không thể tạo bài tập', severity: 'error' });
    }
  };

  const openSubmissions = async (assignment: any) => {
    setSelectedAssignment(assignment);
    setOpenGradeDialog(true);
    try {
      const response = await submissionApi.getByAssignment(assignment.id);
      setSubmissions(Array.isArray(response.data) ? response.data : []);
    } catch {
      setSubmissions([]);
    }
  };

  const openGradeForm = (submission: any) => {
    setSelectedSubmission(submission);
    setGradeForm({ score: submission.grade != null ? String(submission.grade) : '', feedback: submission.feedback || '' });
    setOpenScoreDialog(true);
  };

  const openSubmissionDetail = (submission: any) => {
    setSelectedSubmissionDetail(submission);
    setOpenSubmissionDetailDialog(true);
  };

  const getSubmissionFileUrl = (submission: any) =>
    submission?.fileUrl || submission?.fileURL || submission?.attachmentUrl || submission?.attachmentURL || submission?.url || '';

  const handleCopySubmissionLink = async (link: string) => {
    if (!link) return;

    try {
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(link);
      } else {
        const textarea = document.createElement('textarea');
        textarea.value = link;
        textarea.style.position = 'fixed';
        textarea.style.opacity = '0';
        document.body.appendChild(textarea);
        textarea.focus();
        textarea.select();
        document.execCommand('copy');
        document.body.removeChild(textarea);
      }

      setSnackbar({ open: true, message: 'Đã copy link bài nộp', severity: 'success' });
    } catch {
      setSnackbar({ open: true, message: 'Không thể copy link bài nộp', severity: 'error' });
    }
  };

  const handleGrade = async () => {
    if (!selectedSubmission) return;
    try {
      await submissionApi.grade(selectedSubmission.id, Number(gradeForm.score), gradeForm.feedback);
      setSnackbar({ open: true, message: 'Đã chấm điểm bài nộp', severity: 'success' });
      setOpenScoreDialog(false);
      if (selectedAssignment) {
        await openSubmissions(selectedAssignment);
      }
    } catch (err: any) {
      setSnackbar({ open: true, message: err?.response?.data?.message || 'Không thể chấm điểm', severity: 'error' });
    }
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" fontWeight={700}>Quản lý bài tập</Typography>
        <Button variant="contained" startIcon={<AddIcon />} onClick={() => setOpenCreateDialog(true)}>
          Tạo bài tập mới
        </Button>
      </Box>

      <Grid container spacing={3}>
        {assignments.length === 0 && (
          <Grid item xs={12}>
            <Alert severity="info">Chưa có bài tập nào cho các lớp của bạn</Alert>
          </Grid>
        )}
        {assignments.map((assignment) => (
          <Grid item xs={12} md={4} key={assignment.id}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', mb: 2 }}>
                  <AssignmentIcon color="primary" />
                  <Chip label={assignment.className || 'Lớp học'} color="default" size="small" />
                </Box>
                <Typography variant="h6" gutterBottom fontWeight={600}>{assignment.title}</Typography>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  Hạn nộp: {assignment.dueDate ? new Date(assignment.dueDate).toLocaleString('vi-VN') : '-'}
                </Typography>
                <Typography variant="body2" color="text.secondary">{assignment.description || 'Không có mô tả'}</Typography>
                <Button variant="outlined" fullWidth sx={{ mt: 2 }} startIcon={<GradeIcon />} onClick={() => void openSubmissions(assignment)}>
                  Bài nộp & chấm điểm
                </Button>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      <Dialog open={openCreateDialog} onClose={() => setOpenCreateDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Tạo bài tập mới</DialogTitle>
        <DialogContent>
          <TextField fullWidth select label="Lớp" margin="normal" value={form.classId} onChange={(e) => setForm((prev) => ({ ...prev, classId: e.target.value }))}>
            {classes.map((cls) => <MenuItem value={cls.id} key={cls.id}>{cls.name || cls.id}</MenuItem>)}
          </TextField>
          <TextField fullWidth label="Tiêu đề bài tập" margin="normal" value={form.title} onChange={(e) => setForm((prev) => ({ ...prev, title: e.target.value }))} />
          <TextField fullWidth label="Mô tả" multiline rows={4} margin="normal" value={form.description} onChange={(e) => setForm((prev) => ({ ...prev, description: e.target.value }))} />
          <TextField fullWidth type="date" label="Hạn nộp" margin="normal" InputLabelProps={{ shrink: true }} value={form.dueDate} onChange={(e) => setForm((prev) => ({ ...prev, dueDate: e.target.value }))} />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenCreateDialog(false)}>Hủy</Button>
          <Button variant="contained" disabled={!form.classId || !form.title || !form.dueDate} onClick={() => void handleCreate()}>
            Tạo bài tập
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={openGradeDialog} onClose={() => setOpenGradeDialog(false)} maxWidth="md" fullWidth>
        <DialogTitle>Bài nộp - {selectedAssignment?.title}</DialogTitle>
        <DialogContent>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Học viên</TableCell>
                  <TableCell>Ngày nộp</TableCell>
                  <TableCell>Điểm</TableCell>
                  <TableCell>Trạng thái</TableCell>
                  <TableCell align="right">Thao tác</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {submissions.length === 0 && (
                  <TableRow><TableCell colSpan={5}>Chưa có bài nộp</TableCell></TableRow>
                )}
                {submissions.map((submission) => (
                  <TableRow key={submission.id}>
                    <TableCell>{submission.studentName || submission.studentId}</TableCell>
                    <TableCell>{submission.submissionDate ? new Date(submission.submissionDate).toLocaleString('vi-VN') : '-'}</TableCell>
                    <TableCell>{submission.grade != null ? <Chip label={submission.grade} color="success" size="small" /> : <Chip label="Chưa chấm" color="warning" size="small" />}</TableCell>
                    <TableCell><Chip label={submission.status || 'SUBMITTED'} color={submission.grade != null ? 'success' : 'warning'} size="small" /></TableCell>
                    <TableCell align="right">
                      <IconButton size="small" color="warning" onClick={() => openSubmissionDetail(submission)}><VisibilityIcon /></IconButton>
                      <IconButton size="small" color="primary" onClick={() => openGradeForm(submission)}><GradeIcon /></IconButton>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenGradeDialog(false)}>Đóng</Button>
        </DialogActions>
      </Dialog>

      <Dialog open={openSubmissionDetailDialog} onClose={() => setOpenSubmissionDetailDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Chi tiết bài nộp</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'grid', gap: 2, pt: 1 }}>
            <Box>
              <Typography variant="caption" color="text.secondary" fontWeight={800} textTransform="uppercase">
                Học viên
              </Typography>
              <Typography fontWeight={800}>
                {selectedSubmissionDetail?.studentName || selectedSubmissionDetail?.studentId || '-'}
              </Typography>
            </Box>

            <Box>
              <Typography variant="caption" color="text.secondary" fontWeight={800} textTransform="uppercase">
                Ngày nộp
              </Typography>
              <Typography>
                {selectedSubmissionDetail?.submissionDate ? new Date(selectedSubmissionDetail.submissionDate).toLocaleString('vi-VN') : '-'}
              </Typography>
            </Box>

            <Box sx={{ display: 'flex', gap: 1.5, flexWrap: 'wrap' }}>
              <Chip
                label={selectedSubmissionDetail?.grade != null ? `Điểm: ${selectedSubmissionDetail.grade}` : 'Chưa chấm'}
                color={selectedSubmissionDetail?.grade != null ? 'success' : 'warning'}
                sx={{ fontWeight: 800 }}
              />
              <Chip
                label={selectedSubmissionDetail?.status || 'SUBMITTED'}
                color={selectedSubmissionDetail?.grade != null ? 'success' : 'warning'}
                variant="outlined"
                sx={{ fontWeight: 800 }}
              />
            </Box>

            <Box>
              <Typography variant="caption" color="text.secondary" fontWeight={800} textTransform="uppercase">
                Nội dung bài làm
              </Typography>
              <Box sx={{ p: 2, mt: 0.75, borderRadius: 2, border: '1px solid rgba(30,41,59,0.25)', bgcolor: '#FFFDF5' }}>
                <Typography sx={{ whiteSpace: 'pre-wrap', overflowWrap: 'anywhere' }}>
                  {selectedSubmissionDetail?.content || selectedSubmissionDetail?.answer || selectedSubmissionDetail?.description || 'Không có nội dung text.'}
                </Typography>
              </Box>
            </Box>

            <Box>
              <Typography variant="caption" color="text.secondary" fontWeight={800} textTransform="uppercase">
                Link bài nộp
              </Typography>
              {getSubmissionFileUrl(selectedSubmissionDetail) ? (
                <Box
                  sx={{
                    mt: 0.75,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1,
                    p: 1,
                    borderRadius: 1,
                    border: '1px solid rgba(30,41,59,0.25)',
                    bgcolor: '#FFFDF5',
                  }}
                >
                  <Typography
                    sx={{
                      flex: 1,
                      minWidth: 0,
                      px: 1,
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                    }}
                    title={getSubmissionFileUrl(selectedSubmissionDetail)}
                  >
                    {getSubmissionFileUrl(selectedSubmissionDetail)}
                  </Typography>
                  <IconButton
                    aria-label="Copy link bài nộp"
                    onClick={() => void handleCopySubmissionLink(getSubmissionFileUrl(selectedSubmissionDetail))}
                    sx={{
                      border: '2px solid #1E293B',
                      bgcolor: '#FACC15',
                      color: '#1E293B',
                      '&:hover': { bgcolor: '#FDE68A' },
                    }}
                  >
                    <ContentCopyIcon fontSize="small" />
                  </IconButton>
                </Box>
              ) : (
                <Typography color="text.secondary" sx={{ mt: 0.75 }}>
                  Không có link bài nộp.
                </Typography>
              )}
            </Box>

            <Box>
              <Typography variant="caption" color="text.secondary" fontWeight={800} textTransform="uppercase">
                Nhận xét của giáo viên
              </Typography>
              <Box sx={{ p: 2, mt: 0.75, borderRadius: 2, border: '1px solid rgba(30,41,59,0.25)', bgcolor: '#F7E9FF' }}>
                <Typography sx={{ whiteSpace: 'pre-wrap', overflowWrap: 'anywhere' }}>
                  {selectedSubmissionDetail?.feedback || 'Chưa có nhận xét.'}
                </Typography>
              </Box>
            </Box>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenSubmissionDetailDialog(false)}>Đóng</Button>
          <Button variant="contained" onClick={() => selectedSubmissionDetail && openGradeForm(selectedSubmissionDetail)}>
            Chấm/Sửa điểm
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={openScoreDialog} onClose={() => setOpenScoreDialog(false)} maxWidth="xs" fullWidth>
        <DialogTitle>Chấm điểm bài nộp</DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            {selectedSubmission?.studentName || selectedSubmission?.studentId}
          </Typography>
          <TextField
            fullWidth
            type="number"
            label="Điểm"
            margin="normal"
            value={gradeForm.score}
            onChange={(e) => setGradeForm((prev) => ({ ...prev, score: e.target.value }))}
            inputProps={{ min: 0, step: 0.1 }}
          />
          <TextField
            fullWidth
            label="Nhận xét"
            multiline
            rows={4}
            margin="normal"
            value={gradeForm.feedback}
            onChange={(e) => setGradeForm((prev) => ({ ...prev, feedback: e.target.value }))}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenScoreDialog(false)}>Hủy</Button>
          <Button variant="contained" disabled={!gradeForm.score} onClick={() => void handleGrade()}>
            Lưu điểm
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar open={snackbar.open} autoHideDuration={3000} onClose={() => setSnackbar((prev) => ({ ...prev, open: false }))}>
        <Alert severity={snackbar.severity} variant="filled">{snackbar.message}</Alert>
      </Snackbar>
    </Box>
  );
}
