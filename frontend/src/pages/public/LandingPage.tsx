import { Box, Button, Container, Grid, Typography, Card, CardContent, CardMedia } from '@mui/material';
import { useNavigate } from 'react-router-dom';

const LandingPage = () => {
  const navigate = useNavigate();

  return (
    <Box>
      {/* Hero Section */}
      <Box sx={{ 
        background: 'linear-gradient(135deg, #1565c0 0%, #1976d2 100%)', 
        color: 'white', 
        py: 12, 
        textAlign: 'center' 
      }}>
        <Container maxWidth="md">
          <Typography variant="h2" sx={{ fontWeight: "bold" }} gutterBottom>
            Unlock Your Global Potential
          </Typography>
          <Typography variant="h5" sx={{ mb: 4, opacity: 0.9 }}>
            Join the English Language Center to master English and achieve your dreams.
          </Typography>
          <Button 
            variant="contained" 
            color="secondary" 
            size="large" 
            sx={{ px: 4, py: 1.5, fontSize: '1.2rem', borderRadius: 8 }}
            onClick={() => navigate('/register')}
          >
            Start Your Journey Now
          </Button>
        </Container>
      </Box>

      {/* Featured Courses */}
      <Container maxWidth="lg" sx={{ py: 8 }}>
        <Typography variant="h3" sx={{ fontWeight: "bold" }} align="center" gutterBottom>
          Featured Courses
        </Typography>
        <Grid container spacing={4} sx={{ mt: 2 }}>
          {[1, 2, 3].map((item) => (
            <Grid  xs={12} md={4} key={item}>
              <Card>
                <CardMedia
                  component="img"
                  height="200"
                  image={`https://placehold.co/600x400/eeeeee/1976d2?text=Course+${item}`}
                  alt="Course image"
                />
                <CardContent>
                  <Typography gutterBottom variant="h5" component="div" sx={{ fontWeight: "bold" }}>
                    IELTS Masterclass {item}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Comprehensive preparation for the IELTS exam with expert instructors.
                  </Typography>
                  <Box sx={{ mt: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Typography variant="h6" color="primary.main" sx={{ fontWeight: "bold" }}>
                      5,000,000 VND
                    </Typography>
                    <Button variant="outlined" size="small" onClick={() => navigate('/courses/1')}>
                      Details
                    </Button>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
        <Box sx={{ textAlign: 'center', mt: 4 }}>
          <Button variant="text" size="large" onClick={() => navigate('/courses')}>
            View All Courses
          </Button>
        </Box>
      </Container>
    </Box>
  );
};

export default LandingPage;
