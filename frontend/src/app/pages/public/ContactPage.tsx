import { Box, Container, Typography, Grid, Paper, TextField, Button } from '@mui/material';
import { Email as EmailIcon, Phone as PhoneIcon, LocationOn as LocationIcon } from '@mui/icons-material';

export default function ContactPage() {
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    alert('Cảm ơn bạn đã liên hệ! Chúng tôi sẽ phản hồi sớm nhất.');
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
            <Typography variant="h6" gutterBottom fontWeight={600}>
              Địa chỉ
            </Typography>
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
            <Typography variant="h6" gutterBottom fontWeight={600}>
              Điện thoại
            </Typography>
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
            <Typography variant="h6" gutterBottom fontWeight={600}>
              Email
            </Typography>
            <Typography variant="body2" color="text.secondary">
              info@elcenglish.edu.vn
              <br />
              support@elcenglish.edu.vn
            </Typography>
          </Paper>
        </Grid>

        <Grid item xs={12}>
          <Paper sx={{ p: 4 }}>
            <Typography variant="h5" gutterBottom fontWeight={600}>
              Gửi tin nhắn cho chúng tôi
            </Typography>
            <form onSubmit={handleSubmit}>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <TextField fullWidth label="Họ tên" required />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField fullWidth label="Email" type="email" required />
                </Grid>
                <Grid item xs={12}>
                  <TextField fullWidth label="Số điện thoại" />
                </Grid>
                <Grid item xs={12}>
                  <TextField fullWidth label="Tiêu đề" required />
                </Grid>
                <Grid item xs={12}>
                  <TextField fullWidth label="Nội dung" multiline rows={6} required />
                </Grid>
                <Grid item xs={12}>
                  <Button type="submit" variant="contained" size="large">
                    Gửi tin nhắn
                  </Button>
                </Grid>
              </Grid>
            </form>
          </Paper>
        </Grid>
      </Grid>
    </Container>
  );
}
