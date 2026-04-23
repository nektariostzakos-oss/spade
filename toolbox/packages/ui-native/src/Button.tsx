import { tokens } from '@toolbox/design-tokens';
import * as React from 'react';
import { Pressable, StyleSheet, Text, type PressableProps } from 'react-native';

type Variant = 'primary' | 'secondary' | 'ghost';

export interface ButtonProps extends PressableProps {
  variant?: Variant;
  label: string;
}

export const Button: React.FC<ButtonProps> = ({ variant = 'primary', label, style, ...props }) => (
  <Pressable
    accessibilityRole="button"
    style={(state) => [
      styles.base,
      variant === 'primary' && styles.primary,
      variant === 'secondary' && styles.secondary,
      variant === 'ghost' && styles.ghost,
      state.pressed && styles.pressed,
      typeof style === 'function' ? style(state) : style,
    ]}
    {...props}
  >
    <Text
      style={[
        styles.label,
        variant === 'primary' ? styles.labelInverse : styles.labelPrimary,
      ]}
    >
      {label}
    </Text>
  </Pressable>
);

const styles = StyleSheet.create({
  base: {
    minHeight: tokens.size.tap,
    paddingHorizontal: tokens.size.space[6],
    borderRadius: tokens.size.radius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  primary: { backgroundColor: tokens.color.accent.primary },
  secondary: {
    backgroundColor: tokens.color.surface[2],
    borderWidth: 1,
    borderColor: tokens.color.border.default,
  },
  ghost: { backgroundColor: 'transparent' },
  pressed: { opacity: 0.85 },
  label: { fontSize: tokens.size.text.base, fontWeight: '700' },
  labelPrimary: { color: tokens.color.text.primary },
  labelInverse: { color: tokens.color.text.inverse },
});
