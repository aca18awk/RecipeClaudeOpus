import { router } from 'expo-router';
import { useState } from 'react';
import { AccessibilityInfo, FlatList, StyleSheet, Text, View } from 'react-native';

import { EmptyState } from '@/components/empty-state';
import { PotButton } from '@/components/pot-button';
import { RecipeCard } from '@/components/recipe-card';
import { Snackbar } from '@/components/snackbar';
import { SwipeableRow } from '@/components/swipeable-row';
import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { useRecipes } from '@/state/recipes-context';
import type { Recipe } from '@/types/recipe';

const UNDO_DURATION_MS = 5000;

type PendingUndo = {
  recipeId: string;
  title: string;
  index: number;
  key: number;
};

export default function KitchenScreen() {
  const theme = useTheme();
  const { recipes, savedIds, removeSaved, restoreSaved } = useRecipes();
  const [pendingUndo, setPendingUndo] = useState<PendingUndo | null>(null);

  const saved = savedIds
    .map((id) => recipes.find((recipe) => recipe.id === id))
    .filter((recipe): recipe is Recipe => recipe !== undefined);

  const remove = (recipe: Recipe) => {
    const index = removeSaved(recipe.id);
    setPendingUndo((current) => ({
      recipeId: recipe.id,
      title: recipe.title,
      index,
      key: (current?.key ?? 0) + 1,
    }));
    AccessibilityInfo.announceForAccessibility(
      `${recipe.title} removed from My Kitchen. Undo available.`
    );
  };

  const undo = () => {
    if (!pendingUndo) return;
    restoreSaved(pendingUndo.recipeId, pendingUndo.index);
    AccessibilityInfo.announceForAccessibility(`${pendingUndo.title} restored to My Kitchen`);
    setPendingUndo(null);
  };

  return (
    <View style={[styles.screen, { backgroundColor: theme.background }]}>
      <FlatList
        data={saved}
        keyExtractor={(item) => item.id}
        contentContainerStyle={[styles.listContent, saved.length === 0 && styles.emptyContent]}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
        ListHeaderComponent={
          saved.length > 0 ? (
            <Text style={[styles.hint, { color: theme.textSecondary }]}>
              Swipe left on a recipe, or tap its pot, to remove it.
            </Text>
          ) : null
        }
        renderItem={({ item }) => (
          <SwipeableRow onRemove={() => remove(item)}>
            <RecipeCard
              recipe={item}
              accessibilityActions={[
                { name: 'remove', label: 'Remove from My Kitchen', onAction: () => remove(item) },
              ]}
              action={
                <PotButton
                  recipeTitle={item.title}
                  saved
                  announce={false}
                  onPress={() => remove(item)}
                />
              }
            />
          </SwipeableRow>
        )}
        ListEmptyComponent={
          <EmptyState
            title="Your kitchen is empty"
            message="Tap the pot on any recipe to save it here."
            actionLabel="Browse recipes"
            onAction={() => router.navigate('/')}
          />
        }
      />

      {pendingUndo ? (
        <Snackbar
          key={pendingUndo.key}
          message={`${pendingUndo.title} removed`}
          actionLabel="Undo"
          onAction={undo}
          onDismiss={() => setPendingUndo(null)}
          durationMs={UNDO_DURATION_MS}
        />
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },
  listContent: {
    padding: Spacing.three,
    // Leaves room so the snackbar never covers the last card.
    paddingBottom: 96,
  },
  emptyContent: {
    flexGrow: 1,
    justifyContent: 'center',
  },
  hint: {
    fontSize: 15,
    lineHeight: 20,
    marginBottom: Spacing.three - 4,
  },
  separator: {
    height: Spacing.three - 4,
  },
});
