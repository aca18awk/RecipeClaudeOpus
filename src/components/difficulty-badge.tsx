import { StyleSheet, Text, View } from 'react-native';

import { Radius, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import type { Difficulty } from '@/types/recipe';
import { DIFFICULTY_LABELS } from '@/utils/format';

/**
 * Colour-coded difficulty badge. The text label is always shown so the
 * difficulty is not conveyed by colour alone.
 */
export function DifficultyBadge({ difficulty }: { difficulty: Difficulty }) {
  const theme = useTheme();
  const colors = {
    easy: { background: theme.easyBackground, text: theme.easyText, dot: theme.easyDot },
    medium: { background: theme.mediumBackground, text: theme.mediumText, dot: theme.mediumDot },
    hard: { background: theme.hardBackground, text: theme.hardText, dot: theme.hardDot },
  }[difficulty];

  return (
    <View
      style={[styles.badge, { backgroundColor: colors.background }]}
      accessible
      accessibilityLabel={`Difficulty: ${DIFFICULTY_LABELS[difficulty]}`}>
      <View style={[styles.dot, { backgroundColor: colors.dot }]} />
      <Text style={[styles.text, { color: colors.text }]}>{DIFFICULTY_LABELS[difficulty]}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    gap: Spacing.one + 2,
    paddingHorizontal: Spacing.two + 2,
    paddingVertical: Spacing.one,
    borderRadius: Radius.pill,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  text: {
    fontSize: 13,
    lineHeight: 18,
    fontWeight: '700',
  },
});
