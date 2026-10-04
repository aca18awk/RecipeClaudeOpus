import { useEffect, useRef, useState } from 'react';
import { Animated, Pressable, StyleSheet, Text } from 'react-native';

import { MinTouchSize, Radius, Spacing } from '@/constants/theme';
import { useReducedMotion } from '@/hooks/use-reduced-motion';
import { useTheme } from '@/hooks/use-theme';

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
  const reducedMotion = useReducedMotion();
  const [translateY] = useState(() => new Animated.Value(reducedMotion ? 0 : 80));

  const onDismissRef = useRef(onDismiss);
  useEffect(() => {
    onDismissRef.current = onDismiss;
  });

  useEffect(() => {
    Animated.spring(translateY, { toValue: 0, friction: 8, useNativeDriver: true }).start();
    const timeout = setTimeout(() => onDismissRef.current(), durationMs);
    return () => clearTimeout(timeout);
  }, [durationMs, translateY]);

  return (
    <Animated.View
      style={[
        styles.snackbar,
        { backgroundColor: theme.inverseBackground, transform: [{ translateY }] },
      ]}>
      <Text style={[styles.message, { color: theme.inverseText }]} numberOfLines={2}>
        {message}
      </Text>
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
