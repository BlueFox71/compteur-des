export const theme = {
  colors: {
    primary: 'var(--primary-color)',
    secondary: 'var(--secondary-color)',
    tertiary: 'var(--tertiary-color)',
    text: {
      primary: 'var(--text-primary)',
      secondary: 'var(--text-secondary)',
      dark: 'var(--text-dark)',
    },
    background: {
      primary: 'var(--background-primary)',
      secondary: 'var(--background-secondary)',
      tertiary: 'var(--background-tertiary)',
    },
    border: 'var(--border-color)',
  },
  spacing: {
    xs: '4px',
    sm: '8px',
    md: '12px',
    lg: '16px',
    xl: '24px',
    xxl: '32px',
  },
  borderRadius: {
    sm: '4px',
    md: '6px',
    lg: '8px',
    xl: '12px',
  },
  shadows: {
    light: '0 1px 3px rgba(0,0,0,0.1)',
    medium: '0 2px 8px rgba(0,0,0,0.15)',
    heavy: '0 4px 16px rgba(0,0,0,0.2)',
  },
  transitions: {
    fast: '0.2s ease',
    medium: '0.3s ease',
    slow: '0.4s ease',
  },
  fonts: {
    sizes: {
      xs: '12px',
      sm: '14px',
      md: '16px',
      lg: '18px',
      xl: '24px',
      xxl: '32px',
    },
    weights: {
      normal: 400,
      medium: 500,
      semibold: 600,
      bold: 700,
    },
  },
};

export type Theme = typeof theme; 