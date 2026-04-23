import { Box, Container, Typography, TextField, Button, Paper, Alert } from '@mui/material';
import { useState } from 'react';

const Registration = () => {
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
  };

  return (
    <Container maxWidth="sm" sx={{ py: 8 }}>
      <Paper elevation={3} sx={{ p: 4 }}>
        <Typography variant="h4" sx={{ fontWeight: "bold" }} align="center" gutterBottom>
          Register for a Course
        </Typography>
        <Typography variant="body1" align="center" color="text.secondary" sx={{ mb: 4 }}>
          Leave your details and our consultant will contact you soon.
        </Typography>

        {submitted ? (
          <Alert severity="success" sx={{ mt: 2 }}>
            Thank you for registering! We will contact you within 24 hours.
          </Alert>
        ) : (
          <Box component="form" onSubmit={handleSubmit}>
            <TextField fullWidth label="Full Name" margin="normal" required />
            <TextField fullWidth label="Email" type="email" margin="normal" required />
            <TextField fullWidth label="Phone Number" margin="normal" required />
            <TextField 
              fullWidth 
              label="Which course are you interested in?" 
              margin="normal" 
              multiline
              rows={3}
            />
            <Button 
              type="submit" 
              variant="contained" 
              color="primary" 
              fullWidth 
              size="large" 
              sx={{ mt: 3 }}
            >
              Submit Registration
            </Button>
          </Box>
        )}
      </Paper>
    </Container>
  );
};

export default Registration;
