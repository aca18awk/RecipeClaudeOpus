import { useState } from 'react';
import { AccessibilityInfo, Animated, Pressable, StyleSheet } from 'react-native';

import { PotIcon } from '@/components/icons';
import { MinTouchSize } from '@/constants/theme';
import { useReducedMotion } from '@/hooks/use-reduced-motion';
import { useTheme } from '@/hooks/use-theme';

type PotButtonProps = {
  recipeTitle: string;
  saved: boolean;
  onPress: () => void;
  /** Set to false when the caller announces the change itself (e.g. an undo snackbar). */
  announce?: boolean;
};

/** Cooking-pot toggle that saves a recipe to "My Kitchen", with a small bounce. */
export function PotButton({ recipeTitle, saved, onPress, announce = true }: PotButtonProps) {
  const theme = useTheme();
  const reducedMotion = useReducedMotion();
  const [scale] = useState(() => new Animated.Value(1));
  const [lift] = useState(() => new Animated.Value(0));

  const handlePress = () => {
    const nowSaved = !saved;
    onPress();

    if (announce) {
      AccessibilityInfo.announceForAccessibility(
        nowSaved ? `${recipeTitle} saved to My Kitchen` : `${recipeTitle} removed from My Kitchen`
      );
    }

    if (reducedMotion) return;
    scale.setValue(nowSaved ? 0.7 : 0.85);
    lift.setValue(0);
    Animated.parallel([
      Animated.spring(scale, { toValue: 1, friction: 3, tension: 160, useNativeDriver: true }),
      Animated.sequence([
        Animated.timing(lift, { toValue: nowSaved ? -5 : 0, duration: 120, useNativeDriver: true }),
        Animated.spring(lift, { toValue: 0, friction: 4, useNativeDriver: true }),
      ]),
    ]).start();
  };

  return (
    <Pressable
      onPress={handlePress}
      accessibilityRole="button"
      accessibilityLabel={
        saved ? `Remove ${recipeTitle} from My Kitchen` : `Save ${recipeTitle} to My Kitchen`
      }
      hitSlop={4}
      style={({ pressed }) => [
        styles.button,
        {
          backgroundColor: saved ? theme.tintSoft : 'transparent',
          borderColor: saved ? theme.tint : theme.border,
          opacity: pressed ? 0.7 : 1,
        },
      ]}>
      <Animated.View style={{ transform: [{ scale }, { translateY: lift }] }}>
        <PotIcon
          color={saved ? theme.tint : theme.textSecondary}
          filled={saved}
          fillDetailColor={theme.tintSoft}
          size={26}
        />
      </Animated.View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    width: MinTouchSize,
    height: MinTouchSize,
    borderRadius: MinTouchSize / 2,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
