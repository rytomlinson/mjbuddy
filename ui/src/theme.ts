export const theme = {
  colors: {
    // Scarlet/rose red to complement cherry blossoms
    primary: '#B84A4A',
    primaryHover: '#C65858',
    primaryActive: '#A03E3E',
    // Backgrounds
    background: 'transparent',
    surface: 'rgba(255, 253, 250, 0.88)',
    surfaceHover: 'rgba(255, 253, 250, 0.95)',
    border: 'rgba(139, 125, 107, 0.25)',
    // Text - warm dark tones
    text: '#2D2A26',
    textSecondary: '#5C564E',
    textMuted: '#8B7D6B',
    // Status colors - muted to match aesthetic
    error: '#B84A4A',
    success: '#5B8A6F',
    warning: '#C9A55C',
    // Accent colors from the image
    accent: {
      sage: '#6B8E7A',
      gold: '#C9A55C',
      blush: '#C4A4A4',
      slate: '#7A8B9A',
    },
    // Colors for exposed melds (distinguishable but cohesive)
    meldColors: [
      '#6B8E7A', // sage green
      '#7A8B9A', // slate blue
      '#C9A55C', // gold
      '#9A7A9A', // plum
      '#5A9A8A', // teal
      '#C4A4A4', // blush
    ],
  },
  spacing: {
    xs: '4px',
    sm: '8px',
    md: '16px',
    lg: '24px',
    xl: '32px',
  },
  borderRadius: {
    sm: '4px',
    md: '8px',
    lg: '12px',
  },
  fontSizes: {
    sm: '12px',
    md: '14px',
    lg: '16px',
    xl: '20px',
    xxl: '24px',
  },
  fontWeights: {
    normal: 400,
    medium: 500,
    bold: 600,
  },
} as const;

export type Theme = typeof theme;
