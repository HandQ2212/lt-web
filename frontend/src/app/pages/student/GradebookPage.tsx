import { useEffect, useMemo, useState } from 'react';
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
} from '@mui/material';
import { 
  Assignment as AssignmentIcon, 
  TrendingUp as TrendingUpIcon,
  Grade as GradeIcon 
} from '@mui/icons-material';
import { enrollmentApi, resultApi, submissionApi, assignmentApi } from '../../../services/api';
import { RootState } from '../../../store';

const getScoreColor = (score: number) => {
  if (score >= 8) return 'success';
  if (score >= 6) return 'warning';
  return 'error';
};

export default function GradebookPage() {
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
              finalGrade: 'Chưa có',
              comments: '',
            };
          }
        })
      );
      
      // Combine assignments and submissions
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
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Không thể tải bảng điểm');
    } finally {
      setLoading(false);
    }
  };

  const averageScore = useMemo(() => {
    const scores = results
      .flatMap((result) => [result.midtermScore, result.finalScore])
      .concat(submissions.map(s => s.grade))
      .map((score) => Number(score))
      .filter((score) => Number.isFinite(score));
    
    if (scores.length === 0) return '-';
    return (scores.reduce((sum, score) => sum + score, 0) / scores.length).toFixed(1);
  }, [results, submissions]);

  return (
    <Box>
      <Typography variant="h4" gutterBottom fontWeight={700}>
        Bảng điểm tổng quát
      </Typography>

      {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}

      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} md={4}>
          <Card sx={{ borderRadius: 3, boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                <Typography variant="h6" fontWeight={600}>Điểm trung bình</Typography>
                <TrendingUpIcon color="primary" />
              </Box>
              <Typography variant="h3" color="primary" fontWeight={800}>{loading ? '...' : averageScore}</Typography>
              <Typography variant="body2" color="text.secondary">Quy mô hệ điểm 10</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={4}>
          <Card sx={{ borderRadius: 3, boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                <Typography variant="h6" fontWeight={600}>Khóa học</Typography>
                <AssignmentIcon color="success" />
              </Box>
              <Typography variant="h3" color="success.main" fontWeight={800}>{loading ? '...' : results.length}</Typography>
              <Typography variant="body2" color="text.secondary">Lớp đang theo học</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={4}>
          <Card sx={{ borderRadius: 3, boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                <Typography variant="h6" fontWeight={600}>Bài tập đã nộp</Typography>
                <GradeIcon color="warning" />
              </Box>
              <Typography variant="h3" color="warning.main" fontWeight={800}>{loading ? '...' : submissions.filter(s => s.grade != null).length}</Typography>
              <Typography variant="body2" color="text.secondary">Đã được chấm điểm</Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Typography variant="h5" gutterBottom fontWeight={700} sx={{ mt: 4 }}>
        Điểm định kỳ (Giữa kỳ & Cuối kỳ)
      </Typography>
      <TableContainer component={Paper} sx={{ borderRadius: 3, mb: 5, boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}>
        <Table>
          <TableHead sx={{ bgcolor: 'grey.50' }}>
            <TableRow>
              <TableCell sx={{ fontWeight: 700 }}>Lớp học</TableCell>
              <TableCell sx={{ fontWeight: 700 }}>Giữa kỳ</TableCell>
              <TableCell sx={{ fontWeight: 700 }}>Cuối kỳ</TableCell>
              <TableCell sx={{ fontWeight: 700 }}>Xếp loại</TableCell>
              <TableCell sx={{ fontWeight: 700 }}>Nhận xét</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {loading ? (
              <TableRow><TableCell colSpan={5} align="center"><CircularProgress size={24} /></TableCell></TableRow>
            ) : results.length === 0 ? (
              <TableRow><TableCell colSpan={5} align="center">Chưa có dữ liệu điểm định kỳ</TableCell></TableRow>
            ) : results.map((result) => (
              <TableRow key={result.enrollmentId || result.id} hover>
                <TableCell><Typography variant="body2" fontWeight={700}>{result.className || '-'}</Typography></TableCell>
                <TableCell>
                  {result.midtermScore != null ? <Chip label={result.midtermScore} color={getScoreColor(Number(result.midtermScore))} sx={{ fontWeight: 700 }} /> : '-'}
                </TableCell>
                <TableCell>
                  {result.finalScore != null ? <Chip label={result.finalScore} color={getScoreColor(Number(result.finalScore))} sx={{ fontWeight: 700 }} /> : '-'}
                </TableCell>
                <TableCell><Chip label={result.finalGrade || 'Chưa có'} size="small" variant="outlined" /></TableCell>
                <TableCell><Typography variant="body2" color="text.secondary">{result.comments || '-'}</Typography></TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <Typography variant="h5" gutterBottom fontWeight={700}>
        Chi tiết điểm bài tập
      </Typography>
      <TableContainer component={Paper} sx={{ borderRadius: 3, boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}>
        <Table>
          <TableHead sx={{ bgcolor: 'grey.50' }}>
            <TableRow>
              <TableCell sx={{ fontWeight: 700 }}>Bài tập</TableCell>
              <TableCell sx={{ fontWeight: 700 }}>Ngày nộp</TableCell>
              <TableCell sx={{ fontWeight: 700 }}>Trạng thái</TableCell>
              <TableCell sx={{ fontWeight: 700 }}>Điểm</TableCell>
              <TableCell sx={{ fontWeight: 700 }}>Phản hồi</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {loading ? (
              <TableRow><TableCell colSpan={5} align="center"><CircularProgress size={24} /></TableCell></TableRow>
            ) : submissions.length === 0 ? (
              <TableRow><TableCell colSpan={5} align="center">Bạn chưa nộp bài tập nào</TableCell></TableRow>
            ) : submissions.map((sub) => (
              <TableRow key={sub.id} hover>
                <TableCell>
                  <Typography variant="body2" fontWeight={700}>{sub.assignmentTitle || 'Bài tập'}</Typography>
                </TableCell>
                <TableCell>
                  {sub.submissionDate ? new Date(sub.submissionDate).toLocaleDateString('vi-VN') : '-'}
                </TableCell>
                <TableCell>
                  <Chip 
                    label={
                      sub.status === 'GRADED' ? 'Đã chấm' : 
                      sub.status === 'SUBMITTED' ? 'Đã nộp' : 'Chưa nộp'
                    } 
                    color={
                      sub.status === 'GRADED' ? 'success' : 
                      sub.status === 'SUBMITTED' ? 'info' : 'error'
                    } 
                    size="small" 
                  />
                </TableCell>
                <TableCell>
                  {sub.grade != null ? (
                    <Typography variant="body2" fontWeight={800} color={getScoreColor(sub.grade) + '.main'}>
                      {sub.grade}/10
                    </Typography>
                  ) : '-'}
                </TableCell>
                <TableCell>
                  <Typography variant="body2" color="text.secondary" sx={{ fontStyle: 'italic' }}>
                    {sub.feedback || 'Chưa có phản hồi'}
                  </Typography>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
}
