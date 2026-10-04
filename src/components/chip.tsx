import { Pressable, StyleSheet, Text } from 'react-native';

import { CheckIcon } from '@/components/icons';
import { MinTouchSize, Radius, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

type ChipProps = {
  label: string;
  selected: boolean;
  onPress: () => void;
  accessibilityHint?: string;
};

/** Toggleable filter chip. Selection is shown by fill, border and a checkmark. */
export function Chip({ label, selected, onPress, accessibilityHint }: ChipProps) {
  const theme = useTheme();

  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="checkbox"
      accessibilityState={{ checked: selected }}
      accessibilityLabel={label}
      accessibilityHint={accessibilityHint}
      style={({ pressed }) => [
        styles.chip,
        {
          backgroundColor: selected ? theme.tint : theme.backgroundElement,
          borderColor: selected ? theme.tint : theme.border,
          opacity: pressed ? 0.8 : 1,
        },
      ]}>
      {selected ? <CheckIcon color={theme.onTint} size={14} /> : null}
      <Text style={[styles.label, { color: selected ? theme.onTint : theme.text }]}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  chip: {
    minHeight: MinTouchSize - 4,
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.one + 2,
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.two,
    borderRadius: Radius.pill,
    borderWidth: 1.5,
  },
  label: {
    fontSize: 15,
    lineHeight: 20,
    fontWeight: '600',
  },
});
