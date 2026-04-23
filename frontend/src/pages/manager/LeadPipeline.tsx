import { Box, Typography, Paper, Grid, Card, CardContent } from '@mui/material';

// Very basic Kanban board without drag-n-drop for simplicity in this prototype
const leads = [
  { id: 1, name: 'John Doe', course: 'IELTS Foundation', status: 'NEW' },
  { id: 2, name: 'Sarah Connor', course: 'TOEIC Masterclass', status: 'NEW' },
  { id: 3, name: 'Mike Ross', course: 'Business Comm', status: 'CONTACTED' },
  { id: 4, name: 'Rachel Zane', course: 'IELTS Intensive', status: 'INTERESTED' },
  { id: 5, name: 'Harvey Specter', course: 'Legal English', status: 'ENROLLED' },
];

const statuses = ['NEW', 'CONTACTED', 'INTERESTED', 'ENROLLED'];

const LeadPipeline = () => {
  return (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <Typography variant="h4" sx={{ fontWeight: "bold" }} mb={3}>CRM Lead Pipeline</Typography>
      
      <Grid container spacing={2} sx={{ flexGrow: 1 }}>
        {statuses.map(status => (
          <Grid  xs={12} md={3} key={status}>
            <Paper sx={{ p: 2, height: '100%', minHeight: 400, bgcolor: '#f4f6f8' }}>
              <Typography variant="subtitle1" sx={{ fontWeight: "bold" }} mb={2}>
                {status} ({leads.filter(l => l.status === status).length})
              </Typography>
              
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                {leads.filter(l => l.status === status).map(lead => (
                  <Card key={lead.id} sx={{ cursor: 'pointer', '&:hover': { boxShadow: 3 } }}>
                    <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
                      <Typography variant="subtitle2" sx={{ fontWeight: "bold" }}>{lead.name}</Typography>
                      <Typography variant="body2" color="text.secondary">{lead.course}</Typography>
                    </CardContent>
                  </Card>
                ))}
              </Box>
            </Paper>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
};

export default LeadPipeline;
