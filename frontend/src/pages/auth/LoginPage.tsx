import { Box, Button, Container, TextField, Typography, Paper } from '@mui/material';
import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { loginStart, loginSuccess, loginFailure } from '../../features/auth/authSlice';
import type {  RootState  } from '../../app/store';
import { useNavigate } from 'react-router-dom';
import axios from '../../api/axiosConfig';

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { isLoading, error } = useSelector((state: RootState) => state.auth);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    dispatch(loginStart());
    try {
      const response = await axios.post('/auth/login', { email, password });
      const { user, token } = response.data;
      dispatch(loginSuccess({ user, token }));
      
      // Navigate based on role
      switch (user.role) {
        case 'MANAGER': navigate('/manager/dashboard'); break;
        case 'TEACHER': navigate('/teacher/dashboard'); break;
        case 'STUDENT': navigate('/student/dashboard'); break;
        case 'ACCOUNTANT': navigate('/accountant/dashboard'); break;
        default: navigate('/');
      }
    } catch (err: any) {
      dispatch(loginFailure(err.response?.data?.message || 'Login failed'));
    }
  };

  // Mock login for demo purposes (bypassing backend)
  const handleMockLogin = (role: string) => {
    const mockUser = { id: '1', email: `${role.toLowerCase()}@elc.com`, fullName: `Demo ${role}`, role: role, status: 'ACTIVE' };
    dispatch(loginSuccess({ user: mockUser as any, token: 'mock-token' }));
    navigate(`/${role.toLowerCase()}/dashboard`);
  };

  return (
    <Container maxWidth="xs" sx={{ mt: 8 }}>
      <Paper elevation={3} sx={{ p: 4, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <Typography component="h1" variant="h5" sx={{ fontWeight: "bold" }}>
          Sign in to ELC System
        </Typography>
        <Box component="form" onSubmit={handleLogin} sx={{ mt: 1, width: '100%' }}>
          {error && <Typography color="error" variant="body2">{error}</Typography>}
          <TextField
            margin="normal"
            required
            fullWidth
            label="Email Address"
            autoFocus
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <TextField
            margin="normal"
            required
            fullWidth
            label="Password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <Button
            type="submit"
            fullWidth
            variant="contained"
            sx={{ mt: 3, mb: 2 }}
            disabled={isLoading}
          >
            {isLoading ? 'Signing in...' : 'Sign In'}
          </Button>
          <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
            <Button variant="text" size="small" onClick={() => navigate('/forgot-password')}>
              Forgot password?
            </Button>
            <Button variant="text" size="small" onClick={() => navigate('/register')}>
              Sign Up
            </Button>
          </Box>

          <Box sx={{ mt: 4, borderTop: '1px solid #eee', pt: 2 }}>
            <Typography variant="body2" color="text.secondary" align="center" gutterBottom>
              Mock Login (Demo mode)
            </Typography>
            <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', justifyContent: 'center' }}>
              {['MANAGER', 'TEACHER', 'STUDENT', 'ACCOUNTANT'].map(role => (
                <Button key={role} size="small" variant="outlined" onClick={() => handleMockLogin(role)}>
                  {role}
                </Button>
              ))}
            </Box>
          </Box>
        </Box>
      </Paper>
    </Container>
  );
};

export default LoginPage;
