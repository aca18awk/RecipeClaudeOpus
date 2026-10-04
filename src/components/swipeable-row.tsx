import { useMemo, useState, type ReactNode } from 'react';
import { Animated, PanResponder, StyleSheet, Text, useWindowDimensions, View } from 'react-native';

import { Radius, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

const SWIPE_THRESHOLD = 110;

type SwipeableRowProps = {
  children: ReactNode;
  onRemove: () => void;
};

/**
 * Swipe left to reveal a "Remove" background and remove the row.
 * Built on PanResponder + Animated so it needs no gesture library. Swipes are
 * not available to screen reader or switch users, so callers must also offer
 * a button and/or accessibility action for removal.
 */
export function SwipeableRow({ children, onRemove }: SwipeableRowProps) {
  const theme = useTheme();
  const { width } = useWindowDimensions();
  const [translateX] = useState(() => new Animated.Value(0));

  const panResponder = useMemo(
    () =>
      PanResponder.create({
        onMoveShouldSetPanResponder: (_, { dx, dy }) =>
          dx < -10 && Math.abs(dx) > Math.abs(dy) * 1.5,
        onPanResponderTerminationRequest: () => false,
        onPanResponderMove: (_, { dx }) => translateX.setValue(Math.min(0, dx)),
        onPanResponderRelease: (_, { dx, vx }) => {
          if (dx < -SWIPE_THRESHOLD || vx < -0.8) {
            Animated.timing(translateX, {
              toValue: -width,
              duration: 180,
              useNativeDriver: true,
            }).start(() => onRemove());
          } else {
            Animated.spring(translateX, { toValue: 0, useNativeDriver: true }).start();
          }
        },
        onPanResponderTerminate: () => {
          Animated.spring(translateX, { toValue: 0, useNativeDriver: true }).start();
        },
      }),
    [onRemove, translateX, width]
  );

  const revealOpacity = translateX.interpolate({
    inputRange: [-SWIPE_THRESHOLD, -20, 0],
    outputRange: [1, 0.4, 0],
    extrapolate: 'clamp',
  });

  return (
    <View>
      <Animated.View
        style={[styles.background, { backgroundColor: theme.danger, opacity: revealOpacity }]}
        importantForAccessibility="no-hide-descendants"
        accessibilityElementsHidden>
        <Text style={[styles.backgroundLabel, { color: theme.onDanger }]}>Remove</Text>
      </Animated.View>
      <Animated.View style={{ transform: [{ translateX }] }} {...panResponder.panHandlers}>
        {children}
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  background: {
    ...StyleSheet.absoluteFill,
    borderRadius: Radius.large,
    alignItems: 'flex-end',
    justifyContent: 'center',
    paddingRight: Spacing.four,
  },
  backgroundLabel: {
    fontSize: 16,
    fontWeight: '800',
  },
});
