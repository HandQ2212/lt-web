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
        boxShadow: '6px 6px 0 #1E293B',
        border: '2px solid #1E293B',
        bgcolor: '#FFFFFF',
        position: 'relative',
        overflow: 'hidden',
        '&::before': {
          content: '""',
          position: 'absolute',
          width: 160,
          height: 160,
          borderRadius: '50%',
          bgcolor: 'rgba(251, 191, 36, 0.28)',
          right: -48,
          top: -64,
        },
      }}
    >
      <Stack spacing={0.5} alignItems="center" sx={{ mb: 4, position: 'relative', zIndex: 1 }}>
        <Typography variant="h5" fontWeight={800} letterSpacing={0.5} textAlign="center">
          {title}
        </Typography>
        {subtitle && (
          <Typography variant="body2" color="text.secondary" textAlign="center">
            {subtitle}
          </Typography>
        )}
      </Stack>

      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={{ xs: 2, sm: 4 }} alignItems="flex-start" sx={{ position: 'relative', zIndex: 1 }}>
        <Avatar
          src={avatarUrl}
          alt={name}
          sx={{
            width: { xs: 88, sm: 140 },
            height: { xs: 88, sm: 140 },
            borderRadius: 3,
            bgcolor: '#FFF7DF',
            color: 'primary.main',
            fontSize: { xs: 36, sm: 56 },
            fontWeight: 800,
            border: '2px solid #1E293B',
            boxShadow: '4px 4px 0 #1E293B',
            flexShrink: 0,
          }}
          variant="rounded"
        >
          {avatarFallback || name?.charAt(0)?.toUpperCase() || 'U'}
        </Avatar>

        <Box sx={{ flexGrow: 1, minWidth: 0, width: '100%' }}>
          <Stack direction="row" spacing={2} alignItems="center" flexWrap="wrap" sx={{ mb: 2.5 }}>
            <Typography variant="h5" fontWeight={900} color="text.primary" sx={{ fontSize: { xs: '1.1rem', sm: '1.5rem' }, overflowWrap: 'anywhere' }}>
              {name}
            </Typography>
            {statusLabel && (
              <Chip
                label={statusLabel}
                color={statusColor}
                variant="filled"
                size="small"
                sx={{ fontWeight: 800, borderRadius: 1.5 }}
              />
            )}
          </Stack>

          <Grid container spacing={2.5}>
            {leftFields.map((field) => (
              <Grid item xs={12} sm={6} lg={4} key={`${field.number}-${field.label}`}>
                <Box sx={{ minHeight: 48 }}>
                  <Typography variant="body2" sx={{ lineHeight: 1.6 }}>
                    <Box component="span" sx={{ fontWeight: 800, display: 'block', fontSize: '0.75rem', textTransform: 'uppercase', color: 'text.secondary', mb: 0.25 }}>
                      {field.label}
                    </Box>
                    <Box component="span" sx={{ color: field.valueColor || 'text.primary', fontWeight: field.valueColor ? 700 : 600, fontSize: '0.9rem' }}>
                      {field.value}
                    </Box>
                  </Typography>
                </Box>
              </Grid>
            ))}

            {fullWidthFields.map((field) => (
              <Grid item xs={12} key={`${field.number}-${field.label}`}>
                <Box sx={{ minHeight: 48 }}>
                  <Typography variant="body2" sx={{ lineHeight: 1.6 }}>
                    <Box component="span" sx={{ fontWeight: 800, display: 'block', fontSize: '0.75rem', textTransform: 'uppercase', color: 'text.secondary', mb: 0.25 }}>
                      {field.label}
                    </Box>
                    <Box component="span" sx={{ color: field.valueColor || 'text.primary', fontWeight: field.valueColor ? 700 : 600, fontSize: '0.9rem' }}>
                      {field.value}
                    </Box>
                  </Typography>
                </Box>
              </Grid>
            ))}
          </Grid>

          {actions && (
            <>
              <Divider sx={{ my: 2.5 }} />
              <Box>{actions}</Box>
            </>
          )}
        </Box>
      </Stack>
    </Paper>
  );
}
