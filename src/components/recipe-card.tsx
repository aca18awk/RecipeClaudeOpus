import { router } from 'expo-router';
import type { ReactNode } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { DifficultyBadge } from '@/components/difficulty-badge';
import { ClockIcon } from '@/components/icons';
import { RecipeImage } from '@/components/recipe-image';
import { Radius, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import type { Recipe } from '@/types/recipe';
import { DIFFICULTY_LABELS, formatMinutes, spokenMinutes } from '@/utils/format';

type RecipeCardProps = {
  recipe: Recipe;
  /** Trailing action, e.g. the "My Kitchen" pot button. Kept outside the card's
   *  pressable area so screen readers expose it as a separate control. */
  action?: ReactNode;
  /** Extra screen reader actions on the card, e.g. "Remove" where swiping removes it. */
  accessibilityActions?: { name: string; label: string; onAction: () => void }[];
};

export function RecipeCard({ recipe, action, accessibilityActions = [] }: RecipeCardProps) {
  const theme = useTheme();
  const summary = [
    recipe.title,
    spokenMinutes(recipe.cookingTimeMinutes),
    `${DIFFICULTY_LABELS[recipe.difficulty]} difficulty`,
    recipe.vegetarian ? 'Vegetarian' : null,
  ]
    .filter(Boolean)
    .join(', ');
  const openRecipe = () => router.push({ pathname: '/recipe/[id]', params: { id: recipe.id } });

  return (
    <View
      style={[styles.card, { backgroundColor: theme.backgroundElement, borderColor: theme.border }]}>
      <Pressable
        onPress={openRecipe}
        accessibilityRole="button"
        accessibilityLabel={summary}
        accessibilityHint="Opens the recipe"
        accessibilityActions={[
          { name: 'activate' },
          ...accessibilityActions.map(({ name, label }) => ({ name, label })),
        ]}
        onAccessibilityAction={(event) => {
          const { actionName } = event.nativeEvent;
          if (actionName === 'activate') openRecipe();
          accessibilityActions.find((action) => action.name === actionName)?.onAction();
        }}
        style={({ pressed }) => [styles.main, { opacity: pressed ? 0.75 : 1 }]}>
        <RecipeImage recipe={recipe} style={styles.image} decorative />
        {/* The card's label already covers these; hiding them stops TalkBack
            stopping on the nested difficulty badge. */}
        <View style={styles.info} importantForAccessibility="no-hide-descendants">
          <Text style={[styles.title, { color: theme.text }]}>{recipe.title}</Text>
          <View style={styles.metaRow}>
            <ClockIcon color={theme.textSecondary} size={15} />
            <Text style={[styles.meta, { color: theme.textSecondary }]}>
              {formatMinutes(recipe.cookingTimeMinutes)}
            </Text>
            {recipe.vegetarian ? (
              <Text style={[styles.meta, { color: theme.textSecondary }]}>· Vegetarian</Text>
            ) : null}
          </View>
          <DifficultyBadge difficulty={recipe.difficulty} />
        </View>
      </Pressable>
      {action ? <View style={styles.action}>{action}</View> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: Radius.large,
    borderWidth: 1,
    overflow: 'hidden',
  },
  main: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.three,
    padding: Spacing.two + 2,
  },
  image: {
    width: 92,
    height: 92,
    borderRadius: Radius.medium,
  },
  info: {
    flex: 1,
    gap: Spacing.one + 2,
  },
  title: {
    fontSize: 17,
    lineHeight: 22,
    fontWeight: '700',
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: Spacing.one + 2,
  },
  meta: {
    fontSize: 14,
    lineHeight: 20,
    fontWeight: '500',
  },
  action: {
    paddingRight: Spacing.two + 2,
  },
});
