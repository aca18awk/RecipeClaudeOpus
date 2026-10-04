import { router } from 'expo-router';
import { useState } from 'react';
import {
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
  type NativeScrollEvent,
  type NativeSyntheticEvent,
} from 'react-native';

import { RecipeImage } from '@/components/recipe-image';
import { Radius, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import type { Recipe } from '@/types/recipe';
import { DIFFICULTY_LABELS, formatMinutes, spokenMinutes } from '@/utils/format';

const GAP = Spacing.three - 4;

export function FeaturedCarousel({ recipes }: { recipes: Recipe[] }) {
  const theme = useTheme();
  const { width: windowWidth } = useWindowDimensions();
  const [activeIndex, setActiveIndex] = useState(0);
  const itemWidth = Math.min(windowWidth - Spacing.three * 2 - Spacing.five, 420);
  const snapInterval = itemWidth + GAP;

  const handleScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const index = Math.round(event.nativeEvent.contentOffset.x / snapInterval);
    setActiveIndex(Math.max(0, Math.min(recipes.length - 1, index)));
  };

  if (recipes.length === 0) return null;

  return (
    <View style={styles.container}>
      <Text style={[styles.heading, { color: theme.text }]} accessibilityRole="header">
        Featured
      </Text>
      <FlatList
        data={recipes}
        horizontal
        keyExtractor={(item) => item.id}
        showsHorizontalScrollIndicator={false}
        snapToInterval={snapInterval}
        decelerationRate="fast"
        contentContainerStyle={styles.listContent}
        ItemSeparatorComponent={() => <View style={{ width: GAP }} />}
        onScroll={handleScroll}
        scrollEventThrottle={32}
        renderItem={({ item, index }) => (
          <Pressable
            onPress={() => router.push({ pathname: '/recipe/[id]', params: { id: item.id } })}
            accessibilityRole="button"
            accessibilityLabel={`Featured recipe ${index + 1} of ${recipes.length}: ${item.title}, ${spokenMinutes(item.cookingTimeMinutes)}, ${DIFFICULTY_LABELS[item.difficulty]} difficulty`}
            accessibilityHint="Opens the recipe"
            style={({ pressed }) => [styles.item, { width: itemWidth, opacity: pressed ? 0.85 : 1 }]}>
            <RecipeImage recipe={item} style={styles.image} decorative />
            {/* Solid scrim keeps the white title readable on any photo. */}
            <View style={styles.caption}>
              <Text style={styles.captionTitle} numberOfLines={2}>
                {item.title}
              </Text>
              <Text style={styles.captionMeta}>
                {formatMinutes(item.cookingTimeMinutes)} · {DIFFICULTY_LABELS[item.difficulty]}
              </Text>
            </View>
          </Pressable>
        )}
      />
      {recipes.length > 1 ? (
        <View style={styles.dots} importantForAccessibility="no-hide-descendants" accessibilityElementsHidden>
          {recipes.map((recipe, index) => (
            <View
              key={recipe.id}
              style={[
                styles.dot,
                index === activeIndex
                  ? { backgroundColor: theme.tint, width: 18 }
                  : { backgroundColor: theme.border },
              ]}
            />
          ))}
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: Spacing.two,
  },
  heading: {
    fontSize: 22,
    lineHeight: 28,
    fontWeight: '800',
    paddingHorizontal: Spacing.three,
  },
  listContent: {
    paddingHorizontal: Spacing.three,
  },
  item: {
    height: 210,
    borderRadius: Radius.large,
    overflow: 'hidden',
  },
  image: {
    ...StyleSheet.absoluteFill,
    width: '100%',
    height: '100%',
  },
  caption: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.two + 2,
    backgroundColor: 'rgba(0, 0, 0, 0.62)',
  },
  captionTitle: {
    color: '#FFFFFF',
    fontSize: 20,
    lineHeight: 25,
    fontWeight: '800',
  },
  captionMeta: {
    color: '#FFFFFF',
    fontSize: 14,
    lineHeight: 20,
    fontWeight: '600',
  },
  dots: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 6,
  },
  dot: {
    height: 6,
    width: 6,
    borderRadius: 3,
  },
});
