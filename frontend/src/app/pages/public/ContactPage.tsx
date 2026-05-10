import { useEffect, useState } from 'react';
import {
  Alert,
  Box,
  Button,
  Checkbox,
  Container,
  Grid,
  ListItemText,
  MenuItem,
  Paper,
  Snackbar,
  TextField,
  Typography,
} from '@mui/material';
import { Email as EmailIcon, LocationOn as LocationIcon, Phone as PhoneIcon } from '@mui/icons-material';
import { courseApi, leadApi } from '../../../services/api';

export default function ContactPage() {
  const [courses, setCourses] = useState<any[]>([]);
  const [form, setForm] = useState({
    fullName: '',
    email: '',
    phone: '',
    subject: '',
    message: '',
    courseIds: [] as string[],
  });
  const [submitting, setSubmitting] = useState(false);
  const [snackbar, setSnackbar] = useState<{ open: boolean; message: string; severity: 'success' | 'error' }>({
    open: false,
    message: '',
    severity: 'success',
  });

  useEffect(() => {
    courseApi.getAll().then(setCourses).catch(() => setCourses([]));
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSubmitting(true);
      await leadApi.publicSubmit({
        fullName: form.fullName,
        email: form.email,
        phone: form.phone,
        source: 'WEBSITE_FORM',
        status: 'NEW',
        courseIds: form.courseIds,
        notes: [form.subject, form.message].filter(Boolean).join('\n\n'),
      });
      setForm({ fullName: '', email: '', phone: '', subject: '', message: '', courseIds: [] });
      setSnackbar({ open: true, message: 'Cảm ơn bạn đã liên hệ. Chúng tôi sẽ phản hồi sớm nhất.', severity: 'success' });
    } catch (err: any) {
      setSnackbar({ open: true, message: err?.response?.data?.message || 'Không thể gửi liên hệ', severity: 'error' });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Container maxWidth="lg" sx={{ py: 6 }}>
      <Typography variant="h3" gutterBottom fontWeight={700} align="center">
        Liên hệ với chúng tôi
      </Typography>
      <Typography variant="body1" align="center" color="text.secondary" sx={{ mb: 6 }}>
        Chúng tôi luôn sẵn sàng hỗ trợ bạn
      </Typography>

      <Grid container spacing={4}>
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 3, textAlign: 'center', height: '100%' }}>
            <LocationIcon sx={{ fontSize: 48, color: 'primary.main', mb: 2 }} />
            <Typography variant="h6" gutterBottom fontWeight={600}>Địa chỉ</Typography>
            <Typography variant="body2" color="text.secondary">
              123 Đường ABC, Quận 1
              <br />
              TP. Hồ Chí Minh
            </Typography>
          </Paper>
        </Grid>

        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 3, textAlign: 'center', height: '100%' }}>
            <PhoneIcon sx={{ fontSize: 48, color: 'primary.main', mb: 2 }} />
            <Typography variant="h6" gutterBottom fontWeight={600}>Điện thoại</Typography>
            <Typography variant="body2" color="text.secondary">
              Hotline: (028) 1234 5678
              <br />
              Mobile: 0901 234 567
            </Typography>
          </Paper>
        </Grid>

        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 3, textAlign: 'center', height: '100%' }}>
            <EmailIcon sx={{ fontSize: 48, color: 'primary.main', mb: 2 }} />
            <Typography variant="h6" gutterBottom fontWeight={600}>Email</Typography>
            <Typography variant="body2" color="text.secondary">
              info@elcenglish.edu.vn
              <br />
              support@elcenglish.edu.vn
            </Typography>
          </Paper>
        </Grid>

        <Grid item xs={12}>
          <Paper elevation={3} sx={{ p: { xs: 3, md: 5 }, borderRadius: 4 }}>
            <Typography variant="h5" gutterBottom fontWeight={700} sx={{ mb: 4 }}>
              Gửi tin nhắn cho chúng tôi
            </Typography>
            <form onSubmit={handleSubmit}>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: 3 }}>
                  <TextField 
                    fullWidth 
                    label="Họ tên" 
                    required 
                    variant="outlined"
                    value={form.fullName} 
                    onChange={(e) => setForm((prev) => ({ ...prev, fullName: e.target.value }))} 
                  />
                  <TextField 
                    fullWidth 
                    label="Email" 
                    type="email" 
                    variant="outlined"
                    value={form.email} 
                    onChange={(e) => setForm((prev) => ({ ...prev, email: e.target.value }))} 
                  />
                </Box>
                
                <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: 3 }}>
                  <TextField 
                    fullWidth 
                    label="Số điện thoại" 
                    required 
                    variant="outlined"
                    value={form.phone} 
                    onChange={(e) => setForm((prev) => ({ ...prev, phone: e.target.value }))} 
                  />
                  <TextField
                    fullWidth
                    select
                    label="Khóa học quan tâm"
                    variant="outlined"
                    value={form.courseIds}
                    SelectProps={{
                      multiple: true,
                      renderValue: (selected) => (selected as string[]).map((id) => courses.find((course) => course.id === id)?.name || id).join(', '),
                    }}
                    onChange={(e) =>
                      setForm((prev) => ({
                        ...prev,
                        courseIds: typeof e.target.value === 'string' ? e.target.value.split(',') : (e.target.value as string[]),
                      }))
                    }
                  >
                    {courses.map((course) => (
                      <MenuItem value={course.id} key={course.id}>
                        <Checkbox checked={form.courseIds.includes(course.id)} />
                        <ListItemText primary={course.name} />
                      </MenuItem>
                    ))}
                  </TextField>
                </Box>

                <TextField 
                  fullWidth 
                  label="Tiêu đề" 
                  required 
                  variant="outlined"
                  value={form.subject} 
                  onChange={(e) => setForm((prev) => ({ ...prev, subject: e.target.value }))} 
                />
                
                <TextField 
                  fullWidth 
                  label="Nội dung" 
                  multiline 
                  rows={5} 
                  required 
                  variant="outlined"
                  value={form.message} 
                  onChange={(e) => setForm((prev) => ({ ...prev, message: e.target.value }))} 
                />

                <Box sx={{ display: 'flex', justifyContent: 'flex-start', mt: 2 }}>
                  <Button 
                    type="submit" 
                    variant="contained" 
                    size="large" 
                    sx={{ px: 6, py: 1.5, borderRadius: 2, fontWeight: 600 }}
                    disabled={submitting}
                  >
                    {submitting ? 'Đang gửi...' : 'Gửi tin nhắn'}
                  </Button>
                </Box>
              </Box>
            </form>
          </Paper>
        </Grid>
      </Grid>

      <Snackbar open={snackbar.open} autoHideDuration={3500} onClose={() => setSnackbar((prev) => ({ ...prev, open: false }))}>
        <Alert severity={snackbar.severity} variant="filled">{snackbar.message}</Alert>
      </Snackbar>
    </Container>
  );
}
