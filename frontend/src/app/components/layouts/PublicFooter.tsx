import { Box, Container, Grid, Typography, Link, IconButton } from '@mui/material';
import FacebookIcon from '@mui/icons-material/Facebook';
import InstagramIcon from '@mui/icons-material/Instagram';
import YouTubeIcon from '@mui/icons-material/YouTube';

export default function PublicFooter() {
  return (
    <Box sx={{ bgcolor: '#0f172a', color: 'white', py: 10, mt: 0 }}>
      <Container maxWidth="xl">
        <Grid container spacing={8}>
          <Grid item xs={12} md={4}>
            <Typography variant="h5" gutterBottom fontWeight={900} sx={{ letterSpacing: 1 }}>
              ELC English Center
            </Typography>
            <Typography variant="body1" sx={{ mb: 4, opacity: 0.7, lineHeight: 1.8 }}>
              Hệ thống đào tạo Anh ngữ hàng đầu với sứ mệnh khai phá tiềm năng ngôn ngữ của thế hệ trẻ Việt Nam thông qua phương pháp giảng dạy sáng tạo.
            </Typography>
            <Box sx={{ display: 'flex', gap: 2 }}>
              {[<FacebookIcon />, <InstagramIcon />, <YouTubeIcon />].map((icon, idx) => (
                <IconButton 
                  key={idx}
                  sx={{ 
                    bgcolor: 'rgba(255,255,255,0.05)', 
                    color: 'white',
                    '&:hover': { bgcolor: 'primary.main', transform: 'translateY(-3px)' },
                    transition: 'all 0.3s'
                  }}
                >
                  {icon}
                </IconButton>
              ))}
            </Box>
          </Grid>

          <Grid item xs={12} md={4}>
            <Typography variant="h6" gutterBottom fontWeight={800} sx={{ mb: 3 }}>
              Thông tin liên hệ
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <Typography variant="body2" sx={{ opacity: 0.8 }}><strong>Địa chỉ:</strong> 123 Đường ABC, Quận 1, TP.HCM</Typography>
              <Typography variant="body2" sx={{ opacity: 0.8 }}><strong>Hotline:</strong> (028) 1234 5678</Typography>
              <Typography variant="body2" sx={{ opacity: 0.8 }}><strong>Email:</strong> info@elcenglish.edu.vn</Typography>
              <Typography variant="body2" sx={{ opacity: 0.8 }}><strong>Giờ làm việc:</strong> 8:00 - 21:00 (T2 - CN)</Typography>
            </Box>
          </Grid>

          <Grid item xs={12} md={4}>
            <Typography variant="h6" gutterBottom fontWeight={800} sx={{ mb: 3 }}>
              Liên kết nhanh
            </Typography>
            <Grid container spacing={1}>
              {['Khóa học', 'Giảng viên', 'Về chúng tôi', 'Liên hệ', 'Tuyển dụng', 'Chính sách bảo mật'].map((text, idx) => (
                <Grid item xs={6} key={idx}>
                  <Link 
                    href="#" 
                    color="inherit" 
                    sx={{ 
                      display: 'block', 
                      mb: 1, 
                      textDecoration: 'none', 
                      opacity: 0.6,
                      '&:hover': { opacity: 1, color: 'primary.main', pl: 1 },
                      transition: 'all 0.2s'
                    }}
                  >
                    {text}
                  </Link>
                </Grid>
              ))}
            </Grid>
          </Grid>
        </Grid>

        <Box sx={{ borderTop: '1px solid rgba(255,255,255,0.1)', mt: 8, pt: 4, textAlign: 'center' }}>
          <Typography variant="body2" sx={{ opacity: 0.5 }}>
            © {new Date().getFullYear()} ELC English Center. All rights reserved. Developed for Excellence.
          </Typography>
        </Box>
      </Container>
    </Box>
  );
}
