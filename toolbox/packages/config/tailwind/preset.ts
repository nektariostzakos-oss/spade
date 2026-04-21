import { tokens } from '@toolbox/design-tokens';
import type { Config } from 'tailwindcss';

const preset: Partial<Config> = {
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        bg: tokens.color.bg,
        surface: tokens.color.surface,
        border: tokens.color.border,
        text: tokens.color.text,
        accent: tokens.color.accent,
        semantic: tokens.color.semantic,
      },
      fontFamily: {
        display: tokens.font.display.split(',').map((s) => s.trim().replace(/"/g, '')),
        sans: tokens.font.sans.split(',').map((s) => s.trim().replace(/"/g, '')),
        mono: tokens.font.mono.split(',').map((s) => s.trim().replace(/"/g, '')),
      },
      borderRadius: {
        sm: `${tokens.size.radius.sm}px`,
        md: `${tokens.size.radius.md}px`,
        lg: `${tokens.size.radius.lg}px`,
        xl: `${tokens.size.radius.xl}px`,
      },
      boxShadow: tokens.shadow,
      minHeight: { tap: `${tokens.size.tap}px` },
      minWidth: { tap: `${tokens.size.tap}px` },
    },
  },
};

export default preset;
