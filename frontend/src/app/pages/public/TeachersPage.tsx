import { useEffect, useState } from 'react';
import { Alert, Avatar, Box, Card, CardContent, Chip, CircularProgress, Container, Typography } from '@mui/material';
import { PublicTeacher, publicTeacherApi } from '../../../services/api';

const getInitial = (name: string) => name.trim().charAt(0).toUpperCase() || 'G';

export default function TeachersPage() {
  const [teachers, setTeachers] = useState<PublicTeacher[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let mounted = true;

    const fetchTeachers = async () => {
      try {
        setLoading(true);
        setError('');
        const data = await publicTeacherApi.getAll();
        if (mounted) setTeachers(data);
      } catch (err: any) {
        if (mounted) setError(err?.response?.data?.message || 'Không thể tải danh sách giảng viên');
      } finally {
        if (mounted) setLoading(false);
      }
    };

    void fetchTeachers();

    return () => {
      mounted = false;
    };
  }, []);

  return (
    <Container maxWidth="xl" sx={{ py: 8 }}>
      <Typography variant="h3" gutterBottom fontWeight={800} align="center">
        Đội ngũ giảng viên
      </Typography>
      <Typography variant="body1" align="center" color="text.secondary" sx={{ mb: 6, fontWeight: 600 }}>
        Giảng viên giàu kinh nghiệm, tận tâm và chuyên nghiệp
      </Typography>

      {loading && (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
          <CircularProgress />
        </Box>
      )}

      {!loading && error && (
        <Alert severity="error" sx={{ maxWidth: 720, mx: 'auto' }}>
          {error}
        </Alert>
      )}

      {!loading && !error && teachers.length === 0 && (
        <Alert severity="info" sx={{ maxWidth: 720, mx: 'auto' }}>
          Chưa có giảng viên đang hoạt động.
        </Alert>
      )}

      {!loading && !error && teachers.length > 0 && (
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: {
              xs: '1fr',
              sm: 'repeat(2, minmax(0, 1fr))',
              lg: 'repeat(3, minmax(0, 1fr))',
            },
            gap: 4,
            alignItems: 'stretch',
            maxWidth: 1240,
            mx: 'auto',
          }}
        >
          {teachers.map((teacher) => {
            const specialties = teacher.specialties.filter(Boolean);
            const primarySpecialty = specialties[0] || 'Giảng viên ELC';
            const classLabel = teacher.activeClassCount > 0
              ? `${teacher.activeClassCount} lớp đang phụ trách`
              : 'Chưa có lớp đang phụ trách';

            return (
              <Box key={teacher.id}>
                <Card sx={{ height: '100%', minHeight: 330, display: 'flex', flexDirection: 'column', borderRadius: 5, border: '2px solid #1E293B', boxShadow: '5px 5px 0 #1E293B' }}>
                  <CardContent sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column', p: 3 }}>
                    <Box sx={{ textAlign: 'center', mb: 2 }}>
                      <Avatar
                        src={teacher.avatarUrl || undefined}
                        sx={{ width: 100, height: 100, mx: 'auto', mb: 2, boxShadow: '4px 4px 0 #1E293B', bgcolor: 'primary.main', fontWeight: 800 }}
                      >
                        {getInitial(teacher.fullName)}
                      </Avatar>
                      <Typography variant="h6" fontWeight={800}>
                        {teacher.fullName}
                      </Typography>
                      <Typography variant="body2" color="primary" gutterBottom>
                        {primarySpecialty}
                      </Typography>
                      <Chip label={classLabel} size="small" color={teacher.activeClassCount > 0 ? 'primary' : 'default'} />
                    </Box>

                    <Typography variant="body2" color="text.secondary" sx={{ mb: 2, flexGrow: 1 }}>
                      {specialties.length > 0
                        ? `Đang giảng dạy: ${specialties.join(', ')}.`
                        : 'Chưa có khóa học được phân công.'}
                    </Typography>

                    <Box>
                      <Typography variant="caption" fontWeight={800} display="block" gutterBottom>
                        Khóa đang giảng dạy:
                      </Typography>
                      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                        {(specialties.length > 0 ? specialties : ['Chưa cập nhật']).map((specialty, idx) => (
                          <Chip key={specialty} label={specialty} size="small" variant="outlined" sx={{ bgcolor: idx % 2 === 0 ? '#FFF7DF' : '#FCE7F3' }} />
                        ))}
                      </Box>
                    </Box>
                  </CardContent>
                </Card>
              </Box>
            );
          })}
        </Box>
      )}
    </Container>
  );
}
