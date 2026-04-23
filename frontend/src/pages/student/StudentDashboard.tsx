import { Box, Card, CardContent, Grid, Typography, Paper, List, ListItem, ListItemText, LinearProgress } from '@mui/material';
import MenuBookIcon from '@mui/icons-material/MenuBook';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';

const StudentDashboard = () => {
  return (
    <Box>
      <Typography variant="h4" sx={{ fontWeight: "bold" }} gutterBottom>
        Student Dashboard
      </Typography>

      <Grid container spacing={3} mb={4}>
        <Grid size={{xs: 12, md: 8}}>
          <Paper sx={{ p: 3, height: '100%' }}>
            <Typography variant="h6" sx={{ fontWeight: "bold" }} gutterBottom>
              Current Course Progress
            </Typography>
            <Box mb={3}>
              <Box display="flex" justifyContent="space-between" mb={1}>
                <Typography variant="body1" sx={{ fontWeight: "bold" }}>IELTS Foundation</Typography>
                <Typography variant="body1">40% Completed</Typography>
              </Box>
              <LinearProgress variant="determinate" value={40} sx={{ height: 10, borderRadius: 5 }} />
            </Box>
            <Box>
              <Box display="flex" justifyContent="space-between" mb={1}>
                <Typography variant="body1" sx={{ fontWeight: "bold" }}>Business Comm</Typography>
                <Typography variant="body1">85% Completed</Typography>
              </Box>
              <LinearProgress variant="determinate" value={85} color="secondary" sx={{ height: 10, borderRadius: 5 }} />
            </Box>
          </Paper>
        </Grid>
        
        <Grid size={{xs: 12, md: 4}}>
          <Card sx={{ height: '100%', bgcolor: 'primary.main', color: 'white' }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>Next Class</Typography>
              <Typography variant="h4" sx={{ fontWeight: "bold" }} mb={2}>18:00 Today</Typography>
              <Typography variant="body1">IELTS Foundation</Typography>
              <Typography variant="body2" sx={{ opacity: 0.8 }}>Room 101 • Teacher Bob</Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Grid container spacing={3}>
        <Grid size={{xs: 12, md: 6}}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" sx={{ fontWeight: "bold" }} gutterBottom>
              Pending Assignments
            </Typography>
            <List>
              <ListItem>
                <Box sx={{ mr: 2, color: 'warning.main' }}><MenuBookIcon /></Box>
                <ListItemText primary="Essay Task 2" secondary="Due: Tomorrow 23:59" />
              </ListItem>
            </List>
          </Paper>
        </Grid>
        <Grid size={{xs: 12, md: 6}}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" sx={{ fontWeight: "bold" }} gutterBottom>
              Recent Grades
            </Typography>
            <List>
              <ListItem>
                <Box sx={{ mr: 2, color: 'success.main' }}><CheckCircleIcon /></Box>
                <ListItemText primary="Reading Mock Test 1" secondary="Grade: 8.5/10" />
              </ListItem>
            </List>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default StudentDashboard;
