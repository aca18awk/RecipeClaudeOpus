import type { ReactNode } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { MinusIcon, PlusIcon } from '@/components/icons';
import { MinTouchSize, Radius, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

type StepperProps = {
  label: string;
  value: number;
  min: number;
  max: number;
  onChange: (value: number) => void;
  /** e.g. (n) => `${n} servings` */
  formatValue: (value: number) => string;
};

/**
 * − / + stepper. Screen readers get a single "adjustable" element that
 * responds to swipe up/down (iOS) or volume keys (Android); the visible
 * buttons are for touch.
 */
export function Stepper({ label, value, min, max, onChange, formatValue }: StepperProps) {
  const theme = useTheme();
  const canDecrement = value > min;
  const canIncrement = value < max;

  const step = (delta: number) => {
    const next = Math.min(max, Math.max(min, value + delta));
    if (next !== value) onChange(next);
  };

  return (
    <View
      style={styles.row}
      accessible
      accessibilityRole="adjustable"
      accessibilityLabel={label}
      accessibilityValue={{ min, max, now: value, text: formatValue(value) }}
      accessibilityActions={[{ name: 'increment' }, { name: 'decrement' }]}
      onAccessibilityAction={(event) => {
        if (event.nativeEvent.actionName === 'increment') step(1);
        if (event.nativeEvent.actionName === 'decrement') step(-1);
      }}>
      <Text style={[styles.label, { color: theme.text }]}>{label}</Text>
      <View style={[styles.control, { borderColor: theme.border, backgroundColor: theme.backgroundElement }]}>
        <StepButton onPress={() => step(-1)} disabled={!canDecrement}>
          <MinusIcon color={theme.tint} size={18} />
        </StepButton>
        <Text style={[styles.value, { color: theme.text }]}>{value}</Text>
        <StepButton onPress={() => step(1)} disabled={!canIncrement}>
          <PlusIcon color={theme.tint} size={18} />
        </StepButton>
      </View>
    </View>
  );
}

function StepButton({
  onPress,
  disabled,
  children,
}: {
  onPress: () => void;
  disabled: boolean;
  children: ReactNode;
}) {
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      style={({ pressed }) => [
        styles.button,
        { opacity: disabled ? 0.35 : pressed ? 0.6 : 1 },
      ]}>
      {children}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: Spacing.three,
  },
  label: {
    fontSize: 17,
    lineHeight: 22,
    fontWeight: '700',
    flexShrink: 1,
  },
  control: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1.5,
    borderRadius: Radius.pill,
  },
  button: {
    width: MinTouchSize,
    height: MinTouchSize,
    alignItems: 'center',
    justifyContent: 'center',
  },
  value: {
    minWidth: 36,
    textAlign: 'center',
    fontSize: 20,
    fontWeight: '800',
    fontVariant: ['tabular-nums'],
  },
});
