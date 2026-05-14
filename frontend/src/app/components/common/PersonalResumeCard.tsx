import { ReactNode } from 'react';
import { Avatar, Box, Chip, Divider, Paper, Stack, Typography } from '@mui/material';

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
  compact?: boolean;
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
  compact = false,
}: PersonalResumeCardProps) {
  const leftFields = fields.filter((field) => !field.fullWidth);
  const fullWidthFields = fields.filter((field) => field.fullWidth);

  return (
    <Paper
      sx={{
        p: { xs: 2.5, sm: compact ? 3 : 4 },
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
      <Stack spacing={0.5} alignItems="center" sx={{ mb: compact ? 2.5 : 4, position: 'relative', zIndex: 1 }}>
        <Typography variant="h5" fontWeight={800} letterSpacing={0.5} textAlign="center">
          {title}
        </Typography>
        {subtitle && (
          <Typography variant="body2" color="text.secondary" textAlign="center">
            {subtitle}
          </Typography>
        )}
      </Stack>

      <Stack
        direction={compact ? 'column' : { xs: 'column', sm: 'row' }}
        spacing={{ xs: 2, sm: compact ? 2.5 : 4 }}
        alignItems={compact ? 'center' : 'flex-start'}
        sx={{ position: 'relative', zIndex: 1 }}
      >
        <Avatar
          src={avatarUrl}
          alt={name}
          sx={{
            width: { xs: 88, sm: compact ? 120 : 140 },
            height: { xs: 88, sm: compact ? 120 : 140 },
            borderRadius: 3,
            bgcolor: '#FFF7DF',
            color: 'primary.main',
            fontSize: { xs: 36, sm: compact ? 48 : 56 },
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
          <Stack
            direction="row"
            spacing={1.5}
            alignItems="center"
            justifyContent={compact ? 'center' : 'flex-start'}
            flexWrap="wrap"
            sx={{ mb: compact ? 3 : 2.5 }}
          >
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

          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: {
                xs: '1fr',
                sm: 'repeat(2, minmax(0, 1fr))',
                lg: compact ? 'repeat(2, minmax(0, 1fr))' : 'repeat(4, minmax(0, 1fr))',
              },
              columnGap: { xs: 2.5, md: compact ? 3 : 4 },
              rowGap: { xs: 2.25, md: 3 },
              alignItems: 'start',
            }}
          >
            {leftFields.map((field) => (
              <Box key={`${field.number}-${field.label}`} sx={{ minHeight: 58, minWidth: 0 }}>
                <Typography variant="body2" component="div" sx={{ lineHeight: 1.6 }}>
                  <Box
                    component="span"
                    sx={{
                      fontWeight: 800,
                      display: 'block',
                      fontSize: '0.75rem',
                      textTransform: 'uppercase',
                      color: 'text.secondary',
                      mb: 0.55,
                      letterSpacing: 0,
                    }}
                  >
                    {field.label}
                  </Box>
                  <Box
                    component="span"
                    sx={{
                      color: field.valueColor || 'text.primary',
                      fontWeight: field.valueColor ? 700 : 650,
                      fontSize: '0.92rem',
                      lineHeight: 1.45,
                      overflowWrap: 'anywhere',
                      wordBreak: 'break-word',
                    }}
                  >
                    {field.value}
                  </Box>
                </Typography>
              </Box>
            ))}
          </Box>

          {fullWidthFields.length > 0 && (
            <Box
              sx={{
                display: 'grid',
                gridTemplateColumns: {
                  xs: '1fr',
                  md: compact ? '1fr' : 'repeat(2, minmax(0, 1fr))',
                },
                gap: { xs: 2.25, md: 3 },
                mt: { xs: 2.25, md: 3 },
              }}
            >
              {fullWidthFields.map((field) => (
                <Box key={`${field.number}-${field.label}`} sx={{ minHeight: 58, minWidth: 0 }}>
                  <Typography variant="body2" component="div" sx={{ lineHeight: 1.6 }}>
                    <Box component="span" sx={{ fontWeight: 800, display: 'block', fontSize: '0.75rem', textTransform: 'uppercase', color: 'text.secondary', mb: 0.25 }}>
                      {field.label}
                    </Box>
                    <Box
                      component="span"
                      sx={{
                        color: field.valueColor || 'text.primary',
                        fontWeight: field.valueColor ? 700 : 650,
                        fontSize: '0.92rem',
                        lineHeight: 1.45,
                        overflowWrap: 'anywhere',
                        wordBreak: 'break-word',
                      }}
                    >
                      {field.value}
                    </Box>
                  </Typography>
                </Box>
              ))}
            </Box>
          )}

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
