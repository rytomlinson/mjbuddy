export const theme = {
  colors: {
    primary: '#FF6B00',
    primaryHover: '#FF8533',
    primaryActive: '#E65C00',
    background: '#121212',
    surface: '#1E1E1E',
    surfaceHover: '#2A2A2A',
    border: '#333333',
    text: '#FFFFFF',
    textSecondary: '#B3B3B3',
    textMuted: '#808080',
    error: '#FF5252',
    success: '#4CAF50',
    warning: '#FFC107',
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
} as const;

export type Theme = typeof theme;
