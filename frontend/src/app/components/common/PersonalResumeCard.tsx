import { ReactNode } from 'react';
import { Avatar, Box, Chip, Divider, Grid, Paper, Stack, Typography } from '@mui/material';

export type ResumeField = {
  number: string | number;
  label: string;
  value: ReactNode;
  valueColor?: string;
  fullWidth?: boolean;
};

type PersonalResumeCardProps = {
  title?: string;
  subtitle?: string;
  name: string;
  avatarUrl?: string;
  avatarFallback?: string;
  statusLabel?: string;
  statusColor?: 'default' | 'primary' | 'secondary' | 'success' | 'warning' | 'error' | 'info';
  fields: ResumeField[];
  actions?: ReactNode;
};

export default function PersonalResumeCard({
  title = 'SƠ YẾU LÝ LỊCH',
  subtitle,
  name,
  avatarUrl,
  avatarFallback,
  statusLabel,
  statusColor = 'primary',
  fields,
  actions,
}: PersonalResumeCardProps) {
  const leftFields = fields.filter((field) => !field.fullWidth);
  const fullWidthFields = fields.filter((field) => field.fullWidth);

  return (
    <Paper
      sx={{
        p: { xs: 2.5, sm: 4 },
        borderRadius: 4,
        boxShadow: '0 10px 30px rgba(15, 23, 42, 0.06)',
        border: '1px solid rgba(15, 23, 42, 0.08)',
        bgcolor: 'rgba(255,255,255,0.96)',
      }}
    >
      <Stack spacing={0.5} alignItems="center" sx={{ mb: 4 }}>
        <Typography variant="h5" fontWeight={800} letterSpacing={0.5} textAlign="center">
          {title}
        </Typography>
        {subtitle && (
          <Typography variant="body2" color="text.secondary" textAlign="center">
            {subtitle}
          </Typography>
        )}
      </Stack>

      <Grid container spacing={4} alignItems="flex-start">
        <Grid item xs={12} md={3}>
          <Stack alignItems="center" spacing={2}>
            <Avatar
              src={avatarUrl}
              alt={name}
              sx={{
                width: { xs: 140, sm: 180 },
                height: { xs: 140, sm: 180 },
                borderRadius: 0,
                bgcolor: 'rgba(25, 118, 210, 0.08)',
                color: 'primary.main',
                fontSize: { xs: 52, sm: 64 },
                fontWeight: 800,
                boxShadow: '0 8px 24px rgba(15, 23, 42, 0.10)',
              }}
              variant="rounded"
            >
              {avatarFallback || name?.charAt(0)?.toUpperCase() || 'U'}
            </Avatar>
            <Stack spacing={1} alignItems="center">
              <Typography variant="h6" fontWeight={800} textAlign="center">
                {name}
              </Typography>
              {statusLabel && (
                <Chip
                  label={statusLabel}
                  color={statusColor}
                  variant="outlined"
                  sx={{ fontWeight: 700, borderRadius: 2 }}
                />
              )}
            </Stack>
          </Stack>
        </Grid>

        <Grid item xs={12} md={9}>
          <Grid container spacing={2.5}>
            {leftFields.map((field) => (
              <Grid item xs={12} sm={6} lg={4} key={`${field.number}-${field.label}`}>
                <Box sx={{ minHeight: 58 }}>
                  <Typography variant="body1" sx={{ lineHeight: 1.75 }}>
                    <Box component="span" sx={{ fontWeight: 800, color: 'text.primary' }}>
                      {field.number}. {field.label}:
                    </Box>{' '}
                    <Box component="span" sx={{ color: field.valueColor || 'text.primary', fontWeight: field.valueColor ? 700 : 400 }}>
                      {field.value}
                    </Box>
                  </Typography>
                </Box>
              </Grid>
            ))}

            {fullWidthFields.map((field) => (
              <Grid item xs={12} key={`${field.number}-${field.label}`}>
                <Box sx={{ minHeight: 58 }}>
                  <Typography variant="body1" sx={{ lineHeight: 1.75 }}>
                    <Box component="span" sx={{ fontWeight: 800, color: 'text.primary' }}>
                      {field.number}. {field.label}:
                    </Box>{' '}
                    <Box component="span" sx={{ color: field.valueColor || 'text.primary', fontWeight: field.valueColor ? 700 : 400 }}>
                      {field.value}
                    </Box>
                  </Typography>
                </Box>
              </Grid>
            ))}
          </Grid>

          {actions && (
            <>
              <Divider sx={{ my: 3 }} />
              <Box>{actions}</Box>
            </>
          )}
        </Grid>
      </Grid>
    </Paper>
  );
}
