import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import {
  Alert,
  Box,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  Grid,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
  Divider,
  useTheme,
  useMediaQuery,
} from '@mui/material';
import { 
  Assignment as AssignmentIcon, 
  TrendingUp as TrendingUpIcon,
} from '@mui/icons-material';
import { enrollmentApi, resultApi, submissionApi, assignmentApi } from '../../../services/api';
import { RootState } from '../../../store';

const getScoreColor = (score: number) => {
  if (score >= 8) return 'success';
  if (score >= 6) return 'warning';
  return 'error';
};

export default function GradebookPage() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const user = useSelector((state: RootState) => state.auth.user);
  const [results, setResults] = useState<any[]>([]);
  const [submissions, setSubmissions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    void fetchData();
  }, [user?.id]);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      const userId = user?.id || localStorage.getItem('userId') || '';
      if (!userId) return;

      const [enrollmentResponse, submissionsResponse] = await Promise.all([
        enrollmentApi.getByStudent(userId),
        submissionApi.getMine()
      ]);

      const enrollments = Array.isArray(enrollmentResponse.data) ? enrollmentResponse.data : [];
      const submissionsData = Array.isArray(submissionsResponse.data) ? submissionsResponse.data : [];
      
      const assignmentsResponse = await Promise.all(
        enrollments.filter((e: any) => e.classId).map((e: any) => assignmentApi.getByClass(e.classId))
      );
      const allAssignments = assignmentsResponse.flatMap(res => Array.isArray(res.data) ? res.data : []);
      
      const resultResponses = await Promise.all(
        enrollments.map(async (enrollment: any) => {
          try {
            const response = await resultApi.getByEnrollment(enrollment.id);
            return response.data;
          } catch {
            return {
              enrollmentId: enrollment.id,
              className: enrollment.className,
              midtermScore: null,
              finalScore: null,
              finalGrade: 'Chưa cập nhật',
              comments: '',
            };
          }
        })
      );
      
      const combinedSubmissions = allAssignments.map(assignment => {
        const submission = submissionsData.find(s => s.assignmentId === assignment.id);
        return {
          id: submission?.id || assignment.id,
          assignmentId: assignment.id,
          assignmentTitle: assignment.title,
          submissionDate: submission?.submissionDate,
          dueDate: assignment.dueDate,
          status: submission ? (submission.grade != null ? 'GRADED' : 'SUBMITTED') : 'NOT_SUBMITTED',
          grade: submission?.grade,
          feedback: submission?.feedback
        };
      });

      setSubmissions(combinedSubmissions);
      setResults(resultResponses);
    } catch (err) {
      console.error('Failed to fetch grades:', err);
      setError('Không thể tải dữ liệu bảng điểm. Vui lòng thử lại sau.');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 10 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ pb: 6 }}>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" fontWeight={800} color="primary.main" gutterBottom>
          Bảng điểm chi tiết
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Theo dõi kết quả học tập và phản hồi từ giảng viên qua từng giai đoạn.
        </Typography>
      </Box>

      {error && <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }}>{error}</Alert>}

      {/* Periodic Results */}
      <Typography variant="h6" fontWeight={800} sx={{ mb: 3, mt: 4 }} display="flex" alignItems="center">
        <TrendingUpIcon sx={{ mr: 1, color: 'primary.main' }} /> Kết quả học tập định kỳ
      </Typography>
      
      <Grid container spacing={3} sx={{ mb: 6 }}>
        {results.map((result, index) => (
          <Grid item xs={12} md={6} key={index}>
            <Card sx={{ 
              borderRadius: 4, 
              boxShadow: '0 8px 32px rgba(0,0,0,0.06)', 
              border: '1px solid rgba(0,0,0,0.05)',
              overflow: 'visible',
              position: 'relative',
              mt: 2
            }}>
              <Box sx={{ 
                position: 'absolute', 
                top: -15, 
                left: 20, 
                bgcolor: 'primary.main', 
                color: 'white', 
                px: 2, py: 0.5, 
                borderRadius: 2,
                fontWeight: 700,
                boxShadow: '0 4px 12px rgba(25, 118, 210, 0.3)',
                zIndex: 1
              }}>
                {result.className}
              </Box>
              <CardContent sx={{ pt: 4 }}>
                <Grid container spacing={2}>
                  <Grid item xs={6}>
                    <Typography variant="caption" color="text.secondary" display="block">Điểm giữa kỳ</Typography>
                    <Typography variant="h5" fontWeight={800} color={result.midtermScore ? getScoreColor(result.midtermScore) : 'text.disabled'}>
                      {result.midtermScore ?? '-'}
                    </Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="caption" color="text.secondary" display="block">Điểm cuối kỳ</Typography>
                    <Typography variant="h5" fontWeight={800} color={result.finalScore ? getScoreColor(result.finalScore) : 'text.disabled'}>
                      {result.finalScore ?? '-'}
                    </Typography>
                  </Grid>
                  <Grid item xs={12}>
                    <Divider sx={{ my: 1.5, opacity: 0.5 }} />
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Typography variant="subtitle2" fontWeight={700}>Xếp loại chung:</Typography>
                      <Chip 
                        label={result.finalGrade || 'Chưa xếp loại'} 
                        color="primary" 
                        size="small" 
                        sx={{ fontWeight: 800, borderRadius: 1.5 }} 
                      />
                    </Box>
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          </Grid>
        ))}
        {results.length === 0 && (
          <Grid item xs={12}>
            <Paper sx={{ p: 4, textAlign: 'center', bgcolor: 'rgba(0,0,0,0.02)', borderRadius: 4 }}>
              <Typography color="text.secondary">Chưa có dữ liệu điểm định kỳ.</Typography>
            </Paper>
          </Grid>
        )}
      </Grid>

      {/* Assignment Submissions */}
      <Typography variant="h6" fontWeight={800} sx={{ mb: 2 }} display="flex" alignItems="center">
        <AssignmentIcon sx={{ mr: 1, color: 'primary.main' }} /> Chi tiết bài tập về nhà
      </Typography>

      <TableContainer component={Paper} sx={{ borderRadius: 4, boxShadow: '0 8px 32px rgba(0,0,0,0.04)', overflow: 'auto' }}>
        <Table sx={{ minWidth: 800 }}>
          <TableHead sx={{ bgcolor: 'rgba(0,0,0,0.02)' }}>
            <TableRow>
              <TableCell sx={{ fontWeight: 800 }}>Tên bài tập</TableCell>
              <TableCell sx={{ fontWeight: 800 }}>Trạng thái</TableCell>
              <TableCell sx={{ fontWeight: 800 }}>Hạn nộp</TableCell>
              <TableCell sx={{ fontWeight: 800 }}>Ngày nộp</TableCell>
              <TableCell sx={{ fontWeight: 800 }} align="center">Điểm số</TableCell>
              <TableCell sx={{ fontWeight: 800 }}>Nhận xét</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {submissions.map((row) => (
              <TableRow key={row.id} hover>
                <TableCell sx={{ fontWeight: 600 }}>{row.assignmentTitle}</TableCell>
                <TableCell>
                  <Chip
                    label={
                      row.status === 'GRADED' ? 'Đã chấm điểm' :
                      row.status === 'SUBMITTED' ? 'Đã nộp bài' : 'Chưa nộp bài'
                    }
                    size="small"
                    color={
                      row.status === 'GRADED' ? 'success' :
                      row.status === 'SUBMITTED' ? 'info' : 'error'
                    }
                    sx={{ fontWeight: 700, borderRadius: 1.5 }}
                  />
                </TableCell>
                <TableCell sx={{ color: 'text.secondary', fontSize: '0.875rem' }}>
                  {new Date(row.dueDate).toLocaleDateString('vi-VN')}
                </TableCell>
                <TableCell sx={{ color: 'text.secondary', fontSize: '0.875rem' }}>
                  {row.submissionDate ? new Date(row.submissionDate).toLocaleDateString('vi-VN') : '-'}
                </TableCell>
                <TableCell align="center">
                  {row.grade != null ? (
                    <Typography fontWeight={800} color={getScoreColor(row.grade)}>
                      {row.grade}/10
                    </Typography>
                  ) : '-'}
                </TableCell>
                <TableCell sx={{ 
                  fontStyle: row.feedback ? 'normal' : 'italic', 
                  color: row.feedback ? 'text.primary' : 'text.disabled',
                  maxWidth: 200,
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap'
                }}>
                  {row.feedback || 'Chưa có nhận xét'}
                </TableCell>
              </TableRow>
            ))}
            {submissions.length === 0 && (
              <TableRow>
                <TableCell colSpan={6} align="center" sx={{ py: 6, opacity: 0.5 }}>
                  <Typography>Chưa có dữ liệu bài tập nào được ghi nhận</Typography>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
}
