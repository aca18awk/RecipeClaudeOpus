import { useWindowDimensions } from 'react-native';

import { LargeTextScale } from '@/constants/theme';

/** True when the user has chosen a large system text size (Dynamic Type / font scale). */
export function useLargeText() {
  return useWindowDimensions().fontScale >= LargeTextScale;
}
