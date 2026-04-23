export const tokens = {
  color: {
    bg: {
      base: '#0A0A0A',
      raised: '#141414',
      overlay: 'rgba(0,0,0,0.85)',
    },
    surface: {
      1: '#1A1A1A',
      2: '#222222',
      3: '#2D2D2D',
    },
    border: {
      subtle: '#2A2A2A',
      default: '#3A3A3A',
      strong: '#4A4A4A',
    },
    text: {
      primary: '#FAFAFA',
      secondary: '#A8A8A8',
      tertiary: '#6E6E6E',
      inverse: '#0A0A0A',
    },
    accent: {
      primary: '#FFC107',
      primaryHover: '#FFD54F',
      primaryPressed: '#FFA000',
    },
    semantic: {
      success: '#10B981',
      warning: '#F59E0B',
      danger: '#EF4444',
      info: '#3B82F6',
      verified: '#0EA5E9',
    },
  },
  font: {
    display: '"Bebas Neue", "Inter Tight", system-ui',
    sans: '"Inter Tight", "Inter", system-ui',
    mono: '"JetBrains Mono", monospace',
  },
  size: {
    text: {
      xs: 12,
      sm: 14,
      base: 16,
      lg: 18,
      xl: 20,
      '2xl': 24,
      '3xl': 32,
      '4xl': 48,
      '5xl': 64,
    },
    space: {
      1: 4,
      2: 8,
      3: 12,
      4: 16,
      5: 20,
      6: 24,
      8: 32,
      10: 40,
      12: 48,
      16: 64,
    },
    radius: {
      sm: 6,
      md: 10,
      lg: 14,
      xl: 20,
      full: 9999,
    },
    tap: 56,
  },
  motion: {
    fast: '120ms cubic-bezier(0.2, 0, 0, 1)',
    base: '200ms cubic-bezier(0.2, 0, 0, 1)',
    slow: '320ms cubic-bezier(0.2, 0, 0, 1)',
    spring: { stiffness: 300, damping: 30 },
  },
  shadow: {
    sm: '0 1px 2px rgba(0,0,0,0.4)',
    md: '0 4px 12px rgba(0,0,0,0.5)',
    lg: '0 12px 32px rgba(0,0,0,0.6)',
    glow: '0 0 24px rgba(255,193,7,0.35)',
  },
} as const;

export type Tokens = typeof tokens;
export type ColorKey = keyof Tokens['color'];
export type SpaceKey = keyof Tokens['size']['space'];
export type TextKey = keyof Tokens['size']['text'];
export type RadiusKey = keyof Tokens['size']['radius'];
