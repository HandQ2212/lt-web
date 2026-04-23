import { Box, Typography, Paper, Grid, Card, CardContent, Button, LinearProgress } from '@mui/material';

const classes = [
  { id: 1, name: 'IELTS Weekend', course: 'IELTS Foundation', students: 12, schedule: 'Sat-Sun 18:00', progress: 40 },
  { id: 2, name: 'TOEIC Evening', course: 'TOEIC Masterclass', students: 20, schedule: 'Mon-Wed 19:30', progress: 75 },
];

const MyClasses = () => {
  return (
    <Box>
      <Typography variant="h4" sx={{ fontWeight: "bold" }} mb={3}>My Classes</Typography>
      
      <Grid container spacing={3}>
        {classes.map(cls => (
          <Grid  xs={12} md={6} key={cls.id}>
            <Card elevation={2}>
              <CardContent>
                <Typography variant="h5" sx={{ fontWeight: "bold" }} gutterBottom>{cls.name}</Typography>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  Course: {cls.course}
                </Typography>
                <Typography variant="body2" gutterBottom>
                  <strong>Schedule:</strong> {cls.schedule}
                </Typography>
                <Typography variant="body2" gutterBottom>
                  <strong>Students:</strong> {cls.students} enrolled
                </Typography>
                
                <Box sx={{ mt: 2, mb: 1, display: 'flex', justifyContent: 'space-between' }}>
                  <Typography variant="body2" color="text.secondary">Progress</Typography>
                  <Typography variant="body2" sx={{ fontWeight: "bold" }}>{cls.progress}%</Typography>
                </Box>
                <LinearProgress variant="determinate" value={cls.progress} sx={{ mb: 3, height: 8, borderRadius: 4 }} />
                
                <Box sx={{ display: 'flex', gap: 2 }}>
                  <Button variant="contained" size="small">Attendance</Button>
                  <Button variant="outlined" size="small">Assignments</Button>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
};

export default MyClasses;
