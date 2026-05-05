import { useState } from 'react';
import {
  Box,
  Typography,
  Button,
  Paper,
  Card,
  CardContent,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Grid,
  Chip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
} from '@mui/material';
import {
  Add as AddIcon,
  Assignment as AssignmentIcon,
  Grade as GradeIcon,
  Visibility as VisibilityIcon,
} from '@mui/icons-material';

const mockAssignments = [
  {
    id: '1',
    title: 'Reading Practice - Unit 5',
    deadline: '2026-05-10',
    submitted: 12,
    total: 15,
    status: 'ongoing',
  },
  {
    id: '2',
    title: 'Writing Task 1 - Graphs',
    deadline: '2026-05-15',
    submitted: 8,
    total: 15,
    status: 'ongoing',
  },
  {
    id: '3',
    title: 'Midterm Test',
    deadline: '2026-04-30',
    submitted: 15,
    total: 15,
    status: 'completed',
  },
];

const mockSubmissions = [
  { id: '1', studentName: 'Nguyễn Văn A', submittedAt: '2026-05-08', score: 8.5, graded: true },
  { id: '2', studentName: 'Trần Thị B', submittedAt: '2026-05-09', score: null, graded: false },
  { id: '3', studentName: 'Lê Văn C', submittedAt: '2026-05-07', score: 9.0, graded: true },
];

export default function AssignmentPage() {
  const [openCreateDialog, setOpenCreateDialog] = useState(false);
  const [openGradeDialog, setOpenGradeDialog] = useState(false);
  const [selectedAssignment, setSelectedAssignment] = useState<any>(null);

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" fontWeight={700}>
          Quản lý bài tập
        </Typography>
        <Button variant="contained" startIcon={<AddIcon />} onClick={() => setOpenCreateDialog(true)}>
          Tạo bài tập mới
        </Button>
      </Box>

      <Grid container spacing={3}>
        {mockAssignments.map((assignment) => (
          <Grid item xs={12} md={4} key={assignment.id}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', mb: 2 }}>
                  <AssignmentIcon color="primary" />
                  <Chip
                    label={assignment.status === 'completed' ? 'Hoàn thành' : 'Đang diễn ra'}
                    color={assignment.status === 'completed' ? 'success' : 'warning'}
                    size="small"
                  />
                </Box>
                <Typography variant="h6" gutterBottom fontWeight={600}>
                  {assignment.title}
                </Typography>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  Hạn nộp: {assignment.deadline}
                </Typography>
                <Typography variant="body2" color="primary" fontWeight={600}>
                  Đã nộp: {assignment.submitted}/{assignment.total}
                </Typography>
                <Button
                  variant="outlined"
                  fullWidth
                  sx={{ mt: 2 }}
                  startIcon={<GradeIcon />}
                  onClick={() => {
                    setSelectedAssignment(assignment);
                    setOpenGradeDialog(true);
                  }}
                >
                  Chấm điểm
                </Button>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      <Dialog open={openCreateDialog} onClose={() => setOpenCreateDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Tạo bài tập mới</DialogTitle>
        <DialogContent>
          <TextField fullWidth label="Tiêu đề bài tập" margin="normal" />
          <TextField fullWidth label="Mô tả" multiline rows={4} margin="normal" />
          <TextField fullWidth type="date" label="Hạn nộp" margin="normal" InputLabelProps={{ shrink: true }} />
          <TextField fullWidth type="number" label="Điểm tối đa" margin="normal" defaultValue={10} />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenCreateDialog(false)}>Hủy</Button>
          <Button variant="contained" onClick={() => setOpenCreateDialog(false)}>
            Tạo bài tập
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={openGradeDialog} onClose={() => setOpenGradeDialog(false)} maxWidth="md" fullWidth>
        <DialogTitle>Chấm điểm - {selectedAssignment?.title}</DialogTitle>
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
                {mockSubmissions.map((submission) => (
                  <TableRow key={submission.id}>
                    <TableCell>{submission.studentName}</TableCell>
                    <TableCell>{submission.submittedAt}</TableCell>
                    <TableCell>
                      {submission.graded ? (
                        <Chip label={submission.score} color="success" size="small" />
                      ) : (
                        <Chip label="Chưa chấm" color="warning" size="small" />
                      )}
                    </TableCell>
                    <TableCell>
                      {submission.graded ? (
                        <Chip label="Đã chấm" color="success" size="small" />
                      ) : (
                        <Chip label="Chờ chấm" color="warning" size="small" />
                      )}
                    </TableCell>
                    <TableCell align="right">
                      <IconButton size="small">
                        <VisibilityIcon />
                      </IconButton>
                      {!submission.graded && (
                        <IconButton size="small" color="primary">
                          <GradeIcon />
                        </IconButton>
                      )}
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
    </Box>
  );
}
