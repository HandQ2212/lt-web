import { Box, Card, CardContent, Grid, Typography, Paper, List, ListItem, ListItemText, ListItemAvatar, Avatar } from '@mui/material';
import ClassIcon from '@mui/icons-material/Class';
import AssignmentIcon from '@mui/icons-material/Assignment';
import AccessTimeIcon from '@mui/icons-material/AccessTime';

const StatCard = ({ title, value, icon, color }: { title: string, value: string, icon: any, color: string }) => (
  <Card sx={{ height: '100%' }}>
    <CardContent>
      <Box display="flex" justifyContent="space-between" alignItems="center">
        <Box>
          <Typography color="textSecondary" gutterBottom variant="overline">
            {title}
          </Typography>
          <Typography color="textPrimary" variant="h4">
            {value}
          </Typography>
        </Box>
        <Box sx={{ backgroundColor: `${color}15`, p: 1, borderRadius: '50%', color: color, display: 'flex' }}>
          {icon}
        </Box>
      </Box>
    </CardContent>
  </Card>
);

const TeacherDashboard = () => {
  return (
    <Box>
      <Typography variant="h4" sx={{ fontWeight: "bold" }} gutterBottom>
        Teacher Dashboard
      </Typography>

      <Grid container spacing={3} mb={4}>
        <Grid size={{xs: 12, sm: 4}}>
          <StatCard title="Active Classes" value="4" icon={<ClassIcon />} color="#1976d2" />
        </Grid>
        <Grid size={{xs: 12, sm: 4}}>
          <StatCard title="Assignments to Grade" value="12" icon={<AssignmentIcon />} color="#f44336" />
        </Grid>
        <Grid size={{xs: 12, sm: 4}}>
          <StatCard title="Hours Taught (This Month)" value="45" icon={<AccessTimeIcon />} color="#4caf50" />
        </Grid>
      </Grid>

      <Grid container spacing={3}>
        <Grid size={{xs: 12, md: 6}}>
          <Paper sx={{ p: 3, height: '100%' }}>
            <Typography variant="h6" sx={{ fontWeight: "bold" }} gutterBottom>
              Upcoming Classes Today
            </Typography>
            <List>
              {[1, 2].map((item) => (
                <ListItem key={item} divider sx={{ px: 0 }}>
                  <ListItemAvatar>
                    <Avatar sx={{ bgcolor: 'primary.main' }}>
                      <ClassIcon />
                    </Avatar>
                  </ListItemAvatar>
                  <ListItemText 
                    primary={`IELTS Weekend ${item}`} 
                    secondary="18:00 - 20:00 | Room 101" 
                  />
                </ListItem>
              ))}
            </List>
          </Paper>
        </Grid>
        <Grid size={{xs: 12, md: 6}}>
          <Paper sx={{ p: 3, height: '100%' }}>
            <Typography variant="h6" sx={{ fontWeight: "bold" }} gutterBottom>
              Recent Submissions
            </Typography>
            <List>
              {[1, 2, 3].map((item) => (
                <ListItem key={item} divider sx={{ px: 0 }}>
                  <ListItemText 
                    primary={`Essay Task ${item} - Student ${item}`} 
                    secondary="Submitted 2 hours ago" 
                  />
                  <Typography variant="body2" color="error" sx={{ fontWeight: "bold" }}>
                    Needs Grading
                  </Typography>
                </ListItem>
              ))}
            </List>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default TeacherDashboard;
