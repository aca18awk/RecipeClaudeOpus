import { Image, StyleSheet, Text, View } from 'react-native';

import { AppButton } from '@/components/app-button';
import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

type EmptyStateProps = {
  title: string;
  message: string;
  actionLabel?: string;
  onAction?: () => void;
};

export function EmptyState({ title, message, actionLabel, onAction }: EmptyStateProps) {
  const theme = useTheme();

  return (
    <View style={styles.container}>
      {/* Decorative illustration; the text below carries the meaning. */}
      <Image
        source={require('@/assets/images/empty-state.jpeg')}
        style={styles.image}
        resizeMode="contain"
        accessible={false}
        importantForAccessibility="no"
      />
      <Text style={[styles.title, { color: theme.text }]} accessibilityRole="header">
        {title}
      </Text>
      <Text style={[styles.message, { color: theme.textSecondary }]}>{message}</Text>
      {actionLabel && onAction ? (
        <AppButton label={actionLabel} onPress={onAction} variant="secondary" />
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    gap: Spacing.three - 4,
    paddingHorizontal: Spacing.four,
    paddingVertical: Spacing.five,
  },
  image: {
    width: 200,
    height: 160,
    borderRadius: 16,
  },
  title: {
    fontSize: 20,
    lineHeight: 26,
    fontWeight: '800',
    textAlign: 'center',
  },
  message: {
    fontSize: 16,
    lineHeight: 22,
    textAlign: 'center',
  },
});
