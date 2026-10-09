import { AccessibilityInfo, Platform } from 'react-native';

/**
 * Screen reader announcement that waits for current speech on iOS, so it is not
 * cut off when VoiceOver reads a button's new label or a screen change.
 */
export function announce(message: string) {
  if (Platform.OS === 'ios') {
    AccessibilityInfo.announceForAccessibilityWithOptions(message, { queue: true });
  } else {
    AccessibilityInfo.announceForAccessibility(message);
  }
}
