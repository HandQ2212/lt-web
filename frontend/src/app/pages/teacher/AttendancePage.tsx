import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import {
  Alert,
  Box,
  Button,
  CircularProgress,
  FormControlLabel,
  Grid,
  MenuItem,
  Paper,
  Radio,
  RadioGroup,
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
import { Save as SaveIcon } from '@mui/icons-material';
import { attendanceApi, classApi, enrollmentApi } from '../../../services/api';
import { RootState } from '../../../store';

export default function AttendancePage() {
  const user = useSelector((state: RootState) => state.auth.user);
  const [classes, setClasses] = useState<any[]>([]);
  const [selectedClass, setSelectedClass] = useState('');
  const [attendanceDate, setAttendanceDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [students, setStudents] = useState<any[]>([]);
  const [attendance, setAttendance] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [snackbar, setSnackbar] = useState<{ open: boolean; message: string; severity: 'success' | 'error' }>({
    open: false,
    message: '',
    severity: 'success',
  });

  useEffect(() => {
    void fetchClasses();
  }, [user?.id]);

  useEffect(() => {
    if (selectedClass) {
      void fetchStudents(selectedClass);
      void fetchExistingAttendance(selectedClass, attendanceDate);
    } else {
      setStudents([]);
      setAttendance({});
    }
  }, [selectedClass, attendanceDate]);

  const fetchClasses = async () => {
    try {
      setLoading(true);
      const data = await classApi.getAll();
      const mine = (data || []).filter((cls: any) => !user?.id || cls.teacherId === user.id);
      setClasses(mine);
      setSelectedClass((current) => current || mine[0]?.id || '');
    } catch (err: any) {
      setSnackbar({ open: true, message: err?.response?.data?.message || 'Không thể tải lớp', severity: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const fetchStudents = async (classId: string) => {
    try {
      const response = await enrollmentApi.getByClass(classId);
      const enrollments = Array.isArray(response.data) ? response.data : [];
      setStudents(enrollments);
      // Default to PRESENT for new entries
      setAttendance((prev) => {
        const next = { ...prev };
        enrollments.forEach((item: any) => {
          if (!next[item.id]) next[item.id] = 'PRESENT';
        });
        return next;
      });
    } catch (err: any) {
      setSnackbar({ open: true, message: err?.response?.data?.message || 'Không thể tải học viên', severity: 'error' });
    }
  };

  const fetchExistingAttendance = async (classId: string, date: string) => {
    try {
      const response = await attendanceApi.getByClass(classId, date);
      const records = Array.isArray(response.data) ? response.data : [];
      if (records.length > 0) {
        const existingMap: Record<string, string> = {};
        records.forEach((rec: any) => {
          existingMap[rec.enrollmentId] = rec.status;
        });
        setAttendance((prev) => ({ ...prev, ...existingMap }));
      }
    } catch (err: any) {
      console.error('Failed to fetch existing attendance', err);
    }
  };

  const handleAttendanceChange = (enrollmentId: string, status: string) => {
    setAttendance((prev) => ({ ...prev, [enrollmentId]: status }));
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      await Promise.all(
        students.map((student) =>
          attendanceApi.submit({
            enrollmentId: student.id,
            attendanceDate,
            status: attendance[student.id] || 'PRESENT',
          })
        )
      );
      setSnackbar({ open: true, message: 'Điểm danh đã được lưu', severity: 'success' });
    } catch (err: any) {
      setSnackbar({ open: true, message: err?.response?.data?.message || 'Không thể lưu điểm danh', severity: 'error' });
    } finally {
      setSaving(false);
    }
  };

  return (
    <Box>
      <Typography variant="h4" gutterBottom fontWeight={700}>
        Điểm danh
      </Typography>

      <Paper sx={{ p: 3, mb: 3 }}>
        <Grid container spacing={2}>
          <Grid item xs={12} md={6}>
            <TextField fullWidth select label="Chọn lớp" value={selectedClass} onChange={(e) => setSelectedClass(e.target.value)}>
              {classes.map((cls) => (
                <MenuItem value={cls.id} key={cls.id}>{cls.name || cls.id}</MenuItem>
              ))}
            </TextField>
          </Grid>
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              type="date"
              label="Ngày điểm danh"
              value={attendanceDate}
              onChange={(e) => setAttendanceDate(e.target.value)}
              InputLabelProps={{ shrink: true }}
            />
          </Grid>
        </Grid>
      </Paper>

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}><CircularProgress /></Box>
      ) : (
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell width="40%">Học viên</TableCell>
                <TableCell width="20%">Trạng thái ghi danh</TableCell>
                <TableCell width="40%">Điểm danh</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {students.length === 0 && (
                <TableRow>
                  <TableCell colSpan={3}>
                    <Alert severity="info">Lớp này chưa có học viên</Alert>
                  </TableCell>
                </TableRow>
              )}
              {students.map((student) => (
                <TableRow key={student.id}>
                  <TableCell><Typography variant="body2" fontWeight={600}>{student.studentName || student.studentId}</Typography></TableCell>
                  <TableCell>{student.status || '-'}</TableCell>
                  <TableCell>
                    <RadioGroup row value={attendance[student.id] || 'PRESENT'} onChange={(e) => handleAttendanceChange(student.id, e.target.value)}>
                      <FormControlLabel value="PRESENT" control={<Radio />} label="Có mặt" />
                      <FormControlLabel value="ABSENT" control={<Radio />} label="Vắng" />
                      <FormControlLabel value="LATE" control={<Radio />} label="Muộn" />
                      <FormControlLabel value="EXCUSED" control={<Radio />} label="Có phép" />
                    </RadioGroup>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      <Box sx={{ mt: 3, display: 'flex', justifyContent: 'flex-end' }}>
        <Button variant="contained" size="large" startIcon={<SaveIcon />} disabled={saving || students.length === 0} onClick={handleSave}>
          {saving ? 'Đang lưu...' : 'Lưu điểm danh'}
        </Button>
      </Box>

      <Snackbar open={snackbar.open} autoHideDuration={3000} onClose={() => setSnackbar((prev) => ({ ...prev, open: false }))}>
        <Alert severity={snackbar.severity} variant="filled">{snackbar.message}</Alert>
      </Snackbar>
    </Box>
  );
}
