import type { ReactNode } from 'react';
import { Pressable, StyleSheet, Text, View, type StyleProp, type ViewStyle } from 'react-native';

import { MinTouchSize, Radius, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

type AppButtonProps = {
  label: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'ghost';
  size?: 'regular' | 'large';
  icon?: ReactNode;
  disabled?: boolean;
  accessibilityLabel?: string;
  accessibilityHint?: string;
  style?: StyleProp<ViewStyle>;
};

export function AppButton({
  label,
  onPress,
  variant = 'primary',
  size = 'regular',
  icon,
  disabled = false,
  accessibilityLabel,
  accessibilityHint,
  style,
}: AppButtonProps) {
  const theme = useTheme();
  const palette = {
    primary: { background: theme.tint, text: theme.onTint, border: theme.tint },
    secondary: { background: theme.backgroundElement, text: theme.tint, border: theme.tint },
    ghost: { background: 'transparent', text: theme.tint, border: 'transparent' },
  }[variant];

  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      accessibilityHint={accessibilityHint}
      accessibilityState={{ disabled }}
      style={({ pressed }) => [
        styles.button,
        size === 'large' && styles.large,
        {
          backgroundColor: palette.background,
          borderColor: palette.border,
          opacity: disabled ? 0.45 : pressed ? 0.8 : 1,
        },
        style,
      ]}>
      {icon ? <View importantForAccessibility="no-hide-descendants">{icon}</View> : null}
      <Text
        style={[styles.label, size === 'large' && styles.largeLabel, { color: palette.text }]}>
        {label}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    minHeight: MinTouchSize,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.two,
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.two,
    borderRadius: Radius.medium,
    borderWidth: 2,
  },
  large: {
    minHeight: 60,
    paddingHorizontal: Spacing.four,
  },
  label: {
    fontSize: 16,
    lineHeight: 22,
    fontWeight: '700',
    textAlign: 'center',
    flexShrink: 1,
  },
  largeLabel: {
    fontSize: 18,
    lineHeight: 24,
  },
});
