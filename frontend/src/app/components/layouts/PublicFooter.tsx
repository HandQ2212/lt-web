import { Box, Container, Grid, Typography, Link, IconButton } from '@mui/material';
import FacebookIcon from '@mui/icons-material/Facebook';
import InstagramIcon from '@mui/icons-material/Instagram';
import YouTubeIcon from '@mui/icons-material/YouTube';

export default function PublicFooter() {
  return (
    <Box sx={{ bgcolor: '#1976d2', color: 'white', py: 6, mt: 8 }}>
      <Container maxWidth="lg">
        <Grid container spacing={4}>
          <Grid item xs={12} md={4}>
            <Typography variant="h6" gutterBottom fontWeight={700}>
              ELC English Center
            </Typography>
            <Typography variant="body2" sx={{ mb: 2 }}>
              Trung tâm Anh ngữ hàng đầu với đội ngũ giáo viên chuyên nghiệp và phương pháp giảng dạy hiện đại.
            </Typography>
            <Box>
              <IconButton color="inherit" href="https://facebook.com" target="_blank">
                <FacebookIcon />
              </IconButton>
              <IconButton color="inherit" href="https://instagram.com" target="_blank">
                <InstagramIcon />
              </IconButton>
              <IconButton color="inherit" href="https://youtube.com" target="_blank">
                <YouTubeIcon />
              </IconButton>
            </Box>
          </Grid>

          <Grid item xs={12} md={4}>
            <Typography variant="h6" gutterBottom fontWeight={700}>
              Liên hệ
            </Typography>
            <Typography variant="body2" gutterBottom>
              Địa chỉ: 123 Đường ABC, Quận 1, TP.HCM
            </Typography>
            <Typography variant="body2" gutterBottom>
              Điện thoại: (028) 1234 5678
            </Typography>
            <Typography variant="body2" gutterBottom>
              Email: info@elcenglish.edu.vn
            </Typography>
          </Grid>

          <Grid item xs={12} md={4}>
            <Typography variant="h6" gutterBottom fontWeight={700}>
              Liên kết nhanh
            </Typography>
            <Link href="/courses" color="inherit" display="block" sx={{ mb: 1, textDecoration: 'none' }}>
              Khóa học
            </Link>
            <Link href="/teachers" color="inherit" display="block" sx={{ mb: 1, textDecoration: 'none' }}>
              Giảng viên
            </Link>
            <Link href="/about" color="inherit" display="block" sx={{ mb: 1, textDecoration: 'none' }}>
              Giới thiệu
            </Link>
            <Link href="/contact" color="inherit" display="block" sx={{ mb: 1, textDecoration: 'none' }}>
              Liên hệ
            </Link>
          </Grid>
        </Grid>

        <Box sx={{ borderTop: '1px solid rgba(255,255,255,0.2)', mt: 4, pt: 3, textAlign: 'center' }}>
          <Typography variant="body2">
            © {new Date().getFullYear()} ELC English Center. All rights reserved.
          </Typography>
        </Box>
      </Container>
    </Box>
  );
}
