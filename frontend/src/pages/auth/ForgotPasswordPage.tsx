import { Box, Button, Container, TextField, Typography, Paper } from '@mui/material';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const ForgotPasswordPage = () => {
  const navigate = useNavigate();
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
  };

  return (
    <Container maxWidth="xs" sx={{ mt: 8 }}>
      <Paper elevation={3} sx={{ p: 4, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <Typography component="h1" variant="h5" sx={{ fontWeight: "bold" }} gutterBottom>
          Reset Password
        </Typography>
        
        {submitted ? (
          <Box textAlign="center">
            <Typography color="success.main" mb={2}>
              Instructions have been sent to your email.
            </Typography>
            <Button variant="contained" onClick={() => navigate('/login')} fullWidth>
              Back to Login
            </Button>
          </Box>
        ) : (
          <Box component="form" onSubmit={handleSubmit} sx={{ mt: 1, width: '100%' }}>
            <Typography variant="body2" color="text.secondary" mb={2}>
              Enter your email address and we'll send you a link to reset your password.
            </Typography>
            <TextField
              margin="normal"
              required
              fullWidth
              label="Email Address"
              type="email"
              autoFocus
            />
            <Button type="submit" fullWidth variant="contained" sx={{ mt: 3, mb: 2 }}>
              Send Reset Link
            </Button>
            <Button fullWidth variant="text" onClick={() => navigate('/login')}>
              Back to Login
            </Button>
          </Box>
        )}
      </Paper>
    </Container>
  );
};

export default ForgotPasswordPage;
