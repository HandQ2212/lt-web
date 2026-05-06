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
} from '@mui/material';
import { Assignment as AssignmentIcon, TrendingUp as TrendingUpIcon } from '@mui/icons-material';
import { enrollmentApi, resultApi } from '../../../services/api';
import { RootState } from '../../../store';

const getScoreColor = (score: number) => {
  if (score >= 8) return 'success';
  if (score >= 6) return 'warning';
  return 'error';
};

export default function GradebookPage() {
  const user = useSelector((state: RootState) => state.auth.user);
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    void fetchResults();
  }, [user?.id]);

  const fetchResults = async () => {
    try {
      setLoading(true);
      setError(null);
      const userId = user?.id || localStorage.getItem('userId') || '';
      if (!userId) {
        setResults([]);
        return;
      }

      const enrollmentResponse = await enrollmentApi.getByStudent(userId);
      const enrollments = Array.isArray(enrollmentResponse.data) ? enrollmentResponse.data : [];
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
      .map((score) => Number(score))
      .filter((score) => Number.isFinite(score));
    if (scores.length === 0) return '-';
    return (scores.reduce((sum, score) => sum + score, 0) / scores.length).toFixed(1);
  }, [results]);

  return (
    <Box>
      <Typography variant="h4" gutterBottom fontWeight={700}>
        Bảng điểm
      </Typography>

      {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}

      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                <Typography variant="h6" fontWeight={600}>Điểm trung bình</Typography>
                <TrendingUpIcon color="primary" />
              </Box>
              <Typography variant="h3" color="primary" fontWeight={700}>{loading ? '...' : averageScore}</Typography>
              <Typography variant="body2" color="text.secondary">/ 10</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                <Typography variant="h6" fontWeight={600}>Khóa học đang theo dõi</Typography>
                <AssignmentIcon color="success" />
              </Box>
              <Typography variant="h3" color="success.main" fontWeight={700}>{loading ? '...' : results.length}</Typography>
              <Typography variant="body2" color="text.secondary">lớp/khóa học</Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
          <CircularProgress />
        </Box>
      ) : (
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Lớp học</TableCell>
                <TableCell>Giữa kỳ</TableCell>
                <TableCell>Cuối kỳ</TableCell>
                <TableCell>Xếp loại</TableCell>
                <TableCell>Nhận xét</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {results.length === 0 && (
                <TableRow>
                  <TableCell colSpan={5}>Chưa có dữ liệu điểm</TableCell>
                </TableRow>
              )}
              {results.map((result) => (
                <TableRow key={result.enrollmentId || result.id}>
                  <TableCell><Typography variant="body2" fontWeight={600}>{result.className || '-'}</Typography></TableCell>
                  <TableCell>
                    {result.midtermScore != null ? <Chip label={result.midtermScore} color={getScoreColor(Number(result.midtermScore))} /> : '-'}
                  </TableCell>
                  <TableCell>
                    {result.finalScore != null ? <Chip label={result.finalScore} color={getScoreColor(Number(result.finalScore))} /> : '-'}
                  </TableCell>
                  <TableCell><Chip label={result.finalGrade || 'Chưa có'} size="small" /></TableCell>
                  <TableCell><Typography variant="body2" color="text.secondary">{result.comments || '-'}</Typography></TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}
    </Box>
  );
}
