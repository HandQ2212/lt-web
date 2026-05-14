import { Container, Typography, Card, CardContent, Avatar, Rating, Chip, Box } from '@mui/material';

const teachers = [
  {
    id: '1',
    name: 'Ms. Sarah Johnson',
    specialty: 'IELTS Expert',
    rating: 4.9,
    experience: '8 years',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200',
    bio: 'Chuyên gia luyện thi IELTS với hơn 8 năm kinh nghiệm. Đã giúp hơn 500 học viên đạt điểm 7.0+',
    certifications: ['CELTA', 'TESOL', 'IELTS 8.5'],
  },
  {
    id: '2',
    name: 'Mr. David Brown',
    specialty: 'Business English',
    rating: 4.8,
    experience: '10 years',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200',
    bio: 'Giảng viên Business English với kinh nghiệm làm việc tại các tập đoàn đa quốc gia',
    certifications: ['MBA', 'TESOL', 'Cambridge CELTA'],
  },
  {
    id: '3',
    name: 'Ms. Emma Wilson',
    specialty: 'Communication Skills',
    rating: 5.0,
    experience: '6 years',
    avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=200',
    bio: 'Chuyên gia giao tiếp với phương pháp giảng dạy sáng tạo và hiệu quả',
    certifications: ['TESOL', 'TKT', 'IELTS 8.0'],
  },
  {
    id: '4',
    name: 'Mr. John Smith',
    specialty: 'TOEIC Preparation',
    rating: 4.7,
    experience: '7 years',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200',
    bio: 'Chuyên gia luyện thi TOEIC, giúp học viên đạt 800+ trong thời gian ngắn',
    certifications: ['TESOL', 'TOEIC 990'],
  },
  {
    id: '5',
    name: 'Ms. Lisa Anderson',
    specialty: 'English for Kids',
    rating: 4.9,
    experience: '5 years',
    avatar: 'https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?w=200',
    bio: 'Giảng viên tiếng Anh trẻ em với phương pháp giảng dạy vui nhộn và hiệu quả',
    certifications: ['TESOL', 'Early Childhood Education'],
  },
  {
    id: '6',
    name: 'Mr. Michael Chen',
    specialty: 'Academic English',
    rating: 4.8,
    experience: '9 years',
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=200',
    bio: 'Chuyên gia tiếng Anh học thuật, hỗ trợ học viên du học',
    certifications: ['PhD in Linguistics', 'TESOL', 'IELTS 9.0'],
  },
];

export default function TeachersPage() {
  return (
    <Container maxWidth="xl" sx={{ py: 8 }}>
      <Typography variant="h3" gutterBottom fontWeight={900} align="center">
        Đội ngũ giảng viên
      </Typography>
      <Typography variant="body1" align="center" color="text.secondary" sx={{ mb: 6, fontWeight: 600 }}>
        Giảng viên giàu kinh nghiệm, tận tâm và chuyên nghiệp
      </Typography>

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
        {teachers.map((teacher) => (
          <Box key={teacher.id}>
            <Card sx={{ height: '100%', minHeight: 390, display: 'flex', flexDirection: 'column', borderRadius: 5, border: '2px solid #1E293B', boxShadow: '5px 5px 0 #1E293B' }}>
              <CardContent sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column', p: 3 }}>
                <Box sx={{ textAlign: 'center', mb: 2 }}>
                  <Avatar
                    src={teacher.avatar}
                    sx={{ width: 100, height: 100, mx: 'auto', mb: 2, boxShadow: '4px 4px 0 #1E293B' }}
                  />
                  <Typography variant="h6" fontWeight={900}>
                    {teacher.name}
                  </Typography>
                  <Typography variant="body2" color="primary" gutterBottom>
                    {teacher.specialty}
                  </Typography>
                  <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 1, mb: 1 }}>
                    <Rating value={teacher.rating} precision={0.1} readOnly size="small" />
                    <Typography variant="body2" color="text.secondary">
                      ({teacher.rating})
                    </Typography>
                  </Box>
                  <Chip label={`${teacher.experience} kinh nghiệm`} size="small" color="primary" />
                </Box>

                <Typography variant="body2" color="text.secondary" sx={{ mb: 2, flexGrow: 1 }}>
                  {teacher.bio}
                </Typography>

                <Box>
                  <Typography variant="caption" fontWeight={900} display="block" gutterBottom>
                    Chứng chỉ:
                  </Typography>
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                    {teacher.certifications.map((cert, idx) => (
                      <Chip key={idx} label={cert} size="small" variant="outlined" sx={{ bgcolor: idx % 2 === 0 ? '#FFF7DF' : '#FCE7F3' }} />
                    ))}
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Box>
        ))}
      </Box>
    </Container>
  );
}
