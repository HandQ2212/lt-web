import { Box, Typography, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Chip, LinearProgress, Card, CardContent, Grid } from '@mui/material';
import { TrendingUp as TrendingUpIcon, Assignment as AssignmentIcon } from '@mui/icons-material';

const grades = [
  {
    id: '1',
    assignment: 'Assignment 1: Reading Practice',
    type: 'Homework',
    score: 8.5,
    maxScore: 10,
    date: '2026-04-15',
    feedback: 'Làm tốt! Cần cải thiện thêm kỹ năng skimming.',
  },
  {
    id: '2',
    assignment: 'Assignment 2: Writing Task 1',
    type: 'Homework',
    score: 7.0,
    maxScore: 10,
    date: '2026-04-22',
    feedback: 'Bài viết cần rõ ràng hơn trong phần overview.',
  },
  {
    id: '3',
    assignment: 'Midterm Test',
    type: 'Exam',
    score: 8.0,
    maxScore: 10,
    date: '2026-04-29',
    feedback: 'Kết quả khá tốt. Tiếp tục phát huy!',
  },
  {
    id: '4',
    assignment: 'Speaking Practice',
    type: 'Oral',
    score: 7.5,
    maxScore: 10,
    date: '2026-05-01',
    feedback: 'Phát âm tốt, cần tự tin hơn khi trình bày.',
  },
];

const getScoreColor = (score: number, maxScore: number) => {
  const percentage = (score / maxScore) * 100;
  if (percentage >= 80) return 'success';
  if (percentage >= 60) return 'warning';
  return 'error';
};

const calculateAverage = () => {
  const total = grades.reduce((sum, grade) => sum + (grade.score / grade.maxScore) * 10, 0);
  return (total / grades.length).toFixed(1);
};

export default function GradebookPage() {
  const averageScore = calculateAverage();

  return (
    <Box>
      <Typography variant="h4" gutterBottom fontWeight={700}>
        Bảng điểm
      </Typography>

      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                <Typography variant="h6" fontWeight={600}>
                  Điểm trung bình
                </Typography>
                <TrendingUpIcon color="primary" />
              </Box>
              <Typography variant="h3" color="primary" fontWeight={700}>
                {averageScore}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                / 10
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                <Typography variant="h6" fontWeight={600}>
                  Tổng số bài tập
                </Typography>
                <AssignmentIcon color="success" />
              </Box>
              <Typography variant="h3" color="success.main" fontWeight={700}>
                {grades.length}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Đã hoàn thành
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Bài tập</TableCell>
              <TableCell>Loại</TableCell>
              <TableCell>Ngày nộp</TableCell>
              <TableCell>Điểm</TableCell>
              <TableCell>Nhận xét</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {grades.map((grade) => (
              <TableRow key={grade.id}>
                <TableCell>
                  <Typography variant="body2" fontWeight={600}>
                    {grade.assignment}
                  </Typography>
                </TableCell>
                <TableCell>
                  <Chip
                    label={grade.type}
                    size="small"
                    color={grade.type === 'Exam' ? 'error' : grade.type === 'Oral' ? 'info' : 'default'}
                  />
                </TableCell>
                <TableCell>{grade.date}</TableCell>
                <TableCell>
                  <Chip
                    label={`${grade.score}/${grade.maxScore}`}
                    color={getScoreColor(grade.score, grade.maxScore)}
                    sx={{ fontWeight: 600 }}
                  />
                </TableCell>
                <TableCell>
                  <Typography variant="body2" color="text.secondary">
                    {grade.feedback}
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
