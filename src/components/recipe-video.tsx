import { useVideoPlayer, VideoView } from 'expo-video';
import { StyleSheet, Text, View } from 'react-native';

import { Radius, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import type { RecipeVideo as RecipeVideoType } from '@/types/recipe';

/** Short technique clip with native controls. It never autoplays. */
export function RecipeVideo({ video }: { video: RecipeVideoType }) {
  const theme = useTheme();
  const player = useVideoPlayer(video.source, (p) => {
    p.loop = false;
  });

  return (
    <View style={styles.container}>
      <VideoView
        player={player}
        style={[styles.video, { backgroundColor: theme.backgroundSelected }]}
        nativeControls
        contentFit="contain"
        fullscreenOptions={{ enable: true }}
        accessibilityLabel={video.title}
      />
      <Text style={[styles.caption, { color: theme.textSecondary }]}>{video.title}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: Spacing.two,
  },
  video: {
    width: '100%',
    aspectRatio: 16 / 9,
    borderRadius: Radius.medium,
    overflow: 'hidden',
  },
  caption: {
    fontSize: 14,
    lineHeight: 20,
  },
});
