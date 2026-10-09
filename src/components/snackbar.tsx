import { useEffect, useRef, useState } from 'react';
import { AccessibilityInfo, Animated, Pressable, StyleSheet, Text } from 'react-native';

import { MinTouchSize, Radius, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

const SCREEN_READER_MIN_MS = 20000;

type SnackbarProps = {
  message: string;
  actionLabel: string;
  onAction: () => void;
  /** Called when the snackbar times out. */
  onDismiss: () => void;
  durationMs: number;
};

/** Message with a single action that dismisses itself after `durationMs`. */
export function Snackbar({ message, actionLabel, onAction, onDismiss, durationMs }: SnackbarProps) {
  const theme = useTheme();
  const [translateY] = useState(() => new Animated.Value(80));

  const onDismissRef = useRef(onDismiss);
  useEffect(() => {
    onDismissRef.current = onDismiss;
  });

  useEffect(() => {
    let cancelled = false;
    let timeout: ReturnType<typeof setTimeout> | undefined;

    AccessibilityInfo.isReduceMotionEnabled().then((reduce) => {
      if (cancelled) return;
      if (reduce) translateY.setValue(0);
      else Animated.spring(translateY, { toValue: 0, friction: 8, useNativeDriver: true }).start();
    });

    // Screen reader users need longer to reach the action (WCAG 2.2.1); Android
    // also lets users choose a longer "time to take action".
    Promise.all([
      AccessibilityInfo.isScreenReaderEnabled(),
      AccessibilityInfo.getRecommendedTimeoutMillis(durationMs),
    ]).then(([screenReader, recommended]) => {
      if (cancelled) return;
      const duration = screenReader ? Math.max(recommended, SCREEN_READER_MIN_MS) : recommended;
      timeout = setTimeout(() => onDismissRef.current(), duration);
    });

    return () => {
      cancelled = true;
      clearTimeout(timeout);
    };
  }, [durationMs, translateY]);

  return (
    <Animated.View
      style={[
        styles.snackbar,
        { backgroundColor: theme.inverseBackground, transform: [{ translateY }] },
      ]}>
      <Text style={[styles.message, { color: theme.inverseText }]}>{message}</Text>
      <Pressable
        onPress={onAction}
        accessibilityRole="button"
        accessibilityLabel={`${actionLabel}: ${message}`}
        style={({ pressed }) => [styles.action, { opacity: pressed ? 0.6 : 1 }]}>
        <Text style={[styles.actionLabel, { color: theme.inverseTint }]}>{actionLabel}</Text>
      </Pressable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  snackbar: {
    position: 'absolute',
    left: Spacing.three,
    right: Spacing.three,
    bottom: Spacing.three,
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
    paddingLeft: Spacing.three,
    paddingRight: Spacing.one,
    paddingVertical: Spacing.one,
    borderRadius: Radius.medium,
    shadowColor: '#000',
    shadowOpacity: 0.25,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 8,
  },
  message: {
    flex: 1,
    fontSize: 15,
    lineHeight: 20,
    fontWeight: '600',
  },
  action: {
    minHeight: MinTouchSize,
    minWidth: MinTouchSize,
    paddingHorizontal: Spacing.three,
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionLabel: {
    fontSize: 16,
    fontWeight: '800',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
});
