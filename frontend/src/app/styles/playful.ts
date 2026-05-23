import type { SxProps, Theme } from '@mui/material/styles';

export const playfulColors = {
  cream: '#FFFDF5',
  ink: '#1E293B',
  slate: '#64748B',
  muted: '#F1F5F9',
  softBorder: '#E2E8F0',
  violet: '#8B5CF6',
  pink: '#F472B6',
  yellow: '#FBBF24',
  mint: '#34D399',
  sky: '#38BDF8',
  white: '#FFFFFF',
};

export const playfulShadow = `4px 4px 0 0 ${playfulColors.ink}`;
export const playfulShadowLg = `8px 8px 0 0 ${playfulColors.ink}`;
export const playfulTransition = 'all 260ms cubic-bezier(0.34, 1.56, 0.64, 1)';

export const pageShellSx: SxProps<Theme> = {
  position: 'relative',
  overflow: 'hidden',
  bgcolor: playfulColors.cream,
  color: playfulColors.ink,
  '&::before': {
    content: '""',
    position: 'absolute',
    inset: 0,
    pointerEvents: 'none',
    opacity: 0.22,
    backgroundImage: `radial-gradient(circle, rgba(30, 41, 59, 0.16) 1px, transparent 1px)`,
    backgroundSize: '22px 22px',
  },
};

export const stickerCardSx: SxProps<Theme> = {
  bgcolor: playfulColors.white,
  border: `2px solid ${playfulColors.ink}`,
  borderRadius: 1.25,
  boxShadow: playfulShadow,
  backgroundImage: 'none',
  transition: playfulTransition,
  '&:hover': {
    transform: 'translate(-2px, -2px)',
    boxShadow: `6px 6px 0 0 ${playfulColors.ink}`,
  },
};

export const metricCardSx: SxProps<Theme> = {
  ...stickerCardSx,
  p: 3,
  minHeight: 132,
};

export const candyButtonSx: SxProps<Theme> = {
  borderRadius: 1,
  border: `2px solid ${playfulColors.ink}`,
  bgcolor: playfulColors.violet,
  color: playfulColors.white,
  boxShadow: playfulShadow,
  fontWeight: 800,
  minHeight: 48,
  px: 3,
  transition: playfulTransition,
  '&:hover': {
    bgcolor: '#7C3AED',
    transform: 'translate(-2px, -2px)',
    boxShadow: `6px 6px 0 0 ${playfulColors.ink}`,
  },
  '&:active': {
    transform: 'translate(2px, 2px)',
    boxShadow: `2px 2px 0 0 ${playfulColors.ink}`,
  },
};

export const secondaryButtonSx: SxProps<Theme> = {
  borderRadius: 1,
  border: `2px solid ${playfulColors.ink}`,
  color: playfulColors.ink,
  bgcolor: playfulColors.white,
  fontWeight: 800,
  minHeight: 48,
  px: 3,
  transition: playfulTransition,
  '&:hover': {
    bgcolor: playfulColors.yellow,
    border: `2px solid ${playfulColors.ink}`,
  },
};

export const tablePaperSx: SxProps<Theme> = {
  border: `2px solid ${playfulColors.ink}`,
  borderRadius: 1.25,
  boxShadow: playfulShadow,
  overflow: 'hidden',
  backgroundImage: 'none',
};

export const dialogPaperSx: SxProps<Theme> = {
  border: `2px solid ${playfulColors.ink}`,
  borderRadius: 1.5,
  boxShadow: playfulShadowLg,
  backgroundImage: 'none',
};

export const textFieldSx: SxProps<Theme> = {
  '& .MuiOutlinedInput-root': {
    bgcolor: playfulColors.white,
    borderRadius: 1,
    transition: playfulTransition,
    '& fieldset': {
      borderColor: '#CBD5E1',
      borderWidth: 2,
    },
    '&:hover fieldset': {
      borderColor: playfulColors.ink,
    },
    '&.Mui-focused': {
      boxShadow: `4px 4px 0 0 ${playfulColors.violet}`,
      '& fieldset': {
        borderColor: playfulColors.violet,
      },
    },
  },
  '& .MuiInputLabel-root': {
    fontWeight: 800,
  },
};

export const chipSx: SxProps<Theme> = {
  border: `2px solid ${playfulColors.ink}`,
  borderRadius: 0.75,
  fontWeight: 800,
};
