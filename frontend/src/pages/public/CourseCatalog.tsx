import { Box, Container, Grid, Typography, Card, CardContent, CardMedia, Button, TextField, MenuItem } from '@mui/material';
import { useNavigate } from 'react-router-dom';

const CourseCatalog = () => {
  const navigate = useNavigate();

  return (
    <Container maxWidth="lg" sx={{ py: 6 }}>
      <Typography variant="h3" sx={{ fontWeight: "bold" }} gutterBottom>
        Course Catalog
      </Typography>
      
      {/* Filter Bar */}
      <Box sx={{ display: 'flex', gap: 2, mb: 4, p: 2, bgcolor: 'background.paper', borderRadius: 2, boxShadow: 1 }}>
        <TextField label="Search courses..." variant="outlined" size="small" fullWidth />
        <TextField select label="Level" variant="outlined" size="small" sx={{ minWidth: 150 }}>
          <MenuItem value="ALL">All Levels</MenuItem>
          <MenuItem value="BEGINNER">Beginner</MenuItem>
          <MenuItem value="INTERMEDIATE">Intermediate</MenuItem>
          <MenuItem value="ADVANCED">Advanced</MenuItem>
        </TextField>
        <Button variant="contained">Search</Button>
      </Box>

      {/* Course Grid */}
      <Grid container spacing={4}>
        {[1, 2, 3, 4, 5, 6].map((item) => (
          <Grid  xs={12} sm={6} md={4} key={item}>
            <Card>
              <CardMedia
                component="img"
                height="160"
                image={`https://placehold.co/600x400/eeeeee/1976d2?text=Course+${item}`}
                alt="Course image"
              />
              <CardContent>
                <Typography gutterBottom variant="h6" component="div" sx={{ fontWeight: "bold" }}>
                  English Course {item}
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                  Level: INTERMEDIATE
                </Typography>
                <Button variant="outlined" fullWidth onClick={() => navigate(`/courses/${item}`)}>
                  View Details
                </Button>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Container>
  );
};

export default CourseCatalog;
