import { Box, Button, Typography, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Chip, IconButton } from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import { useState } from 'react';

const mockUsers = [
  { id: '1', fullName: 'Alice Admin', email: 'admin@elc.com', role: 'MANAGER', status: 'ACTIVE' },
  { id: '2', fullName: 'Bob Teacher', email: 'teacher@elc.com', role: 'TEACHER', status: 'ACTIVE' },
  { id: '3', fullName: 'Charlie Student', email: 'student@elc.com', role: 'STUDENT', status: 'INACTIVE' },
];

const UserManagement = () => {
  const [users] = useState(mockUsers);

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4" sx={{ fontWeight: "bold" }}>User Management</Typography>
        <Button variant="contained" color="primary">Add New User</Button>
      </Box>

      <TableContainer component={Paper} elevation={2}>
        <Table>
          <TableHead sx={{ backgroundColor: '#f5f5f5' }}>
            <TableRow>
              <TableCell><strong>Name</strong></TableCell>
              <TableCell><strong>Email</strong></TableCell>
              <TableCell><strong>Role</strong></TableCell>
              <TableCell><strong>Status</strong></TableCell>
              <TableCell align="right"><strong>Actions</strong></TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {users.map((user) => (
              <TableRow key={user.id} hover>
                <TableCell>{user.fullName}</TableCell>
                <TableCell>{user.email}</TableCell>
                <TableCell>
                  <Chip 
                    label={user.role} 
                    size="small" 
                    color={user.role === 'MANAGER' ? 'secondary' : user.role === 'TEACHER' ? 'primary' : 'default'} 
                  />
                </TableCell>
                <TableCell>
                  <Chip 
                    label={user.status} 
                    size="small" 
                    color={user.status === 'ACTIVE' ? 'success' : 'error'} 
                    variant="outlined"
                  />
                </TableCell>
                <TableCell align="right">
                  <IconButton size="small" color="primary"><EditIcon /></IconButton>
                  <IconButton size="small" color="error"><DeleteIcon /></IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
};

export default UserManagement;
