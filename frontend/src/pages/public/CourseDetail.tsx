import { Box, Container, Grid, Typography, Button, Paper, Divider } from '@mui/material';
import { useParams, useNavigate } from 'react-router-dom';

const CourseDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  return (
    <Container maxWidth="lg" sx={{ py: 6 }}>
      <Grid container spacing={4}>
        <Grid size={{xs: 12, md: 8}}>
          <Box sx={{ mb: 4 }}>
            <img 
              src={`https://placehold.co/800x400/eeeeee/1976d2?text=Course+${id}`} 
              alt="Course Cover" 
              style={{ width: '100%', borderRadius: 8 }} 
            />
          </Box>
          <Typography variant="h3" sx={{ fontWeight: "bold" }} gutterBottom>
            English Course {id}
          </Typography>
          <Typography variant="body1" paragraph>
            This is a comprehensive course designed to improve your English skills rapidly.
            You will learn reading, writing, listening, and speaking with our expert instructors.
          </Typography>
          
          <Typography variant="h5" sx={{ fontWeight: "bold" }} sx={{ mt: 4, mb: 2 }}>
            What you'll learn
          </Typography>
          <ul>
            <li>Advanced grammar structures</li>
            <li>Fluent speaking in professional environments</li>
            <li>Listening comprehension for native speakers</li>
          </ul>
        </Grid>
        
        <Grid size={{xs: 12, md: 4}}>
          <Paper elevation={3} sx={{ p: 3, position: 'sticky', top: 100 }}>
            <Typography variant="h4" color="primary.main" sx={{ fontWeight: "bold" }} gutterBottom>
              5,000,000 VND
            </Typography>
            <Divider sx={{ my: 2 }} />
            <Typography variant="body1" sx={{ mb: 1 }}><strong>Level:</strong> Intermediate</Typography>
            <Typography variant="body1" sx={{ mb: 1 }}><strong>Duration:</strong> 12 weeks</Typography>
            <Typography variant="body1" sx={{ mb: 3 }}><strong>Status:</strong> Enrolling</Typography>
            
            <Button 
              variant="contained" 
              color="secondary" 
              fullWidth 
              size="large"
              onClick={() => navigate('/register')}
            >
              Enroll Now
            </Button>
          </Paper>
        </Grid>
      </Grid>
    </Container>
  );
};

export default CourseDetail;
