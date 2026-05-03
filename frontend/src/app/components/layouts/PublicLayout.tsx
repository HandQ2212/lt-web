import { Box } from '@mui/material';
import { Outlet } from 'react-router-dom';
import PublicHeader from './PublicHeader';
import PublicFooter from './PublicFooter';

export default function PublicLayout() {
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <PublicHeader />
      <Box component="main" sx={{ flexGrow: 1 }}>
        <Outlet />
      </Box>
      <PublicFooter />
    </Box>
  );
}
